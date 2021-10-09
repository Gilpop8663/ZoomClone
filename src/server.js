import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";
//import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));

const httpServer = http.createServer(app); // http 서버 만들기

const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
}); // 웹소켓 io 서버 만들기 && socketIO 어드민 페이지 설치

instrument(wsServer, {
  auth: false,
}); //어드민 패널에 필요한 요소

wsServer.on("connection", (socket) => {
  //ws 서버, socket.io 를 연결
  socket.on("join_room", (roomName) => {
    //프론트에서 받은 이벤트와 입력값으로 방을 만들고 입장함
    socket.join(roomName);
    socket.to(roomName).emit("welcome"); // 룸네임에 있는 사용자들에게 welcome 이벤트를 보냄
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer); // Peer B에게로 전송함
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer); // Peer A에게로 전송함
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log(`Listening on http:localhost:3000`);

httpServer.listen(3000, handleListen);
