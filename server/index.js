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
let sala = 'peer2peer';

io.on('connection', (cliente) => {

  cliente.join(sala);

  console.log(`Usuario ${cliente.id} conectado`);

  cliente.on('disconnect', () => {
    console.log(`Usuario ${cliente.id} desconectado`);
  });

  cliente.on('offer', (data, callback) => {
    cliente.broadcast.to(sala).emit('offer', data);

    callback('Offer enviada');
  });
  
  
  cliente.on('answer', (data, callback) => {
    cliente.broadcast.to(sala).emit('answer', data);

    callback('Answer enviada');
  })

  cliente.on('newIceCandidate', (data) => {
    cliente.broadcast.to(sala).emit('newIceCandidate', data);
  })
});

const serverPort = process.env.PORT || 3000;
server.listen(serverPort, () => console.log(`Listening on port ${serverPort}`));
