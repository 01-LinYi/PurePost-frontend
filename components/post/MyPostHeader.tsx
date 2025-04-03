// components/post/MyPostsHeader.tsx - Header component for the My Posts screen

import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";

interface MyPostsHeaderProps {
  onBack: () => void;
  onCreatePost: () => void;
}

/**
 * Header component for the My Posts screen with navigation and create post button
 */
const MyPostsHeader: React.FC<MyPostsHeaderProps> = ({
  onBack,
  onCreatePost,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.pageTitle}>My Posts</Text>

      <TouchableOpacity
        style={styles.createPostButton}
        onPress={onCreatePost}
        accessibilityLabel="Create new post"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={22} color="#FFFFFF" />
        <Text style={styles.createPostButtonText}>New Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00c5e3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  createPostButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default MyPostsHeader;
