// components/post/FeedPostItem.tsx

import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

// Type for Post in feed
// This is a mockup type definition for the post object.
// TODO: Change this to types/postType.ts
type Post = {
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
    confidence: number;
    status: 'pending' | 'completed' | 'failed';
  };
};

type FeedPostItemProps = {
  post: Post;
  onLike: (postId: number) => void;
  onDeepfakeDetection: (postId: number) => void;
  onNavigate: (postId: string) => void;
};

// Cache control for images
const getCacheKey = (uri: string) => {
  return `${uri}?timestamp=${Date.now()}`;
};

/**
 * Component for rendering individual post items in the feed
 */
export default function FeedPostItem({ post, onLike, onDeepfakeDetection, onNavigate }: FeedPostItemProps) {
  
  // Render deepfake detection section
  const renderDeepfakeSection = () => {
    if (!post.image) return null;
    
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
        onPress={() => onDeepfakeDetection(post.id)}
      >
        <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
        <Text style={{color: '#FFFFFF', marginLeft: 5, fontWeight: '500'}}>
          Request Deepfake Detection
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.postCard}
      activeOpacity={0.9}
      onPress={() => onNavigate(post.id.toString())}
    >
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <TouchableOpacity style={styles.userAvatarContainer}>
            {post.user.avatar ? (
              <Image
                source={{ uri: getCacheKey(post.user.avatar) }}
                style={styles.userAvatar}
              />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {post.user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.username}>{post.user.username}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#8e8e93" />
        </TouchableOpacity>
      </View>

      {/* Content Disclaimer - only show if post has a disclaimer */}
      {post.disclaimer && (
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerContent}>
            <View style={styles.disclaimerIconContainer}>
              <Ionicons name="warning-outline" size={18} color="#ffffff" />
            </View>
            <Text style={styles.disclaimerText}>{post.disclaimer}</Text>
          </View>
        </View>
      )}

      <Text style={styles.postContent}>{post.content}</Text>

      {post.image && (
        <View style={styles.postImageContainer}>
          <Image
            source={{ uri: getCacheKey(post.image) }}
            style={styles.postImage}
            resizeMode="cover"
            progressiveRenderingEnabled={true}
          />

          <View style={styles.imageActionOverlay}>
            {renderDeepfakeSection()}
          </View>
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={22}
            color={post.isLiked ? "#FF3B30" : "#555"}
          />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={22} color="#555" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={22} color="#555" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
