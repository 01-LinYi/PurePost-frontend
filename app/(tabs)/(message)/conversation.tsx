import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, TextInput, Modal, Button } from 'react-native';
import { router } from 'expo-router';
import axiosInstance from '@/utils/axiosInstance';
import { API_URL } from '@/constants/Api';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/components/SessionProvider';

type Conversation = {
  id: string;
  name: string;
  image: string;
  lastMessage: string;
  lastMessageTimestamp: string;
};

type User = {
  user_id: number;
  username: string;
  avatar: string;
};

export default function ConversationListScreen() {
  const getAllConversation = async () => {
    try {
      const response = await axiosInstance.get(API_URL + "messages/conv/");
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('Conversation fetch failed:', response.statusText);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Conversation fetch failed:', error.response.data);
      } else {
        console.error('Conversation fetch failed:', error);
      }
    }
    return [];
  }

  const { user } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newName, setNewName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [newConversationModalVisible, setNewConversationModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  React.useEffect(() => {
    const fetchConversations = async () => {
      const data = await getAllConversation();
      setConversations(data);
    };

    fetchConversations();
  }, []);

  const handleEditName = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setNewName(conversation.name);
    setModalVisible(true);
  };

  const handleSaveName = async () => {
    if (selectedConversation) {
      try {
        const response = await axiosInstance.patch(`${API_URL}messages/conv/${selectedConversation.id}/`, {
          name: newName,
        });
        if (response.status === 200) {
          setConversations((prevConversations) =>
            prevConversations.map((conv) =>
              conv.id === selectedConversation.id ? { ...conv, name: newName } : conv
            )
          );
          setModalVisible(false);
        } else {
          console.error('Failed to update conversation name:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to update conversation name:', error);
      }
    }
  };

  const handleSearchUser = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}users/search/`, {
        params: { username: searchUsername },
      });
      if (response.status === 200) {
        setSearchResults(response.data);
      } else {
        console.error('User search failed:', response.statusText);
      }
    } catch (error) {
      console.error('User search failed:', error);
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleCreateConversation = async () => {
    try {
      console.log('Selected users:', selectedUsers);
      const participants = user ? (selectedUsers.includes(user.id) ? selectedUsers : [...selectedUsers, user?.id]) : selectedUsers;
      console.log('participants:', participants);
      const response = await axiosInstance.post(`${API_URL}messages/conv/`, {
        participants,
      });
      if (response.status === 201 || response.status === 200) {
        router.push({
          pathname: './message',
          params: {
            id: response.data.id,
            name: response.data.name,
            image: response.data.image,
          },
        });
      } else {
        console.error('Failed to create conversation:', response.statusText);
      }
      setConversations((prevConversations) => prevConversations.includes(response.data) ? prevConversations : [...prevConversations, response.data]);
      setNewConversationModalVisible(false);
      setSelectedUsers([]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Conversation creation error:', error.response.data);
      } else {
        console.error('Conversation creation error:', error);
      }
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <View style={styles.conversationItem}>
      <TouchableOpacity
        style={styles.conversationContent}
        onPress={() =>
          router.push({
            pathname: './message',
            params: {
              id: item.id,
              name: item.name,
              image: item.image,
            },
          })
        }
      >
        <Image source={{ uri: item.image }} style={styles.conversationImage} />
        <View style={styles.conversationDetails}>
          <Text style={styles.conversationName}>{item.name}</Text>
          <Text style={styles.conversationLastMessage}>{item.lastMessage}</Text>
          <Text style={styles.conversationTimestamp}>{item.lastMessageTimestamp}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreButton} onPress={() => handleEditName(item)}>
        <Ionicons name="ellipsis-vertical" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.newConversationButton} onPress={() => setNewConversationModalVisible(true)}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Conversation Name</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Save" onPress={handleSaveName} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={newConversationModalVisible}
        onRequestClose={() => {
          setNewConversationModalVisible(false);
          setSelectedUsers([]);
          setSearchResults([]);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Conversation</Text>
            <TextInput
              style={styles.input}
              value={searchUsername}
              onChangeText={setSearchUsername}
              placeholder="Search by username"
            />
            <Button title="Search" onPress={handleSearchUser} />
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.user_id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userItem,
                    selectedUsers.includes(item.user_id) && styles.selectedUserItem,
                  ]}
                  onPress={() => handleUserSelect(item.user_id)}
                >
                  <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                  <Text style={styles.username}>{item.username}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
            />
            <Button title="Create Conversation" onPress={handleCreateConversation} />
            <Button
              title="Cancel"
              onPress={
                () => {
                  setNewConversationModalVisible(false);
                  setSelectedUsers([]);
                  setSearchResults([]);
                }
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  conversationContent: {
    flexDirection: 'row',
    flex: 1,
  },
  conversationImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  conversationDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#666',
  },
  conversationTimestamp: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
  },
  moreButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  newConversationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
  },
  selectedUserItem: {
    backgroundColor: '#d3d3d3',
  },
});