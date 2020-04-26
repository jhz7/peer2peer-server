class Negociator {

  constructor(signalingChannel, peer){
    this.signalingChannel = signalingChannel;
    this.peer = peer;
  }

  async negotiateFromEmitter() {
    await this.peer.setLocalDescription( await this.peer.createOffer() );

    this.signalingChannel.addHandler({
      event: 'answer',
      listener: async (data) => await this.peer.setRemoteDescription(data.answer)
    });

    this.signalingChannel.send({
      event: 'offer',
      data: { offer: this.peer.localDescription }
    });
  }

  async negotiateFromReceiver() {
    this.signalingChannel.addHandler({
      event: 'offer',
      listener: async (data) => {

        await this.peer.setRemoteDescription(data.offer);
        await this.peer.setLocalDescription( await this.peer.createAnswer() );

        this.signalingChannel.send({
          event: 'answer',
          data: { answer: this.peer.localDescription }
        });
      }
    });
  }

}