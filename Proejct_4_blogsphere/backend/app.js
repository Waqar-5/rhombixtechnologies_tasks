const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { applySecurityMiddleware } = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const config = require('./config/env');
// Importing this triggers its module-level side effect of creating the
// uploads/ subfolders if they don't exist yet.
const { UPLOADS_ROOT } = require('./utils/fileStorage');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const blogRoutes = require('./routes/blogRoutes');
const commentRoutes = require('./routes/commentRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust the first proxy hop (Render/Vercel/Nginx) so req.secure and
// x-forwarded-proto are honored correctly for secure cookies.
app.set('trust proxy', 1);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

applySecurityMiddleware(app);

// Serve locally-stored uploaded images (avatars, cover images, etc).
// Helmet (applied above) sets Cross-Origin-Resource-Policy: same-origin
// by default on every response, which is the right call for JSON API
// responses but blocks the browser from loading these images when the
// frontend runs on a different origin/port (e.g. localhost:5173 loading
// from localhost:5000). Override it just for this route — these are
// public, non-sensitive static assets meant to be embedded cross-origin.
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(UPLOADS_ROOT)
);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BlogSphere API is running', env: config.env });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
