// store/socketMiddleware.js
import { io } from 'socket.io-client';
import { notify } from '../lib/notify';
import {
  CALL_STATUS,
  callAcceptRequested,
  callCancelRequested,
  callEndRequested,
  callRejectRequested,
  callStartRequested,
  resetCallState,
  setCallAccepted,
  setCallEnded,
  setIncomingCall,
  setLocalStream,
  setOutgoingCall,
  setPeerConnection,
  setRemoteStream,
} from './slices/callSlice';
import {
  addChatMessage,
  addTypingUser,
  removeTypingUser,
  setActiveUsers,
  setChatMessages,
  setProjectJoined,
  updateTeamMemberStatus,
  updateProjectCode,
  updateProjectReview,
} from './slices/projectSlice';
import {
  acceptIncoming,
  addRemoteIceCandidate,
  applyAnswer,
  cleanup as cleanupCallMedia,
  handleRemoteOffer,
  startOutgoing,
} from '../webrtc/callManager';
import {
  socketConnected,
  socketConnecting,
  socketDisconnected,
  socketError,
} from './slices/socketSlice';
import { logout } from './slices/authSlice';

const INTERNAL_SOCKET_ACTIONS = new Set([
  socketConnecting.type,
  socketConnected.type,
  socketDisconnected.type,
  socketError.type,
]);

let socket = null;
let pendingActions = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let callTimeoutId = null;
let callResetId = null;
let iceCandidateListener = null;
let peerStateListener = null;
let iceRestartListener = null;

const clearCallTimers = () => {
  if (callTimeoutId) {
    clearTimeout(callTimeoutId);
    callTimeoutId = null;
  }
  if (callResetId) {
    clearTimeout(callResetId);
    callResetId = null;
  }
};

const generateCallId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const removeCallListeners = () => {
  if (iceCandidateListener) {
    window.removeEventListener('ice-candidate-generated', iceCandidateListener);
    iceCandidateListener = null;
  }
  if (peerStateListener) {
    window.removeEventListener('peer-connection-state-change', peerStateListener);
    peerStateListener = null;
  }
  if (iceRestartListener) {
    window.removeEventListener('ice-restart-offer', iceRestartListener);
    iceRestartListener = null;
  }
};

const attachCallListeners = store => {
  if (!iceCandidateListener) {
    iceCandidateListener = event => {
      const callId = store.getState().call.callId;
      if (!callId || !socket?.connected) return;
      socket.emit('call:ice-candidate', { callId, candidate: event.detail?.candidate });
    };
    window.addEventListener('ice-candidate-generated', iceCandidateListener);
  }

  if (!peerStateListener) {
    peerStateListener = event => {
      const state = event.detail?.state;
      if (!state) return;
      if (['failed', 'closed', 'disconnected'].includes(state)) {
        store.dispatch(
          setCallEnded({ status: CALL_STATUS.FAILED, reason: `peer-${state}` })
        );
        cleanupCall(store);
      }
    };
    window.addEventListener('peer-connection-state-change', peerStateListener);
  }

  if (!iceRestartListener) {
    iceRestartListener = event => {
      const callId = store.getState().call.callId;
      if (!callId || !socket?.connected) return;
      const offer = event.detail?.offer;
      if (!offer) return;
      socket.emit('call:offer', { callId, offer });
    };
    window.addEventListener('ice-restart-offer', iceRestartListener);
  }
};

const scheduleReset = store => {
  if (callResetId) clearTimeout(callResetId);
  callResetId = setTimeout(() => {
    store.dispatch(resetCallState());
  }, 1200);
};

const cleanupCall = store => {
  cleanupCallMedia();
  removeCallListeners();
  clearCallTimers();
  scheduleReset(store);
};

const logCall = (message, payload) => {
  if (payload) {
    console.log(`[CALL] ${message}`, payload);
  } else {
    console.log(`[CALL] ${message}`);
  }
};

