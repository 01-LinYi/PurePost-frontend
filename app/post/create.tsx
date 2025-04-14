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
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";
import axiosInstance from "@/utils/axiosInstance";
import { formatUploadFileName } from "@/utils/formatUploadFileName";
import MediaPreview from "@/components/MediaPreview";
import ActionButton from "@/components/ActionButton";
import { Media } from "@/types/postType";

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

// Validation function for tags
const validateTag = (tag: string): boolean => {
  // Allow alphanumeric, spaces, underscores, and hyphens, 1-30 characters
  return /^[a-zA-Z0-9 _-]{1,30}$/.test(tag);
};


const CreatePost = () => {
  const [postText, setPostText] = useState<string>("");
  const [media, setMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [hasDisclaimer, setHasDisclaimer] = useState<boolean>(false);
  const [disclaimerText, setDisclaimerText] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [caption, setCaption] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [showCaptionAndTags, setShowCaptionAndTags] = useState<boolean>(false);

  useEffect(() => {
    const checkForDraft = async () => {
      try {
        const response = await axiosInstance.get("/content/posts/draft/");
        const draft = response.data;
        
        Alert.alert(
          "Draft Found",
          "Would you like to continue with your saved draft?",
          [
            {
              text: "Discard",
              style: "destructive",
              onPress: async () => {
                try {
                  await axiosInstance.delete(`/content/posts/${draft.id}/`);
                  console.log("Draft discarded");
                } catch (error) {
                  console.error("Error discarding draft:", error);
                }
              }
            },
            {
              text: "Load Draft",
              onPress: () => {
                setPostText(draft.content || "");
                
                if (draft.image) {
                  setMedia({
                    image: draft.image,
                    type: "image",
                    name: draft.image.split('/').pop() || "image.jpg",
                  });
                } else if (draft.video) {
                  setMedia({
                    video: draft.video,
                    type: "video", 
                    name: draft.video.split('/').pop() || "video.mp4",
                  });
                }
                
                setVisibility(draft.visibility);
                setHasDisclaimer(!!draft.disclaimer);
                setDisclaimerText(draft.disclaimer || "");
                setDraftId(draft.id);
              }
            }
          ]
        );
      } catch (error) {
        // No draft or error fetching - that's okay, just continue with new post
        if ((error as any)?.response?.status !== 404) {
          console.error("Error checking for draft:", error);
        }
      }
    };
    
    checkForDraft();
  }, []);


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
  }, [navigation, postText, media, caption, tags]);

  // Toggle disclaimer
  const toggleDisclaimer = useCallback(() => {
    setHasDisclaimer(!hasDisclaimer);
    if (!hasDisclaimer === false) {
      setDisclaimerText("");
    }
  }, [hasDisclaimer]);

  // Toggle caption and tags section
  const toggleCaptionAndTags = useCallback(() => {
    setShowCaptionAndTags(!showCaptionAndTags);
  }, [showCaptionAndTags]);

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
        // Check file size limits
        const fileSize = asset.fileSize || 0;
        const mediaType = getMediaType(asset.uri);

        if (mediaType === "image" && fileSize > 5 * 1024 * 1024) {
          Alert.alert("Error", "Image size cannot exceed 5MB");
          setIsLoading(false);
          return;
        }

        if (mediaType === "video" && fileSize > 50 * 1024 * 1024) {
          Alert.alert("Error", "Video size cannot exceed 50MB");
          setIsLoading(false);
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

  // Preview navigation
  const handlePreview = useCallback(() => {
    if (!postText.trim() && !media) {
      Alert.alert(
        "Error",
        "Please write something or add media before previewing."
      );
      return;
    }

    // Navigate to preview screen with post data
    router.push({
      pathname: "/post/preview",
      params: {
        postText: encodeURIComponent(postText),
        caption: encodeURIComponent(caption),
        tags: encodeURIComponent(JSON.stringify(tags)),
        mediaUri: media?.uri || "",
        mediaType: media?.type || "",
        visibility,
        hasDisclaimer: hasDisclaimer ? "true" : "false",
        disclaimerText: encodeURIComponent(disclaimerText || ""),
      },
    });
  }, [postText, media, visibility, hasDisclaimer, disclaimerText, caption, tags]);

  const handleSaveDraft = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Create form data object
      const formData = new FormData();
      formData.append("content", postText);
      formData.append("visibility", visibility);
      formData.append("status", "draft");
      
      if (hasDisclaimer)
      {
        formData.append("disclaimer", disclaimerText);
      }

      if (caption.trim())
      {
        formData.append("caption", caption.trim());
      }
      
      if (tags.length > 0)
      {
        formData.append("tags", JSON.stringify(tags));
      }
  
      if (media) {
        const fileType = media.type === "video" ? "video" : "image";
        
        // @ts-ignore - RN FormData type issue
        formData.append(fileType, {
          uri: Platform.OS === "android" 
            ? (media.type === "video" ? media.video : media.image)
            : (media.type === "video" ? media.video?.replace("file://", "") : media.image?.replace("file://", "")),
          name: media.name,
          type: media.type === "video" ? "video/mp4" : "image/jpeg",
        });
      }
  
      // Either update or create a draft
      const endpoint = draftId 
        ? `/content/posts/${draftId}/update-draft/` 
        : "/content/posts/save-draft/";
      
      const method = draftId ? "patch" : "post";
      
      const response = await axiosInstance({
        method,
        url: endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setDraftId(response.data.id);
      setHasUnsavedChanges(false);
      
      Alert.alert(
        "Draft Saved",
        "Your post has been saved as a draft.",
        [{ text: "OK" }]
      );
      
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.detail ||
        (error as Error).message ||
        "Unknown error occurred";
        
      Alert.alert("Error", `Failed to save draft: ${errorMessage}`);
      console.error("Draft saving error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [postText, media, visibility, hasDisclaimer, disclaimerText, draftId]);

  // Add a tag
  const addTag = useCallback(() => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag)
    {
      return;
    }
    
    if (!validateTag(trimmedTag))
    {
      Alert.alert(
        "Invalid Tag", 
        "Tags can only contain letters, numbers, spaces, underscores, and hyphens, and must be 1-30 characters long."
      );
      return;
    }
    
    if (tags.includes(trimmedTag))
    {
      Alert.alert("Duplicate Tag", "This tag has already been added.");
      return;
    }
    
    if (tags.length >= 10)
    {
      Alert.alert("Tag Limit", "You can add a maximum of 10 tags.");
      return;
    }
    
    setTags([...tags, trimmedTag]);
    setTagInput("");
  }, [tagInput, tags]);

  // Remove a tag
  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

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

      // ADDED: Check if we're publishing a draft
    if (draftId)
    {
        const response = await axiosInstance.post(`/content/posts/${draftId}/publish/`);
        
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
      } 
      else 
      {
        // Create form data object
        const formData = new FormData();
        formData.append("content", postText.trim());
        formData.append("visibility", visibility);
        formData.append("status", "published");

        if (hasDisclaimer)
        {
          formData.append("disclaimer", disclaimerText);
        }

        if (caption.trim())
        {
          formData.append("caption", caption.trim());
        }
        
        if (tags.length > 0)
        {
          formData.append("tags", JSON.stringify(tags));
        }
      

        if (media) {
            const uriParts =
            media.type === "video"
                ? media.video?.split("/") || []
                : media.image?.split("/") || [];

            const fileName = uriParts[uriParts.length - 1];
            const fileType = media.type === "video" ? "video" : "image";

            // @ts-ignore - RN FormData type issue
            formData.append(fileType, {
            uri:
                Platform.OS === "android"
                ? media.image
                : media.image?.replace("file://", "") ?? "",
            name: media.name || fileName,
            type: media.type === "video" ? "video/mp4" : "image/jpeg", // Simplified for example
            });
        }

        // Submit post with media if present
        const response = await axiosInstance.post("/content/posts/", formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        });
        console.log("Post created:", response.data);

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
        setHasDisclaimer(false);
        setDisclaimerText("");
        setDraftId(null);
      }
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.detail ||
        (error as Error).message ||
        "Unknown error occurred";

      Alert.alert("Error", `Failed to publish post: ${errorMessage}`);
      console.error("Post creation error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postText, media, visibility]);

  // Added isSaving to disabled state checks
  const isPostDisabled = (!postText.trim() && !media) || isLoading || isSaving;
  const isPreviewDisabled = (!postText.trim() && !media) || isLoading || isSaving;
  const isSaveDisabled = (!postText.trim() && !media) || isLoading || isSaving;

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

        {/* Caption and Tags Toggle Button */}
        <TouchableOpacity
          style={styles.captionToggleButton}
          onPress={toggleCaptionAndTags}
        >
          <View style={styles.captionToggleContent}>
            <Ionicons 
              name={showCaptionAndTags ? "chevron-up-outline" : "chevron-down-outline"} 
              size={20} 
              color="#00c5e3" 
            />
            <Text style={styles.captionToggleText}>
              {showCaptionAndTags ? "Hide Caption & Tags" : "Add Caption & Tags"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Caption and Tags Section */}
        {showCaptionAndTags && (
          <View style={styles.captionTagsContainer}>
            {/* Caption Input */}
            <View style={styles.captionContainer}>
              <Text style={styles.sectionLabel}>Caption</Text>
              <TextInput
                style={styles.captionInput}
                placeholder="Add a short caption to your post..."
                placeholderTextColor="#9E9E9E"
                multiline
                value={caption}
                onChangeText={setCaption}
                maxLength={100}
                returnKeyType="default"
              />
              <Text style={styles.charCount}>{caption.length}/100</Text>
            </View>
            
            {/* Tags Input */}
            <View style={styles.tagsContainer}>
              <Text style={styles.sectionLabel}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add tags..."
                  placeholderTextColor="#9E9E9E"
                  value={tagInput}
                  onChangeText={setTagInput}
                  maxLength={30}
                  returnKeyType="done"
                  onSubmitEditing={addTag}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.addTagButton}
                  onPress={addTag}
                  disabled={!tagInput.trim()}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#00c5e3" />
                </TouchableOpacity>
              </View>
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <View style={styles.tagsWrap}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagText}>#{tag}</Text>
                      <TouchableOpacity
                        onPress={() => removeTag(tag)}
                        style={styles.removeTagButton}
                      >
                        <Ionicons name="close-circle" size={16} color="#666666" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              {tags.length > 0 && (
                <Text style={styles.tagCountText}>
                  {tags.length}/10 tags added
                </Text>
              )}
            </View>
          </View>
        )}


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
            disabled={isLoading || media !== null}
            style={styles.mediaButton}
            textStyle={styles.mediaButtonText}
          />
        </View>

        <View style={styles.actionBar}>

          {/* Preview Button */}
          <ActionButton
            icon={<Ionicons name="eye-outline" size={20} color="#FFFFFF" />}
            text="Preview"
            onPress={handlePreview}
            disabled={isPreviewDisabled}
            style={[
                styles.previewButton,
                isPreviewDisabled && styles.previewButtonDisabled,
              ]}
            textStyle={styles.previewButtonText}
          />

          <ActionButton
            icon={<Ionicons name="document-outline" size={20} color="#FFFFFF" />}
            text="Save Draft"
            onPress={handleSaveDraft}
            disabled={isSaveDisabled}
            loading={isSaving}
            style={[
            styles.saveDraftButton,
            isSaveDisabled && styles.saveDraftButtonDisabled,
            ]}
            textStyle={styles.saveDraftButtonText}
          />

          <ActionButton
            icon={<Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />}
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

        {/* Information about file limitations */}
        <View style={styles.limitContainer}>
          <Text style={styles.limitText}>
            File limits: Images (5MB max), Videos (50MB max)
          </Text>
          <Text style={styles.limitText}>
            Supported formats: JPG, JPEG, PNG, GIF, MP4, MOV, AVI, WMV
          </Text>
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
    marginTop: "10%",
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
  captionToggleButton: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#00c5e3",
  },
  captionToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  captionToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00c5e3",
    marginLeft: 8,
  },
  captionTagsContainer: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  captionContainer: {
    marginBottom: 16,
  },
  captionInput: {
    width: "100%",
    minHeight: 60,
    borderWidth: 1,
    borderColor: "#00c5e3",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    marginBottom: 4,
    color: "#333333",
  },
  tagsContainer: {
    marginBottom: 8,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#00c5e3",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    color: "#333333",
    marginRight: 8,
  },
  addTagButton: {
    padding: 6,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    backgroundColor: "#ffffff",
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E1F5FE",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#00c5e3",
    fontWeight: "500",
  },
  removeTagButton: {
    marginLeft: 6,
    padding: 2,
  },
  tagCountText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
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
  previewButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    minWidth: 100,
  },
  previewButtonDisabled: {
    backgroundColor: "#B6E0E8",
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 2,
  },
  saveDraftButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 2,
  },
  saveDraftButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    minWidth: 100,
  },
  saveDraftButtonDisabled: {
    backgroundColor: "#B6E0E8",
  },
  postButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    marginLeft: 2,
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
