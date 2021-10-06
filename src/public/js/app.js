const socket = io(); // io() 는 socket.io 의 프론트에서의 출력을 함

const welcome = document.getElementById("welcome"); // div #웰컴을 선택
const form = document.querySelector("form"); // 폼을 선택
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = roomName;
}

function handleRoomSubmit(event) {
  event.preventDefault(); // 이벤트 초기화
  const input = form.querySelector("input"); // form 안의 input을 선택
  socket.emit("enter_room", input.value, showRoom); // wws 와 달리 socket.io 는 send 대신 emit 을 사용한다  또한 여러가지의 문자열,오브젝트,심지어 함수까지 보낼 수 있다. ( 함수는 맨 마지막 인자로 보내야함)
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
  addMessage("Someone joined!");
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
