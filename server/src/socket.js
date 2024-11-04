import { Server } from 'socket.io';
import db from './db.js';
import { verifyToken } from './auth.js';

export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error'));
    }
    
    socket.userId = decoded.userId;
    next();
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    
    // Update user status to online
    db.prepare('UPDATE users SET isOnline = true WHERE id = ?').run(socket.userId);
    io.emit('user_status_change', { userId: socket.userId, isOnline: true });

    socket.on('send_message', (data) => {
      const { chatId, content } = data;
      const message = {
        id: Date.now().toString(),
        senderId: socket.userId,
        content,
        timestamp: new Date(),
        isRead: false,
        chatId
      };

      // Save message to database
      db.prepare(`
        INSERT INTO messages (id, senderId, content, timestamp, isRead, chatId)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        message.id,
        message.senderId,
        message.content,
        message.timestamp.toISOString(),
        message.isRead ? 1 : 0,
        message.chatId
      );

      // Broadcast message to chat participants
      io.to(chatId).emit('new_message', message);
    });

    socket.on('disconnect', () => {
      db.prepare('UPDATE users SET isOnline = false, lastSeen = ? WHERE id = ?')
        .run(new Date().toISOString(), socket.userId);
      io.emit('user_status_change', { 
        userId: socket.userId, 
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });

  return io;
};