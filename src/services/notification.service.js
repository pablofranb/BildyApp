// EventEmitter es una clase de Node.js que permite crear un sistema de eventos interno
// funciona como un walkie-talkie: una parte del código emite un evento y otra lo escucha
import { EventEmitter } from 'node:events';

// creamos nuestra propia clase que hereda de EventEmitter
class NotificationService extends EventEmitter {}

// exportamos una instancia única para usar en toda la app
export const notificationService = new NotificationService();

// listeners de prueba — escuchan los eventos emitidos desde los controladores
// por ahora solo muestran el evento por consola, en el futuro podrían hacer más cosas
// (guardar logs en BD, enviar notificaciones push, etc.) sin tocar el controlador

notificationService.on('user:registered', (payload) => {
  console.log('EVENT user:registered', payload);
});

notificationService.on('user:verified', (payload) => {
  console.log('EVENT user:verified', payload);
});

notificationService.on('user:invited', (payload) => {
  console.log('EVENT user:invited', payload);
});

notificationService.on('user:deleted', (payload) => {
  console.log('EVENT user:deleted', payload);
});