export const socketMiddleware = store => next => action => {
  /* ========== CALL ACTIONS ========== */
  if (action.type === callStartRequested.type) {
    const { callee, callees, callType = 'audio' } = action.payload || {};
    const state = store.getState();
    const username = state.auth.user?.username;
    const targetList = Array.isArray(callees)
      ? callees
      : callee
        ? [callee]
        : [];
    const uniqueTargets = Array.from(new Set(targetList.filter(Boolean))).filter(
      user => user !== username
    );

    if (uniqueTargets.length === 0) return next(action);
    if (state.call.status !== CALL_STATUS.IDLE) {
      notify('A call is already in progress', 'warning');
      return next(action);
    }
    if (!socket?.connected) {
      store.dispatch(
        setCallEnded({ status: CALL_STATUS.FAILED, reason: 'socket-disconnected' })
      );
      cleanupCall(store);
      return next(action);
    }

    const callId = generateCallId();
    const displayReceiver = uniqueTargets.length > 1 ? 'Team' : uniqueTargets[0];
    store.dispatch(
      setOutgoingCall({
        callId,
        receiver: displayReceiver,
        recipients: uniqueTargets,
        callType,
        caller: username,
      })
    );
    logCall('start', { callId, targets: uniqueTargets, callType });
    attachCallListeners(store);

    void (async () => {
      try {
        const { offer, localStream, peer } = await startOutgoing(callType, stream => {
          store.dispatch(setRemoteStream(stream));
        });

        store.dispatch(setLocalStream(localStream));
        store.dispatch(setPeerConnection(peer));

        socket.emit('call:initiate', {
          callId,
          to: uniqueTargets.length === 1 ? uniqueTargets[0] : undefined,
          targets: uniqueTargets.length > 1 ? uniqueTargets : undefined,
          offer,
          type: callType,
        });

        clearCallTimers();
        callTimeoutId = setTimeout(() => {
          const current = store.getState().call;
          if (current.callId === callId && current.status === CALL_STATUS.CALLING) {
            socket.emit('call:cancel', { callId, reason: 'timeout' });
            store.dispatch(
              setCallEnded({ status: CALL_STATUS.CANCELLED, reason: 'timeout' })
            );
            cleanupCall(store);
          }
        }, 30000);
      } catch (error) {
        store.dispatch(
          setCallEnded({
            status: CALL_STATUS.FAILED,
            reason: 'init-failed',
            error: error?.message || 'Failed to start call',
          })
        );
        cleanupCall(store);
      }
    })();

    return next(action);
  }

  if (action.type === callAcceptRequested.type) {
    const state = store.getState().call;

    if (state.status !== CALL_STATUS.RINGING) return next(action);
    if (!socket?.connected) {
      store.dispatch(
        setCallEnded({ status: CALL_STATUS.FAILED, reason: 'socket-disconnected' })
      );
      cleanupCall(store);
      return next(action);
    }

    attachCallListeners(store);
    logCall('accept', { callId: state.callId });

    void (async () => {
      try {
        const { answer, localStream, peer } = await acceptIncoming(
          state.callType,
          state.offer,
          stream => {
            store.dispatch(setRemoteStream(stream));
          }
        );

        store.dispatch(setLocalStream(localStream));
        store.dispatch(setPeerConnection(peer));
        store.dispatch(setCallAccepted());

        socket.emit('call:accept', { callId: state.callId, answer });
      } catch (error) {
        store.dispatch(
          setCallEnded({
            status: CALL_STATUS.FAILED,
            reason: 'accept-failed',
            error: error?.message || 'Failed to accept call',
          })
        );
        cleanupCall(store);
      }
    })();

    return next(action);
  }

  if (action.type === callRejectRequested.type) {
    const { callId } = store.getState().call;
    if (socket?.connected && callId) {
      logCall('reject', { callId });
      socket.emit('call:reject', { callId, reason: 'rejected' });
    }
    store.dispatch(setCallEnded({ status: CALL_STATUS.REJECTED, reason: 'rejected' }));
    cleanupCall(store);
    return next(action);
  }

  if (action.type === callCancelRequested.type) {
    const { callId } = store.getState().call;
    if (socket?.connected && callId) {
      logCall('cancel', { callId });
      socket.emit('call:cancel', { callId, reason: 'cancelled' });
    }
    store.dispatch(setCallEnded({ status: CALL_STATUS.CANCELLED, reason: 'cancelled' }));
    cleanupCall(store);
    return next(action);
  }

  if (action.type === callEndRequested.type) {
    const current = store.getState().call;
    if (socket?.connected && current.callId) {
      if ([CALL_STATUS.CALLING, CALL_STATUS.RINGING].includes(current.status)) {
        logCall('cancel', { callId: current.callId });
        socket.emit('call:cancel', { callId: current.callId, reason: 'cancelled' });
        store.dispatch(
          setCallEnded({ status: CALL_STATUS.CANCELLED, reason: 'cancelled' })
        );
      } else {
        logCall('end', { callId: current.callId });
        socket.emit('call:end', { callId: current.callId, reason: 'ended' });
        store.dispatch(setCallEnded({ status: CALL_STATUS.ENDED, reason: 'ended' }));
      }
    }
    cleanupCall(store);
    return next(action);
  }

  /* ========== SOCKET INITIALIZATION ========== */

  if (action.type === 'socket/init') {
    const token =
      localStorage.getItem('codex_token') || store.getState().auth?.token;

    if (!token) {
      console.warn('No auth token found');
      return next(action);
    }

    if (socket) {
      socket.auth = { token };
      if (!socket.connected) {
        store.dispatch(socketConnecting());
        socket.connect();
      } else {
        console.log('Socket already connected');
      }
      return next(action);
    }

    store.dispatch(socketConnecting());

    socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      timeout: 20000,
      upgrade: true,
    });

    /* ===== CONNECTION EVENTS ===== */

    socket.on('connect', () => {
      reconnectAttempts = 0;
      store.dispatch(socketConnected());
      notify('Connected to server', 'success');
      console.log('Socket connected:', socket.id);
      pendingActions.forEach(action => store.dispatch(action));
      pendingActions = [];
    });

    socket.on('disconnect', reason => {
      store.dispatch(socketDisconnected());
      console.log('Socket disconnected:', reason);

      if (reason === 'io server disconnect') {
        notify('Disconnected by server. Please refresh.', 'error');
      }

      const current = store.getState().call;
      if (current.status !== CALL_STATUS.IDLE) {
        store.dispatch(
          setCallEnded({ status: CALL_STATUS.FAILED, reason: 'socket-disconnected' })
        );
        cleanupCall(store);
      }
    });

    socket.on('connect_error', err => {
      reconnectAttempts++;
      store.dispatch(socketError(err.message));
      console.error('Connection error:', err.message);

      if (
        err.message?.toLowerCase().includes('authentication') ||
        err.message?.toLowerCase().includes('invalid token')
      ) {
        store.dispatch(logout());
      }

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        notify('Unable to connect. Please check your connection.', 'error');
      }
    });

    socket.on('reconnect', attemptNumber => {
      reconnectAttempts = 0;
      store.dispatch(socketConnected());
      notify(`Reconnected after ${attemptNumber} attempts`, 'success');
      console.log('Reconnected');
    });

    socket.on('reconnect_failed', () => {
      notify('Failed to reconnect. Please refresh the page.', 'error');
    });

    socket.on('error', err => {
      store.dispatch(socketError(err.message || 'Socket error'));
      notify(err.message || 'An error occurred', 'error');
    });

    /* ===== CALL EVENTS ===== */
    socket.on('call:initiated', ({ callId }) => {
      const current = store.getState().call;
      if (current.status === CALL_STATUS.CALLING && current.callId && current.callId !== callId) {
        store.dispatch(
          setOutgoingCall({
            callId,
            receiver: current.receiver,
            callType: current.callType,
          })
        );
      }
    });

    socket.on('call:incoming', ({ callId, from, type, offer }) => {
      const current = store.getState().call;
      if (current.status !== CALL_STATUS.IDLE) {
        socket.emit('call:reject', { callId, reason: 'busy' });
        return;
      }
      logCall('incoming', { callId, from, type });
      store.dispatch(
        setIncomingCall({
          callId,
          caller: from,
          receiver: store.getState().auth.user?.username,
          callType: type || 'audio',
          offer,
        })
      );
      notify(`Incoming ${type || 'audio'} call from ${from}`, 'info');
    });

    socket.on('call:accepted', ({ callId, from }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      if (current.status === CALL_STATUS.ACCEPTED) return;
      logCall('accepted', { callId });
      clearCallTimers();
      store.dispatch(
        setCallAccepted(current.direction === 'outgoing' ? { peer: from } : undefined)
      );
    });

    socket.on('call:answer', async ({ callId, answer, from }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      const peer = current.peerConnection;
      if (peer?.currentRemoteDescription || peer?.remoteDescription) {
        logCall('answer skipped', { callId, reason: 'remote-description-already-set' });
        return;
      }
      logCall('answer', { callId });
      try {
        await applyAnswer(answer);
        store.dispatch(
          setCallAccepted(current.direction === 'outgoing' ? { peer: from } : undefined)
        );
      } catch (error) {
        store.dispatch(
          setCallEnded({
            status: CALL_STATUS.FAILED,
            reason: 'answer-failed',
            error: error?.message || 'Failed to apply answer',
          })
        );
        cleanupCall(store);
      }
    });

    socket.on('call:offer', async ({ callId, offer }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      if (current.status !== CALL_STATUS.ACCEPTED) return;
      if (!socket?.connected) return;
      logCall('offer', { callId });
      try {
        const answer = await handleRemoteOffer(offer);
        if (answer) {
          socket.emit('call:answer', { callId, answer });
        }
      } catch (error) {
        store.dispatch(
          setCallEnded({
            status: CALL_STATUS.FAILED,
            reason: 'offer-failed',
            error: error?.message || 'Failed to handle offer',
          })
        );
        cleanupCall(store);
      }
    });

    socket.on('call:reject', ({ callId, reason }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      logCall('rejected', { callId, reason });
      store.dispatch(setCallEnded({ status: CALL_STATUS.REJECTED, reason }));
      cleanupCall(store);
    });

    socket.on('call:rejected', ({ callId, reason }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      store.dispatch(setCallEnded({ status: CALL_STATUS.REJECTED, reason }));
      cleanupCall(store);
    });

    socket.on('call:cancel', ({ callId, reason }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      logCall('cancelled', { callId, reason });
      store.dispatch(setCallEnded({ status: CALL_STATUS.CANCELLED, reason }));
      cleanupCall(store);
    });

    socket.on('call:cancelled', ({ callId, reason }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      store.dispatch(setCallEnded({ status: CALL_STATUS.CANCELLED, reason }));
      cleanupCall(store);
    });

    socket.on('call:end', ({ callId, reason }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      logCall('ended', { callId, reason });
      store.dispatch(setCallEnded({ status: CALL_STATUS.ENDED, reason }));
      cleanupCall(store);
    });

    socket.on('call:user-disconnected', ({ callId, reason }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      logCall('user-disconnected', { callId, reason });
      store.dispatch(setCallEnded({ status: CALL_STATUS.FAILED, reason }));
      cleanupCall(store);
    });

    socket.on('call:failed', ({ reason, message }) => {
      const current = store.getState().call;
      if (current.status === CALL_STATUS.IDLE) return;
      logCall('failed', { reason, message });
      store.dispatch(
        setCallEnded({
          status: CALL_STATUS.FAILED,
          reason: reason || 'failed',
          error: message || 'Call failed',
        })
      );
      cleanupCall(store);
      notify(message || 'Call failed', 'error');
    });

    socket.on('call:ice-candidate', async ({ callId, candidate }) => {
      const current = store.getState().call;
      if (current.callId !== callId) return;
      await addRemoteIceCandidate(candidate);
    });

    /* ===== PROJECT ROOM EVENTS ===== */

    socket.on('project-joined', ({ projectId, success }) => {
      if (success) {
        store.dispatch(setProjectJoined({ projectId, joined: true }));
        console.log('✅ Joined project:', projectId);

        socket.emit('get-chat-history', { projectId });
        socket.emit('get-project-code', { projectId });
      }
    });

    socket.on('user-joined-project', ({ username, projectId, timestamp }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        store.dispatch(
          addChatMessage({
            projectId,
            message: {
              _id: `system_${Date.now()}_${Math.random()}`,
              username: 'System',
              message: `${username} joined the project`,
              type: 'system',
              createdAt: timestamp || new Date().toISOString(),
            },
          })
        );
      }
    });

    socket.on('user-left-project', ({ username, projectId }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        store.dispatch(
          addChatMessage({
            projectId,
            message: {
              _id: `system_${Date.now()}_${Math.random()}`,
              username: 'System',
              message: `${username} left the project`,
              type: 'system',
              createdAt: new Date().toISOString(),
            },
          })
        );
      }
    });

    socket.on('active-users', ({ projectId, users }) => {
      const currentUser = store.getState().auth.user?.username;
      const filteredUsers = users.filter(user => user !== currentUser);
      store.dispatch(setActiveUsers({ projectId, users: filteredUsers }));
      console.log('👥 Active users:', filteredUsers);
    });

    /* ===== CHAT EVENTS ===== */

    socket.on('chat-history', ({ projectId, messages }) => {
      if (Array.isArray(messages)) {
        const formattedMessages = messages.map(msg => ({
          ...msg,
          _id: msg._id || `msg_${Date.now()}_${Math.random()}`,
          username: msg.username || 'Unknown',
          message: msg.text || msg.message || '',
          createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
        }));

        store.dispatch(setChatMessages({ projectId, messages: formattedMessages }));
        console.log(`📜 Loaded ${messages.length} messages for project ${projectId}`);
      }
    });

    socket.on('chat-message', ({ projectId, message }) => {
      const formattedMessage = {
        ...message,
        _id: message._id || `msg_${Date.now()}_${Math.random()}`,
        message: message.text || message.message || '',
        createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
      };

      store.dispatch(addChatMessage({ projectId, message: formattedMessage }));
    });

    socket.on('user-typing', ({ projectId, username, isTyping }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        if (isTyping) {
          store.dispatch(addTypingUser({ projectId, username }));
        } else {
          store.dispatch(removeTypingUser({ projectId, username }));
        }
      }
    });

    /* ===== CODE COLLABORATION EVENTS ===== */

    socket.on('code-change', ({ projectId, code, delta, cursorPos, username }) => {
      const currentUser = store.getState().auth.user?.username;

      if (username !== currentUser) {
        store.dispatch(updateProjectCode({ projectId, code, delta, cursorPos, username }));
        console.log(`Code updated by ${username}`);
      }
    });

    socket.on('project-code', ({ projectId, code }) => {
      store.dispatch(updateProjectCode({ projectId, code }));
      console.log(`Project code loaded for ${projectId}`);
    });

    socket.on('code-review', ({ projectId, review, success, error }) => {
      console.log('🤖 AI Review received:', {
        projectId,
        success,
        review: review?.substring(0, 100),
      });

      if (success && review) {
        store.dispatch(updateProjectReview({ projectId, review }));
        notify('AI review completed!', 'success');
      } else if (error) {
        const errorReview = `❌ **AI Review Failed**\n\n${error}\n\nPlease check:\n- Your API key is configured correctly\n- The backend service is running\n- Try again in a moment`;
        store.dispatch(updateProjectReview({ projectId, review: errorReview }));
        notify('AI review failed', 'error');
      } else {
        const fallbackReview =
          '⚠️ **No Review Generated**\n\nThe AI service returned an empty response. Please try again.';
        store.dispatch(updateProjectReview({ projectId, review: fallbackReview }));
        notify('No review generated', 'warning');
      }
    });

    socket.on('review-error', ({ projectId, error, message }) => {
      console.error('❌ Review error:', error, message);
      const errorReview = `❌ **AI Review Error**\n\n${message || error || 'An unknown error occurred'}\n\nTroubleshooting:\n- Check if GOOGLE_API_KEY is set in backend .env\n- Verify Gemini API is accessible\n- Check backend logs for details`;
      store.dispatch(updateProjectReview({ projectId, review: errorReview }));
      notify('Review generation failed', 'error');
    });

    /* ===== TEAM EVENTS ===== */

    socket.on('user-online', ({ username, timestamp }) => {
      store.dispatch(
        updateTeamMemberStatus({
          username,
          status: 'online',
          isActive: true,
          lastSeen: timestamp,
        })
      );
      console.log('User online:', username);
    });

    socket.on('user-offline', ({ username, timestamp }) => {
      store.dispatch(
        updateTeamMemberStatus({
          username,
          status: 'offline',
          isActive: false,
          lastSeen: timestamp,
        })
      );
      console.log('User offline:', username);
    });

    socket.on('team-presence', ({ users }) => {
      if (!Array.isArray(users)) return;
      const normalizedUsers = users.filter(Boolean);
      const onlineSet = new Set(normalizedUsers.map(user => user.toLowerCase()));
      const currentMembers = store.getState().projects.teamMembers || [];

      normalizedUsers.forEach(username => {
        store.dispatch(
          updateTeamMemberStatus({
            username,
            status: 'online',
            isActive: true,
          })
        );
      });

      currentMembers.forEach(member => {
        const name = member.username || member.email;
        if (!name) return;
        const key = name.toLowerCase();
        if (onlineSet.has(key)) return;
        store.dispatch(
          updateTeamMemberStatus({
            username: name,
            status: 'offline',
            isActive: false,
          })
        );
      });
    });
  }

  /* ========== SOCKET ACTIONS ========== */

  if (socket?.connected && action.type.startsWith('socket/')) {
    switch (action.type) {
      case 'socket/joinProject':
        console.log('Joining project:', action.payload.projectId);
        socket.emit('join-project', {
          projectId: action.payload.projectId || action.payload,
        });
        break;

      case 'socket/leaveProject':
        console.log('Leaving project:', action.payload.projectId);
        socket.emit('leave-project', {
          projectId: action.payload.projectId || action.payload,
        });
        break;

      case 'socket/sendChatMessage':
        socket.emit('chat-message', {
          projectId: action.payload.projectId,
          text: action.payload.text,
        });
        break;

      case 'socket/typingStart':
        socket.emit('typing-start', {
          projectId: action.payload.projectId,
        });
        break;

      case 'socket/typingStop':
        socket.emit('typing-stop', {
          projectId: action.payload.projectId,
        });
        break;

      case 'socket/codeChange':
        socket.emit('code-change', {
          projectId: action.payload.projectId,
          code: action.payload.code,
          delta: action.payload.delta,
          cursorPos: action.payload.cursorPos,
        });
        break;

      case 'socket/getReview':
        console.log('🤖 Requesting AI review for project:', action.payload.projectId);
        socket.emit('get-review', {
          projectId: action.payload.projectId,
          code: action.payload.code,
          language: action.payload.language,
        });
        break;

      /* ===== WEBRTC SIGNALING ACTIONS ===== */

      case 'socket/callUser':
        console.log('Calling user:', action.payload.username, 'Type:', action.payload.type);
        socket.emit('call-user', {
          username: action.payload.username,
          offer: action.payload.offer,
          type: action.payload.type,
        });
        break;

      case 'socket/callAccepted':
        console.log('Accepting call, sending answer to:', action.payload.to);
        socket.emit('call-accepted', {
          to: action.payload.to,
          answer: action.payload.answer,
        });
        break;

      case 'socket/callRejected':
        console.log('Rejecting call from:', action.payload.to);
        socket.emit('call-rejected', {
          to: action.payload.to,
        });
        break;

      case 'socket/iceCandidate':
        console.log('Sending ICE candidate to:', action.payload.to);
        socket.emit('ice-candidate', {
          to: action.payload.to,
          candidate: action.payload.candidate,
        });
        break;

      case 'socket/endCall':
        console.log('Ending call with:', action.payload.to);
        socket.emit('end-call', {
          to: action.payload.to,
        });
        break;

      case 'socket/disconnect':
        if (socket) {
          socket.disconnect();
          socket = null;
        }
        break;

      default:
        break;
    }
  } else if (
    action.type.startsWith('socket/') &&
    action.type !== 'socket/init' &&
    !INTERNAL_SOCKET_ACTIONS.has(action.type)
  ) {
    pendingActions.push(action);
    console.warn('⚠️ Socket not connected, queuing action:', action.type);
  }

  return next(action);
};

export const getSocket = () => socket;
