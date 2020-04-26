
const signalingChannel = new SignalingChannel();
const callManager = new CallManager(signalingChannel);

const enableStart = () => {
  startButton.disabled = false;
  answerButton.disabled = true;
  stopButton.disabled = true;
}

const enableAnswer = () => {
  startButton.disabled = true;
  answerButton.disabled = false;
  stopButton.disabled = true;
}

const enableStop = () => {
  startButton.disabled = true;
  answerButton.disabled = true;
  stopButton.disabled = false;
}

let startButton = document.querySelector('button#start-button');
let answerButton = document.querySelector('button#answer-button');
let stopButton = document.querySelector('button#stop-button');

let primaryVideo = document.querySelector('video#primary-video');
let secondaryVideo = document.querySelector('video#secondary-video');
secondaryVideo.muted = true;

enableStart();

const fullStreamConstraints = { audio: true, video: true };
const videoStreamConstraints = { audio: false, video: true };

(async() => {

  let fullStream = await navigator.mediaDevices.getUserMedia(fullStreamConstraints);
  let videoStream = new MediaStream() ;//= await navigator.mediaDevices.getUserMedia(videoStreamConstraints);
  videoStream.addTrack(fullStream.getVideoTracks()[0], videoStream);

  primaryVideo.srcObject = videoStream;
  secondaryVideo.srcObject = videoStream;

  startButton.addEventListener('click', (e) => {
    enableStop();
    signalingChannel.send({ event: 'onStart', data: {} });
  
    signalingChannel.addHandler({
      event: 'onAnswer',
      listener: (data) => {

        //callManager.addAudioTrackOnPeer(fullStream);
        callManager.addVideoTrackOnPeer(fullStream);
        primaryVideo.srcObject = callManager.getRemoteStream();
        callManager.negotiate(true);
      }
    })
  
  });
  
  answerButton.addEventListener('click', (e) => {
    enableStop();
    //callManager.addAudioTrackOnPeer(fullStream);
    callManager.addVideoTrackOnPeer(fullStream);
    primaryVideo.srcObject = callManager.getRemoteStream();
    signalingChannel.send({ event: 'onAnswer', data: {} });
  });
  
  signalingChannel.addHandler({
    event: 'onStart',
    listener: (data) => {
      enableAnswer();
      callManager.negotiate(false);
    }
  });


})();
