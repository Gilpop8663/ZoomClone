const socket = io(); // io() 는 socket.io 의 프론트에서의 출력을 함

const welcome = document.getElementById("welcome"); // div #웰컴을 선택
const enterRoomForm = welcome.querySelector("#enter"); // 폼을 선택
const room = document.getElementById("room");
const nameForm = welcome.querySelector("#nickname");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You : ${value}`);
  }); // 프론트에서 백엔드로 new_message 라는 이름의 이벤트를 보냈고 input.value라는 인자를 보냈다
  // 백엔드에서 어떤 채팅방에 보내는 지 알 수 있게 roomName 도 인자로 보냈다.
  // 그리고 마지막 인자에는 addMessage 함수를 실행하여 백엔드가 프론트의 함수를 실행하도록 하였다.
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("#nickname input"); // 닉네임 form 의 input을 선택
  socket.emit("nickname", input.value); // 백앤드로 프론트에서 받은 입력값을 nickname 이벤트명과 함께 보냄
  const h3 = welcome.querySelector("h3");
  h3.innerText = `닉네임 : ${input.value}`;
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault(); // 이벤트 초기화
  const input = welcome.querySelector("#enter input"); // form 안의 input을 선택
  socket.emit("enter_room", input.value, showRoom); // wws 와 달리 socket.io 는 send 대신 emit 을 사용한다  또한 여러가지의 문자열,오브젝트,심지어 함수까지 보낼 수 있다. ( 함수는 맨 마지막 인자로 보내야함)
  roomName = input.value;
  input.value = "";
}

enterRoomForm.addEventListener("submit", handleRoomSubmit);
nameForm.addEventListener("submit", handleNicknameSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = "";
  h3.innerText = `방제 : ${roomName} ${newCount}명 이용 중`;
  addMessage(`${user} is arrived!`); // 백엔드에서 룸에 입장하는 사람에게 welcome 이벤트를 보내왔고 프론트에서 welcome 이벤트에 반응하여 메세지를 출력함
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = "";
  h3.innerText = `방제 : ${roomName} ${newCount}명 이용 중`;
  addMessage(`${left} left ㅜㅜ}`); // 백엔드에서 룸에 입장하는 사람에게 bye 이벤트를 보내왔고 프론트에서 bye 이벤트에 반응하여 메세지를 출력함
});

socket.on("new_message", (msg) => {
  addMessage(msg); // 프론트에서 백앤드로 msg 를 보내고 다시 백앤드에서 프론트로 msg 를 보내와서 이벤트에 반응함
});

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul"); // 백엔드에서 사용자가 룸을 생성하고 없애는 것을 감지합니다
  roomList.innerHTML = ""; // roomList 를 초기화해서 매번 새로고침하도록 함
  if (rooms.length === 0) {
    return rooms;
  }
  rooms.forEach((room) => {
    // 입력받은 room 을 forEach로 ul 밑의 li 형식으로 출력한다.
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
/*const messageList = document.querySelector("ul");
const messageForm = document.querySelector(".msg");
const nickForm = document.querySelector(".nick");
const socket = new WebSocket(`ws://${window.location.host}`);
//프론트앤드가 백앤드에 요청할 때

function makeMessage(type, payload) {
  const msg = { type, payload }; // msg 에는 type 무엇을 나타내는지 , payload 내용이 들어간다
  return JSON.stringify(msg); // JSON.stringify 를 통해 [object Object]로 표현되는 것을 문자열로 제대로 표현시켜준다.
}

socket.addEventListener("open", () => {
  // 서버와 브라우저 간 연결이 되었을 때 출력
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  // 서버로부터 메세지를 받는 addEventListener 역할
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  //서버와 브라우저 간 연결이 끊겼을 때 출력
  console.log("Disconnected from Server ❌");
});

function handleSubmit(event) {
  event.preventDefault(); // 버튼을 눌렀을 때 사이트가 초기화 되는 것을 막아줌.
  const input = messageForm.querySelector("input"); // input 선택
  socket.send(makeMessage("new_message", input.value)); //백앤드로 input에 넣은 입력값을 보냄
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value)); // 닉네임 타입과 , 사용자가 쓴 닉네임을 입력값으로 보냄
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
*/
