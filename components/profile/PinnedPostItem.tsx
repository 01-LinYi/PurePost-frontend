import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles as profileStyles } from "@/components/profile/profileStyle";
import { formatDate } from "@/utils/dateUtils";


type PinnedPostItemProps = {
    post: any;
    onSelectPost: () => any;
    isOwnProfile?: boolean;
};

// PinnedPostItem 
const PinnedPostItem = ({ post, onSelectPost, isOwnProfile=true }: PinnedPostItemProps) => {
  const router = useRouter();
  

  if (!post && isOwnProfile) {
    return (
      <View style={profileStyles.postContainer}>
        <Ionicons name="pin-outline" size={24} color="#00c5e3" />
        <Text style={[profileStyles.noPostText, { marginTop: 8 }]}>
          Pin your favorite post here!
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={onSelectPost || (() => router.push("/post/my_posts"))}
        >
          <Text style={styles.addButtonText}>Select Post</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if ((!post && !isOwnProfile) || post.length === 0) {
    return (
      <View style={profileStyles.postContainer}>
        <Ionicons name="pin-outline" size={24} color="#00c5e3" />
        <Text style={[profileStyles.noPostText, { marginTop: 8 }]}>
          This user has not pinned any posts yet.
        </Text>
      </View>
    );
  }
  

  const handlePostPress = () => {
    router.push({
      pathname: "/post/[id]",
      params: { id: post.id }
    });
  };
  
  return (
    <TouchableOpacity 
      style={styles.postItemContainer} 
      onPress={handlePostPress}
      activeOpacity={0.7}
    >

      {post.image && (
        <Image 
          source={ {uri: post.image || " https://picsum.photos/600/400"}} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <Text style={styles.postTitle} numberOfLines={1}>
            {post.title}
          </Text>
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={12} color="#00c5e3" />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        </View>
        
        <Text style={styles.postDescription} numberOfLines={2}>
          {post.content || post.description}
        </Text>
        
        <View style={styles.postFooter}>
          <Text style={styles.postDate}>
            {formatDate(post.created_at || post.createdAt)}
          </Text>
          
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{post.likes || 0}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{post.comments || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({  
  addButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#00c5e3",
    borderRadius: 20,
  },
  
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  
  // 帖子样式
  postItemContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 197, 227, 0.1)",
  },
  
  postImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F3F4F6",
  },
  
  postContent: {
    padding: 12,
  },
  
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 197, 227, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  
  pinnedText: {
    fontSize: 11,
    color: "#00c5e3",
    fontWeight: "600",
    marginLeft: 2,
  },
  
  postDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },
  
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  
  postDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  
  postStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  
  statText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 3,
  },
});

export default PinnedPostItem;