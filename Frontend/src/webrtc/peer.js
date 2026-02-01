// src/webrtc/peer.js
// Enterprise-grade WebRTC Peer Connection Manager

class PeerManager {
  constructor() {
    this.peer = null;
    this.iceCandidateQueue = [];
    this.remoteDescriptionSet = false;
    this.isProcessingCandidates = false;
  }

  /**
   * Create a new RTCPeerConnection with robust configuration
   */
  createPeer() {
    if (this.peer) {
      console.warn('Peer already exists, cleaning up before creating new one');
      this.closePeer();
    }

    // STUN/TURN server configuration for NAT traversal
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    };

    this.peer = new RTCPeerConnection(configuration);
    this.remoteDescriptionSet = false;
    this.iceCandidateQueue = [];

    // Set up event handlers
    this.setupEventHandlers();

    console.log('Peer connection created');
    return this.peer;
  }

  /**
   * Setup event handlers for peer connection
   */
  setupEventHandlers() {
    if (!this.peer) return;

    // ICE candidate handler
    this.peer.onicecandidate = event => {
      if (event.candidate) {
        console.log('ICE candidate generated:', event.candidate.type);
        // Dispatch event for middleware to send via socket
        window.dispatchEvent(
          new CustomEvent('ice-candidate-generated', {
            detail: { candidate: event.candidate.toJSON() },
          })
        );
      }
    };

    // ICE connection state changes
    this.peer.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', this.peer.iceConnectionState);

      if (this.peer.iceConnectionState === 'failed') {
        console.error('ICE connection failed, attempting restart');
        this.restartIce();
      }

      window.dispatchEvent(
        new CustomEvent('ice-connection-state-change', {
          detail: { state: this.peer.iceConnectionState },
        })
      );
    };

    // ICE gathering state changes
    this.peer.onicegatheringstatechange = () => {
      console.log('🔄 ICE Gathering State:', this.peer.iceGatheringState);
    };

    // Connection state changes
    this.peer.onconnectionstatechange = () => {
      console.log('Connection State:', this.peer.connectionState);

      window.dispatchEvent(
        new CustomEvent('peer-connection-state-change', {
          detail: { state: this.peer.connectionState },
        })
      );

      // Auto-cleanup on failed/closed states
      if (['failed', 'closed'].includes(this.peer.connectionState)) {
        console.warn('Connection ended:', this.peer.connectionState);
      }
    };

    // Signaling state changes
    this.peer.onsignalingstatechange = () => {
      console.log('Signaling State:', this.peer.signalingState);
    };

    // Negotiation needed (for renegotiation scenarios)
    this.peer.onnegotiationneeded = async () => {
      console.log(' Negotiation needed');
    };
  }

  /**
   * Get current peer instance
   */
  getPeer() {
    return this.peer;
  }

  /**
   * Add ICE candidate to peer connection
   * Handles queuing if remote description not yet set
   */
  async addIceCandidate(candidate) {
    if (!this.peer) {
      console.warn('No peer connection to add ICE candidate');
      return;
    }

    if (!this.remoteDescriptionSet) {
      console.log('Queuing ICE candidate (remote description not set yet)');
      this.iceCandidateQueue.push(candidate);
      return;
    }

    try {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('ICE candidate added successfully');
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }

  /**
   * Process queued ICE candidates after remote description is set
   */
  async processQueuedCandidates() {
    if (this.isProcessingCandidates || !this.remoteDescriptionSet) return;

    this.isProcessingCandidates = true;
    console.log(`Processing ${this.iceCandidateQueue.length} queued ICE candidates`);

    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      try {
        await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('Queued ICE candidate added');
      } catch (error) {
        console.error('Failed to add queued ICE candidate:', error);
      }
    }

    this.isProcessingCandidates = false;
  }

  /**
   * Set remote description and process queued candidates
   */
  async setRemoteDescription(description) {
    if (!this.peer) {
      throw new Error('No peer connection available');
    }

    try {
      await this.peer.setRemoteDescription(new RTCSessionDescription(description));
      this.remoteDescriptionSet = true;
      console.log('Remote description set:', description.type);

      // Process any queued ICE candidates
      await this.processQueuedCandidates();
    } catch (error) {
      console.error('Failed to set remote description:', error);
      throw error;
    }
  }

  /**
   * Create and set local offer
   */
  async createOffer() {
    if (!this.peer) {
      throw new Error('No peer connection available');
    }

    try {
      const offer = await this.peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peer.setLocalDescription(offer);
      console.log('Offer created and set as local description');

      return offer;
    } catch (error) {
      console.error('Failed to create offer:', error);
      throw error;
    }
  }

  /**
   * Create and set local answer
   */
  async createAnswer() {
    if (!this.peer) {
      throw new Error('No peer connection available');
    }

    try {
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      console.log('Answer created and set as local description');

      return answer;
    } catch (error) {
      console.error('Failed to create answer:', error);
      throw error;
    }
  }

  /**
   * Add media track to peer connection
   */
  addTrack(track, stream) {
    if (!this.peer) {
      throw new Error('No peer connection available');
    }

    return this.peer.addTrack(track, stream);
  }

  /**
   * Get all tracks from peer connection
   */
  getTracks() {
    if (!this.peer) return [];
    return this.peer.getSenders().map(sender => sender.track);
  }

  /**
   * Restart ICE (for failed connections)
   */
  async restartIce() {
    if (!this.peer) return;

    try {
      const offer = await this.peer.createOffer({ iceRestart: true });
      await this.peer.setLocalDescription(offer);
      console.log('ICE restart initiated');

      window.dispatchEvent(
        new CustomEvent('ice-restart-offer', {
          detail: { offer },
        })
      );
    } catch (error) {
      console.error('ICE restart failed:', error);
    }
  }

  /**
   * Close peer connection and cleanup
   */
  closePeer() {
    if (!this.peer) {
      console.log('No peer to close');
      return;
    }

    console.log('🔌 Closing peer connection');

    try {
      // Stop all senders
      this.peer.getSenders().forEach(sender => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      // Close the connection
      this.peer.close();
    } catch (error) {
      console.error('Error during peer cleanup:', error);
    } finally {
      this.peer = null;
      this.remoteDescriptionSet = false;
      this.iceCandidateQueue = [];
      console.log('✅ Peer connection closed and cleaned up');
    }
  }

  /**
   * Get connection stats for debugging
   */
  async getStats() {
    if (!this.peer) return null;

    try {
      const stats = await this.peer.getStats();
      return stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }
}

// Singleton instance
const peerManager = new PeerManager();

// Export functions
export const createPeer = () => peerManager.createPeer();
export const getPeer = () => peerManager.getPeer();
export const closePeer = () => peerManager.closePeer();
export const addIceCandidate = candidate => peerManager.addIceCandidate(candidate);
export const setRemoteDescription = description => peerManager.setRemoteDescription(description);
export const createOffer = () => peerManager.createOffer();
export const createAnswer = () => peerManager.createAnswer();
export const addTrack = (track, stream) => peerManager.addTrack(track, stream);
export const getTracks = () => peerManager.getTracks();
export const getStats = () => peerManager.getStats();

export default peerManager;
