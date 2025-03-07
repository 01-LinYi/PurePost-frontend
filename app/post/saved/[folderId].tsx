import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import ActionButton from "@/components/ActionButton";
import axiosInstance from "@/utils/axiosInstance";

// Import existing types from postType.ts
import { Author, Post } from "@/types/postType";

// Define additional types for saved folders
export interface SavedFolder {
  id: string;
  name: string;
  post_count: number;
  created_at: string;
}

export interface SavedPost extends Post {
  saved_at: string; // When the post was saved
}

// Create a component for saved post items
const SavedPostItem = ({
  post,
  onPress,
}: {
  post: SavedPost;
  onPress: () => void;
}) => {
  // Derive title from the first line of post content
  const title = post.text?.split("\n")[0] || "Post";
  
  // Create excerpt from post content
  const excerpt = post.text && post.text.length > title.length 
    ? post.text.substring(title.length, title.length + 100) 
    : "No description";

  // Get thumbnail from media if available
  const thumbnail = post.media?.uri || "https://picsum.photos/100";

  // Format author's first letter for avatar if no image available
  const authorInitial = post.author.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.postItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: thumbnail }} style={styles.postThumbnail} />
      <View style={[styles.postContent, { backgroundColor: "transparent" }]}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.postExcerpt} numberOfLines={2}>
          {excerpt}
        </Text>
        <View style={[styles.postMeta, { backgroundColor: "transparent" }]}>
          {post.author.avatar ? (
            <Image
              source={{ uri: post.author.avatar }}
              style={styles.authorAvatar}
            />
          ) : (
            <View style={styles.authorAvatarPlaceholder}>
              <Text style={styles.authorAvatarText}>{authorInitial}</Text>
            </View>
          )}
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.postDate}>
            {new Date(post.saved_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SavedFolderDetail = () => {
  const { folderId } = useLocalSearchParams();
  const [folder, setFolder] = useState<SavedFolder | null>(null);
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  // Fetch folder details from API
  const fetchFolderDetails = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/saved/folders/${folderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching folder details:", error);
      const errorMessage = (error as any)?.response?.data?.message || "Failed to load folder details";
      throw new Error(errorMessage);
    }
  }, [folderId]);

  // Fetch saved posts in folder from API
  const fetchSavedPosts = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/saved/folders/${folderId}/posts`);
      return response.data.posts;
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      const errorMessage = (error as any)?.response?.data?.message || "Failed to load saved posts";
      throw new Error(errorMessage);
    }
  }, [folderId]);

  // Load folder data
  const loadFolderData = useCallback(async (showFullLoading = true) => {
    try {
      if (showFullLoading) {
        setIsLoading(true);
        setError(null);
      }
      
      const [folderData, postsData] = await Promise.all([
        fetchFolderDetails(),
        fetchSavedPosts()
      ]);

      setFolder(folderData);
      setPosts(postsData);
    } catch (error) {
      setError((error as Error).message);
      console.error("Folder loading error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchFolderDetails, fetchSavedPosts]);

  // Initial data load
  useEffect(() => {
    loadFolderData();
  }, [loadFolderData]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadFolderData(false);
  }, [loadFolderData]);

  // Rename folder
  const handleRenameFolder = () => {
    if (!folder) return;
    setNewFolderName(folder.name);
    setRenameModalVisible(true);
  };

  // Confirm rename folder
  const confirmRename = async () => {
    if (!folder || !newFolderName.trim()) return;

    try {
      setIsLoading(true);
      
      // Send request to rename folder
      await axiosInstance.put(`/saved/folders/${folderId}`, {
        name: newFolderName.trim()
      });

      // Update the folder name in the state
      setFolder({
        ...folder,
        name: newFolderName.trim(),
      });

      // Close the modal and reset the state
      setRenameModalVisible(false);
      setNewFolderName("");

      // Display success message
      Alert.alert("Success", "Folder renamed successfully");
    } catch (error) {
      console.error("Error renaming folder:", error);
      Alert.alert(
        "Error",
        (error as any)?.response?.data?.message || "Failed to rename folder"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to post detail
  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  // Delete folder
  const handleDeleteFolder = () => {
    Alert.alert(
      "Delete Folder",
      `Are you sure you want to delete "${folder?.name}"? All saved posts will be removed from this folder.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Send request to delete folder
              await axiosInstance.delete(`/saved/folders/${folderId}`);

              // Navigate back after deletion
              router.replace("/post/saved");

              // Show success message
              setTimeout(() => {
                Alert.alert("Success", "Folder deleted successfully");
              }, 500);
            } catch (error) {
              console.error("Error deleting folder:", error);
              Alert.alert(
                "Error",
                (error as any)?.response?.data?.message || "Failed to delete folder"
              );
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Remove post from folder
  const handleRemovePost = (postId: string) => {
    Alert.alert(
      "Remove from Folder",
      "Are you sure you want to remove this post from this folder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Send request to remove post from folder
              await axiosInstance.delete(`/saved/folders/${folderId}/posts/${postId}`);
              
              // Update the posts list
              setPosts(posts.filter(post => post.id !== postId));
              
              // Update folder post count
              if (folder) {
                setFolder({
                  ...folder,
                  post_count: folder.post_count - 1
                });
              }
              
              setIsLoading(false);
              
              // Show success message
              Alert.alert("Success", "Post removed from folder");
            } catch (error) {
              console.error("Error removing post:", error);
              Alert.alert(
                "Error",
                (error as any)?.response?.data?.message || "Failed to remove post"
              );
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Empty state component
  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: "transparent" }]}>
      <Ionicons name="document-text-outline" size={60} color="#aaa" />
      <Text style={styles.emptyText}>No posts in this folder yet</Text>
      <Text style={styles.emptySubText}>
        Save posts to this folder by tapping the bookmark icon on any post
      </Text>
    </View>
  );

  // Loading state
  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00c5e3" />
      </View>
    );
  }

  // Error state
  if (error && !folder) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <ActionButton
          text="Try Again"
          onPress={() => loadFolderData()}
          style={styles.tryAgainButton}
          textStyle={styles.tryAgainButtonText}
        />
        <ActionButton
          text="Go back to Saved Folders"
          onPress={() => router.push("/post/saved")}
          style={styles.goBackButton}
          textStyle={styles.goBackButtonText}
        />
      </View>
    );
  }

  // Render main content
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10, backgroundColor: "transparent" },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View
          style={[styles.titleContainer, { backgroundColor: "transparent" }]}
        >
          <Text style={styles.title}>{folder?.name || "Loading..."}</Text>
          <Text style={styles.subtitle}>
            {folder ? `${folder.post_count} posts` : ""}
          </Text>
        </View>

        <View
          style={[styles.actionButtons, { backgroundColor: "transparent" }]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRenameFolder}
            disabled={isLoading}
          >
            <Ionicons name="pencil" size={22} color="#00c5e3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDeleteFolder}
            disabled={isLoading}
          >
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <SavedPostItem 
            post={item} 
            onPress={() => handlePostPress(item.id)} 
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#00c5e3"]}
            tintColor="#00c5e3"
          />
        }
      />

      {/* Rename Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Folder</Text>
            <TextInput
              style={styles.input}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Enter new folder name"
              autoFocus
              maxLength={50}
            />
            <View
              style={[styles.modalButtons, { backgroundColor: "transparent" }]}
            >
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmRename}
                disabled={!newFolderName.trim() || newFolderName.trim() === folder?.name}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00c5e3" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  postList: {
    padding: 16,
    flexGrow: 1,
  },
  postItem: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 120,
  },
  postThumbnail: {
    width: 100,
    height: "100%",
  },
  postContent: {
    flex: 1,
    padding: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  postExcerpt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  authorAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00c5e3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  authorAvatarText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  authorName: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#FF6B6B",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  tryAgainButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
  },
  tryAgainButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  goBackButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  goBackButtonText: {
    color: "#00c5e3",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "100%",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#00c5e3",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default SavedFolderDetail;