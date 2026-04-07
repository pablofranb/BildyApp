import { EventEmitter } from 'node:events';

class NotificationService extends EventEmitter {}

export const notificationService = new NotificationService();

// listeners de prueba
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