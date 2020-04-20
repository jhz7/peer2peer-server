 /*var emitterIceServers = 'stun:stun.l.google.com:19302';
  ['stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302']; 
 */

var constraints = {
  video: true,
  audio: true
};

var emitterVideo = document.querySelector('video#emitterVideo');

function start(emitterPeerConnection) {

  navigator.mediaDevices.getUserMedia(constraints)
    .then(function(localStream) {
      emitterVideo.srcObject = localStream;
      localStream.getTracks()
        .forEach(track => emitterPeerConnection.addTrack(track, localStream));

      createAndSendOffer(emitterPeerConnection);
    })
}

function createAndSendOffer(emitterPeerConnection) {

  emitterPeerConnection.createOffer().then( function(offer) {
    emitterPeerConnection.setLocalDescription(offer)
      .then( function() { socket.emit('offer', { offer }, console.log) });
  })
  .catch(console.error);

}

function onAnswer(emitterPeerConnection, message) {  
  console.log('Respuesta recibida ', message);

  if(!message.answer) 
    throw new Error('La respuesta recibida no es válida');

  let remoteDescription = new RTCSessionDescription(message.answer);
  emitterPeerConnection.setRemoteDescription(remoteDescription)
    .catch(function(error) { console.error('Error procesando respuesta de señalización ', error) });
}

function onIceCandidate(event) {
  console.log('ICE candidate en emisor ', event);

  let iceCandidate = event.candidate;
  if (iceCandidate) socket.emit('newIceCandidate', { iceCandidate });
}

function onNewReceiverIceCandidate(emitterPeerConnection, data) {
  console.log('ICE candidate en receptor ', data);

  if(data.iceCandidate)
    emitterPeerConnection.addIceCandidate(data.iceCandidate)
        .then(function() { console.log('Ice candidate agregado en emisor'); });
}

function onIceConnectionStateChange(emitterPeerConnection, event) {
  console.log('Estado del ICE en emisor ', emitterPeerConnection.iceConnectionState);
  console.log('Evento estado del ICE en emisor ', event);
}

function call() {

  let emitterConfiguration = {};//{ sdpSemantics: 'default' }; //{'iceServers': [{'urls': iceServers}]};
  let emitterPeerConnection = new RTCPeerConnection(emitterConfiguration);

  emitterPeerConnection.addEventListener('icecandidate', onIceCandidate);
  emitterPeerConnection.addEventListener('iceconnectionstatechange', function(event) { onIceConnectionStateChange(emitterPeerConnection, event) });

  start(emitterPeerConnection);

  socket.on('answer', function(message) { onAnswer(emitterPeerConnection, message); });
  socket.on('newIceCandidate', function(data) { onNewReceiverIceCandidate(emitterPeerConnection, data) });
}

call();
