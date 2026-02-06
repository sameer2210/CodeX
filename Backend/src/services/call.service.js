import crypto from 'crypto';

const CALL_TIMEOUT_MS = 30000;
const TERMINAL_STATUSES = new Set(['REJECTED', 'CANCELLED', 'ENDED', 'FAILED']);

const buildUserKey = (teamName, username) => `${teamName}:${username}`;

class CallService {
  constructor() {
    this.calls = new Map();
    this.activeByUser = new Map();
  }

  generateCallId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return crypto.randomBytes(16).toString('hex');
  }

  isTerminal(status) {
    return TERMINAL_STATUSES.has(status);
  }

  getCall(callId) {
    return this.calls.get(callId);
  }

  findActiveCallByUser(teamName, username) {
    const key = buildUserKey(teamName, username);
    const callId = this.activeByUser.get(key);
    if (!callId) return null;
    return this.calls.get(callId) || null;
  }

  isUserBusy(teamName, username) {
    const key = buildUserKey(teamName, username);
    return this.activeByUser.has(key);
  }

  createCall({
    callId,
    caller,
    receiver,
    receivers,
    type,
    teamName,
    callerSocketId,
    receiverSocketId,
    offer,
  }) {
    const callerKey = buildUserKey(teamName, caller);
    const targetList = Array.isArray(receivers) ? receivers : receiver ? [receiver] : [];
    const uniqueTargets = Array.from(new Set(targetList.filter(Boolean))).filter(
      username => username !== caller
    );

    if (this.activeByUser.has(callerKey)) {
      return { error: 'busy' };
    }

    if (uniqueTargets.length === 0) {
      return { error: 'no-targets' };
    }

    const availableTargets = uniqueTargets.filter(
      username => !this.activeByUser.has(buildUserKey(teamName, username))
    );

    if (availableTargets.length === 0) {
      return { error: 'busy' };
    }

    const id = callId || this.generateCallId();
    if (this.calls.has(id)) {
      return { error: 'duplicate' };
    }

    const now = Date.now();
    const receiverStates = {};
    availableTargets.forEach(username => {
      receiverStates[username] = 'RINGING';
    });

    const call = {
      callId: id,
      caller,
      receiver: availableTargets.length === 1 ? availableTargets[0] : null,
      receivers: availableTargets,
      receiverStates,
      acceptedBy: null,
      type,
      teamName,
      callerSocketId,
      receiverSocketId,
      offer,
      answer: null,
      status: 'CALLING',
      createdAt: now,
      updatedAt: now,
      startedAt: now,
      endedAt: null,
      timeoutId: null,
    };

    this.calls.set(id, call);
    this.activeByUser.set(callerKey, id);
    availableTargets.forEach(username => {
      this.activeByUser.set(buildUserKey(teamName, username), id);
    });

    const skipped = uniqueTargets.filter(username => !availableTargets.includes(username));

    return { call, skipped };
  }

  updateCall(callId, updates = {}) {
    const call = this.calls.get(callId);
    if (!call) return null;
    Object.assign(call, updates, { updatedAt: Date.now() });
    return call;
  }

  setStatus(callId, status, updates = {}) {
    const call = this.calls.get(callId);
    if (!call) return null;
    call.status = status;
    call.updatedAt = Date.now();
    if (this.isTerminal(status)) {
      call.endedAt = Date.now();
    }
    Object.assign(call, updates);
    return call;
  }

  clearTimeout(call) {
    if (!call?.timeoutId) return;
    clearTimeout(call.timeoutId);
    call.timeoutId = null;
  }

  releaseReceiver(callId, username, status = 'CANCELLED') {
    const call = this.calls.get(callId);
    if (!call) return;
    if (!call.receivers?.includes(username)) return;
    call.receiverStates[username] = status;
    this.activeByUser.delete(buildUserKey(call.teamName, username));
  }

  startTimeout(callId, onTimeout) {
    const call = this.calls.get(callId);
    if (!call) return;
    this.clearTimeout(call);
    call.timeoutId = setTimeout(() => {
      onTimeout?.(callId);
    }, CALL_TIMEOUT_MS);
  }

  cleanup(callId) {
    const call = this.calls.get(callId);
    if (!call) return;
    this.clearTimeout(call);
    this.calls.delete(callId);
    this.activeByUser.delete(buildUserKey(call.teamName, call.caller));
    if (Array.isArray(call.receivers)) {
      call.receivers.forEach(username => {
        this.activeByUser.delete(buildUserKey(call.teamName, username));
      });
    } else if (call.receiver) {
      this.activeByUser.delete(buildUserKey(call.teamName, call.receiver));
    }
  }

  findActiveCallBetween(teamName, caller, receiver) {
    const call = this.findActiveCallByUser(teamName, caller);
    if (!call) return null;
    if (
      call.receiver !== receiver &&
      call.caller !== receiver &&
      !call.receivers?.includes(receiver)
    ) {
      return null;
    }
    if (this.isTerminal(call.status)) return null;
    return call;
  }
}

const callService = new CallService();

export default callService;
export { CALL_TIMEOUT_MS };
