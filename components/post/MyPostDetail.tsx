// components/post/MyPostDetail.tsx - Detailed view of a post with full content

import { useState } from "react";
import { StyleSheet, View as RNView } from "react-native";
import { View } from "@/components/Themed";
import { Post, Comment } from "@/types/postType";
import PostContent from "@/components/post/PostContent";

interface MyPostDetailProps {
  post: Post;
  onEdit: () => void;
  bottomPadding?: number;
}

/**
 * Component to display full post content and interactions when viewing a single post
 */
const MyPostDetail: React.FC<MyPostDetailProps> = ({
  post,
  onEdit,
  bottomPadding = 20,
}) => {
  // In a real app, these would come from an API
  const [comments, setComments] = useState<Comment[]>([]);

  // Handlers for post interactions
  const handleLike = () => {
    // This would typically call an API to like/unlike the post
    console.log("Like post:", post.id);
  };

  const handleShare = () => {
    console.log("Share post:", post.id);
  };

  const handleSave = () => {
    console.log("Save post:", post.id);
  };

  return (
    <View style={styles.container}>
      {/* Use our updated PostContent component */}
      <PostContent
        post={post}
        comments={comments}
        onLike={handleLike}
        onEdit={onEdit}
        onShare={handleShare}
        onSave={handleSave}
        bottomPadding={bottomPadding}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

export default MyPostDetail;
