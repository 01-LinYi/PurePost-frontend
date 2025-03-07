import React, { useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Modal,
  Button,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { router } from "expo-router";
import axiosInstance from "@/utils/axiosInstance";
import { View, Text } from "@/components/Themed";
import { API_URL } from "@/constants/Api";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/components/SessionProvider";

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

// add UserListItem component, which is a list item for selecting users
// can be extracted to a separate file if needed
const UserListItem = ({
  item,
  isSelected,
  onSelect,
}: {
  item: User;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.userItem, isSelected && styles.selectedUserItem]}
      onPress={onSelect}
    >
      <Text>{item.username}</Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color="#00c5e3" />
      )}
    </TouchableOpacity>
  );
};

export default function ConversationListScreen() {
  const getAllConversation = async () => {
    try {
      const response = await axiosInstance.get(API_URL + "messages/conv/");
      if (response.status === 200) {
        return response.data;
      } else {
        console.error("Conversation fetch failed:", response.statusText);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Conversation fetch failed:", error.response.data);
      } else {
        console.error("Conversation fetch failed:", error);
      }
    }
    return [];
  };

  const { user } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newName, setNewName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [newConversationModalVisible, setNewConversationModalVisible] =
    useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchConversation, setSearchConversation] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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
        const response = await axiosInstance.patch(
          `${API_URL}messages/conv/${selectedConversation.id}/`,
          {
            name: newName,
          }
        );
        if (response.status === 200) {
          setConversations((prevConversations) =>
            prevConversations.map((conv) =>
              conv.id === selectedConversation.id
                ? { ...conv, name: newName }
                : conv
            )
          );
          setModalVisible(false);
        } else {
          console.error(
            "Failed to update conversation name:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Failed to update conversation name:", error);
      }
    }
  };

  const handleDeleteConversation = async () => {
    Alert.alert(
      "Delete Conversation is not implemented",
      "This feature is not implemented yet. Please check back later.",
      [{ text: "OK", onPress: () => setDeleteModalVisible(false) }]
    );
    /*
    if (selectedConversation) {
      try {
        const response = await axiosInstance.delete(`${API_URL}messages/conv/${selectedConversation.id}/`);
        if (response.status === 204) {
          setConversations((prevConversations) =>
            prevConversations.filter((conv) => conv.id !== selectedConversation.id)
          );
          setDeleteModalVisible(false);
        } else {
          console.error('Failed to delete conversation:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
    */
  };

  const confirmDelete = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setDeleteModalVisible(true);
  };

  const handleSearchUser = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}users/search/`, {
        params: { username: searchUsername },
      });
      if (response.status === 200) {
        setSearchResults(response.data);
      } else {
        console.error("User search failed:", response.statusText);
      }
    } catch (error) {
      console.error("User search failed:", error);
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
      console.log("Selected users:", selectedUsers);
      const participants = user
        ? selectedUsers.includes(user.id)
          ? selectedUsers
          : [...selectedUsers, user?.id]
        : selectedUsers;
      console.log("participants:", participants);
      const response = await axiosInstance.post(`${API_URL}messages/conv/`, {
        participants,
      });
      if (response.status === 201 || response.status === 200) {
        router.push({
          pathname: "./message",
          params: {
            id: response.data.id,
            name: response.data.name,
            image: response.data.image,
          },
        });
      } else {
        console.error("Failed to create conversation:", response.statusText);
      }
      setConversations((prevConversations) =>
        prevConversations.includes(response.data)
          ? prevConversations
          : [...prevConversations, response.data]
      );
      setNewConversationModalVisible(false);
      setSelectedUsers([]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Conversation creation error:", error.response.data);
      } else {
        console.error("Conversation creation error:", error);
      }
    }
  };

  const filteredConversations = searchConversation
    ? conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchConversation.toLowerCase())
      )
    : conversations;

  const renderItem = ({ item }: { item: Conversation }) => (
    <View style={styles.conversationItem}>
      <TouchableOpacity
        style={styles.conversationContent}
        onPress={() =>
          router.push({
            pathname: "./message",
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
          <Text style={styles.conversationTimestamp}>
            {item.lastMessageTimestamp}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => confirmDelete(item)}
        >
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditName(item)}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#00c5e3" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Dynamic Island Friendly Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color="#00c5e3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8e8e93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchConversation}
          onChangeText={setSearchConversation}
        />
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.newConversationButton}
        onPress={() => setNewConversationModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Edit Conversation Name Modal */}
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
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveName}
              >
                <Text style={styles.buttonTextWhite}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Conversation</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteConversation}
              >
                <Text style={styles.buttonTextWhite}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Conversation Modal */}
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
          <View style={[styles.modalContent, styles.largeModalContent]}>
            <Text style={styles.modalTitle}>Create New Conversation</Text>

            <View style={styles.searchUserContainer}>
              <TextInput
                style={styles.searchUserInput}
                value={searchUsername}
                onChangeText={setSearchUsername}
                placeholder="Search by username"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchUser}
              >
                <Ionicons name="search" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.user_id)}
              renderItem={({ item }) => (
                <UserListItem
                  item={item}
                  isSelected={selectedUsers.includes(item.user_id)}
                  onSelect={() => handleUserSelect(item.user_id)}
                />
              )}
              contentContainerStyle={styles.userListContent}
            />

            <View style={styles.modalActionsContainer}>
              <TouchableOpacity
                style={styles.cancelActionButton}
                onPress={() => {
                  setNewConversationModalVisible(false);
                  setSelectedUsers([]);
                  setSearchResults([]);
                }}
              >
                <Text style={styles.cancelActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createActionButton,
                  selectedUsers.length === 0 && styles.disabledButton,
                ]}
                disabled={selectedUsers.length === 0}
                onPress={handleCreateConversation}
              >
                <Text style={styles.createActionText}>Create Conversation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    alignContent: "center",
    color: "#00c5e3",
  },
  headerRight: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 10,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  conversationContent: {
    flexDirection: "row",
    flex: 1,
  },
  conversationImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#00c5e3",
  },
  conversationDetails: {
    flex: 1,
    justifyContent: "center",
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  conversationTimestamp: {
    fontSize: 12,
    color: "#00c5e3",
    alignSelf: "flex-end",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  largeModalContent: {
    height: "70%",
    width: "90%",
    justifyContent: "flex-start",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#00c5e3",
    alignSelf: "flex-start",
  },
  modalText: {
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
    lineHeight: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#00c5e3",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  disabledButton: {
    backgroundColor: "#b7e5ee",
    opacity: 0.7,
  },
  buttonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonTextWhite: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  newConversationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#00c5e3",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  username: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginLeft: 8,
    fontWeight: "500",
  },

  checkIcon: {
    marginLeft: 10,
  },
  selectedUserItem: {
    width: "100%",
    backgroundColor: "rgba(0, 197, 227, 0.1)",
  },
  searchUserContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
  },
  searchUserInput: {
    flex: 1,
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginRight: 8,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: "#00c5e3",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  userListContent: {
    width: "100%",
    flexGrow: 1,
  },
  modalActionsContainer: {
    width: "100%",
    flexDirection: "column",
    marginTop: 15,
  },
  cancelActionButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  createActionButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  createActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
