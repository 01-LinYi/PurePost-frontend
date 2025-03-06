import React, { useState, useCallback } from 'react';
import { View, Text } from '@/components/Themed';
import {
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MediaPreview from '@/components/MediaPreview';
import ActionButton from '@/components/ActionButton';

interface Media {
  uri: string;
  type: string;
}

const getMediaType = (uri: string): string => {
    if (uri.endsWith('.mp4')) return 'video/mp4';
    if (uri.endsWith('.mov')) return 'video/quicktime';
    if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) return 'image/jpeg';
    if (uri.endsWith('.png')) return 'image/png';
    return 'image/jpeg'; // Default type
  };

const Posting = () => {
  const [postText, setPostText] = useState<string>('');
  const [media, setMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const pickMedia = useCallback(async () => {
    try {
      // check permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please allow access to media files in settings.'
        );
        return;
      }

      setIsLoading(true);

      // launch media picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const type = asset.type || getMediaType(asset.uri);
        setMedia({ uri: asset.uri, type: type });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to select media: ' + ((error as Error).message || 'Unknown error')
      );
      console.error('Media picker error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMedia = useCallback(() => {
    setMedia(null);
  }, []);

  const handlePost = useCallback(() => {
    if (!postText.trim() && !media) {
      Alert.alert('Error', 'Please write something or add media before posting.');
      return;
    }

    setIsLoading(true);

    // simulate post request
    // replace this with your actual post request
    setTimeout(() => {
      Alert.alert('Success', 'Your post has been published!');
      setPostText('');
      setMedia(null);
      setIsLoading(false);
    }, 500);
  }, [postText, media]);

  const isPostDisabled = !postText.trim() && !media;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top) }]}>
        <Text style={styles.headerTitle}>Create New Post</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(20, insets.bottom) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Text input */}
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#9E9E9E"
          multiline
          value={postText}
          onChangeText={setPostText}
          maxLength={2000}
          returnKeyType="default"
          textAlignVertical="top"
          autoCapitalize="sentences"
        />

        {/* Preview your media */}
        <MediaPreview media={media} onRemove={removeMedia} />

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <ActionButton
            icon={<Ionicons name="image-outline" size={24} color="#00c5e3" />}
            text="Photo/Video"
            onPress={pickMedia}
            disabled={isLoading}
            style={styles.mediaButton}
            textStyle={styles.mediaButtonText}
          />

          <ActionButton
            text="Post"
            onPress={handlePost}
            disabled={isPostDisabled}
            loading={isLoading}
            style={[styles.postButton, isPostDisabled && styles.postButtonDisabled]}
            textStyle={styles.postButtonText}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00c5e3',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  textInput: {
    width: '100%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#00c5e3',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
    marginBottom: 16,
    color: '#333333',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaButton: {
    backgroundColor: '#F0F8FA',
    paddingHorizontal: 16,
  },
  mediaButtonText: {
    marginLeft: 8,
    color: '#00c5e3',
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#00c5e3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 100,
  },
  postButtonDisabled: {
    backgroundColor: '#B0E0E8',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Posting;