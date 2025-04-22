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
import { Image } from '@/components/CachedImage';
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

  const handleProfilePress = (username: string, id: number) => {
    router.push(`/user/${username}?id=${id}`);
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
        clearButtonMode="while-editing"
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleProfilePress(item.username, item.id)}
          >
            {item.avatar ? (
              <Image
                style={styles.userAvatar}
                source={{ uri: item.avatar }}
              />) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.username}>{item.username}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  userAvatarContainer: {
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#00c5e3",
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00c5e3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00c5e3",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
