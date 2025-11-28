import { useState, useEffect } from 'react';
import { NotificationPayload } from '@/types';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem('dims-notifications');
      if (!stored) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const allNotifications: NotificationPayload[] = JSON.parse(stored);
      
      // Filter by userId if provided
      const userNotifications = userId
        ? allNotifications.filter(n => n.userId === userId || n.userId === 'all')
        : allNotifications;

      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = (notificationId: string) => {
    try {
      const stored = localStorage.getItem('dims-notifications');
      if (!stored) return;

      const allNotifications: NotificationPayload[] = JSON.parse(stored);
      const index = allNotifications.findIndex(n => n.id === notificationId);
      
      if (index !== -1) {
        allNotifications[index].read = true;
        localStorage.setItem('dims-notifications', JSON.stringify(allNotifications));
        loadNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      const stored = localStorage.getItem('dims-notifications');
      if (!stored) return;

      const allNotifications: NotificationPayload[] = JSON.parse(stored);
      
      allNotifications.forEach(n => {
        if (userId && (n.userId === userId || n.userId === 'all')) {
          n.read = true;
        } else if (!userId) {
          n.read = true;
        }
      });

      localStorage.setItem('dims-notifications', JSON.stringify(allNotifications));
      loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = (notificationId: string) => {
    try {
      const stored = localStorage.getItem('dims-notifications');
      if (!stored) return;

      const allNotifications: NotificationPayload[] = JSON.parse(stored);
      const filtered = allNotifications.filter(n => n.id !== notificationId);
      
      localStorage.setItem('dims-notifications', JSON.stringify(filtered));
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen for storage changes (new notifications)
    const handleStorageChange = () => {
      loadNotifications();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom notification event
    window.addEventListener('notification-added', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notification-added', handleStorageChange);
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications
  };
};

export default useNotifications;
