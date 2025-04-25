// hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { getNotifications, markNotificationsAsRead, markAllNotificationsAsRead } from '@/utils/api';
import { getStorageItemAsync } from '@/hooks/useStorageState';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const session = await getStorageItemAsync("session");
      setIsAuthenticated(!!session);
      return !!session;
    } catch (e) {
      console.error('Error checking authentication:', e);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  const loadNotifications = useCallback(async (refresh = false) => {
    try {
      const isAuth = await checkAuth();
      if (!isAuth) {
        setError('Authentication required');
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const data = await getNotifications();
      setNotifications(data);
      
      // Calculate unread count
      const count = data.filter((notification: any) => !notification.read).length;
      setUnreadCount(count);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications. Please check your connection and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [checkAuth]);

  const handleRefresh = useCallback(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Call API to persist change
      await markNotificationsAsRead([parseInt(notificationId, 10)]);
    } catch (e: any) {
      console.error('Failed to mark notification as read', e);
      // Reload notifications if needed to sync with server state
      loadNotifications();
    }
  }, [loadNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      
      // Call API to persist change
      await markAllNotificationsAsRead();
    } catch (e: any) {
      console.error('Failed to mark all notifications as read', e);
      // Reload notifications if needed
      loadNotifications();
    }
  }, [loadNotifications]);

  // Load notifications when component mounts
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Add auto-refresh of notifications on app focus
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadNotifications(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadNotifications]);

  // Set up periodic refresh (optional)
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      loadNotifications(true);
    }, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, [isAuthenticated, loadNotifications]);

  return {
    notifications,
    isLoading,
    isRefreshing,
    error,
    unreadCount,
    isAuthenticated,
    handleRefresh,
    markNotificationRead,
    markAllNotificationsRead: markAllRead,
    loadNotifications
  };
}