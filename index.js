import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
config();

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUsers = new Map();
let roomUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining the chat
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("Online Users:", [...onlineUsers.entries()]);
  });

  // Handle sending and receiving chat messages
  socket.on("sendMessage", ({ chatId, senderId, text }) => {
    console.log(`New message in chat ${chatId} from ${senderId}: ${text}`);
    io.emit("chatMessage", { senderId, text });
  });

  console.log("A user connected:", socket.id);

  socket.on("join-room", (chatId) => {
    socket.join(chatId);
  });

  socket.on("offer", ({ offer, chatId }) => {
    socket.to(chatId).emit("offer", { offer });
  });

  socket.on("answer", ({ answer, chatId }) => {
    socket.to(chatId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ candidate, chatId }) => {
    socket.to(chatId).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
