import { TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import React, { useState, useEffect, useRef } from 'react';


export default function TabMessageScreen() {
  const [roomName, setRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ message: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    const url = `ws://localhost:8000/ws/messages/${roomName}/`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (e) => {
      const newMessage = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, { message: newMessage.message }]);
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket error:', e);
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket closed:', e.code, e.reason);
      setIsConnected(false);
    };
  };

  const sendMessage = () => {
    if (ws.current && message.trim()) {
      ws.current.send(JSON.stringify({ message }));
      setMessage('');
    }
  };

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Room Name"
        value={roomName}
        onChangeText={setRoomName}
      />
      <Button title="Join Room" onPress={connectWebSocket} disabled={isConnected} />
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Message"
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={sendMessage}
      />
      <Button title="Send" onPress={sendMessage} disabled={!isConnected} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  messageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  message: {
    fontSize: 16,
  },
});
