import { io } from 'socket.io-client';

let socket = null;
const FALLBACK_SOCKET_URL = 'https://backend-for-auctionbd-railway.onrender.com';

const getSocketURL = () => {
  const configuredURL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || FALLBACK_SOCKET_URL;
  const frontendURL = process.env.REACT_APP_FRONTEND_URL || process.env.VITE_FRONTEND_URL || '';
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isFrontendOrigin = [browserOrigin, frontendURL, 'http://localhost:3000']
    .filter(Boolean)
    .some(origin => configuredURL.replace(/\/$/, '') === origin.replace(/\/$/, ''));

  return isFrontendOrigin ? FALLBACK_SOCKET_URL : configuredURL;
};

export const initSocket = (token) => {
  if (!token) return null;
  if (socket) return socket;

  socket = io(getSocketURL(), {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 3,
    reconnectionDelay: 1500,
    timeout: 8000,
  });

  socket.on('connect_error', () => {
    socket?.disconnect();
    socket = null;
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

export const joinAuctionRoom = (auctionId) =>
  socket?.emit('joinAuction', auctionId);

export const leaveAuctionRoom = (auctionId) =>
  socket?.emit('leaveAuction', auctionId);
