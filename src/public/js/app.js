const socket = io(); // io() 는 socket.io 의 프론트에서의 출력을 함

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");
const chat = document.getElementById("chat");

call.hidden = true;
chat.hidden = true;

let myStream;
let muted = false; // 처음엔 음소거가 아님
let cameraOff = false; // 처음엔 카메라가 켜져 있음
let roomName; // 방의 이름을 공유하기 위함
let myPeerConnection; // 누구와 연결되었는지
let myDataChannel;
let nickName = "Anon";

async function getCameras() {
  // 카메라의 정보 , 변경 등을 할 수 있게 구현함
  try {
    const devices = await navigator.mediaDevices.enumerateDevices(); // 사용자의 사용장치를 불러옴
    const cameras = devices.filter((device) => device.kind === "videoinput"); // 사용자의 장치 중 카메라만 불러옴
    const currentCamera = myStream.getVideoTracks()[0];
    //console.log(cameras);

    cameras.forEach((camera) => {
      const option = document.createElement("option"); // 옵션을 만들고
      option.value = camera.deviceId; // 옵션의 value 값의 카메라 device값을 넣는다.
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        // 생성된 옵션의 라벨과 비디오트랙의 첫번째 배열의 label값이 같다면 보여지는 라벨이 선택된 것이 맞는것임
        option.selected = true;
      }
      camerasSelect.appendChild(option); // 프론트앤드에 연결
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  // 사용자의 카메라, 마이크 사용권한을 요구함
  const defaultConstrains = {
    // 사용자가 카메라를 선택하지 않았고 초기화면일 때
    audio: true,
    video: { facingMode: "user" },
  };
  const userConstrains = {
    // 사용자가 지정한 카메라를 선택하였을 때
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      //사용자에게 미디어 입력 장치 사용 권한을 요청하며, 사용자가 수락하면 요청한 미디어 종류의 트랙을 포함한 MediaStream (en-US)을 반환
      deviceId ? userConstrains : defaultConstrains // 디바이스 아이디가 있다면 user가 설정한 카메라를 실행 없다면 초기값 카메라 실행
    );
    console.log(myStream);
    myFace.srcObject = myStream; // srcObject란 현재 HTMLMediaElement 객체에서 재생중이거나 재생되었던 미디어를 참조하는 MediaStream 객체를 참조한다.
    if (!deviceId) {
      // 디바이스 아이디가 없다면 getCameras 함수 실행
      await getCameras(); // 카메라에 관한 추가적인 함수 실행
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled; // 사용자의 오디오 정보를 불러온 후 클릭할 때마다 enabled 상태가 변경되도록 함
  });
  if (muted === false) {
    // 음소거가 아닐 때 클릭 시
    muteBtn.innerText = "Unmute"; // 음소거 해제하기로 변하고
    muted = true; // 음소거로 변함
  } else {
    muteBtn.innerText = "Mute"; // 음소거일때 클릭 시
    muted = false;
  }
}
function handleCameraClick() {
  myStream.getVideoTracks().forEach((track) => {
    // 사용자의 카메라 정보를 불러온 후 클릭할 때마다 enabled 상태가 변경되도록 함
    track.enabled = !track.enabled;
  });
  if (cameraOff === false) {
    // 카메라가 켜져 있을 때
    cameraBtn.innerText = "Turn Camera Off"; // 카메라를 끄는 버튼이 활성화 됨
    cameraOff = true; // 카메라를 끄는 것을 true로 바꿈
  } else {
    cameraBtn.innerText = "Turn Camera On"; // 카메라를 키는 버튼이 활성화 됨
    cameraOff = false; //
  }
}

async function handleCameraChange() {
  // 카메라 변경 함수
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    // 통신이 연결되어 있다면 실행한다
    const videoTrack = myStream.getVideoTracks()[0]; // 내 비디오 스트림의 0번째 인자를 가져옴
    const videoSender = myPeerConnection //getSenders() 메소드는 RTCRtpSender (en-US) 객체의 배열을 반환
      .getSender()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack); // 현재 송신자의 소스로 사용 중인 트랙을 새 MediaStreamTrack으로 바꿉니다.
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// welcome Form (join room) // 방 입장에 관한 코드들

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  chat.hidden = false;
  await getMedia();
  makeConnection(); // 서버로 보냄
}

