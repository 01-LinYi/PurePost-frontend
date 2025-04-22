import { useEffect, useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { Image } from '@/components/CachedImage';
import ActionButton from "@/components/ActionButton";
import { useFolders } from "@/hooks/useFolders";
import { Post } from "@/types/postType";
import { SavedFolder } from "@/types/folderType";

const SavedPostItem = ({
  post,
  onPress,
}: {
  post: Post & { saved_at?: string };
  onPress: () => void;
}) => {
  const title = post.content?.split("\n")[0] || "Post";
  const excerpt =
    post.content && post.content.length > title.length
      ? post.content.substring(title.length, title.length + 100)
      : "No description";
  const thumbnail = post?.image || "https://via.placeholder.com/100";
  const authorInitial = post.user.username.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.postItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: thumbnail }} style={styles.postThumbnail} />
      <View style={styles.postContent}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.postExcerpt} numberOfLines={2}>
          {excerpt}
        </Text>
        <View style={styles.postMeta}>
          {post.user.profile_picture ? (
            <Image
              source={{ uri: post.user.profile_picture }}
              style={styles.authorAvatar}
            />
          ) : (
            <View style={styles.authorAvatarPlaceholder}>
              <Text style={styles.authorAvatarText}>{authorInitial}</Text>
            </View>
          )}
          <Text style={styles.authorName}>{post.user.username}</Text>
          <Text style={styles.postDate}>
            {post.saved_at ? new Date(post.saved_at).toLocaleDateString() : ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SavedFolderDetail = () => {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const router = useRouter();

  const {
    renameFolder,
    deleteFolder,
    folderDetails,
    isRenaming,
    isDeleting,
    isLoading,
    error,
  } = useFolders();


  const [posts, setPosts] = useState<Post[]>([]);
  const [folder, setFolder] = useState<SavedFolder | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const loadPosts = useCallback(async (forceRefresh:boolean) => {
    if (!folderId) return;
    setPostsLoading(true);
    try {
      const data = await folderDetails(folderId, forceRefresh);
      console.log("Fetched folder details:", data);
      setFolder(data.folder);
      setPosts(data.posts);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    } finally {
      setPostsLoading(false);
      setIsRefreshing(false);
    }
  }, [folderId]);

  useEffect(() => {
    console.log("Loading posts for folder:", folderId);
    loadPosts(false);
  }, [loadPosts]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadPosts(true);
  }, [loadPosts]);

  const handleRenameFolder = () => {
    if (!folder) return;
    setNewFolderName(folder.name);
    setRenameModalVisible(true);
  };

  const confirmRename = async () => {
    if (!folder || !newFolderName.trim()) return;
    try {
      await renameFolder(folder.id, newFolderName.trim());
      setRenameModalVisible(false);
      setNewFolderName("");
      handleRefresh();
      Alert.alert("Success", "Folder renamed successfully");
    } catch (err) {
      Alert.alert("Error", (err as Error).message || "Failed to rename folder");
    }
  };

  const handleDeleteFolder = () => {
    if (!folder) return;
    Alert.alert(
      "Delete Folder",
      `All posts under this folder will be removed and cannot be undone.\n Are you sure you want to delete "${folder.name}"? `,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFolder(folder.id);
              router.replace("/post/saved");
              setTimeout(() => {
                Alert.alert("Success", "Folder deleted successfully");
              }, 500);
            } catch (err) {
              Alert.alert(
                "Error",
                (err as Error).message || "Failed to delete folder"
              );
            }
          },
        },
      ]
    );
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };


  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={60} color="#aaa" />
      <Text style={styles.emptyText}>No posts in this folder yet</Text>
      <Text style={styles.emptySubText}>
        Save posts to this folder by tapping the bookmark icon on any post
      </Text>
    </View>
  );

  // Loading
  if (isLoading || postsLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00c5e3" />
      </View>
    );
  }

  // Error
  if (error && !folder) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <ActionButton
          text="Try Again"
          onPress={() => {
            handleRefresh();
            loadPosts(true);
          }}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{folder?.name || "Folder" }</Text>
          <Text style={styles.subtitle}>
            {folder
              ? `${folder.postCount ?? 0} posts`
              : ""}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRenameFolder}
            disabled={isRenaming}
          >
            <Ionicons name="pencil" size={22} color="#00c5e3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDeleteFolder}
            disabled={isDeleting}
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
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRenameModalVisible(false)}
                disabled={isRenaming}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmRename}
                disabled={
                  isRenaming ||
                  !newFolderName.trim() ||
                  newFolderName.trim() === folder?.name
                }
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
    flexDirection: "row",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
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
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});

export default SavedFolderDetail;
