import React, { useState, useCallback, useEffect } from "react";
import { View } from "@/components/Themed";
import {
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text as Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";
import axiosInstance from "@/utils/axiosInstance";
import MediaPreview from "@/components/MediaPreview";
import ActionButton from "@/components/ActionButton";
import { Media, PostRequest } from "@/types/postType";

const getMediaType = (uri: string): string => {
  const uriLower = uri.toLowerCase();
  if (uriLower.endsWith(".mp4")) return "video/mp4";
  if (uriLower.endsWith(".mov")) return "video/quicktime";
  if (uriLower.endsWith(".jpg") || uriLower.endsWith(".jpeg"))
    return "image/jpeg";
  if (uriLower.endsWith(".png")) return "image/png";
  if (uriLower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
};

const createMediaFormData = (media: Media) => {
  const formData = new FormData();
  const uriParts = media.uri.split("/");
  const fileName = uriParts[uriParts.length - 1];

  // @ts-ignore - RN doesn't have `Platform` type
  formData.append("media", {
    uri:
      Platform.OS === "android" ? media.uri : media.uri.replace("file://", ""),
    name: fileName,
    type: media.type,
  });

  return formData;
};

const CreatePost = () => {
  const [postText, setPostText] = useState<string>("");
  const [media, setMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  useEffect(() => {
    const hasContent = postText.trim().length > 0 || media !== null;
    setHasUnsavedChanges(hasContent);

    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasContent) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Don't leave", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, postText, media]);

  const pickMedia = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow access to media files in settings."
        );
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const type = asset.type || getMediaType(asset.uri);
        setMedia({ uri: asset.uri, type });
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to select media: " +
          ((error as Error).message || "Unknown error")
      );
      console.error("Media picker error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMedia = useCallback(() => {
    setMedia(null);
  }, []);

  const toggleVisibility = useCallback(() => {
    setVisibility((prev) => (prev === "public" ? "private" : "public"));
  }, []);

  const handlePost = useCallback(async () => {
    if (!postText.trim() && !media) {
      Alert.alert(
        "Error",
        "Please write something or add media before posting."
      );
      return;
    }

    try {
      setIsLoading(true);

      const postData: PostRequest = {
        content: postText.trim(),
        visibility: visibility,
      };

      let response;

      if (media) {
        const formData = createMediaFormData(media);
        const mediaResponse = await axiosInstance.post(
          "/content/media/upload/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        postData.media_id = mediaResponse.data.id;
      }

      response = await axiosInstance.post("/content/posts/", postData);

      Alert.alert("Success", "Your post has been published!", [
        {
          text: "View Post",
          onPress: () => router.push(`/post/${response.data.id}`),
        },
        {
          text: "Go Home",
          onPress: () => router.push("/(tabs)"),
        },
      ]);

      setPostText("");
      setMedia(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as Error).message ||
        "Unknown error occurred";

      Alert.alert("Error", `Failed to publish post: ${errorMessage}`);
      console.error("Post creation error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postText, media, visibility]);

  const isPostDisabled = (!postText.trim() && !media) || isLoading;

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

        <MediaPreview media={media} onRemove={removeMedia} />

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
            style={[
              styles.postButton,
              isPostDisabled && styles.postButtonDisabled,
            ]}
            textStyle={styles.postButtonText}
          />
        </View>

        {/* Back to Tabs Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back to Tabs</Text>
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
  postButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 100,
  },
  postButtonDisabled: {
    backgroundColor: "#B0E0E8",
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreatePost;
