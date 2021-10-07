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

function roomCount(roomName) {
  const count = wsServer.sockets.adapter.rooms.get(roomName)?.size;
  return count;
}

function publicRooms() {
  // 현재 채팅방의 목록을 표현하는 함수임
  const {
    sockets: {
      adapter: { rooms, sids }, // rooms 와 sids 는 공적인 채팅방, 개인적 채팅방의 표현 개수가 다르다는 점을 이용함
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((value, key) => {
    if (sids.get(key) === undefined) {
      // sids.get(key)를 했을 때 undefined 면 개인적 채팅방으로 사용자가 만든 채팅방인걸 알 수 있다.
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

wsServer.on("connection", (socket) => {
  wsServer.sockets.emit("room_change", publicRooms()); // 방에 아무도 없을 때 채팅방 상황이 변경되었다고 알림
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    //console.log(wsServer.sockets.adapter);
    console.log(`Socket Event : ${event}`); // socket에 이벤트가 발생하면 출력함
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); // 룸에 입장함
    done(roomCount(roomName)); //프론트에 있는 done()에 해당하는 함수 실행
    wsServer.to(roomName).emit("welcome", socket.nickname, roomCount(roomName)); // 사용자가 룸에 입장하면 프론트에 닉네임 인자와 welcome 이벤트를 보냄
    wsServer.sockets.emit("room_change", publicRooms()); // 방을 사용자가 만들면 채팅방 상황이 변경되었디고 알림
  });
  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname} : ${msg}`); // room에 해당하는곳에 new_message 와 백엔드에서 받은 msg 인자를 프론트로 보냄
    done(); //프론트에 있는 done()에 해당하는 함수 실행
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, roomCount(room) - 1)
    ); //사용자가 브라우저를 끄거나 인터넷 연결이 끊길 때 프론트에 알림
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms()); // 방에 아무도 없을 때 채팅방 상황이 변경되었다고 알림
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname)); // 프론트에서 입력받은 nickname 인자를 socket 배열에 추가하고 업데이트함
});

const handleListen = () => console.log(`Listening on http:localhost:3000`);

httpServer.listen(3000, handleListen);

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
