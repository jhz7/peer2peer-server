class SignalingChannel {

  constructor(){ 
    this.socket = io();

    this.addHandler({event: 'connect', listener: (_) => console.log('Canal de señalización conectado')});
    this.addHandler({event: 'disconnect', listener: (_) => console.log('Canal de señalización desconectado')});
  }

  addHandler(toHandle) {
    this.validateHandlerParams(toHandle);
    this.socket.on(toHandle.event, data => toHandle.listener(data));
  }
  
  addHandler(toHandle, listenerParam) {
    this.validateHandlerParams(toHandle);
    this.socket.on(toHandle.event, data => toHandle.listener(data, listenerParam));
  }

  validateHandlerParams(toHandle) {
    if(!toHandle)
      throw new Error('El parámetro para agregar el handler es requerido');

    if(!toHandle.event)
      throw new Error('El evento a manejar es requerido');
    
    if(!toHandle.listener)
      throw new Error('El callback a ejecutar durante el manejo del evento es requerido');
  }

  send(toEmit) {
    if(!toEmit)
      throw new Error('El parámetro para emitir el mensaje es requerido');

    const event = toEmit.event;
    const data = toEmit.data;

    if(!event)
      throw new Error('El evento a emitir es requerido');
    
    if(!data)
      throw new Error('La data a enviar es requerida');

    if(toEmit.callBack)
      return this.socket.emit(event, data, toEmit.callBack);

    return this.socket.emit(event, data);
  }

}
