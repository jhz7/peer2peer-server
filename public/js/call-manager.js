class PeerManager {

  audioTrack;
  videoTrack;

  constructor(signalingChannel) {

    this.signalingChannel = signalingChannel;

    this.peer = this.createPeer();
    this.negotiator = this.createNegociator();
    this.remoteStream = this.createStream();

    this.registerHandlers();
  }

  createNegociator(){
    return new Negociator(this.signalingChannel, this.peer);
  }

  createStream() { return new MediaStream(); }

  createPeer() { return new RTCPeerConnection(); }

  getRemoteStream() { return this.remoteStream; }

  registerHandlers() {

    this.peer.ontrack = event => this.remoteStream.addTrack(event.track, this.remoteStream);

    this.peer.onicecandidate = (event) => this.signalingChannel.send({
      event: 'newIceCandidate',
      data: { iceCandidate: event.candidate }
    });

    this.signalingChannel.addHandler({
      event: 'newIceCandidate', 
      listener: (data) => { if(data.iceCandidate) this.peer.addIceCandidate(data.iceCandidate) }
    });
  }

  addAudioTrackOnPeer(localStream) {
    this.audioTrack = this.peer.addTrack(localStream.getAudioTracks()[0], localStream);
  }
  
  addVideoTrackOnPeer(localStream) {
    this.videoTrack = this.peer.addTrack(localStream.getVideoTracks()[0], localStream);
  }

  finalize(){
    this.peer.removeTrack(this.audioTrack);
    this.peer.removeTrack(this.videoTrack);
    this.peer.close();
  }

  async negotiate(isStarter) {
    if(isStarter)       
      return this.negotiator.negotiateFromEmitter();
    
    return this.negotiator.negotiateFromReceiver();
  }
}
