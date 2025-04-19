import { View, Text } from "@/components/Themed";
import { StyleSheet } from "react-native";

const ContentModerationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Content Moderation</Text>
      <Text style={styles.placeholderText}>
        This is a placeholder screen for content moderation. Implement
        moderation features here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default ContentModerationScreen;
