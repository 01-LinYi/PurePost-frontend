import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';

interface PostActionsProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
  onShare: () => void;
  onSave: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  isLiked,
  likesCount,
  commentsCount,
  onLike,
  onShare,
  onSave
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onLike} style={styles.button}>
        <Ionicons 
          name={isLiked ? "heart" : "heart-outline"} 
          size={24} 
          color={isLiked ? "#ff4a4a" : "#666"} 
        />
        <Text style={styles.count}>{likesCount}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button}>
        <Ionicons name="chatbubble-outline" size={22} color="#666" />
        <Text style={styles.count}>{commentsCount}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onShare} style={styles.button}>
        <Ionicons name="arrow-redo-outline" size={24} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onSave} style={styles.button}>
        <Ionicons name="bookmark-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  count: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});

export default PostActions;