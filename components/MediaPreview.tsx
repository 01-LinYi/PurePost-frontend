import { memo } from "react";
import { View } from "./Themed";
import { Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import Video from "react-native-video";
import { Ionicons } from "@expo/vector-icons";

interface Media {
  uri: string;
  type: string;
}

interface MediaPreviewProps {
  media: Media | null;
  onRemove?: () => void;
}

const MediaPreview = memo(({ media, onRemove }: MediaPreviewProps) => {
  if (!media) return null;

  return (
    <View style={styles.mediaContainer}>
      {media.type.startsWith("image") ? (
        <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
      ) : (
        <Video
          source={{ uri: media.uri }}
          style={styles.mediaPreview}
          controls
          resizeMode="cover"
          repeat
        />
      )}
      {onRemove && (
        <TouchableOpacity
          style={styles.removeMediaButton}
          onPress={onRemove}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="close-circle" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
});

MediaPreview.displayName = "MediaPreview";

const styles = StyleSheet.create({
  mediaContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#00c5e3",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mediaPreview: {
    width: "100%",
    height: 240,
    backgroundColor: "#E0E0E0",
  },
  removeMediaButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 4,
    zIndex: 2,
  },
});

export default MediaPreview;
