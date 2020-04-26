const express = require('express');
const path = require('path');

const socketIO = require('socket.io');
const http = require('http');

const app = express();
let server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(require('./routes/index'));

let io = socketIO(server);

io.on('connection', (cliente) => {

  console.log(`Usuario ${cliente.id} conectado`);

  cliente.on('disconnect', () => {
    console.log(`Usuario ${cliente.id} desconectado`);
  });

  cliente.on('offer', (data) => {
    cliente.broadcast.emit('offer', data);
  });
  
  
  cliente.on('answer', (data) => {
    cliente.broadcast.emit('answer', data);
  });

  cliente.on('newIceCandidate', (data) => {
    cliente.broadcast.emit('newIceCandidate', data);
  });
  
  cliente.on('onStart', (data) => {
    cliente.broadcast.emit('onStart', data);
  });
  
  cliente.on('onAnswer', (data) => {
    cliente.broadcast.emit('onAnswer', data);
  });
  
});

const serverPort = process.env.PORT || 3000;
server.listen(serverPort, () => console.log(`Listening on port ${serverPort}`));
