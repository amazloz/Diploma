import * as constants from "./constants.js";
import * as elements from "./elements.js";

const callm = localStorage.getItem("callType");
export const updatePersonalCode = (personalCode) => {
  const personalCodeParagraph = document.getElementById(
    "personal_code_paragraph"
  );
  personalCodeParagraph.innerHTML = personalCode;
};

export const updateLocalVideo = (stream) => {
  const remoteVideo = document.getElementById("remote_video");
  const remoteimg = document.getElementById("video_placeholder");
  const localVideo = document.getElementById("local_video");
  const localimg = document.getElementById("video_placeholder2");
  if (callm === "audio") {
    hideElement(remoteVideo);
    showElement(remoteimg);
    hideElement(localVideo);
    showElement(localimg);
  } else {
    hideElement(remoteimg);
    showElement(remoteVideo);
    hideElement(localimg);
    showElement(localVideo);
  }
  localVideo.srcObject = stream;
  localVideo.addEventListener("loadedmetadata", () => {
    localVideo.play();
  });
  if (stream.getAudioTracks().length > 0) {
    localVideo.muted = false;
  }
};

export const updateRemoteVideo = (stream) => {
  const remoteVideo = document.getElementById("remote_video");
  const remoteimg = document.getElementById("video_placeholder");
  const localVideo = document.getElementById("local_video");
  const localimg = document.getElementById("video_placeholder2");

  document.getElementById("main_container").classList.remove("display_none");

  if (callm === "audio") {
    hideElement(remoteVideo);
    showElement(remoteimg);
    hideElement(localVideo);
    showElement(localimg);
    localStorage.setItem("callType", "video");
  } else {
    hideElement(remoteimg);
    showElement(remoteVideo);
    hideElement(localimg);
    showElement(localVideo);
    localStorage.setItem("callType", "audio");
  }
  remoteVideo.srcObject = stream;
  remoteVideo.addEventListener("loadedmetadata", () => {
    remoteVideo.play();
  });
  if (stream.getAudioTracks().length > 0) {
    remoteVideo.muted = false;
  }
};

export const showIncomingCallDialog = (
  callType,
  acceptCallHandler,
  rejectCallHandler
) => {
  const callTypeInfo =
    callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";

  const incomingCallDialog = elements.getIncomingCallDialog(
    callType,
    acceptCallHandler,
    rejectCallHandler
  );
  const popUp = document.getElementById("match_body");
  hideElement(popUp);
  document.getElementById("main_container").classList.remove("display_none");

  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
  dialog.appendChild(incomingCallDialog);
};

export const showCallingDialog = (rejectCallHandler) => {
  const callingDialog = elements.getCallingDialog(rejectCallHandler);

  const popUp = document.getElementById("match_body");
  hideElement(popUp);
  document.getElementById("main_container").classList.remove("display_none");

  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());

  dialog.appendChild(callingDialog);
};

export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    infoDialog = elements.getInfoDialog(
      "Call rejected",
      "Callee rejected your call"
    );
  }
  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    infoDialog = elements.getInfoDialog(
      "Callee not found",
      "Please check personal code"
    );
  }
  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    infoDialog = elements.getInfoDialog(
      "Call is not available",
      "Probably callee is busy. Please try again later"
    );
  }

  if (infoDialog) {
    const dialog = document.getElementById("dialog");
    dialog.appendChild(infoDialog);

    setTimeout(() => {
      removeAllDialogs();
    }, [4000]);
  }
};

export const removeAllDialogs = () => {
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};

export const showCallElements = (callType) => {
  if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
    showChatCallElements();
    const popUp = document.getElementById("match_body");
    hideElement(popUp);
    document.getElementById("main_container").classList.remove("display_none");
  }
  if (callType === constants.callType.VIDEO_STRANGER) {
    showVideoCallElements();
    const popUp = document.getElementById("match_body");
    hideElement(popUp);

    const timerDisplay = document.getElementById("timer");
    const tenMinutes = 60 * 10;
    startTimer(tenMinutes, timerDisplay);
    setTimeout(() => {
      document.getElementById("finish_chat_call_button").click();
    }, 600000);
    localStorage.setItem("StrangerCall", "aftercall");
    document.getElementById("main_container").classList.remove("display_none");
  }
};
let timerInterval;

function startTimer(duration, display) {
  let timer = duration,
    minutes,
    seconds;
  timerInterval = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = minutes + ":" + seconds;

    if (--timer < 0) {
      clearInterval(timerInterval);
      document.getElementById("finish_chat_call_button").click();
    }
  }, 1000);
}

const showChatCallElements = () => {
  const finishConnectionChatButtonContainer = document.getElementById(
    "finish_chat_button_container"
  );
  showElement(finishConnectionChatButtonContainer);

  const newMessageInput = document.getElementById("new_message");
  showElement(newMessageInput);

  disableDashboard();
};

const showVideoCallElements = () => {
  const callButtons = document.getElementById("call_buttons");
  showElement(callButtons);

  const fButton = document.getElementById("fullscreenButton");
  showElement(fButton);

  const newMessageInput = document.getElementById("new_message");
  showElement(newMessageInput);

  disableDashboard();
};

const micOnImgSrc = "./utils/images/mic.png";
const micOffImgSrc = "./utils/images/micOff.png";

export const updateMicButton = (micActive) => {
  const micButtonImage = document.getElementById("mic_button_image");
  micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
};

const cameraOnImgSrc = "./utils/images/camera.png";
const cameraOffImgSrc = "./utils/images/cameraOff.png";

export const updateCameraButton = (cameraActive) => {
  const cameraButtonImage = document.getElementById("camera_button_image");
  cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
};

//messages

export const appendMessage = (message, right = false) => {
  const messagesContainer = document.getElementById("messages_container");
  const messageElement = right
    ? elements.getRightMessage(message)
    : elements.getLeftMessage(message);
  messagesContainer.appendChild(messageElement);
};

export const clearMessenger = () => {
  const messagesContainer = document.getElementById("messages_container");
  messagesContainer.querySelectorAll("*").forEach((n) => n.remove());
};

export const updateUIAfterHangUp = (callType) => {
  if (
    callType === constants.callType.VIDEO_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    const callButtons = document.getElementById("call_buttons");
    hideElement(callButtons);
  } else {
    const chatCallButtons = document.getElementById(
      "finish_chat_button_container"
    );
    hideElement(chatCallButtons);
  }

  clearMessenger();

  updateMicButton(false);
  updateCameraButton(false);

  const remoteVideo = document.getElementById("remote_video");
  hideElement(remoteVideo);

  const placeholder = document.getElementById("video_placeholder");
  showElement(placeholder);

  const localVideo = document.getElementById("local_video");
  hideElement(localVideo);

  const placeholder2 = document.getElementById("video_placeholder2");
  showElement(placeholder2);

  const fButton = document.getElementById("fullscreenButton");
  hideElement(fButton);
};

export const updateStrangerCheckbox = (allowConnections) => {
  const checkboxCheckImg = document.getElementById(
    "allow_strangers_checkbox_image"
  );

  allowConnections
    ? showElement(checkboxCheckImg)
    : hideElement(checkboxCheckImg);
};

const enableDashboard = () => {};

const disableDashboard = () => {};

const hideElement = (element) => {
  if (!element.classList.contains("display_none")) {
    element.classList.add("display_none");
  }
};

const showElement = (element) => {
  if (element.classList.contains("display_none")) {
    element.classList.remove("display_none");
  }
};
