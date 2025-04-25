import React from "react";
import { FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Sheets } from "@/hooks/useQuestionnaireList";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Importing icons

interface QuestionnaireListProps {
  forms: Sheets[];
  isFinishedMap: Record<string, boolean>;
  refresh: () => Promise<void>;
}

export const QuestionnaireList: React.FC<QuestionnaireListProps> = ({
  forms,
  isFinishedMap,
  refresh,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose One You Like</Text>

      <FlatList
        data={forms}
        keyExtractor={(item) => item.formName}
        refreshing={false}
        onRefresh={refresh}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.formItem,
              isFinishedMap[item.formName] && styles.finishedItem,
            ]}
            disabled={isFinishedMap[item.formName]} // Disable if finished
            onPress={() => router.push(`/feedback/${item.formName}`)}
          >
            <View style={styles.formContent}>
              <Text style={styles.formName}>{item.title}</Text>
              <Text style={styles.statusText}>
                {isFinishedMap[item.formName] ? "Finished" : "Unfinished"}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color="#00c5e3"
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FDFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#00c5e3",
  },
  formItem: {
    flexDirection: "row", // Ensures icon is aligned next to the text
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12, // Rounded corners
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#00c5e3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "space-between", // Puts text and icon apart
  },
  finishedItem: {
    backgroundColor: "#e0ffe0", // Light green for finished items
  },
  formContent: {
    flex: 1, // Ensures the text occupies available space
    backgroundColor: "transparent", // Makes sure the background is transparent
  },
  formName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  statusText: {
    marginTop: 4,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  icon: {
    marginLeft: 8, // Adds some space between text and icon
  },
});

