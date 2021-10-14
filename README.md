## Zoom Clone

배운 이론
WebSocket , WebRTC , SocketIO

구현하는 기능
Realtime , chat , Rooms , Notification ,Video Call , Audio Call

NodeJs 로 만든 Peer to Peer , WebRTC를 활용한 유저 간 화상통신, WebSocket을 활용해서 채팅방 생성, 개인 메세지 기능들을 만들어봄으로써 제가 앞으로 만들 다른 사이트에도 채팅 기능을 넣을수 있게 되었습니다.

## Screenshots

Include logo/demo screenshot etc.

## Features

코로나로 사람들과의 거리가 멀어진 현재 함께 취미와 추억을 공유해줄수 있는 어플입니다.

It is an application that can share hobbies and memories with people who are far away from each other due to coronavirus.

## Code Example

wsServer.on("connection", (socket) => {
//ws 서버, socket.io 를 연결
socket["nickname"] = "Anon";
socket.on("nickname", (nick) => {
socket["nickname"] = nick;
});
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

## Tests

<img width="80%" src="https://user-images.githubusercontent.com/80146176/137236137-53fb8846-438e-4d32-ba4c-dd60508d2907.gif"/>

## License

A short snippet describing the license (MIT, Apache etc)

MIT © [gilpop8663]
