/*var iceServers = 'stun:stun.l.google.com:19302';
   ['stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302']; */


var receiverVideo = document.querySelector('video#receiverVideo');

let startTime;

receiverVideo.addEventListener('resize', () => {
  console.log(`Remote video size changed to ${receiverVideo.videoWidth}x${receiverVideo.videoHeight}`);
  // We'll use the first onsize callback as an indication that video has started
  // playing out.
  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
    startTime = null;
  }
});

function onIceCandidate(event) {
  console.log('ICE candidate en receptor ', event);

  let iceCandidate = event.candidate;
  if (iceCandidate) socket.emit('newIceCandidate', { iceCandidate });
}

function onIceConnectionStateChange(receiverPeerConnection, event) {
  console.log('Estado del ICE en receptor ', receiverPeerConnection.iceConnectionState);
  console.log('Evento estado del ICE en receptor ', event);
}

function gotRemoteStream(event) {
  console.log('Evento track ', event);

  if(event.track.kind === 'video'){
    receiverVideo.srcObject = event.streams[0];
    console.log('Receptor recibió stream de video del emisor');
  }

 /*  if (receiverVideo.srcObject !== event.streams[0]) {
    receiverVideo.srcObject = event.streams[0];
    console.log('Receptor recibió stream del emisor');
  } */
}

function onNewEmitterIceCandidate(receiverPeerConnection, data) {
  console.log('ICE candidate en emisor ', data);

  if(data.iceCandidate)
    receiverPeerConnection.addIceCandidate(data.iceCandidate)
      .then(function() { console.log('Ice candidate agregado en receptor'); });
}

function onOffer(receiverPeerConnection, message) {
  console.log('Oferta recibida ', message);

  startTime = window.performance.now();

  if (message.offer) {
    const remoteDescription = new RTCSessionDescription(message.offer);

    receiverPeerConnection.setRemoteDescription(remoteDescription)
      .then(function() {

        receiverPeerConnection.createAnswer().then( function(answer) {
          receiverPeerConnection.setLocalDescription(answer)
            .then( function() { socket.emit('answer', { answer }, console.log); })
        })
        .catch(console.error);
      })
      .catch(function(error) { console.error('Error procesando solicitud de señalización ', error) });
  }
}

function answer() {

  let receiverConfiguration = {}; //{ sdpSemantics: 'default' }; //{'iceServers': [{'urls': iceServers}]};
  let receiverPeerConnection = new RTCPeerConnection(receiverConfiguration);

  receiverPeerConnection.addEventListener('icecandidate', onIceCandidate);
  receiverPeerConnection.addEventListener('iceconnectionstatechange', function(event) { onIceConnectionStateChange(receiverPeerConnection, event) });
  receiverPeerConnection.addEventListener('track', gotRemoteStream);

  socket.on('offer', function(message) { onOffer(receiverPeerConnection, message) });
  socket.on('newIceCandidate', function(data) { onNewEmitterIceCandidate(receiverPeerConnection, data) });
}

answer();
