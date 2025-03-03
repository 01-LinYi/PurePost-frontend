import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Author } from '@/post/[id]';

interface AuthorInfoProps {
  author: Author;
  createdAt: string;
  onEdit?: () => void;
  showEditButton?: boolean;
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ 
  author, 
  createdAt, 
  onEdit, 
  showEditButton = false 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {author.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{author.name}</Text>
        <Text style={styles.date}>
          {new Date(createdAt).toLocaleDateString()}
        </Text>
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
  date: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
});

export default AuthorInfo;