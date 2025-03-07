import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { Post, Comment, Author } from '@/types/postType';
import AuthorInfo from './AuthorInfo';
import PostActions from './PostActions';
import CommentsList from './CommentList';
import MediaPreview from '@/components/MediaPreview';

interface PostContentProps {
  post: Post;
  isLiked: boolean;
  isSaved: boolean;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
  onLike: () => void;
  onEdit?: () => void;
  onShare: () => void;
  onSave: () => void;
  bottomPadding: number;
}

const PostContent: React.FC<PostContentProps> = ({
  post,
  isLiked,
  isSaved,
  likesCount,
  commentsCount,
  comments,
  onLike,
  onEdit,
  onShare,
  onSave,
  bottomPadding,
}) => {
  // 添加安全检查，确保 post.author 存在
  const author = post.author || { id: 'unknown', name: 'Unknown', avatar: '' };
  
  // 使用可选链运算符，避免 undefined 错误
  const canEdit = post.isAuthor || author?.id === 'currentuser';

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
        author={author} // 使用我们已验证的 author 对象
        createdAt={post.createdAt}
        updatedAt={post.updatedAt || post.createdAt} // 提供默认值
        isEdited={post.isEdited || false}
        onEdit={onEdit}
        showEditButton={canEdit}
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
        isSaved={isSaved}
        likesCount={likesCount}
        commentsCount={commentsCount}
        shareCount={post.shareCount || 0}
        onLike={onLike}
        onShare={onShare}
        onSave={onSave}
      />

      {/* Comments section */}
      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>
          Comments ({commentsCount})
        </Text>
        <CommentsList comments={comments || []} />
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