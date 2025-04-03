import React, { useState } from "react";
import {
  FlatList,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as api from "@/utils/api";
import { UserProfile } from "@/types/profileType";

export default function ProfileSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a search query.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.searchProfiles(searchQuery.trim());
      setSearchResults(response || []);
    } catch (error) {
      console.error("Error searching profiles:", error);
      Alert.alert("Error", "Failed to search profiles.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePress = (username: string) => {
    router.push(`/user/${username}`);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleProfilePress(item.username)}
          >
            <Text style={styles.resultText}>{item.username}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => 
          !isLoading && (
            <Text style={styles.emptyText}>
              {searchQuery ? "No results found." : "Start searching for users."}
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});
