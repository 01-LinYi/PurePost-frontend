// components/post/EmptyState.tsx - Empty state component for when no posts are available

import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";

interface EmptyStateProps {
  onCreatePost: () => void;
}

/**
 * Displays an empty state with a button to create a new post
 * when no posts are available to display
 */
const EmptyState: React.FC<EmptyStateProps> = ({ onCreatePost }) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="document-text-outline" 
        size={60} 
        color="#ccc" 
        accessibilityLabel="No posts icon"
      />
      
      <Text style={styles.emptyTitle}>No posts yet</Text>
      
      <Text style={styles.emptySubtitle}>
        Share your thoughts by creating your first post
      </Text>
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={onCreatePost}
        accessibilityLabel="Create post"
        accessibilityRole="button"
      >
        <Text style={styles.createButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default EmptyState;