const socket = io(); // io() 는 socket.io 의 프론트에서의 출력을 함

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false; // 처음엔 음소거가 아님
let cameraOff = false; // 처음엔 카메라가 켜져 있음

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
    //console.log(myStream);
    myFace.srcObject = myStream; // srcObject란 현재 HTMLMediaElement 객체에서 재생중이거나 재생되었던 미디어를 참조하는 MediaStream 객체를 참조한다.
    if (!deviceId) {
      // 디바이스 아이디가 없다면 getCameras 함수 실행
      await getCameras(); // 카메라에 관한 추가적인 함수 실행
    }
  } catch (e) {
    console.log(e);
  }
}

getMedia();

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
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
