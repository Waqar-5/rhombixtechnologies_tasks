const xss = require('xss');

/**
 * Sanitizes React Quill's HTML output for blog content. Unlike the strict
 * strip-everything sanitizer used on plain text fields (see
 * middleware/security.js), this allows a curated set of formatting tags
 * so posts render correctly, while still blocking scripts, event handlers,
 * iframes, and other XSS vectors.
 */
const richTextWhiteList = {
  p: ['style', 'class'],
  br: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  blockquote: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  ul: [],
  ol: [],
  li: [],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
  code: [],
  pre: [],
  span: ['class', 'style'],
  hr: [],
};

const sanitizeRichText = (html) => {
  if (!html || typeof html !== 'string') return html;
  return xss(html, {
    whiteList: richTextWhiteList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
    onTagAttr: (tag, name, value) => {
      // Block javascript: URIs on links/images even though href/src are allowlisted.
      if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
        return `${name}="#"`;
      }
      return undefined; // fall back to default (allowlisted) handling
    },
  });
};

module.exports = { sanitizeRichText };
