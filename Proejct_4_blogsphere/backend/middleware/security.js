const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const config = require('./../config/env');

/**
 * xss-clean is deprecated/unmaintained, so we implement the same idea
 * ourselves with the actively-maintained `xss` package: recursively walk
 * req.body/query/params and strip any HTML/script content from string
 * values. Note: this deliberately does NOT touch blog `content`, which is
 * rich-text HTML by design — that field is sanitized separately in the
 * blog validators/controller with an allowlist of safe tags.
 */
// Keys we deliberately skip here because they carry intentional rich-text
// HTML (React Quill output) and get their own allowlist-based sanitization
// in validators/blogValidators.js instead of having all tags stripped.
const RICH_TEXT_KEYS = new Set(['content']);

const deepSanitize = (obj, parentKey = null) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (parentKey && RICH_TEXT_KEYS.has(parentKey)) return obj;
    return xss(obj, { whiteList: {}, stripIgnoreTag: true });
  }
  if (Array.isArray(obj)) return obj.map((item) => deepSanitize(item, parentKey));
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      obj[key] = deepSanitize(obj[key], key);
    }
    return obj;
  }
  return obj;
};

const xssSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = deepSanitize(req.body);
  if (req.params && typeof req.params === 'object') req.params = deepSanitize(req.params);
  // req.query is a getter-only property on some Express/Node versions;
  // mutate its keys in place rather than reassigning the object itself.
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      req.query[key] = deepSanitize(req.query[key]);
    }
  }
  next();
};

/**
 * CORS: only allow the configured frontend origin, with credentials
 * enabled so httpOnly cookies (access/refresh tokens) are sent cross-origin.
 */
const corsOptions = {
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * General API rate limiter — generous, just to blunt basic abuse/scraping.
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMin * 60 * 1000,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/**
 * Strict limiter for auth endpoints (login/register/forgot-password) where
 * brute-force and credential-stuffing risk is highest.
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMin * 60 * 1000,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

/**
 * Applies the full security middleware stack to an Express app.
 * Call once in server.js, in this order, before routes are mounted.
 */
const applySecurityMiddleware = (app) => {
  // Sets various HTTP headers (CSP, X-Frame-Options, etc.)
  app.use(helmet());

  app.use(cors(corsOptions));

  // Strips any keys starting with '$' or containing '.' from
  // req.body/query/params to prevent MongoDB operator injection.
  app.use(mongoSanitize());

  // Sanitizes user input to prevent XSS by stripping HTML in req.body/query/params
  // (except rich-text fields, which are allowlist-sanitized separately).
  app.use(xssSanitizer);

  // Prevents HTTP parameter pollution (e.g. ?sort=a&sort=b), while
  // allowlisting params that legitimately repeat (e.g. tags filter).
  app.use(hpp({ whitelist: ['tags', 'category'] }));

  app.use('/api', generalLimiter);
};

module.exports = { applySecurityMiddleware, authLimiter };
