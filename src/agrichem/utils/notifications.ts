import { RegulatoryAlert } from '../types';

export function checkNotificationSupport(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!checkNotificationSupport()) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return 'denied';
  }
}

export function sendPushNotification(title: string, options?: NotificationOptions): boolean {
  if (!checkNotificationSupport()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
      return true;
    } catch (e) {
      console.warn('Notification failed, falling back to in-app toast:', e);
      return false;
    }
  }
  return false;
}

export function triggerAlertNotification(alert: RegulatoryAlert): boolean {
  const icon = alert.category === 'regulatory' ? '⚠️' : '🌾';
  const title = `${icon} ${alert.title}`;
  return sendPushNotification(title, {
    body: `${alert.summary}\nAction: ${alert.actionRequired || 'Check AgriChem Field Guide.'}`,
    tag: alert.id
  });
}
