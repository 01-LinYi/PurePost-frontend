import { Image } from "@/components/CachedImage";
import { Text, View } from "@/components/Themed";
import { StyleSheet } from "react-native";

interface PostContentCardProps {
  content: string;
  imageUrl?: string;
}

export const PostContentCard = ({
    content,
    imageUrl,
  }: PostContentCardProps) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Post Content</Text>
        <Text style={styles.content}>{content}</Text>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        )}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: "#f9f9f9",
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      width: "100%",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 10,
      elevation: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 12,
      color: "#00c5e3",
    },
    content: {
      fontSize: 16,
      color: "#444",
      lineHeight: 24,
      marginBottom: 12,
    },
    image: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginTop: 12,
    },
  });
