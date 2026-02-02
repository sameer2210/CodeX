// src/webrtc/media.js
class MediaManager {
  constructor() {
    this.currentStream = null;
    this.devices = {
      audio: [],
      video: [],
    };
  }

  /**
   * Get user media with enhanced error handling
   */
  async getMedia({ audio = true, video = true, audioDeviceId = null, videoDeviceId = null } = {}) {
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Media devices not supported in this browser');
    }

    // Clean up previous stream if exists
    if (this.currentStream) {
      this.stopMedia();
    }

    const audioConstraints = audio
      ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
        }
      : false;

    const buildVideoConstraints = (relaxed = false) => {
      if (!video) return false;
      if (relaxed) {
        if (videoDeviceId) {
          return { deviceId: { exact: videoDeviceId } };
        }
        return true;
      }

      return {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: 'user',
        deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
      };
    };

    const logStreamDetails = stream => {
      console.log(
        'Media stream acquired:',
        `Audio: ${stream.getAudioTracks().length}, Video: ${stream.getVideoTracks().length}`
      );
      stream.getTracks().forEach(track => {
        console.log(`Track: ${track.kind} - ${track.label} (${track.readyState})`);
      });
    };

    try {
      const constraints = {
        audio: audioConstraints,
        video: buildVideoConstraints(false),
      };

      console.log('🎥 Requesting media with constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentStream = stream;
      logStreamDetails(stream);
      return stream;
    } catch (error) {
      console.error('Media access failed:', error);

      const retryableErrors = ['OverconstrainedError', 'NotReadableError', 'TrackStartError'];
      if (video && retryableErrors.includes(error.name)) {
        try {
          const relaxedConstraints = {
            audio: audioConstraints,
            video: buildVideoConstraints(true),
          };

          console.warn('Retrying media with relaxed video constraints:', relaxedConstraints);
          const stream = await navigator.mediaDevices.getUserMedia(relaxedConstraints);
          this.currentStream = stream;
          logStreamDetails(stream);
          return stream;
        } catch (retryError) {
          console.error('Media retry failed:', retryError);
          const handledRetryError = this.handleMediaError(retryError);
          handledRetryError.code = retryError.name;
          throw handledRetryError;
        }
      }

      const handledError = this.handleMediaError(error);
      handledError.code = error.name;
      throw handledError;
    }
  }

  /**
   * Handle media errors with user-friendly messages
   */
  handleMediaError(error) {
    const errorMessages = {
      NotFoundError: 'No camera or microphone found. Please connect a device and try again.',
      NotAllowedError:
        'Camera/microphone access denied. Please allow access in your browser settings.',
      NotReadableError:
        'Camera/microphone is already in use by another application. Please close other apps and try again.',
      OverconstrainedError:
        'Camera/microphone does not meet the required specifications. Try using a different device.',
      AbortError: 'Media access was aborted. Please try again.',
      TypeError: 'Invalid media constraints. Please contact support.',
      SecurityError: 'Media access blocked due to security restrictions.',
    };

    const message = errorMessages[error.name] || `Media error: ${error.message}`;
    return new Error(message);
  }

  /**
   * Get available media devices
   */
  async getDevices() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Device enumeration not supported');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      this.devices = {
        audio: devices.filter(d => d.kind === 'audioinput'),
        video: devices.filter(d => d.kind === 'videoinput'),
      };

      console.log(
        '🎛️ Available devices:',
        `Audio: ${this.devices.audio.length}, Video: ${this.devices.video.length}`
      );

      return this.devices;
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return { audio: [], video: [] };
    }
  }

  /**
   * Switch to a different media device
   */
  async switchDevice(kind, deviceId) {
    if (!this.currentStream) {
      throw new Error('No active stream to switch devices');
    }

    try {
      const constraints = kind === 'audio' ? { audio: { deviceId } } : { video: { deviceId } };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      const newTrack = newStream.getTracks().find(t => t.kind === kind);

      if (!newTrack) {
        throw new Error(`No ${kind} track in new stream`);
      }

      // Replace track in current stream
      const oldTrack = this.currentStream.getTracks().find(t => t.kind === kind);
      if (oldTrack) {
        this.currentStream.removeTrack(oldTrack);
        oldTrack.stop();
      }

      this.currentStream.addTrack(newTrack);
      console.log(`Switched ${kind} device to:`, newTrack.label);

      // Notify about device switch
      window.dispatchEvent(
        new CustomEvent('device-switched', {
          detail: { kind, deviceId, track: newTrack },
        })
      );

      return this.currentStream;
    } catch (error) {
      console.error(`Failed to switch ${kind} device:`, error);
      throw error;
    }
  }

  /**
   * Toggle audio track
   */
  toggleAudio(enabled) {
    if (!this.currentStream) return false;

    const audioTrack = this.currentStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled;
      console.log(`Audio ${enabled ? 'enabled' : 'muted'}`);
      return true;
    }
    return false;
  }

  /**
   * Toggle video track
   */
  toggleVideo(enabled) {
    if (!this.currentStream) return false;

    const videoTrack = this.currentStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled;
      console.log(`📹 Video ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    }
    return false;
  }

  /**
   * Get current stream
   */
  getStream() {
    return this.currentStream;
  }

  /**
   * Check if media is active
   */
  isActive() {
    return this.currentStream && this.currentStream.active;
  }

  /**
   * Stop all media tracks
   */
  stopMedia() {
    if (!this.currentStream) {
      console.log('No stream to stop');
      return;
    }

    console.log('Stopping media stream');

    this.currentStream.getTracks().forEach(track => {
      track.stop();
      console.log(`Stopped track: ${track.kind} - ${track.label}`);
    });

    this.currentStream = null;
    console.log(' All media tracks stopped');
  }

  /**
   * Get media constraints for display (screen sharing)
   */
  async getDisplayMedia() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen sharing not supported');
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: false,
      });

      console.log('🖥️ Screen sharing stream acquired');
      return stream;
    } catch (error) {
      console.error('Screen sharing failed:', error);
      throw new Error('Failed to start screen sharing');
    }
  }

  /**
   * Monitor device changes
   */
  monitorDeviceChanges(callback) {
    if (!navigator.mediaDevices) return null;

    const handler = async () => {
      const devices = await this.getDevices();
      callback(devices);
    };

    navigator.mediaDevices.addEventListener('devicechange', handler);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handler);
    };
  }

  /**
   * Get media track settings
   */
  getTrackSettings(kind = 'video') {
    if (!this.currentStream) return null;

    const track = this.currentStream.getTracks().find(t => t.kind === kind);
    return track ? track.getSettings() : null;
  }

  /**
   * Apply constraints to existing track
   */
  async applyConstraints(kind, constraints) {
    if (!this.currentStream) {
      throw new Error('No active stream');
    }

    const track = this.currentStream.getTracks().find(t => t.kind === kind);
    if (!track) {
      throw new Error(`No ${kind} track found`);
    }

    try {
      await track.applyConstraints(constraints);
      console.log(`Applied constraints to ${kind} track`);
      return true;
    } catch (error) {
      console.error(`Failed to apply constraints to ${kind}:`, error);
      throw error;
    }
  }
}

// Singleton instance
const mediaManager = new MediaManager();

// Export functions
export const getMedia = options => mediaManager.getMedia(options);
export const getDevices = () => mediaManager.getDevices();
export const switchDevice = (kind, deviceId) => mediaManager.switchDevice(kind, deviceId);
export const toggleAudio = enabled => mediaManager.toggleAudio(enabled);
export const toggleVideo = enabled => mediaManager.toggleVideo(enabled);
export const stopMedia = () => mediaManager.stopMedia();
export const getStream = () => mediaManager.getStream();
export const isActive = () => mediaManager.isActive();
export const getDisplayMedia = () => mediaManager.getDisplayMedia();
export const monitorDeviceChanges = callback => mediaManager.monitorDeviceChanges(callback);
export const getTrackSettings = kind => mediaManager.getTrackSettings(kind);
export const applyConstraints = (kind, constraints) =>
  mediaManager.applyConstraints(kind, constraints);

export default mediaManager;
