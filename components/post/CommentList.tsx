import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../Themed';
import { Comment } from '@/types/postType';

interface CommentsListProps {
  comments: Comment[];
}

const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <Text style={styles.noCommentsText}>
        No comments yet. Be the first to comment!
      </Text>
    );
  }

  return (
    <>
      {comments.map(comment => (
        <View key={comment.id} style={styles.commentItem}>
          <View style={styles.commentAuthorAvatar}>
            <Text style={styles.commentAuthorAvatarText}>
              {comment.user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.commentContent}>
            <Text style={styles.commentAuthor}>{comment.user.username}</Text>
            <Text style={styles.commentText}>{comment.content}</Text>
            <Text style={styles.commentDate}>
              {new Date(comment.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  noCommentsText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAuthorAvatarText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  commentText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 4,
  },
  commentDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});

export default CommentsList;