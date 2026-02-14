import jwt from "jsonwebtoken";
import { io } from "socket.io-client";

const URL = "http://localhost:5000";
const MAX_CLIENTS = 1000;
const CLIENT_CREATION_INTERVAL_IN_MS = 50;
const JWT_SECRET = "CodeX";

let clientCount = 0;

const createClient = (index) => {
  const token = jwt.sign({
      username: `loadtest_${index}`,
      teamName: `loadtest_team`,
      userId: `loadtest_id_${index}`
  }, JWT_SECRET);

  const socket = io(URL, {
    transports: ["websocket"],
    auth: {
        token: token
    }
  });

  socket.on("connect", () => {
    console.log(`Client ${index} connected: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client ${index} disconnected`);
  });

  socket.on("connect_error", (err) => {
    console.log(`Client ${index} connect_error: ${err.message}`);
  });

  // Simulate activity
  setInterval(() => {
    if (socket.connected) {
      socket.emit("ping", { timestamp: Date.now() });
    }
  }, 1000 + Math.random() * 2000);

  setTimeout(() => {
    socket.disconnect();
  }, 60000); // Run for 60 seconds to ensure overlap (1000 * 50ms = 50s ramp up)
};

console.log(`Starting load test with ${MAX_CLIENTS} clients...`);

const interval = setInterval(() => {
  if (clientCount >= MAX_CLIENTS) {
    clearInterval(interval);
    console.log("All clients created.");
    return;
  }
  createClient(clientCount);
  clientCount++;
}, CLIENT_CREATION_INTERVAL_IN_MS);
