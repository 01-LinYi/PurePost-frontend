import React, { useState, useEffect } from "react";
import {
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import axiosInstance from "@/utils/axiosInstance";
import { View, Text } from "@/components/Themed";
import { Image } from '@/components/CachedImage';
import { API_URL } from "@/constants/Api";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/components/SessionProvider";
import styles from "@/components/message/conversationStyle";

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

// UserListItem component for selecting users in conversation creation
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

  // States to handle loading, errors and retry operations
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Function to get all conversations with error handling
  const getAllConversation = async () => {
    try {
      // Set a timeout for the request to prevent hanging
      const response = await axiosInstance.get(API_URL + "messages/conv/", {
        timeout: 10000, // 10 seconds timeout
      });

      if (response.status === 200) {
        setError(null);
        return response.data;
      } else {
        // Handle non-200 status codes
        throw new Error(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      // Handle different types of axios errors
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error(
            "Request timeout. The server took too long to respond."
          );
        } else if (!error.response) {
          // Network error or server not responding
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        } else {
          // Server returned an error response
          throw new Error(
            `Server error: ${error.response.data?.message || error.message}`
          );
        }
      } else {
        // For non-axios errors
        throw error;
      }
    }
  };

  // Function to fetch conversations with proper error handling
  const fetchConversations = async () => {
    setIsLoading(true);
    setIsRetrying(false);
    try {
      const data = await getAllConversation();
      setConversations(data.results);
      setError(null);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle manual retry by user
  const handleRetry = () => {
    setIsRetrying(true);
    fetchConversations();
  };

  // Handler for editing conversation name
  const handleEditName = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setNewName(conversation.name);
    setModalVisible(true);
  };

  // Save the edited conversation name
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
          setError(null);
        } else {
          throw new Error(`Failed to update: ${response.statusText}`);
        }
      } catch (error) {
        let errorMessage = "Failed to update conversation name";
        if (axios.isAxiosError(error)) {
          errorMessage += `: ${error.response?.data?.message || error.message}`;
        }
        console.error(errorMessage, error);
        Alert.alert("Error", errorMessage);
      }
    }
  };

  // Delete conversation handler (not fully implemented)
  const handleDeleteConversation = async () => {
    Alert.alert(
      "Delete Conversation is not implemented",
      "This feature is not implemented yet. Please check back later.",
      [{ text: "OK", onPress: () => setDeleteModalVisible(false) }]
    );
  };

  // Show delete confirmation modal
  const confirmDelete = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setDeleteModalVisible(true);
  };

  // Search for users to add to conversation
  const handleSearchUser = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}users/search/`, {
        params: { username: searchUsername },
      });
      if (response.status === 200) {
        setSearchResults(response.data.results);
        setError(null);
      } else {
        throw new Error(`User search failed: ${response.statusText}`);
      }
    } catch (error) {
      let errorMessage = "User search failed";
      if (axios.isAxiosError(error)) {
        errorMessage += `: ${error.response?.data?.message || error.message}`;
      }
      console.error(errorMessage, error);
      Alert.alert("Error", errorMessage);
    }
  };

  // Handle user selection for new conversation
  const handleUserSelect = (userId: number) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  // Create a new conversation
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
        setError(null);
      } else {
        throw new Error(
          `Failed to create conversation: ${response.statusText}`
        );
      }
      setConversations((prevConversations) =>
        prevConversations.includes(response.data)
          ? prevConversations
          : [...prevConversations, response.data]
      );
      setNewConversationModalVisible(false);
      setSelectedUsers([]);
    } catch (error) {
      let errorMessage = "Conversation creation error";
      if (axios.isAxiosError(error)) {
        errorMessage += `: ${error.response?.data?.message || error.message}`;
      }
      console.error(errorMessage, error);
      Alert.alert("Error", errorMessage);
    }
  };

  // Filter conversations based on search input
  const filteredConversations = searchConversation
    ? conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchConversation.toLowerCase())
      )
    : conversations;

  // Render each conversation item
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

  // Render loading state
  const renderLoadingContent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00c5e3" />
      <Text style={styles.loadingText}>Loading messages...</Text>
    </View>
  );

  // Render error state
  const renderErrorContent = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={50} color="#FF3B30" />
      <Text style={styles.errorTitle}>Couldn't Load Messages</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
        {isRetrying && (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color="#00c5e3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Banner - Shows when there's an error but content is still available */}
      {error && conversations.length > 0 && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={handleRetry}
          activeOpacity={0.7}
        >
          <View style={styles.errorBannerContent}>
            <Ionicons
              name="warning"
              size={18}
              color="#fff"
              style={styles.errorBannerIcon}
            />
            <Text style={styles.errorBannerText}>Connection error</Text>
          </View>
          <Text style={styles.errorBannerAction}>
            {isRetrying ? "Retrying..." : "Tap to retry"}
          </Text>
        </TouchableOpacity>
      )}

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

      {/* Main Content - Conditional Rendering */}
      {isLoading ? (
        renderLoadingContent()
      ) : error && conversations.length === 0 ? (
        renderErrorContent()
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            filteredConversations && filteredConversations.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={50}
                color="#c7c7cc"
              />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubText}>
                Start a new conversation by tapping the + button
              </Text>
            </View>
          )}
          refreshing={isRetrying}
          onRefresh={handleRetry}
        />
      )}

      {/* New Conversation Button */}
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
              ListEmptyComponent={() => (
                <View style={styles.emptySearchContainer}>
                  <Text style={styles.emptySearchText}>
                    {searchUsername.length > 0
                      ? "No users found. Try a different search term."
                      : "Search for users to add to your conversation"}
                  </Text>
                </View>
              )}
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
