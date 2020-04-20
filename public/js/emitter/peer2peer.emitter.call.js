var socket = io();

var emitterVideo = document.querySelector('video#emitterVideo');
var remoteStream = new MediaStream();
emitterVideo.srcObject = remoteStream;

function startEmitter(emitterPeerConnection) {

  var constraints = {
    video: true,
    audio: true
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(function(localStream) {      

      console.log('Dispositivos media obtenidos');
      localStream.getTracks()
        .forEach(track => emitterPeerConnection.addTrack(track, localStream));

      createAndSendOffer(emitterPeerConnection);
    })
    .catch(console.error);
}

function createAndSendOffer(emitterPeerConnection) {

  console.log('Inicio envio oferta');

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
  console.log('ICE candidate generado en emisor');

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
}

function gotRemoteStream(event) {
  console.log('Recibiendo data');

  remoteStream.addTrack(event.track, remoteStream);
}

function call() {

  console.log('Iniciando llamada');

  let emitterConfiguration = {};//{ sdpSemantics: 'default' }; //{'iceServers': [{'urls': iceServers}]};
  let emitterPeerConnection = new RTCPeerConnection(emitterConfiguration);

  console.log('Conexión emisor instanciada');

  emitterPeerConnection.addEventListener('icecandidate', onIceCandidate);
  emitterPeerConnection.addEventListener('iceconnectionstatechange', function(event) { onIceConnectionStateChange(emitterPeerConnection, event) });
  emitterPeerConnection.addEventListener('track', gotRemoteStream);

  console.log('Listeners sobre conexión agregados');

  startEmitter(emitterPeerConnection);

  console.log('Llamada iniciada');

  socket.on('answer', function(message) { onAnswer(emitterPeerConnection, message); });
  socket.on('newIceCandidate', function(data) { onNewReceiverIceCandidate(emitterPeerConnection, data) });

  console.log('Listener sobre el socket agregados');
}

call();
