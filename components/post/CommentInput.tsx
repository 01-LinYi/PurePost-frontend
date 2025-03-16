import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  bottomInset: number;
  isSubmitting?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({ 
  onSubmit, 
  bottomInset, 
  isSubmitting = false 
}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim() || isSubmitting) return;
    onSubmit(text);
    setText('');
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={[
        styles.inputWrapper, 
        isSubmitting && styles.inputWrapperDisabled
      ]}>
        <TextInput
          placeholder="Add a comment..."
          placeholderTextColor="#9E9E9E"
          style={styles.input}
          multiline
          value={text}
          onChangeText={setText}
          editable={!isSubmitting}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSubmit}
          disabled={!text.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#00c5e3" />
          ) : (
            <Ionicons 
              name="send" 
              size={24} 
              color={text.trim() ? "#00c5e3" : "#CCCCCC"} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#00c5e3',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  inputWrapperDisabled: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F2F2F2',
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentInput;