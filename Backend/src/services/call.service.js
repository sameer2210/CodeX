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

  createCall({
    callId,
    caller,
    receiver,
    type,
    teamName,
    callerSocketId,
    receiverSocketId,
    offer,
  }) {
    const callerKey = buildUserKey(teamName, caller);
    const receiverKey = buildUserKey(teamName, receiver);

    if (this.activeByUser.has(callerKey) || this.activeByUser.has(receiverKey)) {
      return { error: 'busy' };
    }

    const id = callId || this.generateCallId();
    if (this.calls.has(id)) {
      return { error: 'duplicate' };
    }

    const now = Date.now();
    const call = {
      callId: id,
      caller,
      receiver,
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
    this.activeByUser.set(receiverKey, id);

    return { call };
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
    this.activeByUser.delete(buildUserKey(call.teamName, call.receiver));
  }

  findActiveCallBetween(teamName, caller, receiver) {
    const call = this.findActiveCallByUser(teamName, caller);
    if (!call) return null;
    if (call.receiver !== receiver && call.caller !== receiver) return null;
    if (this.isTerminal(call.status)) return null;
    return call;
  }
}

const callService = new CallService();

export default callService;
export { CALL_TIMEOUT_MS };
