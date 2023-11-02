import express from "express";
import dotenv from "dotenv";
import DbConnection from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { Server } from "socket.io";
import path, { dirname } from "path";

dotenv.config();
DbConnection();

const app = express();

app.use(express.json());

app.get("/", (request, response) => {
  response.send("Api is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//-------------deployment----------

const currentWorkingDirectory = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(currentWorkingDirectory, "../client/build"))
  );

  const indexPath = path.resolve(
    currentWorkingDirectory,
    "../client/build/index.html"
  );
  app.get("*", (req, res) => res.sendFile(indexPath));
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully");
  });
}
//-------------deployment----------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`));

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log("user joined room:" + roomId);
  });

  socket.on("typing", (roomId) => {
    socket.in(roomId).emit("typing");
    console.log("typing", roomId);
  });

  socket.on("stop typing", (roomId) => {
    socket.in(roomId).emit("stop typing");
    console.log("stop type", roomId);
  });

  socket.on("New message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(user._id);
  });
});
