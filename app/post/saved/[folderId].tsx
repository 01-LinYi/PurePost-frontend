import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import ActionButton from "@/components/ActionButton";

// Import existing types from postType.ts
import { Author, Post } from "@/types/postType";

// Define additional types for saved folders
export interface SavedFolder {
  id: string;
  name: string;
  postCount: number;
  createdAt: string;
}

export interface SavedPost extends Post {
  title?: string; // Optional title derived from post text
  excerpt?: string; // Optional excerpt derived from post text
  thumbnail?: string; // Thumbnail for displaying in list
  savedAt: string; // When the post was saved
}

// Create a new component for saved post items
const SavedPostItem = ({
  post,
  onPress,
}: {
  post: SavedPost;
  onPress: () => void;
}) => {
  // Derive title and excerpt from post text if not provided
  const title = post.title || post.text?.split("\n")[0] || "Untitled Post";
  const excerpt = post.excerpt || post.text?.substring(0, 100) || "";

  // Use post media as thumbnail if available, otherwise use a placeholder
  const thumbnail =
    post.media?.uri || post.thumbnail || "https://picsum.photos.com/100";

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
          <Image
            source={{ uri: post.author.avatar }}
            style={styles.authorAvatar}
          />
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.postDate}>
            {new Date(post.savedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Mock API for fetching folder details
const fetchFolderDetails = async (folderId: string): Promise<SavedFolder> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: folderId,
        name:
          folderId === "folder1"
            ? "Favorite Posts"
            : folderId === "folder2"
            ? "Read Later"
            : folderId === "folder3"
            ? "Inspiration"
            : "Educational",
        postCount: Math.floor(Math.random() * 20) + 1,
        createdAt: new Date().toISOString(),
      });
    }, 300);
  });
};

// Mock API for fetching saved posts in a folder
const fetchSavedPosts = async (folderId: string): Promise<SavedPost[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate random number of posts (3-10)
      const count = Math.floor(Math.random() * 8) + 3;
      const posts: SavedPost[] = [];

      for (let i = 0; i < count; i++) {
        posts.push({
          id: `post-${folderId}-${i}`,
          text: `This is a sample post that was saved in your "${folderId}" folder. It contains interesting content that you wanted to revisit later.`,
          title: `Saved Post ${i + 1} in ${folderId}`,
          excerpt: `This is a sample post that was saved in your "${folderId}" folder. It contains interesting content...`,
          thumbnail: `https://picsum.photos/400/300?random=${i + 10}`,
          media: {
            uri: `https://picsum.photos/400/300?random=${i + 10}`,
            type: "image/jpeg",
          },
          author: {
            id: `author${i}`,
            name: `Author ${i + 1}`,
            avatar: `https://picsum.photos/200?random=${i}`,
          },
          createdAt: new Date(Date.now() - i * 86400000).toISOString(), // days ago
          savedAt: new Date(Date.now() - i * 43200000).toISOString(), // half days ago
          likesCount: Math.floor(Math.random() * 100),
          commentsCount: Math.floor(Math.random() * 20),
          isLiked: Math.random() > 0.5,
        });
      }

      resolve(posts);
    }, 600);
  });
};

const SavedFolderDetail = () => {
  const { folderId } = useLocalSearchParams();
  const [folder, setFolder] = useState<SavedFolder | null>(null);
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadFolderData = async () => {
      try {
        setIsLoading(true);
        const folderData = await fetchFolderDetails(String(folderId));
        const postsData = await fetchSavedPosts(String(folderId));

        setFolder(folderData);
        setPosts(postsData);
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to load folder: " +
            ((error as Error).message || "Unknown error")
        );
        console.error("Folder loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFolderData();
  }, [folderId]);

  const handleRenameFolder = () => {
    if (!folder) return;
    setNewFolderName(folder.name);
    setRenameModalVisible(true);
  };

  const confirmRename = () => {
    if (!folder || !newFolderName.trim()) return;

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
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleDeleteFolder = () => {
    Alert.alert(
      "Delete Folder",
      `Are you sure you want to delete "${folder?.name}"? All saved posts will be removed from this folder.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Navigate back after deletion
            router.replace("/post/saved");

            // Show success message
            setTimeout(() => {
              Alert.alert("Success", "Folder deleted successfully");
            }, 500);
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: "transparent" }]}>
      <Ionicons name="document-text-outline" size={60} color="#aaa" />
      <Text style={styles.emptyText}>No posts in this folder yet</Text>
      <Text style={styles.emptySubText}>
        Save posts to this folder by tapping the bookmark icon on any post
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00c5e3" />
      </View>
    );
  }

  if (!folder) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Folder not found</Text>
        <ActionButton
          text="Go back to Saved Folders"
          onPress={() => router.push("/post/saved")}
          style={styles.goBackButton}
          textStyle={styles.goBackButtonText}
        />
      </View>
    );
  }

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
          <Text style={styles.title}>{folder.name}</Text>
          <Text style={styles.subtitle}>{folder.postCount} posts</Text>
        </View>

        <View
          style={[styles.actionButtons, { backgroundColor: "transparent" }]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRenameFolder}
          >
            <Ionicons name="pencil" size={22} color="#00c5e3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDeleteFolder}
          >
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <SavedPostItem post={item} onPress={() => handlePostPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
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
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  goBackButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 20,
  },
  goBackButtonText: {
    color: "#FFFFFF",
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
});

export default SavedFolderDetail;
