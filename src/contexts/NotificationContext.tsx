import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
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

  // Load notifications from localStorage and set up real-time updates
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedNotifications = localStorage.getItem('dims-notifications');
        const savedNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
        
        // Validate that savedNotifications is an array
        if (!Array.isArray(savedNotifications)) {
          console.error('Invalid notifications data in localStorage');
          dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
          return;
        }
        
        // If no saved notifications, create some mock ones
        if (savedNotifications.length === 0) {
          const mockNotifications: Notification[] = [
            {
              id: '1',
              userId: 'admin',
              title: 'New Issue Reported',
              message: 'Lab equipment malfunction reported in Chemistry Lab A',
              type: 'info',
              read: false,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              actionUrl: '/admin/issues'
            },
            {
              id: '2',
              userId: 'admin',
              title: 'Issue Resolved',
              message: 'Projector issue in Room 205 has been resolved',
              type: 'success',
              read: false,
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
              actionUrl: '/admin/issues'
            },
            {
              id: '3',
              userId: 'admin',
              title: 'Maintenance Scheduled',
              message: 'Scheduled maintenance for Computer Lab 1 tomorrow at 9 AM',
              type: 'warning',
              read: true,
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
              actionUrl: '/registers/labs'
            }
          ];
          localStorage.setItem('dims-notifications', JSON.stringify(mockNotifications));
          dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
        } else {
          dispatch({ type: 'SET_NOTIFICATIONS', payload: savedNotifications });
        }
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      }
    };
    
    loadNotifications();
    
    // Listen for storage changes (when new notifications are added)
    const handleStorageChange = () => {
      loadNotifications();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const markAsRead = (id: string) => {
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

  const markAllAsRead = () => {
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
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const value: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
