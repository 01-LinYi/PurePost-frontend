// components/notification/NotificationItem.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Image } from 'expo-image'; // Adjust this import based on your image component
import { Ionicons } from '@expo/vector-icons';
import { Notification, NotificationType } from '@/types/notificationType';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case NotificationType.LIKE:
        return <Ionicons name="heart" size={18} color="#FF2D55" />;
      case NotificationType.COMMENT:
        return <Ionicons name="chatbubble" size={18} color="#5AC8FA" />;
      case NotificationType.SHARE:
        return <Ionicons name="arrow-redo" size={18} color="#4CD964" />;
      case NotificationType.FOLLOW:
        return <Ionicons name="person-add" size={18} color="#007AFF" />;
      default:
        return <Ionicons name="notifications" size={18} color="#FF9500" />;
    }
  };

  const getNotificationMessage = () => {
    const username = notification.sender.username;
    
    switch (notification.type) {
      case NotificationType.LIKE:
        return <Text style={styles.message}><Text style={styles.username}>{username}</Text> </Text>;
      case NotificationType.COMMENT:
        return <Text style={styles.message}><Text style={styles.username}>{username}</Text> </Text>;
      case NotificationType.SHARE:
        return <Text style={styles.message}><Text style={styles.username}>{username}</Text> </Text>;
      case NotificationType.FOLLOW:
        return <Text style={styles.message}><Text style={styles.username}>{username}</Text> </Text>;
      default:
        return <Text style={styles.message}>New notification</Text>;
    }
  };

  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay < 7) {
      return `${diffDay}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        !notification.read && styles.unreadContainer
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Unread indicator */}
      {!notification.read && <RNView style={styles.unreadDot} />}
      
      {/* User avatar */}
      <RNView style={styles.avatarContainer}>
        {notification.sender.profile_picture ? (
          <Image
            source={{ uri: notification.sender.profile_picture }}
            style={styles.avatar}
            placeholder={{ uri: "https://picsum.photos/200" }}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <RNView style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {notification.sender.username.charAt(0).toUpperCase()}
            </Text>
          </RNView>
        )}
        <RNView style={styles.iconContainer}>
          {getNotificationIcon()}
        </RNView>
      </RNView>
      
      <View style={styles.contentContainer}>
        {/* Notification text */}
        <View style={styles.textContainer}>
          {getNotificationMessage()}
          
          {/* Show content preview if available */}
          {notification.content && (
            <Text style={styles.contentPreview} numberOfLines={2}>
              {notification.content}
            </Text>
          )}
        </View>
        
        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {formatTimestamp(notification.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  unreadContainer: {
    backgroundColor: '#F0F9FF',
  },
  unreadDot: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00c5e3',
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00c5e3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  username: {
    fontWeight: 'bold',
  },
  contentPreview: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e93',
    marginLeft: 4,
  },
});