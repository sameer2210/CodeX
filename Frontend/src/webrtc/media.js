//src/webrtc/media.js

export const getMedia = async ({ audio = true, video = true }) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Media devices not supported');
  }

  return await navigator.mediaDevices.getUserMedia({
    audio,
    video,
  });
};
