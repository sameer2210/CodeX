import {
  getMedia,
  stopMedia,
  toggleAudio as toggleAudioTrack,
  toggleVideo as toggleVideoTrack,
} from './media';
import {
  addIceCandidate,
  closePeer,
  createAnswer,
  createOffer,
  createPeer,
  setRemoteDescription,
} from './peer';

let localStream = null;
let remoteStream = null;

const cleanup = () => {
  stopMedia();
  closePeer();
  localStream = null;
  remoteStream = null;
};

const attachRemoteTrackHandler = onRemoteStream => {
  const peer = createPeer();
  peer.ontrack = event => {
    if (!event.streams?.[0]) return;
    remoteStream = event.streams[0];
    onRemoteStream?.(remoteStream);
  };
  return peer;
};

const startOutgoing = async (type, onRemoteStream) => {
  cleanup();
  localStream = await getMedia({ audio: true, video: type === 'video' });
  const peer = attachRemoteTrackHandler(onRemoteStream);
  localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
  const offer = await createOffer();
  return { offer, localStream, peer };
};

const acceptIncoming = async (type, offer, onRemoteStream) => {
  cleanup();
  localStream = await getMedia({ audio: true, video: type === 'video' });
  const peer = attachRemoteTrackHandler(onRemoteStream);
  localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
  await setRemoteDescription(offer);
  const answer = await createAnswer();
  return { answer, localStream, peer };
};

const applyAnswer = async answer => {
  if (!answer) return;
  await setRemoteDescription(answer);
};

const handleRemoteOffer = async offer => {
  if (!offer) return null;
  await setRemoteDescription(offer);
  const answer = await createAnswer();
  return answer;
};

const addRemoteIceCandidate = async candidate => {
  if (!candidate) return;
  await addIceCandidate(candidate);
};

const toggleAudio = enabled => {
  toggleAudioTrack(enabled);
};

const toggleVideo = enabled => {
  toggleVideoTrack(enabled);
};

const getLocalStream = () => localStream;
const getRemoteStream = () => remoteStream;

export {
  acceptIncoming,
  addRemoteIceCandidate,
  applyAnswer,
  handleRemoteOffer,
  cleanup,
  getLocalStream,
  getRemoteStream,
  startOutgoing,
  toggleAudio,
  toggleVideo,
};
