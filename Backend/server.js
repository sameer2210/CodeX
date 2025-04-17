import app from "./src/app.js";
import connectToDb from "./src/db/db.js";
import {Server as SocketServer} from 'socket.io';
import http, { METHODS } from 'http';
import { Socket } from "dgram";

connectToDb();

const server = http.createServer(app);
const io = new SocketServer(server,{
  cors:{
    origin:'*',
    // methods:["GET","POST"]
  }
})

io.on('connection', (socket) => {
  console.log('New client Connected');
  socket.on('disconnect',() => {
    console.log('Client is Disconnect');
    
  })
  
})

const port = process.env.PORT || 5000;

server.listen(port, (req, res) => {
  console.log(`server is running on port ${port}`);
});
