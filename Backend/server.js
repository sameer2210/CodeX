// import dotenv from 'dotenv';
// dotenv.config();

// import http from 'http';
// import jwt from 'jsonwebtoken';
// import { Server as SocketServer } from 'socket.io';
// import app from './src/app.js';
// import connectToDb from './src/db/db.js';

// connectToDb();

// const server = http.createServer(app);
// const io = new SocketServer(server, {
//   cors: {
//     // origin: '*',
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// io.use((socket, next) => {
//   try {
//     const token = socket.handshake.auth.token;
//     if (token) {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//       socket.user = decoded;
//       console.log(`User connected: ${decoded.username} from team: ${decoded.teamName}`);
//     }
//     next();
//   } catch (error) {
//     console.log('Socket connection without valid token');
//     next(); // Allow connection even without token for now
//   }
// });

// io.on('connection', socket => {
//   console.log(socket.handshake.query);
//   console.log('New client Connected');

//   // Join team room if user is authenticated
//   if (socket.user) {
//     socket.join(socket.user.teamName);
//     socket.to(socket.user.teamName).emit('user-joined', {
//       username: socket.user.username,
//       teamName: socket.user.teamName,
//     });
//   }

//   socket.on('disconnect', () => {
//     console.log('Client is Disconnect');
//     if (socket.user) {
//       socket.to(socket.user.teamName).emit('user-left', {
//         username: socket.user.username,
//         teamName: socket.user.teamName,
//       });
//     }
//   });

//   socket.on('chat-message', message => {
//     console.log(message);
//     // Send to team members only if authenticated
//     if (socket.user) {
//       socket.to(socket.user.teamName).emit('chat-message', {
//         ...message,
//         username: socket.user.username,
//         teamName: socket.user.teamName,
//       });
//     } else {
//       socket.broadcast.emit('chat-message', message);
//     }
//   });
// });

// const port = process.env.PORT || 5000;

// server.listen(port, (req, res) => {
//   console.log(`server is running on port ${port}`);
// });

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketServer } from 'socket.io';
import app from './src/app.js';
import connectToDb from './src/db/db.js';
import Message from './src/models/message.model.js';

connectToDb();

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const userSockets = new Map(); // teamName-username -> socket.id for calls

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.user = decoded;
      console.log(`User connected: ${decoded.username} from team: ${decoded.teamName}`);
      userSockets.set(`${decoded.teamName}-${decoded.username}`, socket.id);
    }
    next();
  } catch (error) {
    console.log('Socket connection without valid token');
    next();
  }
});

io.on('connection', socket => {
  console.log('New client Connected');

  if (socket.user) {
    socket.join(socket.user.teamName);
    socket.to(socket.user.teamName).emit('user-joined', {
      username: socket.user.username,
      teamName: socket.user.teamName,
    });
  }

  // New: Join project room for code editing
  socket.on('join-project', projectId => {
    if (socket.user && projectId) {
      const room = `${socket.user.teamName}-${projectId}`;
      socket.join(room);
      console.log(`User ${socket.user.username} joined project room: ${room}`);
    }
  });

  // New: Code change (broadcast delta/full code)
  socket.on('code-change', ({ projectId, delta, code, cursorPos }) => {
    if (socket.user && projectId) {
      const room = `${socket.user.teamName}-${projectId}`;
      socket.to(room).emit('code-change', {
        projectId,
        delta,
        code,
        cursorPos,
        username: socket.user.username,
      });
    }
  });

  // Updated: Chat with persistence
  socket.on('chat-message', async message => {
    if (socket.user) {
      try {
        const newMsg = new Message({
          teamName: socket.user.teamName,
          projectId: message.projectId || null,
          username: socket.user.username,
          message: message.text,
        });
        const saved = await newMsg.save();
        const savedObj = saved.toObject();
        socket.to(socket.user.teamName).emit('chat-message', savedObj);
      } catch (error) {
        console.error('Message save error:', error);
      }
    } else {
      socket.broadcast.emit('chat-message', message);
    }
  });

  // New: WebRTC Signaling for calls/video
  socket.on('call-user', ({ username, offer, type = 'video' }) => {
    // type: 'audio' or 'video'
    if (socket.user) {
      const targetSocketId = userSockets.get(`${socket.user.teamName}-${username}`);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-call', {
          from: socket.user.username,
          offer,
          type,
          callerSocket: socket.id, // For callback
        });
      }
    }
  });

  socket.on('call-accepted', ({ to, answer }) => {
    io.to(to).emit('call-accepted', { answer });
  });

  socket.on('call-rejected', ({ to }) => {
    io.to(to).emit('call-rejected');
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('ice-candidate', { candidate });
  });

  socket.on('end-call', ({ to }) => {
    io.to(to).emit('end-call');
  });

  socket.on('disconnect', () => {
    console.log('Client is Disconnect');
    if (socket.user) {
      userSockets.delete(`${socket.user.teamName}-${socket.user.username}`);
      socket.to(socket.user.teamName).emit('user-left', {
        username: socket.user.username,
        teamName: socket.user.teamName,
      });
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
