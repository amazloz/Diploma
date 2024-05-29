import * as constants from "./constants.js";

let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
  screenSharingStream: null,
  allowConnectionsFromStrangers: true,
  screenSharingActive: false,
  callState: constants.callState.CALL_AVAILABLE,
};

export const setSocketId = (socketId) => {
  state = {
    ...state,
    socketId,
  };
  //console.log(state);
};

export const setLocalStream = (stream) => {
  state = {
    ...state,
    localStream: stream,
  };
  //console.log(state);
};

export const setAllowConnectionsFromStrangers = (allowConnection) => {
  state = {
    ...state,
    allowConnectionsFromStrangers: allowConnection,
  };
  //console.log(state);
};

export const setScreenSharingActive = (screenSharingActive) => {
  state = {
    ...state,
    screenSharingActive,
  };
  //console.log(state);
};

export const setScreenSharingStream = (stream) => {
  state = {
    ...state,
    ScreenSharingStream: stream,
  };
  //console.log(state);
};

export const setRemoteStream = (stream) => {
  state = {
    ...state,
    remoteStream: stream,
  };
  //console.log(state);
};

export const setCallState = (callState) => {
  state = {
    ...state,
    callState,
  };
  //console.log(state);
};

export const getState = () => {
  return state;
};
