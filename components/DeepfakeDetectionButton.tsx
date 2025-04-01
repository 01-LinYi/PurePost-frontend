// components/DeepfakeDetectionButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/utils/axiosInstance';

interface DeepfakeDetectionButtonProps
{
  postId: string;
  mediaId?: string;
  onResultReceived?: (result: DeepfakeResult) => void;
}

export interface DeepfakeResult
{
  id: string;
  postId: string;
  mediaId: string;
  confidence: number; // 0-1 confidence in the result
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

const DeepfakeDetectionButton: React.FC<DeepfakeDetectionButtonProps> = ({ 
  postId, 
  mediaId,
  onResultReceived 
}) => {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const requestDetection = async () => {
    if (!mediaId)
    {
      Alert.alert('No Media', 'This post does not contain media that can be analyzed.');
      return;
    }

    try {
      setLoading(true);
      
      // Make API request to backend for deepfake detection
      const response = await axiosInstance.post('/content/deepfake-detection/', {
        post_id: postId,
        media_id: mediaId
      });
      
      setRequested(true);
      
      // If the result is immediate (unlikely with real detection)
      if (response.data.status === 'completed' && onResultReceived)
      {
        onResultReceived(response.data);
      } 
      else
      {
        // Show confirmation that the request has been submitted
        Alert.alert(
          'Detection Requested', 
          'We\'ve received your request to analyze this media. Results will be available soon.'
        );
      }
    } catch (error) {
      const errorMessage = 
        (error as any)?.response?.data?.detail || 
        (error as Error).message || 
        'Failed to request deepfake detection.';
        
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (requested)
  {
    return (
      <View style={styles.container}>
        <View style={styles.requestedContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.requestedText}>Analysis requested</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={requestDetection}
        disabled={loading || !mediaId}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Request Deepfake Detection</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#8c52ff', // Purple to distinguish from other buttons
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  requestedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f9f0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0f2e0',
  },
  requestedText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  }
});

export default DeepfakeDetectionButton;