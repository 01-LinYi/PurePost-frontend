import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Author } from '@/types/postType';

interface AuthorInfoProps {
  author: Author;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  onEdit?: () => void;
  showEditButton?: boolean;
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ 
  author, 
  createdAt, 
  updatedAt,
  isEdited,
  onEdit, 
  showEditButton = false 
}) => {
  // 格式化日期为更友好的形式
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    // 如果是当天，显示时间
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // 如果是昨天
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // 其他日期显示完整日期
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {author.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{author.name}</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>
            {formatDate(createdAt)}
          </Text>
          {isEdited && updatedAt && (
            <Text style={styles.editedText}>
              • Edited {formatDate(updatedAt)}
            </Text>
          )}
        </View>
      </View>
      
      {showEditButton && (
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="pencil-outline" size={20} color="#00c5e3" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00c5e3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  date: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  editedText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
});

export default AuthorInfo;