import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketServer } from 'socket.io';
import app from './src/app.js';
import connectToDb from './src/db/db.js';

connectToDb();

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*',
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.user = decoded;
      console.log(`User connected: ${decoded.username} from team: ${decoded.teamName}`);
    }
    next();
  } catch (error) {
    console.log('Socket connection without valid token');
    next(); // Allow connection even without token for now
  }
});

io.on('connection', socket => {
  console.log(socket.handshake.query);
  console.log('New client Connected');

  // Join team room if user is authenticated
  if (socket.user) {
    socket.join(socket.user.teamName);
    socket.to(socket.user.teamName).emit('user-joined', {
      username: socket.user.username,
      teamName: socket.user.teamName,
    });
  }

  socket.on('disconnect', () => {
    console.log('Client is Disconnect');
    if (socket.user) {
      socket.to(socket.user.teamName).emit('user-left', {
        username: socket.user.username,
        teamName: socket.user.teamName,
      });
    }
  });

  socket.on('chat-message', message => {
    console.log(message);
    // Send to team members only if authenticated
    if (socket.user) {
      socket.to(socket.user.teamName).emit('chat-message', {
        ...message,
        username: socket.user.username,
        teamName: socket.user.teamName,
      });
    } else {
      socket.broadcast.emit('chat-message', message);
    }
  });
});

const port = process.env.PORT || 5000;

server.listen(port, (req, res) => {
  console.log(`server is running on port ${port}`);
});
