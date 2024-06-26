import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
import * as strangerUtils from "./strangerUtils.js";

let socketIO = null;

export const registerSocketEvents = (socket) => {
  socketIO = socket;
  socket.on("connect", () => {
    console.log("successfully connected to socketio server", socket.id);
    console.log(nlanguage);
    console.log(llanguage);
    store.setSocketId(socket.id);
    ui.updatePersonalCode(socket.id);
    localStorage.setItem("socketId", socket.id);
  });

  socket.on("pre-offer", (data) => {
    webRTCHandler.handlePreOffer(data);
    console.log(data);
  });

  socket.on("pre-offer-answer", (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on("user-hanged-up", () => {
    webRTCHandler.handleConnectedUserHangedUp();
  });

  socket.on("webRTC-signaling", (data) => {
    switch (data.type) {
      case constants.WebRTCSignaling.OFFER:
        webRTCHandler.handleWebRTCOffer(data);
        break;
      case constants.WebRTCSignaling.ANSWER:
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case constants.WebRTCSignaling.ICE_CANDIDATE:
        webRTCHandler.handleWebRTCCandidate(data);
        break;
      default:
        return;
    }
  });

  socket.on("stranger-socket-id", (data) => {
    strangerUtils.connectWithStranger(data);
  });
};

export const sendPreOffer = (data) => {
  socketIO.emit("pre-offer", data);
  console.log("sendPreOffer data:", data);
};

export const sendPreOfferAnswer = (data) => {
  socketIO.emit("pre-offer-answer", data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
  socketIO.emit("webRTC-signaling", data);
};

export const sendUserHangedUp = (data) => {
  socketIO.emit("user-hanged-up", data);
};

export const changeStrangerConnectionStatus = (data) => {
  socketIO.emit("stranger-connection-status", data);
};

export const getStrangerSocketId = () => {
  socketIO.emit("get-stranger-socket-id");
};
