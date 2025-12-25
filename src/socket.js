import { io } from 'socket.io-client';

// Use environment variable for production, fallback to localhost for development
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) return this.socket;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to server:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Room operations
    createRoom(playerName) {
        this.socket?.emit('create-room', { playerName });
    }

    joinRoom(roomCode, playerName) {
        this.socket?.emit('join-room', { roomCode, playerName });
    }

    startGame(topic, difficulty) {
        this.socket?.emit('start-game', { topic, difficulty });
    }

    submitAnswer(answerIndex, timeTaken) {
        this.socket?.emit('submit-answer', { answerIndex, timeTaken });
    }

    playAgain() {
        this.socket?.emit('play-again');
    }

    leaveRoom() {
        this.socket?.emit('leave-room');
    }

    // Event listeners
    on(event, callback) {
        this.socket?.on(event, callback);
        this.listeners.set(event, callback);
    }

    off(event) {
        const callback = this.listeners.get(event);
        if (callback) {
            this.socket?.off(event, callback);
            this.listeners.delete(event);
        }
    }

    removeAllListeners() {
        this.listeners.forEach((callback, event) => {
            this.socket?.off(event, callback);
        });
        this.listeners.clear();
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    getSocketId() {
        return this.socket?.id || null;
    }
}

export const socketService = new SocketService();
export default socketService;
