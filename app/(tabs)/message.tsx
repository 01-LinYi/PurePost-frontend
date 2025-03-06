import React, { useState, useEffect, useRef } from "react";
import {
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";

// Message type definition,
// This is only used for local message objects
// TODO: Modify this to match the actual message structure from the backend
interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: number;
}

// Theme color constant
const THEME_COLOR = "#00c5e3";

// Sample bot responses for local debugging
const BOT_RESPONSES = [
  "Hello there! How can I help you today?",
  "That's interesting. Tell me more.",
  "I understand what you mean.",
  "Could you elaborate on that?",
  "Thanks for sharing that information.",
  "I'm just a debug bot to help you test the UI.",
  "That's a good point!",
  "I'm here to help you debug the chat interface.",
  "This is a local conversation for testing purposes.",
  "Feel free to test different message lengths and UI behaviors.",
];

export default function TabMessageScreen() {
  // State management for chat functionality
  const [roomName, setRoomName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocalMode, setUseLocalMode] = useState(false);

  // References for WebSocket connection and FlatList
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Connect to WebSocket server function
  const connectWebSocket = () => {
    // If local mode is enabled, use mock connection
    if (useLocalMode) {
      setIsConnecting(true);

      // Simulate connection delay
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);

        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: "Welcome to local debug mode! Any messages you send will receive automated responses.",
          sender: "other",
          timestamp: Date.now(),
        };

        setMessages([welcomeMessage]);
      }, 1000);

      return;
    }

    // Regular WebSocket connection logic
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    setError(null);
    setIsConnecting(true);

    // Create WebSocket connection
    const url = `ws://localhost:8000/ws/messages/${roomName}/`;
    ws.current = new WebSocket(url);

    // Handle successful connection
    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setIsConnecting(false);
    };

    // Handle incoming messages
    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // Distinguish between own and others' messages
        // TODO: Modify this to match the actual message structure from the backend

        const newMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          sender: data.sender === "me" ? "user" : "other", // Assumes backend sends 'sender' field
          timestamp: Date.now(),
        };

        // If the backend does not have a 'sender' field, you can use the following code instead
        /*
        const newMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          sender: "other", // Default to 'other' for incoming messages
          timestamp: Date.now(),
        };
        */

        setMessages((prevMessages) => [...prevMessages, newMessage]);
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
      setError("Connection error, please try again");
      setIsConnecting(false);
    };

    // Handle connection close
    ws.current.onclose = (e) => {
      console.log("WebSocket closed:", e.code, e.reason);
      setIsConnected(false);
    };
  };

  // Disconnect from WebSocket server
  const disconnectWebSocket = () => {
    if (useLocalMode) {
      setIsConnected(false);
      setMessages([]);
      return;
    }

    if (ws.current) {
      ws.current.close();
      setIsConnected(false);
      setMessages([]);
    }
  };

  // Get a random bot response for local debugging
  const getRandomBotResponse = () => {
    const randomIndex = Math.floor(Math.random() * BOT_RESPONSES.length);
    return BOT_RESPONSES[randomIndex];
  };

  // Send message function
  const sendMessage = () => {
    if (!message.trim()) return;

    // Create a local message object
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: Date.now(),
    };

    // Update UI immediately
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    if (useLocalMode) {
      // In local mode, simulate receiving a response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getRandomBotResponse(),
          sender: "other",
          timestamp: Date.now() + 1,
        };

        setMessages((prevMessages) => [...prevMessages, botResponse]);

        // Scroll to bottom after response
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000); // Delay bot response by 1 second
    } else if (ws.current) {
      // In WebSocket mode, send to server
      ws.current.send(JSON.stringify({ message }));
    }

    setMessage("");

    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Toggle between local debug mode and WebSocket mode
  const toggleLocalMode = () => {
    if (isConnected) {
      // Warn user if already connected
      Alert.alert(
        "Change Connection Mode",
        "Changing the connection mode will disconnect your current session. Continue?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => {
              disconnectWebSocket();
              setUseLocalMode(!useLocalMode);
            },
          },
        ]
      );
    } else {
      setUseLocalMode(!useLocalMode);
    }
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* KeyboardAvoidingView prevents keyboard from covering input field */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header section - Room connection UI */}
        <View style={styles.header}>
          {/* Debug mode toggle */}
          <View style={styles.debugModeContainer}>
            <Text style={styles.debugModeText}>
              {useLocalMode ? "Local Debug Mode" : "WebSocket Mode"}
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: THEME_COLOR }}
              thumbColor="#ffffff"
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleLocalMode}
              value={useLocalMode}
            />
          </View>

          <View style={styles.roomContainer}>
            <TextInput
              style={styles.roomInput}
              placeholder={
                useLocalMode ? "Debug Room (any name works)" : "Enter room name"
              }
              value={roomName}
              onChangeText={setRoomName}
              editable={!isConnected}
            />
            {isConnected ? (
              <TouchableOpacity
                style={[styles.roomButton, styles.leaveButton]}
                onPress={disconnectWebSocket}
              >
                <Text style={styles.roomButtonText}>Leave</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.roomButton}
                onPress={connectWebSocket}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.roomButtonText}>
                    {useLocalMode ? "Start Debug" : "Join"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          {/* Display error messages if any */}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {/* Connection status indicator */}
          {isConnected && (
            <View style={styles.connectedBanner}>
              <View style={styles.statusDot} />
              <Text style={styles.connectedText}>
                {useLocalMode
                  ? "Connected to local debug mode"
                  : `Connected to ${roomName}`}
              </Text>
            </View>
          )}
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
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageWrapper,
                    item.sender === "user"
                      ? styles.userMessageWrapper
                      : styles.otherMessageWrapper,
                  ]}
                >
                  {/* Message bubble with different styling based on sender */}
                  <View
                    style={[
                      styles.messageContainer,
                      item.sender === "user"
                        ? styles.userMessage
                        : styles.otherMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        item.sender === "user"
                          ? styles.userMessageText
                          : styles.otherMessageText,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                  {/* Message timestamp */}
                  <Text style={styles.timestamp}>
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
              )}
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
    </SafeAreaView>
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
  },
  debugModeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  debugModeText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  roomContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 22,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    marginRight: 10,
  },
  roomButton: {
    backgroundColor: THEME_COLOR, // Updated to theme color
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  leaveButton: {
    backgroundColor: "#ff6b6b",
  },
  roomButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  errorText: {
    color: "#ff6b6b",
    marginTop: 8,
  },
  connectedBanner: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 4,
    marginRight: 6,
  },
  connectedText: {
    fontSize: 13,
    color: "#4CAF50",
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
