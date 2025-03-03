import React, { useState, useEffect, useCallback } from "react";
import { View, Text } from "@/components/Themed";
import {
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

import MediaPreview from "@/components/MediaPreview";
import ActionButton from "@/components/ActionButton";

interface Media {
  uri: string;
  type: string;
}

const getMediaType = (uri: string): string => {
  if (uri.endsWith(".mp4")) return "video/mp4";
  if (uri.endsWith(".mov")) return "video/quicktime";
  if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
  if (uri.endsWith(".png")) return "image/png";
  return "image/jpeg"; // Default type
};

const EditPost = () => {
  const { id } = useLocalSearchParams();
  const [postText, setPostText] = useState<string>("");
  const [media, setMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [originalPost, setOriginalPost] = useState<{
    text: string;
    media: Media | null;
  }>({
    text: "",
    media: null,
  });
  const insets = useSafeAreaInsets();

  // Fetch original post data
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsLoading(true);

        // This is a mock - replace with your actual API call
        // const response = await api.getPost(id);

        // Simulating API response
        setTimeout(() => {
          const mockPostData = {
            text: "This is the original post text that we're now editing.",
            media: {
              uri: "https://example.com/sample-image.jpg",
              type: "image/jpeg",
            },
          };

          setPostText(mockPostData.text);
          setMedia(mockPostData.media);
          setOriginalPost(mockPostData);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to load post: " +
            ((error as Error).message || "Unknown error")
        );
        console.error("Post loading error:", error);
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  const pickMedia = useCallback(async () => {
    try {
      // check permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow access to media files in settings."
        );
        return;
      }

      // launch media picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
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
        "Error",
        "Failed to select media: " +
          ((error as Error).message || "Unknown error")
      );
      console.error("Media picker error:", error);
    }
  }, []);

  const removeMedia = useCallback(() => {
    setMedia(null);
  }, []);

  const handleUpdate = useCallback(() => {
    if (!postText.trim() && !media) {
      Alert.alert(
        "Error",
        "Please write something or add media before updating."
      );
      return;
    }

    setIsSubmitting(true);

    // simulate update request
    // replace this with your actual API call
    setTimeout(() => {
      Alert.alert("Success", "Your post has been updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setIsSubmitting(false);
    }, 800);
  }, [postText, media]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIsSubmitting(true);

            // simulate delete request
            // replace with your actual API call
            setTimeout(() => {
              router.push("/(tabs)");
              // Show toast or notification that post was deleted
            }, 800);
          },
        },
      ]
    );
  }, []);
  /* 
  const handleCancel = useCallback(() => {
    if (postText !== originalPost.text || media !== originalPost.media) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Continue Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  }, [postText, media, originalPost]);
  */

  const isUpdateDisabled =
    (!postText.trim() && !media) ||
    (postText === originalPost.text && media === originalPost.media);

  // Render loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00c5e3" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

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
            disabled={isSubmitting}
            style={styles.mediaButton}
            textStyle={styles.mediaButtonText}
          />

          <ActionButton
            text="Update"
            onPress={handleUpdate}
            disabled={isUpdateDisabled}
            loading={isSubmitting}
            style={[
              styles.updateButton,
              isUpdateDisabled && styles.updateButtonDisabled,
            ]}
            textStyle={styles.updateButtonText}
          />
        </View>

        {/* Delete button at the bottom */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={isSubmitting}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#00c5e3",
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  textInput: {
    width: "100%",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#00c5e3",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    marginBottom: 16,
    color: "#333333",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  mediaButton: {
    backgroundColor: "#F0F8FA",
    paddingHorizontal: 16,
  },
  mediaButtonText: {
    marginLeft: 8,
    color: "#00c5e3",
    fontWeight: "500",
  },
  updateButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 100,
  },
  updateButtonDisabled: {
    backgroundColor: "#B0E0E8",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default EditPost;
