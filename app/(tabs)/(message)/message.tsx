import React, { useState, useEffect, useRef } from "react";
import {
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/components/SessionProvider";
import { useSearchParams } from "expo-router/build/hooks";
import { router } from "expo-router";

// Message type definition,
// This is only used for local message objects
// TODO: Modify this to match the actual message structure from the backend
interface Sender {
  id: number;
  avatar: string;
  name: string;
}

interface Message {
  id: number;
  message: string;
  sender: Sender | null;
  created_at: number;
}

// Theme color constant
const THEME_COLOR = "#00c5e3";

export default function TabMessageScreen() {
  // State management for chat functionality
  const { session, user } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const searchParams = useSearchParams(); // Grab the passed-in parameters
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const image = searchParams.get("image");
  console.log(id, name, image);

  // References for WebSocket connection and FlatList
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Create WebSocket connection
  useEffect(() => {
    const url = `ws://localhost:8000/ws/messages/${id}/?token=${session}`; // TODO: refactor
    ws.current = new WebSocket(url);

    // Handle successful connection
    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    // Handle incoming messages
    ws.current.onmessage = (e) => {
      console.log("WebSocket message:", e.data);

      try {
        const data = JSON.parse(e.data);
        
        console.log("Parsed message:", data);
        console.log("Current messages:", messages);
        const newMessage: Message[] = data;
        console.log("newMessage:", newMessage);

        setMessages((prevMessages) => {
          const newMessages = prevMessages.concat(newMessage);
          console.log("After messages:", newMessages);
          return newMessages;
        });
        
        // Scroll to the bottom after receiving a message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    // Handle connection errors
    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e);
      Alert.alert("Connection error, please try again");
      setIsConnected(false);
    };

    // Handle connection close
    ws.current.onclose = (e) => {
      console.log("WebSocket closed:", e.code, e.reason);
      setIsConnected(false);
    };

    // Cleanup effect - close WebSocket on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [id, session]);

  // Send message function
  const sendMessage = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);

    ws.current?.send(JSON.stringify({ "message": message }));

    setMessage("");

    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Format timestamp into readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Cleanup effect - close WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      {/* KeyboardAvoidingView prevents keyboard from covering input field */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header section - Room connection UI */}
        <View style={styles.header}>
          {/* Back button */}
          <TouchableOpacity onPress={() => router.dismiss()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{name}</Text>
        </View>

        {/* Messages section - Main chat area */}
        <View style={styles.messagesContainer}>
          {/* Empty state when connected but no messages */}
          {messages.length === 0 && isConnected ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages</Text>
              <Text style={styles.emptySubText}>
                Send a message to start chatting
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                console.log("item:", item);
                return <View
                  style={[
                    styles.messageWrapper,
                    item.sender?.id === user?.id
                      ? styles.userMessageWrapper
                      : styles.otherMessageWrapper,
                  ]}
                >
                  {/* Message bubble with different styling based on sender */}
                  <View
                    style={[
                      styles.messageContainer,
                      item.sender?.id === user?.id
                        ? styles.userMessage
                        : styles.otherMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        item.sender?.id === user?.id
                          ? styles.userMessageText
                          : styles.otherMessageText,
                      ]}
                    >
                      {item.content}
                    </Text>
                  </View>
                  {/* Message timestamp */}
                  <Text style={styles.timestamp}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              }}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>

        {/* Message input section - Only shown when connected */}
        {isConnected && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={message.trim() ? "#ffffff" : "#cccccc"}
              />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

// Styles for the entire chat interface
const styles = StyleSheet.create({
  // Container and layout styles
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // Header section styles
  header: {
    padding: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Messages section styles
  messagesContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  flatListContent: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#999999",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#bbbbbb",
  },

  // Message bubble styles
  messageWrapper: {
    maxWidth: "80%",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  userMessageWrapper: {
    alignSelf: "flex-end",
    backgroundColor: "transparent",
  },
  otherMessageWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
  },
  messageContainer: {
    padding: 12,
    borderRadius: 18,
    minHeight: 40,
  },
  userMessage: {
    backgroundColor: THEME_COLOR, // Updated to theme color
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    // Add shadow to other messages to better distinguish them from background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#ffffff",
  },
  otherMessageText: {
    color: "#333333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
    alignSelf: "flex-end",
  },

  // Message input section styles
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    alignItems: "flex-end",
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: THEME_COLOR, // Updated to theme color
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
});