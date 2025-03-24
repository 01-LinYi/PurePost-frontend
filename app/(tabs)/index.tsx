import { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSession } from "@/components/SessionProvider";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useStorageState } from "@/hooks/useStorageState";
import { BlurView } from "expo-blur";

// Define the Post_Feed type for TypeScript
type Post_Feed = {
  id: number;
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
};

// Cache control for images
const getCacheKey = (uri: any) => {
  return `${uri}?timestamp=${Date.now()}`;
};

export default function HomeScreen() {
  const { user } = useSession();
  const [userStorage, setUser] = useStorageState("user");
  const [session, setSession] = useStorageState("session");
  const [posts, setPosts] = useState<Post_Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const windowWidth = Dimensions.get("window").width;

  // Nature-themed images for enhanced visual appeal
  const natureImages = useMemo(
    () => [
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=500", // Succulents like in your first image
      "https://images.unsplash.com/photo-1666427613566-43e67abd1a41?q=80&w=500", // Mountain view like in your second image
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=500", // Additional nature image
      "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=500", // Additional nature image
    ],
    []
  );

  // Get a random image from the nature collection
  const getRandomNatureImage = useCallback(() => {
    return natureImages[Math.floor(Math.random() * natureImages.length)];
  }, [natureImages]);

  // Fetch posts data with enhanced images
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    // Simulating API call with timeout
    setTimeout(() => {
      const dummyPosts: Post_Feed[] = [
        {
          id: 1,
          user: {
            id: 1,
            username: "alex_walker",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          },
          content:
            "Just found these amazing succulents on my hike! Nature's patterns are truly incredible. 🌱",
          image: natureImages[0],
          likes: 24,
          comments: 5,
          timestamp: "10 minutes ago",
          isLiked: false,
        },
        {
          id: 2,
          user: {
            id: 2,
            username: "taylor_smith",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          },
          content:
            "Standing at the edge of this cliff was both terrifying and exhilarating. The fog below made it feel like I was floating above the clouds.",
          image: natureImages[1],
          likes: 42,
          comments: 7,
          timestamp: "30 minutes ago",
          isLiked: false,
        },
        {
          id: 3,
          user: {
            id: 3,
            username: "jordan_jones",
            avatar: "https://randomuser.me/api/portraits/men/22.jpg",
          },
          content:
            "Does anyone have recommendations for growing succulents? I'm starting a small garden on my balcony.",
          likes: 13,
          comments: 11,
          timestamp: "1 hour ago",
          isLiked: false,
        },
        {
          id: 4,
          user: {
            id: 4,
            username: "sam_wilson",
            avatar: "https://randomuser.me/api/portraits/women/29.jpg",
          },
          content:
            "Just launched my new nature photography website! Would love your feedback on the mountain and succulent collections.",
          image: natureImages[2],
          likes: 31,
          comments: 9,
          timestamp: "2 hours ago",
          isLiked: false,
        },
        {
          id: 5,
          user: {
            id: 5,
            username: "robin_chen",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg",
          },
          content:
            "Morning hike through the fog - there's something magical about being above the clouds.",
          image: natureImages[3],
          likes: 56,
          comments: 13,
          timestamp: "3 hours ago",
          isLiked: false,
        },
      ];

      setPosts(dummyPosts);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  }, [natureImages]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = useCallback((postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const isCurrentlyLiked = post.isLiked || false;
          return {
            ...post,
            likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !isCurrentlyLiked,
          };
        }
        return post;
      })
    );
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter(
      (post) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const handleLogOut = useCallback(() => {
    setUser(null);
    setSession(null);
    router.push("/login");
  }, [setUser, setSession]);

  const handleScroll = useCallback((event: any) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  }, []);

  const renderPostItem = useCallback(
    ({ item }: { item: Post_Feed }) => (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <TouchableOpacity style={styles.userAvatarContainer}>
              {item.user.avatar ? (
                <Image
                  source={{ uri: getCacheKey(item.user.avatar) }}
                  style={styles.userAvatar}
                />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.username}>{item.user.username}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#8e8e93" />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.image && (
          <View style={styles.postImageContainer}>
            <Image
              source={{ uri: getCacheKey(item.image) }}
              style={styles.postImage}
              resizeMode="cover"
              progressiveRenderingEnabled={true}
            />
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={22}
              color={item.isLiked ? "#FF3B30" : "#555"}
            />
            <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={22} color="#555" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={22} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleLike]
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00c5e3" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : (
          <View style={styles.noPostsContainer}>
            <Ionicons name="leaf-outline" size={60} color="#00c5e3" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubText}>
              Posts related to nature and exploration will appear here
            </Text>
          </View>
        )}
      </View>
    ),
    [loading]
  );

  // Floating header for better UX when scrolling
  const renderFloatingHeader = useMemo(() => {
    if (scrollPosition <= 10) return null;

    return (
      <BlurView intensity={80} style={styles.floatingHeader}>
        <Text style={styles.floatingHeaderTitle}>Social Feed</Text>
        <View style={styles.floatingHeaderRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={22} color="#00c5e3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={22} color="#00c5e3" />
          </TouchableOpacity>
        </View>
      </BlurView>
    );
  }, [scrollPosition]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Feed</Text>
        <View style={styles.headerRight}>
          {/* Dev button - preserve the clean token button */}
          <TouchableOpacity
            style={styles.devButton}
            onPress={() => {
              setUser(null);
              setSession(null);
              router.push("/login");
            }}
          >
            <Text style={styles.devButtonText}>Clean token</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color="#00c5e3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogOut}>
            <Ionicons name="log-out-outline" size={24} color="#00c5e3" />
          </TouchableOpacity>
        </View>
      </View>

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
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#8e8e93" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Post_Feed List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00c5e3"
            colors={["#00c5e3"]}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
      />

      {/* Floating header that appears when scrolling */}
      {renderFloatingHeader}

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
  },
  devButton: {
    backgroundColor: "#00c5e3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  devButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatarContainer: {
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#00c5e3",
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00c5e3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00c5e3",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 12,
  },
  postImageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
  },
  postActions: {
    flexDirection: "row",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 6,
  },
  actionText: {
    marginLeft: 5,
    color: "#555",
    fontWeight: "500",
  },
  likedText: {
    color: "#FF3B30",
  },
});
