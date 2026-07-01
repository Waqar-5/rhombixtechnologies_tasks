require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { registerSocketHandlers } = require('./sockets/socketHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// --- Socket.IO setup ---
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});
app.set('io', io); // makes io accessible inside controllers via req.app.get('io')
registerSocketHandlers(io);

// --- Core middleware ---
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pulse API is running.', time: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Pulse server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO ready for real-time connections`);
    console.log(`🌐 Accepting requests from ${CLIENT_URL}\n`);
  });
});

module.exports = { app, server, io };
