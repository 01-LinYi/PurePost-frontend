// app/notifications.tsx
import React, { useRef, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ViewToken
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notification/NotificationItem';
import { Notification, NotificationType } from '@/types/notificationType';

export default function NotificationScreen() {
  const router = useRouter();
  const {
    notifications,
    isLoading,
    isRefreshing,
    error,
    handleRefresh,
    markNotificationRead,
    markAllNotificationsRead
  } = useNotifications();

  // Track which notifications are viewed
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Mark notifications as read when they become visible
    viewableItems.forEach((viewableItem) => {
      if (viewableItem.isViewable && viewableItem.item) {
        const notification = viewableItem.item as Notification;
        if (!notification.read) {
          markNotificationRead(notification.id);
        }
      }
    });
  });

  const handleNotificationPress = useCallback((notification: Notification) => {
    // Mark as read if not already
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === NotificationType.FOLLOW) {
      // Navigate to the follower's profile
      router.push(`/user/${notification.sender.username}?id=${notification.sender.id}`);
    } else if (notification.post_id) {
      // For post-related notifications
      router.push(`/post/${notification.post_id}`);
    }
  
  }, [markNotificationRead, router]);

  console.log('Notifications:', !notifications.some(n => !n.read));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00c5e3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.markAllButton} 
          onPress={markAllNotificationsRead}
          disabled={!notifications.some(n => !n.read)}
        >
          <Text style={[
            styles.markAllText, 
            !notifications.some(n => !n.read) && styles.markAllTextDisabled
          ]}>
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              onPress={() => handleNotificationPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00c5e3"
              colors={["#00c5e3"]}
            />
          }
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#00c5e3" />
                <Text style={styles.emptyText}>Loading notifications...</Text>
              </View>
            ) : (
              <View style={styles.centerContent}>
                <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No notifications yet</Text>
                <Text style={styles.emptySubText}>
                  When others interact with your posts, you'll see them here
                </Text>
              </View>
            )
          }
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyListContent : styles.listContent
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllButton: {
    padding: 6,
  },
  markAllText: {
    fontSize: 14,
    color: '#00c5e3',
    fontWeight: '600',
  },
  markAllTextDisabled: {
    color: '#ccc',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00c5e3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
});