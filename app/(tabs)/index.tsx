import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
  AppState,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/components/SessionProvider";
import { SearchField, useFeedPosts } from "@/hooks/useFeedPosts";
import FeedPostItem from "@/components/post/FeedPostItem";
import FeedHeader from "@/components/post/FeedHeader";
import FolderSelectorModal from "@/components/folder/FolderSelectorModal";
import { useFolders } from "@/hooks/useFolders";
import { SavedFolder } from "@/types/folderType";
import { unSavePost, sharePost } from "@/utils/api";
import useFolderModal from "@/hooks/useFolderModal";
import ReportModal from "@/components/report/ReportModal";
import useReportModal from "@/hooks/useReportModal";
import { useNotifications } from '@/hooks/useNotifications';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Home Screen that displays the social feed with posts
 */
export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { logOut } = useSession();
  const router = useRouter();
  const folderModal = useFolderModal();
  const reportModal = useReportModal();
  const { unreadCount, loadNotifications } = useNotifications();

  // Use custom hook to handle posts data and operations, similar to useMyPosts hook
  const {
    posts,
    isLoading,
    isRefreshing,
    error,
    handleSearch,
    handleRefresh,
    handleLike,
    handleDeepfakeDetection,
    loadData,
  } = useFeedPosts();

  // Use custom hook to handle folders data and operations
  const { folders, toggleSaveFolder, createFolder, isCreating } = useFolders({
    forceRefresh: true,
  });

  useEffect(() => {
    if (!reportModal.errorMsg) return;
    if (reportModal.errorMsg === ("Report submitted successfully.")) {
      Alert.alert("Report Submitted!", "Thank you for your report", [
        {
          text: "OK",
          onPress: () => {
            reportModal.closeModal();
            handleRefresh();
          },
        },
      ]);
      return;
    }
    Alert.alert("Report Failed!", reportModal.errorMsg || "Please try again", [
      {
        text: "OK",
      },
    ]);
  }, [reportModal.errorMsg]);

  useEffect(() => {
    const unsubscribe = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadNotifications();
        handleRefresh();
      }
    });

    return () => unsubscribe.remove();
  }, [loadNotifications, handleRefresh]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications(); // Refresh notifications when screen is focused
    }, [loadNotifications])
  );

  const navigateToNotifications = () => router.push('/notifications');

  const handleOpenSelector = (postId: string) => folderModal.openModal(postId);
  const handleSelectFolder = async (folder: SavedFolder) => {
    if (!folderModal.selectedId) return;
    folderModal.setLoading(true);
    folderModal.setError(null);
    try {
      await toggleSaveFolder(folderModal.selectedId, folder.id);
      folderModal.closeModal();
      // Send notification here
    } catch (e) {
      folderModal.setError("Save failed, please try again");
    }
    folderModal.setLoading(false);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      handleRefresh();
    } catch (e) {
      folderModal.setError("Create failed, please try again");
      throw e;
    }
  };

  const handleUnsave = async (postId: string) => {
    folderModal.setLoading(true);
    try {
      await unSavePost(postId);
      // send notification here
    } catch (e) {
      folderModal.setError("Unsave failed, please try again");
    }
    handleRefresh();
    folderModal.setLoading(false);
  };

  const handleShare = async (postId: string) => {
    try {
      await sharePost(postId);
      // send notification here
    }
    catch (e) {
      Alert.alert("Share failed", "Please try again");
    }
  };

  const handleReportPost = (postId: string) =>
    reportModal.openModal(postId, "post");

  // Navigation handlers
  const navigateToPost = (postId: string) => router.push(`/post/${postId}`);
  const navigateToCreatePost = () => router.push("/post/create");

  const handleLogOut = async () => {
    const error = await logOut();
    if (error) {
      Alert.alert("Error logging out", error);
      return;
    }
    router.replace("/login");
  };

  // Error state renderer
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Empty state component
  const EmptyStateComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00c5e3" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : (
          <View style={styles.noPostsContainer}>
            <Ionicons name="leaf-outline" size={60} color="#00c5e3" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubText}>
              Posts from all users will appear here
            </Text>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={navigateToCreatePost}
            >
              <Text style={styles.createPostButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [isLoading, navigateToCreatePost]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <FeedHeader
        onLogOut={handleLogOut}
        onCreatePost={navigateToCreatePost}
        onNotifications={navigateToNotifications}
        unreadNotificationsCount={unreadCount}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8e8e93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => {
            const trimmedQuery = searchQuery.trim();
            if (trimmedQuery.startsWith("#")) {
              handleSearch(SearchField.tag, searchQuery.substring(1));
            } else if (trimmedQuery.startsWith("@")) {
              handleSearch(SearchField.user, searchQuery.substring(1));
            } else if (trimmedQuery.startsWith("!")) {
              handleSearch(SearchField.caption, searchQuery.substring(1));
            } else {
              handleSearch(SearchField.content, searchQuery);
            }
          }}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Content area: error, posts list, or empty state */}
      {error ? (
        renderError()
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <FeedPostItem
              post={item}
              onLike={handleLike}
              onSave={item.is_saved ? handleUnsave : handleOpenSelector}
              onShare={handleShare}
              onReport={handleReportPost}
              onDeepfakeDetection={handleDeepfakeDetection}
              onNavigate={navigateToPost}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00c5e3"
              colors={["#00c5e3"]}
            />
          }
          ListEmptyComponent={EmptyStateComponent}
        />
      )}

      {/* Loading overlay */}
      {isLoading && !isRefreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00c5e3" />
        </View>
      )}
      {/* Folder selector modal */}
      <FolderSelectorModal
        visible={folderModal.modalVisible}
        folders={folders}
        onSelect={handleSelectFolder}
        onCreate={handleCreateFolder}
        onClose={folderModal.closeModal}
        isCreating={isCreating}
        isCollecting={folderModal.loading}
        error={folderModal.errorMsg || error}
      />
      {/* Report modal */}
      <ReportModal
        visible={reportModal.modalVisible}
        loading={reportModal.loading}
        error={reportModal.errorMsg}
        onClose={reportModal.closeModal}
        onSubmit={({ reason, extraInfo }) =>
          reportModal.report(reason, extraInfo)
        }
        targetType={reportModal.target?.type}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(240,240,240,0.8)",
    zIndex: 100,
  },
  floatingHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00c5e3",
  },
  floatingHeaderRight: {
    flexDirection: "row",
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
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 70, // Space for bottom tabs
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 400,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#8e8e93",
    fontSize: 16,
  },
  noPostsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  emptySubText: {
    marginTop: 8,
    textAlign: "center",
    color: "#8e8e93",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  createPostButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
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