async function handleWelcomeSubmit(event) {
  event.preventDefault(); // 기존이벤트 초기화
  const input = welcomeForm.querySelector("input");
  //console.log(input.value);
  await initCall(); // myPeerConnection 생성에 서버측의 속도를 맞추기 위함
  socket.emit("join_room", input.value); // 백앤드로 join_room 에 대한 이벤트와 인자 , 실행할 함수를 보냄
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// socket code socket io 이벤트에 관한 코드

socket.on("welcome", async () => {
  // Peer A가 offer을 생성하고 연결 인터페이스와 관련이 있는 로컬 설명 (local description)을 변경하고 그 offer을 보내는 과정입니다.
  try {
    //console.log("오퍼를 생성");

    myDataChannel = myPeerConnection.createDataChannel("chat"); // peer to peer 에서 파일,채팅,이미지 등을 교환 할수 있는 dataChannel 생성
    myDataChannel.addEventListener("message", (event) => {
      createChat(event.data); // 자신의 메세지와 닉네임을 보냄
      //console.log(event.data);
    }); // 메세지를 받으면 출력함
    //console.log("데이터를 만들었습니다");
    const offer = await myPeerConnection.createOffer(); // RTC 에 필요한 type offer 생성하기

    myPeerConnection.setLocalDescription(offer); // myPeerConnection 에 offer 값 설정하기
    //console.log(offer);
    socket.emit("offer", offer, roomName); // offer을 Peer B에게 보냄
    //console.log("오퍼를 보냄");
  } catch (e) {
    console.log(e);
  }
});

socket.on("offer", async (offer) => {
  // Peer B
  //console.log("오퍼를 받아서 응답을 만듬");
  myPeerConnection.addEventListener("datachannel", (event) => {
    // 생성된 datachannel을 받아서 이벤트를 실행합니다
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", (event) => {
      createChat(event.data);
      //console.log(event.data);
    }); // datachannel에서 보내온 event 에서 channel 부분을 내 데이터 채널로 재지정합니다
  });
  //console.log("데이터를 받았습니다");
  myPeerConnection.setRemoteDescription(offer); // 응답받은 offer을 원격 피어의 현재 제공 또는 응답으로 설정합니다.
  const answer = await myPeerConnection.createAnswer(); // Peer A의 offer 연결으로 인한 값인 type answer을 생성합니다
  myPeerConnection.setLocalDescription(answer); // myPeerConnection 에 응답받은 offer 값 설정하기
  //console.log(answer);
  socket.emit("answer", answer, roomName);
  //console.log("응답을 보냄");
});

socket.on("answer", (answer) => {
  //console.log("응답을 받고 설정함");
  myPeerConnection.setRemoteDescription(answer); // Peer B 가 보내온 값으로 myPeerConnection 에 원격 피어의 현재 제공 또는 응답으로 설정합니다. remote로 해야함
});

socket.on("ice", async (ice) => {
  //console.log("아이스를 받음");
  //console.log(ice);
  await myPeerConnection.addIceCandidate(ice).catch((e) => console.log(e)); // WebRTC가 선택한 candidate를 입력받음
});

// RTC Code 리얼타임코드

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  }); // 브라우저 간 peer to peer 연결을 만듬
  //console.log("RTC를 만듬");
  myPeerConnection.addEventListener("icecandidate", handleIce); // 서로 통신연결을 하였을 때 실행됨
  myPeerConnection.addEventListener("addstream", handleAddStream); // icecandidate 가 검증 끝나면 addstream 이벤트가 시작됨
  //console.log(myStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream)); // 양쪽 브라우저에서 오디오,비디오 데이터 stream을 받아서  연결안에 집어 넣었습니다
  //console.log("각각의 mystream 생성 완료");
}

function handleIce(data) {
  //console.log(data);
  //console.log("아이스를 보냄");
  //console.log(data);
  socket.emit("ice", data.candidate, roomName); // WebRTC가 선택한 candidate를 사용해서 연결 보냄
}

function handleAddStream(data) {
  //console.log("비디오를 만들라고함");
  //console.log(data);
  //console.log("내 스트림", myStream);
  //console.log("상대의 스트림", data.stream);
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream; // peerFace 비디오 태그에 상대방의 stream을 입력
}

// Chat Code 채팅 기능 구현하는 코드

function handleChatSubmit(event) {
  // 채팅을 보내면 자기의 채팅을 보냄 , 그리고 자기화면에 입력값 출력
  event.preventDefault();
  const ul = chat.querySelector("ul");
  const li = document.createElement("li");
  const input = chat.querySelector("input");
  myDataChannel.send(`${nickName} : ${input.value}`);
  li.innerText = `${nickName} : ${input.value}`;
  ul.appendChild(li);
  input.value = "";
}

function createChat(msg) {
  // 채팅을 받으면 화면에 상대방의 말을 출력함
  const ul = chat.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = `${msg}`;
  ul.appendChild(li);
}

chat.addEventListener("submit", handleChatSubmit);

//nickname save code 닉네임을 정함

const nick = document.getElementById("nickname");
const nickForm = nick.querySelector("form");

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  nickName = input.value;
  console.log(nickName);
}

nickForm.addEventListener("submit", handleNickSubmit);
