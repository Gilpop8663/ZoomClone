import http from "http";
import SocketIO from "socket.io";
import express from "express";
//import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

const handleListen = () => console.log(`Listening on http:localhost:3000`);

app.get("/", (req, res) => res.render("home"));

const httpServer = http.createServer(app); // http 서버 만들기

const wsServer = SocketIO(httpServer); // 웹소켓 io 서버 만들기

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event : ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });
});

/*
const wss = new WebSocket.Server({ server });

const sockets = []; // 페이크 DB

wss.on("connection", (socket) => {
  sockets.push(socket); // 소켓을 sockets 에 푸쉬함
  socket["nickname"] = "Anon";
  console.log(socket);
  console.log("Connected to Browser ✅"); // 브라우저와 연결되었을 때 출력
  socket.on("close", () => console.log("Disconnectd from the Browser ❌")); //브라우저가 종료되면 출력
  socket.on("message", async (message) => {
    const messageString = message.toString("utf8"); // unicode로 나와서 utf8로 변환
    const msgParsed = JSON.parse(messageString); // 프론트에서 오브젝트로 된 문자열을 받고 JSON.parse 기능으로 백앤드에서 사용하기 유용하게 다시 object로 변환시킨다
    //console.log(msgParsed, messageString);
    switch (msgParsed.type) {
      case "new_message": // 메세지일때
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${msgParsed.payload}`)
        ); // sockets에 있는 wws를 각각에 전달함
      case "nickname": // 닉네임일때
        socket["nickname"] = msgParsed.payload;
      //console.log(msgParsed.payload);
    }

    // 프론트앤드에서의 메세지를 입력받아서 출력함
    //console.log(message);
  });
  //socket.send("Hello!"); // 백앤드에서 프론트앤드로 요청 후 출력함
});


*/

httpServer.listen(3000, handleListen);
