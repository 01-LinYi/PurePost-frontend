import { memo, useState, useCallback } from "react";
import { View } from "./Themed";
import { TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from "react-native";
import Video from "react-native-video";
import { Ionicons } from "@expo/vector-icons";
import { Image } from '@/components/CachedImage';
import { Media } from "@/types/postType";

interface MediaPreviewProps {
  media: Media | null;
  onRemove?: () => void;
  style?: object;
}

const MediaPreview = memo(({ media, onRemove, style }: MediaPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  if (!media) return null;
  
  const uri = media.uri || media.image || media.video || '';
  const isImage = media.type.startsWith("image");

  // 图片加载的占位符蓝图
  const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

  return (
    <View style={[styles.mediaContainer, style]}>
      {loading && !error && (
        <View style={[styles.mediaPreview, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#00c5e3" />
        </View>
      )}
      
      {error && (
        <View style={[styles.mediaPreview, styles.errorContainer]}>
          <Ionicons name="alert-circle-outline" size={40} color="#ff6b6b" />
        </View>
      )}

      {isImage ? (
        <Image 
          source={uri}
          style={[styles.mediaPreview, error && styles.hidden]}
          onLoad={handleLoadEnd}
          onError={handleError}
          contentFit="cover"
          transition={300}
          placeholder={blurhash}
          cachePolicy="memory-disk"
          recyclingKey={uri}
        />
      ) : (
        <Video
          source={{ uri }}
          style={[styles.mediaPreview, error && styles.hidden]}
          controls
          resizeMode="cover"
          repeat
          onLoad={handleLoadEnd}
          onError={handleError}
          paused={!uri}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000
          }}
        />
      )}
      
      {onRemove && (
        <TouchableOpacity
          style={styles.removeMediaButton}
          onPress={onRemove}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          accessibilityLabel="Remove media"
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
  hidden: {
    display: 'none',
  }
});

export default MediaPreview;
