import { io } from 'socket.io-client';

const rawURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/+$/, '');
const SOCKET_URL = rawURL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['polling', 'websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('⚡ Socket.io connected:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.warn('⚠️ Socket.io connect error:', err.message);
        });
    }

    if (socket && !socket.connected) {
        socket.connect();
    }

    return socket;
};

export const joinConversation = (conversationId) => {
    const s = getSocket();
    if (s && conversationId) {
        s.emit('join_conversation', conversationId);
    }
};

export const leaveConversation = (conversationId) => {
    const s = getSocket();
    if (s && conversationId) {
        s.emit('leave_conversation', conversationId);
    }
};

export const onNewMessage = (callback) => {
    const s = getSocket();
    s.on('new_message', callback);
    return () => {
        s.off('new_message', callback);
    };
};

export const onConversationUpdated = (callback) => {
    const s = getSocket();
    s.on('conversation_updated', callback);
    return () => {
        s.off('conversation_updated', callback);
    };
};
