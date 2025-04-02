import React, { useState, useEffect } from "react";
import { StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { Text, View } from "@/components/Themed";
import * as api from "@/utils/api";
import { useSession } from "@/components/SessionProvider";
import { Follow } from "@/types/followType";

export default function Following() {
  const [following, setFollowing] = useState<Follow[]>([]); // Initially load the first 10 people
  const [next, setNext] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false); // Loading more state
  const [refreshing, setRefreshing] = useState(false); // Refreshing state
  const { user } = useSession();
  if (!user) {
    console.error("Current User not found"); // should never happen
    return null;
  }

  // Function to fetch more people the user is following
  const fetchMoreFollowing = async () => {
    if (loadingMore || next === null) return;

    setLoadingMore(true);
    const res = await api.fetchFollowings(user.id, next);
    console.log(res);
    setFollowing(res.results);
    setNext(res.next);
    setLoadingMore(false);
  };

  // Function to refresh the list of people the user is following
  const refreshFollowing = async () => {
    setRefreshing(true);
    setNext(null); // Reset next to null to start from the beginning
    await fetchMoreFollowing(); // Fetch more followers
    setRefreshing(false);
  };

  useEffect(() => {
    // Initial fetch of the list of people the user is following
    const fetchInitialFollowing = async () => {
      try {
        const res = await api.fetchFollowings(user.id, null);
        setFollowing(res.results);
        setNext(res.next);
      } catch (error) {
        console.error("Error fetching followings:", error);
        Alert.alert("Error", "Failed to load followings.");
      }
    };

    fetchInitialFollowing();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={following}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.following_details.username}</Text>
            <Text style={styles.email}>{item.following_details.email}</Text>
          </View>
        )}
        onEndReached={fetchMoreFollowing} // Triggered when the user scrolls to the end
        onEndReachedThreshold={0.5} // Trigger when 50% of the list is scrolled
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : null
        }
        refreshing={refreshing} // Pull-to-refresh state
        onRefresh={refreshFollowing} // Triggered when the user performs a pull-to-refresh
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  item: {
    marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "#555",
  },
});
