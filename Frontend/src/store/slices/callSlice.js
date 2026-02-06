import { createAction, createSlice } from '@reduxjs/toolkit';

export const CALL_STATUS = {
  IDLE: 'IDLE',
  CALLING: 'CALLING',
  RINGING: 'RINGING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  ENDED: 'ENDED',
  FAILED: 'FAILED',
};

  const initialState = {
  status: CALL_STATUS.IDLE,
  direction: null, // 'outgoing' | 'incoming'
  callId: null,
  callType: 'audio',
  caller: null,
  receiver: null,
  recipients: [],
  offer: null,
  answer: null,
  startedAt: null,
  endedAt: null,
  reason: null,
  error: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isMuted: false,
  isVideoOff: false,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    resetCallState: () => ({ ...initialState }),
    setOutgoingCall: (state, action) => {
      const { callId, receiver, callType, caller, recipients } = action.payload;
      state.status = CALL_STATUS.CALLING;
      state.direction = 'outgoing';
      state.callId = callId;
      state.callType = callType;
      state.receiver = receiver;
      state.recipients = Array.isArray(recipients) ? recipients : receiver ? [receiver] : [];
      state.caller = caller || null;
      state.offer = null;
      state.answer = null;
      state.startedAt = Date.now();
      state.endedAt = null;
      state.reason = null;
      state.error = null;
    },
    setIncomingCall: (state, action) => {
      const { callId, caller, callType, offer, receiver } = action.payload;
      state.status = CALL_STATUS.RINGING;
      state.direction = 'incoming';
      state.callId = callId;
      state.callType = callType;
      state.caller = caller;
      state.receiver = receiver || null;
      state.recipients = [];
      state.offer = offer || null;
      state.answer = null;
      state.startedAt = Date.now();
      state.endedAt = null;
      state.reason = null;
      state.error = null;
    },
    setCallAccepted: (state, action) => {
      const peer = action.payload?.peer;
      state.status = CALL_STATUS.ACCEPTED;
      state.answer = action.payload?.answer || state.answer;
      state.reason = null;
      state.error = null;
      if (peer) {
        if (state.direction === 'outgoing') {
          state.receiver = peer;
        } else {
          state.caller = peer;
        }
        state.recipients = [peer];
      }
    },
    setCallEnded: (state, action) => {
      const { status, reason, error } = action.payload || {};
      state.status = status || CALL_STATUS.ENDED;
      state.reason = reason || null;
      state.error = error || null;
      state.endedAt = Date.now();
    },
    setLocalStream: (state, action) => {
      state.localStream = action.payload || null;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload || null;
    },
    setPeerConnection: (state, action) => {
      state.peerConnection = action.payload || null;
    },
    setMuted: (state, action) => {
      state.isMuted = !!action.payload;
    },
    setVideoOff: (state, action) => {
      state.isVideoOff = !!action.payload;
    },
    setCallError: (state, action) => {
      state.error = action.payload || null;
    },
  },
});

export const {
  resetCallState,
  setOutgoingCall,
  setIncomingCall,
  setCallAccepted,
  setCallEnded,
  setLocalStream,
  setRemoteStream,
  setPeerConnection,
  setMuted,
  setVideoOff,
  setCallError,
} = callSlice.actions;

// Side-effect actions handled by middleware
export const callStartRequested = createAction('call/start');
export const callAcceptRequested = createAction('call/accept');
export const callRejectRequested = createAction('call/reject');
export const callCancelRequested = createAction('call/cancel');
export const callEndRequested = createAction('call/end');

export default callSlice.reducer;
