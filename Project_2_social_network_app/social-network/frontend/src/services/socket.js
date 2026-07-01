import { io } from 'socket.io-client';

let socket = null;

/**
 * Creates (or returns the existing) Socket.IO connection.
 * Auth is via the httpOnly cookie automatically sent with the handshake,
 * since the client and server share the same origin in dev (via Vite proxy)
 * and in production (served from the same domain or with credentials).
 */
export const connectSocket = () => {
  if (socket && socket.connected) return socket;

  socket = io('/', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
