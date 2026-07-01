const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Tracks how many active sockets each user currently has open
// (a user can have multiple tabs/devices open at once).
const onlineUsers = new Map(); // userId -> Set of socket ids

const getUserIdFromSocket = async (socket) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || '';
    const tokenFromAuth = socket.handshake.auth?.token;

    let token = tokenFromAuth;
    if (!token && cookieHeader) {
      const cookieName = process.env.COOKIE_NAME || 'pulse_token';
      const match = cookieHeader.split('; ').find((c) => c.startsWith(`${cookieName}=`));
      if (match) token = decodeURIComponent(match.split('=')[1]);
    }

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
};

const registerSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    const userId = await getUserIdFromSocket(socket);
    if (!userId) {
      return next(new Error('Authentication required'));
    }
    socket.userId = userId;
    next();
  });

  io.on('connection', async (socket) => {
    const { userId } = socket;
    console.log(`[Socket] Connected: user=${userId} socket=${socket.id}`);

    // Join a personal room so we can target this user directly from anywhere
    socket.join(`user:${userId}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Only flip to "online" broadcast on first connection (not every extra tab)
    if (onlineUsers.get(userId).size === 1) {
      try {
        const user = await User.findByIdAndUpdate(userId, { isOnline: true }, { new: true });
        if (user && user.privacy.showOnlineStatus) {
          io.emit('presence:online', { userId });
        }
      } catch (err) {
        console.error('[Socket] Presence update error:', err.message);
      }
    }

    // Client asks to join a specific post's "room" to get live comment/like updates
    socket.on('post:join', (postId) => {
      socket.join(`post:${postId}`);
    });

    socket.on('post:leave', (postId) => {
      socket.leave(`post:${postId}`);
    });

    // Typing indicator for comments
    socket.on('comment:typing', ({ postId, userName }) => {
      socket.to(`post:${postId}`).emit('comment:typing', { postId, userName });
    });

    socket.on('comment:stopTyping', ({ postId }) => {
      socket.to(`post:${postId}`).emit('comment:stopTyping', { postId });
    });

    socket.on('disconnect', async () => {
      console.log(`[Socket] Disconnected: user=${userId} socket=${socket.id}`);

      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          try {
            const user = await User.findByIdAndUpdate(
              userId,
              { isOnline: false, lastSeen: new Date() },
              { new: true }
            );
            if (user && user.privacy.showOnlineStatus) {
              io.emit('presence:offline', { userId, lastSeen: user.lastSeen });
            }
          } catch (err) {
            console.error('[Socket] Presence update error:', err.message);
          }
        }
      }
    });
  });
};

module.exports = { registerSocketHandlers, onlineUsers };
