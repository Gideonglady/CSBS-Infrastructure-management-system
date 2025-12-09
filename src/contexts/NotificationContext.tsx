import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  cleanupDuplicates: () => Promise<any>;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] };

const initialState = {
  notifications: [] as Notification[],
  unreadCount: 0
};

function notificationReducer(state: typeof initialState, action: NotificationAction): typeof initialState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      };
    case 'REMOVE_NOTIFICATION':
      const notification = state.notifications.find(n => n.id === action.payload);
      return {
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount
      };
    case 'SET_NOTIFICATIONS':
      return {
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };
    default:
      return state;
  }
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Load notifications from backend and set up polling
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          // If not logged in, load from localStorage as fallback
          const storedNotifications = localStorage.getItem('dims-notifications');
          const savedNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];

          if (Array.isArray(savedNotifications)) {
            dispatch({ type: 'SET_NOTIFICATIONS', payload: savedNotifications });
          }
          return;
        }

        // Fetch notifications from backend
        const { notificationAPI } = await import('@/services/api');
        const response: any = await notificationAPI.getAll();

        if (response && response.success && Array.isArray(response.data)) {
          // Map backend notifications to frontend format (convert _id to id)
          const mappedNotifications = response.data.map((notif: any) => ({
            ...notif,
            id: notif._id || notif.id, // Use _id from MongoDB or id if already mapped
            createdAt: new Date(notif.createdAt), // Ensure createdAt is a Date object
          }));

          dispatch({ type: 'SET_NOTIFICATIONS', payload: mappedNotifications });
          // Also save to localStorage as backup
          localStorage.setItem('dims-notifications', JSON.stringify(mappedNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications from backend:', error);

        // Fallback to localStorage
        try {
          const storedNotifications = localStorage.getItem('dims-notifications');
          const savedNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];

          if (Array.isArray(savedNotifications)) {
            dispatch({ type: 'SET_NOTIFICATIONS', payload: savedNotifications });
          }
        } catch (localStorageError) {
          console.error('Error loading notifications from localStorage:', localStorageError);
          dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
        }
      }
    };

    loadNotifications();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const markAsRead = async (id: string) => {
    // Validate that ID exists
    if (!id || id === 'undefined') {
      console.error('Invalid notification ID:', id);
      return;
    }

    try {
      // Call backend API
      const token = localStorage.getItem('token');
      if (token) {
        const { notificationAPI } = await import('@/services/api');
        await notificationAPI.markAsRead(id);
      }
    } catch (error) {
      console.error('Error marking notification as read on backend:', error);
    }

    // Update local state
    dispatch({ type: 'MARK_AS_READ', payload: id });

    // Persist the change to localStorage
    try {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      );
      localStorage.setItem('dims-notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error updating notification in localStorage:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Call backend API
      const token = localStorage.getItem('token');
      if (token) {
        const { notificationAPI } = await import('@/services/api');
        await notificationAPI.markAllAsRead();
      }
    } catch (error) {
      console.error('Error marking all notifications as read on backend:', error);
    }

    // Update local state
    dispatch({ type: 'MARK_ALL_AS_READ' });

    // Persist the change to localStorage
    try {
      const updatedNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      localStorage.setItem('dims-notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error updating notifications in localStorage:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    try {
      const existing = localStorage.getItem('dims-notifications');
      const parsed: Notification[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem('dims-notifications', JSON.stringify([newNotification, ...parsed]));
    } catch (error) {
      console.error('Error persisting notification to localStorage:', error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      // Call backend API to delete notification
      const token = localStorage.getItem('token');
      if (token) {
        const { notificationAPI } = await import('@/services/api');
        await notificationAPI.delete(id);
      }
    } catch (error) {
      console.error('Error deleting notification from backend:', error);
    }

    // Update local state
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });

    // Remove from localStorage
    try {
      const updatedNotifications = state.notifications.filter(n => n.id !== id);
      localStorage.setItem('dims-notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  const cleanupDuplicates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { notificationAPI } = await import('@/services/api');
      const response: any = await notificationAPI.cleanupDuplicates();

      if (response && response.success) {
        // Reload notifications after cleanup
        const allNotifications: any = await notificationAPI.getAll();
        if (allNotifications && allNotifications.success && Array.isArray(allNotifications.data)) {
          const mappedNotifications = allNotifications.data.map((notif: any) => ({
            ...notif,
            id: notif._id || notif.id,
            createdAt: new Date(notif.createdAt),
          }));
          dispatch({ type: 'SET_NOTIFICATIONS', payload: mappedNotifications });
          localStorage.setItem('dims-notifications', JSON.stringify(mappedNotifications));
        }
        return response;
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    cleanupDuplicates
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
