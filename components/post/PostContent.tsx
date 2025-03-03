import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { Post, Comment } from '@/app/post/[id]';
import AuthorInfo from './AuthorInfo';
import PostActions from './PostActions';
import CommentsList from './CommentList';
import MediaPreview from '@/components/MediaPreview';

interface PostContentProps {
  post: Post;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
  onLike: () => void;
  onEdit: () => void;
  onShare: () => void;
  onSave: () => void;
  bottomPadding: number;
}

const PostContent: React.FC<PostContentProps> = ({
  post,
  isLiked,
  likesCount,
  commentsCount,
  comments,
  onLike,
  onEdit,
  onShare,
  onSave,
  bottomPadding,
}) => {
  const isCurrentUser = post.author.id === 'currentuser';

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: bottomPadding },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Author info */}
      <AuthorInfo 
        author={post.author} 
        createdAt={post.createdAt}
        onEdit={onEdit}
        showEditButton={isCurrentUser}
      />

      {/* Post content */}
      <Text style={styles.postText}>{post.text}</Text>

      {/* Media preview */}
      {post.media && (
        <View style={styles.mediaContainer}>
          <MediaPreview media={post.media} />
        </View>
      )}

      {/* Interaction bar */}
      <PostActions
        isLiked={isLiked}
        likesCount={likesCount}
        commentsCount={commentsCount}
        onLike={onLike}
        onShare={onShare}
        onSave={onSave}
      />

      {/* Comments section */}
      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <CommentsList comments={comments} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 16,
  },
  mediaContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  commentsContainer: {
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
});

export default PostContent;