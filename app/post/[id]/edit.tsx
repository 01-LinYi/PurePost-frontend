// app/post/[id]/edit.tsx
import { useState, useEffect, useCallback } from "react";
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
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import MediaPreview from "@/components/MediaPreview";
import ActionButton from "@/components/ActionButton";
import * as api from "@/utils/api";
import { formatUploadFileName } from "@/utils/formatUploadFileName";
import { Post, Media } from "@/types/postType";
import { transformApiPostToPost } from "@/utils/transformers/postsTransformers";

const getMediaType = (uri: string): string => {
  const uriLower = uri.toLowerCase();
  if (
    uriLower.endsWith(".mp4") ||
    uriLower.endsWith(".mov") ||
    uriLower.endsWith(".avi") ||
    uriLower.endsWith(".wmv")
  ) {
    return "video";
  }
  return "image";
};

const EditPost = () => {
  const { id } = useLocalSearchParams();
  const [postText, setPostText] = useState<string>("");
  const [media, setMedia] = useState<Media | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [originalPost, setOriginalPost] = useState<{
    text: string;
    media: Media | null;
    visibility: "public" | "private" | "friends";
    hasDisclaimer: boolean;
    disclaimerText: string;
  }>({
    text: "",
    media: null,
    visibility: "public",
    hasDisclaimer: false,
    disclaimerText: "",
  });
  const [visibility, setVisibility] = useState<
    "public" | "private" | "friends"
  >("public");
  const [hasDisclaimer, setHasDisclaimer] = useState<boolean>(false);
  const [disclaimerText, setDisclaimerText] = useState<string>("");
  const insets = useSafeAreaInsets();

  // Fetch original post data
  useEffect(() => {
    const fetchPostData = async () => {
      if (typeof id !== "string") {
        Alert.alert("Error", "Invalid post ID");
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching post with ID: ${id} for editing`);

        const res = await api.fetchSinglePosts(id);
        const apiPost = res.data;
        console.log("Post data:", apiPost);

        // Transform API response to our frontend Post model
        const post = transformApiPostToPost(apiPost);

        // Get media from post if exists
        let postMedia = null;
        if (post.image) {
          const mediaType = getMediaType(post.image);
          postMedia = {
            [mediaType === "video" ? "video" : "image"]: post.image,
            type: mediaType,
            name: formatUploadFileName(
              mediaType as "image" | "video",
              post.image.split("/").pop() ||
                (mediaType === "video" ? "video.mp4" : "image.jpg")
            ),
          };
        }

        // Set post data
        setPostText(post.content || "");
        setMedia(postMedia);
        setVisibility(post.visibility || "public");
        setHasDisclaimer(!!post.disclaimer);
        setDisclaimerText(post.disclaimer || "");

        // Store original values for comparison
        setOriginalPost({
          text: post.content || "",
          media: postMedia,
          visibility: post.visibility || "public",
          hasDisclaimer: !!post.disclaimer,
          disclaimerText: post.disclaimer || "",
        });

        setIsLoading(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        Alert.alert("Error", "Failed to load post: " + errorMessage);
        console.error("Post loading error:", error);
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  // Toggle disclaimer
  const toggleDisclaimer = useCallback(() => {
    setHasDisclaimer(!hasDisclaimer);
    if (hasDisclaimer) {
      setDisclaimerText("");
    }
  }, [hasDisclaimer]);

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
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Check file size limits
        const fileSize = asset.fileSize || 0;
        const mediaType = getMediaType(asset.uri);

        if (mediaType === "image" && fileSize > 5 * 1024 * 1024) {
          Alert.alert("Error", "Image size cannot exceed 5MB");
          return;
        }

        if (mediaType === "video" && fileSize > 50 * 1024 * 1024) {
          Alert.alert("Error", "Video size cannot exceed 50MB");
          return;
        }

        mediaType === "image"
          ? setMedia({
              image: asset.uri,
              type: "image",
              name: formatUploadFileName(
                "image",
                asset.uri.split("/").pop() || "image.jpg"
              ),
            })
          : setMedia({
              video: asset.uri,
              type: "video",
              name: formatUploadFileName(
                "video",
                asset.uri.split("/").pop() || "video.mp4"
              ),
            });
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

  const toggleVisibility = useCallback(() => {
    setVisibility((prev) => (prev === "public" ? "private" : "public"));
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!postText.trim() && !media) {
      Alert.alert(
        "Error",
        "Please write something or add media before updating."
      );
      return;
    }

    if (typeof id !== "string") {
      Alert.alert("Error", "Invalid post ID");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data object for API
      const formData = new FormData();
      formData.append("content", postText.trim());
      formData.append("visibility", visibility);

      // Add disclaimer if enabled
      if (hasDisclaimer && disclaimerText.trim()) {
        formData.append("disclaimer", disclaimerText.trim());
      }

      // Add media if exists
      if (media) {
        const mediaField = media.type === "video" ? "video" : "image";
        const mediaUri = media.type === "video" ? media.video : media.image;

        // Only append if it's a local file (new upload)
        if (mediaUri && mediaUri.startsWith("file://")) {
          // @ts-ignore - RN FormData type issue
          formData.append(mediaField, {
            uri:
              Platform.OS === "android"
                ? mediaUri
                : mediaUri.replace("file://", ""),
            name:
              media.name ||
              `${mediaField}.${media.type === "video" ? "mp4" : "jpg"}`,
            type: media.type === "video" ? "video/mp4" : "image/jpeg",
          });
        } else if (mediaUri) {
          // If it's a remote URL, just send the reference
          formData.append(`${mediaField}_url`, mediaUri);
        }
      }

      // Call API to update post
      await api.updatePost(id, formData);

      Alert.alert("Success", "Your post has been updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", "Failed to update post: " + errorMessage);
      console.error("Post update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [postText, media, id, visibility, hasDisclaimer, disclaimerText]);

  const handleDelete = useCallback(() => {
    if (typeof id !== "string") {
      Alert.alert("Error", "Invalid post ID");
      return;
    }

    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);

            try {
              await api.deletePost(id);
              router.push("/(tabs)");
              // Show toast or notification that post was deleted
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
              Alert.alert("Error", "Failed to delete post: " + errorMessage);
              console.error("Post deletion error:", error);
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  }, [id]);

  const handleCancel = useCallback(() => {
    const hasChanges =
      postText !== originalPost.text ||
      media !== originalPost.media ||
      visibility !== originalPost.visibility ||
      hasDisclaimer !== originalPost.hasDisclaimer ||
      disclaimerText !== originalPost.disclaimerText;

    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Continue Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [
    postText,
    media,
    visibility,
    hasDisclaimer,
    disclaimerText,
    originalPost,
  ]);

  const isUpdateDisabled =
    (!postText.trim() && !media) ||
    (postText === originalPost.text &&
      media === originalPost.media &&
      visibility === originalPost.visibility &&
      hasDisclaimer === originalPost.hasDisclaimer &&
      disclaimerText === originalPost.disclaimerText);

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

        <Text style={styles.charCount}>{postText.length}/2000</Text>

        {/* Preview your media */}
        <MediaPreview media={media} onRemove={removeMedia} />

        {/* Disclaimer Toggle */}
        <View style={styles.disclaimerToggleContainer}>
          <View style={styles.disclaimerToggleRow}>
            <View style={styles.disclaimerLabelContainer}>
              <Ionicons name="warning-outline" size={20} color="#00c5e3" />
              <Text style={styles.disclaimerLabel}>Add Content Disclaimer</Text>
            </View>
            <Switch
              value={hasDisclaimer}
              onValueChange={toggleDisclaimer}
              trackColor={{ false: "#e0e0e0", true: "#00c5e3" }}
              thumbColor={hasDisclaimer ? "#00c5e3" : "#f4f3f4"}
              ios_backgroundColor="#f9f9f9"
            />
          </View>
        </View>

        {/* Disclaimer Input Field - only shown when disclaimer is enabled */}
        {hasDisclaimer && (
          <View style={styles.disclaimerInputContainer}>
            <TextInput
              style={styles.disclaimerInput}
              placeholder="Enter content disclaimer message..."
              placeholderTextColor="#9E9E9E"
              multiline
              value={disclaimerText}
              onChangeText={setDisclaimerText}
              maxLength={200}
              returnKeyType="default"
              textAlignVertical="top"
            />
            <Text style={styles.disclaimerCharCount}>
              {disclaimerText.length}/200
            </Text>
          </View>
        )}

        {/* Visibility toggle */}
        <View style={styles.visibilityContainer}>
          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={toggleVisibility}
          >
            <Ionicons
              name={
                visibility === "public"
                  ? "globe-outline"
                  : "lock-closed-outline"
              }
              size={20}
              color="#666666"
            />
            <Text style={styles.visibilityText}>
              {visibility === "public" ? "Public" : "Private"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.visibilityHint}>
            {visibility === "public"
              ? "Anyone can see this post"
              : "Only you can see this post"}
          </Text>
        </View>

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
            disabled={isUpdateDisabled || isSubmitting}
            loading={isSubmitting}
            style={[
              styles.updateButton,
              (isUpdateDisabled || isSubmitting) && styles.updateButtonDisabled,
            ]}
            textStyle={styles.updateButtonText}
          />
        </View>

        {/* Information about file limitations */}
        <View style={styles.limitContainer}>
          <Text style={styles.limitText}>
            File limits: Images (5MB max), Videos (50MB max)
          </Text>
          <Text style={styles.limitText}>
            Supported formats: JPG, JPEG, PNG, GIF, MP4, MOV, AVI, WMV
          </Text>
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
    marginBottom: 4,
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
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#9E9E9E",
    marginBottom: 16,
  },
  disclaimerToggleContainer: {
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#00c5e3",
  },
  disclaimerToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  disclaimerLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  disclaimerLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#00c5e3",
    backgroundColor: "#f9f9f9",
    marginLeft: 8,
  },
  disclaimerInputContainer: {
    marginBottom: 16,
  },
  disclaimerInput: {
    width: "100%",
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#00c5e3",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    marginBottom: 4,
    color: "#555555",
  },
  disclaimerCharCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#9E9E9E",
  },
  visibilityContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  visibilityButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  visibilityText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 6,
    fontWeight: "500",
  },
  visibilityHint: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 4,
    marginLeft: 26,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
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
  limitContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F0F8FA",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#00c5e3",
  },
  limitText: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default EditPost;
