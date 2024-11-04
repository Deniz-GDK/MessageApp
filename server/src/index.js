import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { register, login } from './auth.js';
import { setupSocket } from './socket.js';

const app = express();
const httpServer = createServer(app);

// Setup middleware
app.use(cors());
app.use(express.json());

// Setup routes
app.post('/auth/register', register);
app.post('/auth/login', login);

// Setup Socket.IO
setupSocket(httpServer);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});