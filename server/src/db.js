import Database from 'better-sqlite3';

const db = new Database(':memory:');

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

export default db;