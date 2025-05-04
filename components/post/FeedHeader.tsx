// components/post/FeedHeader.tsx

import React from "react";
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import { Text } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";

type FeedHeaderProps = {
  onLogOut: () => void;
  onCreatePost: () => void;
  onNotifications: () => void;
  unreadNotificationsCount?: number;
};

/**
 * Header component for the feed screen
 */
export default function FeedHeader({
  onLogOut,
  onCreatePost,
  onNotifications,
  unreadNotificationsCount = 0,
}: FeedHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Social Feed</Text>
      <View style={styles.headerRight}>
        {/* Create post button */}
        <TouchableOpacity style={styles.createButton} onPress={onCreatePost}>
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>

        {/* Notifications button */}
        <View>
          <TouchableOpacity style={styles.headerButton} onPress={onNotifications}>
            <Ionicons name="notifications-outline" size={24} color="#00c5e3" />
          </TouchableOpacity>
          {unreadNotificationsCount > 0 && (
            <View style={styles.notificationBadge}>
              {unreadNotificationsCount > 99 ? (
                <Text style={styles.notificationBadgeText}>99+</Text>
              ) : (
                <Text style={styles.notificationBadgeText}>{unreadNotificationsCount}</Text>
              )}
            </View>
          )}
        </View>

        {/* Log out button */}
        <TouchableOpacity style={styles.headerButton} onPress={onLogOut}>
          <Ionicons name="log-out-outline" size={24} color="#00c5e3" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00c5e3",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
    padding: 6,
  },
  createButton: {
    backgroundColor: "#00c5e3",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
