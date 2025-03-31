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
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSession } from "@/components/SessionProvider";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useStorageState } from "@/hooks/useStorageState";
import { BlurView } from "expo-blur";
import axiosInstance from "@/utils/axiosInstance";

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
  disclaimer?: string;
  deepfakeRequested?: boolean;
  deepfakeResult?: {
    confidence: number; // 0-1 confidence in the result
    status: 'pending' | 'completed' | 'failed';
  };
};

// Cache control for images
const getCacheKey = (uri: any) => {
  return `${uri}?timestamp=${Date.now()}`;
};

// Flag to control whether to use real backend or simulation
const USE_BACKEND = false; // Set to true when your backend is ready

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
          disclaimer: "AI generated contents",
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

  const handleDeepfakeDetection = useCallback((postId: number) => {
    // Immediately set the post to pending state
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            deepfakeRequested: true,
            deepfakeResult: {
              confidence: 0,
              status: 'pending'
            }
          };
        }
        return post;
      })
    );
    
    // Use a simple timeout to simulate processing
    setTimeout(() => {
      // Use a fixed confidence value for testing
      const confidence = 0.5;
      
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              deepfakeResult: {
                confidence: confidence,
                status: 'completed'
              }
            };
          }
          return post;
        })
      );
    }, 1000);
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

  const renderDeepfakeSection = useCallback((post: Post_Feed) => {
    if (!post.image) return null;
    
    // For debugging, add a console log
    console.log('Deepfake status:', post.deepfakeResult?.status);
    
    if (post.deepfakeResult?.status === 'pending') {
      return (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
          margin: 5
        }}>
          <ActivityIndicator size="small" color="#8c52ff" />
          <Text style={{marginLeft: 10, color: '#333'}}>
            Analyzing media...
          </Text>
        </View>
      );
    }
    
    if (post.deepfakeResult?.status === 'completed') {
      const isHighProbability = post.deepfakeResult.confidence > 0.8;
      const isMediumProbability = (post.deepfakeResult.confidence > 0.2 && post.deepfakeResult.confidence <= 0.8);
      const isLowProbability = post.deepfakeResult.confidence <= 0.2;
      
      return (
        <View style={{
          padding: 10,
          backgroundColor: isHighProbability ? '#ffebee' :
                          isMediumProbability? '#fff8e1' :
                             '#e8f5e9',
          borderRadius: 8,
          margin: 5
        }}>
          <Text style={{
            fontWeight: 'bold',
            color: isHighProbability ? '#c62828' : 
                  isMediumProbability? '#ff8f00' :
                    '#2e7d32'
          }}>
            {isHighProbability ? 'High probability of manipulation' :
             isMediumProbability?  'Medium probability of manipulation: unable to determine' :
                'Low probability of manipulation'}
          </Text>
          <Text style={{marginTop: 5, color: '#666'}}>
            Confidence: {Math.round(post.deepfakeResult.confidence * 100)}%
          </Text>
        </View>
      );
    }
    
    // Default button state
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#00c5e3',
          borderRadius: 8,
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 5
        }}
        onPress={() => handleDeepfakeDetection(post.id)}
      >
        <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
        <Text style={{color: '#FFFFFF', marginLeft: 5, fontWeight: '500'}}>
          Request Deepfake Detection
        </Text>
      </TouchableOpacity>
    );
  }, [handleDeepfakeDetection]);

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

        {/* Content Disclaimer - only show if post has a disclaimer */}
        {item.disclaimer && (
          <View style={styles.disclaimerContainer}>
            <View style={styles.disclaimerContent}>
              <View style={styles.disclaimerIconContainer}>
                <Ionicons name="warning-outline" size={18} color="#ffffff" />
              </View>
              <Text style={styles.disclaimerText}>{item.disclaimer}</Text>
            </View>
          </View>
        )}

        <Text style={styles.postContent}>{item.content}</Text>

        {item.image && (
          <View style={styles.postImageContainer}>
            <Image
              source={{ uri: getCacheKey(item.image) }}
              style={styles.postImage}
              resizeMode="cover"
              progressiveRenderingEnabled={true}
            />

            <View style={styles.imageActionOverlay}>
                {renderDeepfakeSection(item)}
            </View>
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
    [handleLike, renderDeepfakeSection]
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

  // Added new styles for the disclaimer
  disclaimerContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#00c5e3",
    backgroundColor: "#fffbeb",
  },
  disclaimerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  disclaimerIconContainer: {
    backgroundColor: "#00c5e3",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#555555",
  },
  // Deepfake detection button styles
  imageActionOverlay: {
    width: "100%",
    padding: 12,
    position: "relative",
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
  },
  deepfakeButton: {
    backgroundColor: "#00c5e3",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  deepfakeButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  deepfakePendingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  deepfakePendingText: {
    color: "#8c52ff",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  deepfakeResultContainer: {
    width: "100%",
    padding: 10,
  },
  deepfakeResultTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
    textAlign: "center",
  },
  resultIndicator: {
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  highProbability: {
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  mediumProbability: {
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    borderColor: "#ffecb3",
  },
  lowProbability: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  resultText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  highProbabilityText: {
    color: "#C62828",
  },
  mediumProbabilityText: {
    color: "#F57F17",
  },
  lowProbabilityText: {
    color: "#2E7D32",
  },
  confidenceText: {
    fontSize: 12,
    marginTop: 4,
    color: "#666666",
    textAlign: "right",
  },
  deepfakeErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  deepfakeErrorText: {
    color: "#F44336",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  retryButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  retryText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
});
