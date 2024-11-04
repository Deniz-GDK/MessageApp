import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const db = new Database(':memory:'); // Using in-memory database for development

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    isOnline BOOLEAN DEFAULT false,
    lastSeen DATETIME
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    senderId TEXT,
    content TEXT,
    timestamp DATETIME,
    isRead BOOLEAN,
    chatId TEXT,
    FOREIGN KEY(senderId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS chat_participants (
    chatId TEXT,
    userId TEXT,
    FOREIGN KEY(chatId) REFERENCES chats(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Authentication Routes
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();

    // Create user
    db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)')
      .run(userId, username, hashedPassword);

    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET);
    const user = { id: userId, username, isOnline: true };

    res.json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        isOnline: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
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

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});