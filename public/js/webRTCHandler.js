import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnection;
let dataChannel;

//let strangerInterest = "Skateboarding";
let myInterest;

//let strangerLanguage = "English";
let myLanguage;

let myAge = localStorage.getItem("user_age");
myAge = 2024 - myAge;
console.log(myAge);

const getMyLanguage = () => {
  const nlanguageElement = document.getElementById("nlanguage");
  return nlanguageElement
    ? nlanguageElement.textContent.split(": ")[1]
    : "unknown";
};
const getMyInterest = () => {
  const interestElement = document.getElementById("interest");
  return interestElement
    ? interestElement.textContent.split(": ")[1]
    : "unknown";
};
const getMyAge = () => {
  const ageElement = document.getElementById("interest");
  return ageElement ? ageElement.textContent.split(": ")[1] : "unknown";
};

const defaultConstraints = {
  audio: true,
  video: true,
};

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:13902",
    },
  ],
};

export const getLocalPreview = () => {
  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setLocalStream(stream);
    })
    .catch((err) => {
      console.log("error occurred when trying to get access to camera");
    });
};

const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);
  dataChannel = peerConnection.createDataChannel("chat");

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      //console.log("peer connection is ready to receive data channel messages");
    };

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      ui.appendMessage(message);
    };
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.WebRTCSignaling.ICE_CANDIDATE,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
    }
  };

  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
    connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
  ) {
    const localStream = store.getState().localStream;

    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }
  }
};

export const sendMessageUsingDataChannel = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  dataChannel.send(stringifiedMessage);
};

export const sendPreOffer = (callType, calleePersonalCode, myAge) => {
  myLanguage = getMyLanguage();
  myInterest = getMyInterest();
  connectedUserDetails = {
    callType,
    socketId: calleePersonalCode,
    language: myLanguage,
    interest: myInterest,
    myAge,
  };
  console.log(connectedUserDetails);

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = {
      callType,
      calleePersonalCode,
      callerLanguage: myLanguage,
      callerInterest: myInterest,
      myAge,
    };
    ui.showCallingDialog(callingDialogRejectCallHandler);
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
    wss.sendPreOffer(data);
  }
  if (
    callType === constants.callType.CHAT_STRANGER ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    const data = {
      callType,
      calleePersonalCode,
      callerLanguage: myLanguage,
      callerInterest: myInterest,
      myAge,
    };
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  const { callType, callerSocketId, callerLanguage, callerInterest } = data;
  console.log("HandlePreOffer data: ", data);

  if (!checkCallPossibility()) {
    return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE);
  }

  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
    strangerLanguage: callerLanguage,
    strangerInterest: callerInterest,
  };
  console.log("handlePreOffer connectedUserDetails:", connectedUserDetails);

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }

  if (
    callType === constants.callType.CHAT_STRANGER ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    if (connectedUserDetails.strangerLanguage === myLanguage) {
      if (myInterest === connectedUserDetails.strangerInterest) {
        createPeerConnection();
        sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
        store.setCallState(constants.callState.CALL_UNAVAILABLE);
        ui.showCallElements(connectedUserDetails.callType);
      } else {
        alert("No user found with same hobby!");
        createPeerConnection();
        sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
        store.setCallState(constants.callState.CALL_UNAVAILABLE);
        ui.showCallElements(connectedUserDetails.callType);
      }
    } else {
      alert("No user found with same language learning!");
    }
  }
};

const acceptCallHandler = () => {
  createPeerConnection();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  store.setCallState(constants.callState.CALL_UNAVAILABLE);
  ui.showCallElements(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  store.setCallState(constants.callState.CALL_AVAILABLE);
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => {
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId,
  };
  closePeerConnectionAndResetState();
  store.setCallState(constants.callState.CALL_AVAILABLE);
  wss.sendUserHangedUp(data);
};

const sendPreOfferAnswer = (preOfferAnswer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    ui.showInfoDialog(preOfferAnswer);
    store.setCallState(constants.callState.CALL_AVAILABLE);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    ui.showInfoDialog(preOfferAnswer);
    store.setCallState(constants.callState.CALL_AVAILABLE);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    ui.showInfoDialog(preOfferAnswer);
    store.setCallState(constants.callState.CALL_AVAILABLE);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    ui.showCallElements(connectedUserDetails.callType);
    createPeerConnection();
    sendWebRTCOffer();
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
  }
};

const sendWebRTCOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.WebRTCSignaling.OFFER,
    offer: offer,
  });
};

export const handleWebRTCOffer = async (data) => {
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.WebRTCSignaling.ANSWER,
    answer: answer,
  });
};

export const handleWebRTCAnswer = async (data) => {
  await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (err) {
    console.error(
      "error occured when trying to add received ice candidate",
      err
    );
  }
};

let screenSharingStream;

export const switchBetweenCameraAndScreenSharing = async (
  screenSharingActive
) => {
  try {
    if (screenSharingActive) {
      const localStream = store.getState().localStream;
      const senders = peerConnection.getSenders();

      const sender = senders.find((sender) => {
        return sender.track.kind === localStream.getVideoTracks()[0].kind;
      });

      if (sender) {
        sender.replaceTrack(localStream.getVideoTracks()[0]);
      }

      if (screenSharingStream) {
        screenSharingStream.getTracks().forEach((track) => track.stop());
      }

      ui.updateLocalVideo(localStream);
      store.setScreenSharingActive(!screenSharingActive);
    } else {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      store.setScreenSharingStream(screenSharingStream);

      const senders = peerConnection.getSenders();

      const sender = senders.find((sender) => {
        return (
          sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
        );
      });

      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.setScreenSharingActive(!screenSharingActive);
      ui.updateLocalVideo(screenSharingStream);
    }
  } catch (err) {
    console.error(
      "Error occurred when trying to switch between camera and screen sharing:",
      err
    );
  }
};

export const handleHangUp = () => {
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId,
  };

  wss.sendUserHangedUp(data);
  closePeerConnectionAndResetState();
};

export const handleConnectedUserHangedUp = () => {
  closePeerConnectionAndResetState();
};

function toggleFriendPopup() {
  document.getElementById("popup-2").classList.toggle("active");
  console.log("toggled");
}

const closePeerConnectionAndResetState = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
    toggleFriendPopup();
    window.location.href = "/match";
  }
  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
    connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
  ) {
    store.getState().localStream.getVideoTracks()[0].enabled = true;
    store.getState().localStream.getAudioTracks()[0].enabled = true;
  }
  ui.updateUIAfterHangUp(connectedUserDetails.callType);
  store.setCallState(constants.callState.CALL_AVAILABLE);
  connectedUserDetails = null;
};

const checkCallPossibility = () => {
  const callState = store.getState().callState;
  if (callState === constants.callState.CALL_AVAILABLE) {
    return true;
  }
  return false;
};
