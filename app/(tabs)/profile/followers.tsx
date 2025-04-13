import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { Text, View } from "@/components/Themed";
import { UserProfile } from "@/types/profileType";
import { useSession } from "@/components/SessionProvider";
import * as api from "@/utils/api";
import { Follow } from "@/types/followType";

// Global list of all followers (limited total dataset)
const allFollowers = [
  { id: "1", name: "Alice", email: "alice@someuni.edu" },
  { id: "2", name: "Bob", email: "bob@someuni.edu" },
  { id: "3", name: "Charlie", email: "charlie@mail.com" },
  { id: "4", name: "David", email: "david@mail.com" },
  { id: "5", name: "Eve", email: "eve@mail.com" },
  { id: "6", name: "Frank", email: "frank@mail.com" },
  { id: "7", name: "Grace", email: "grace@mail.com" },
  { id: "8", name: "Hannah", email: "hannah@mail.com" },
  { id: "9", name: "Ivy", email: "ivy@mail.com" },
  { id: "10", name: "Jack", email: "jack@mail.com" },
  { id: "11", name: "Karen", email: "karen@mail.com" },
  { id: "12", name: "Leo", email: "leo@mail.com" },
  { id: "13", name: "Mona", email: "mona@mail.com" },
  { id: "14", name: "Nancy", email: "nancy@mail.com" },
  { id: "15", name: "Oscar", email: "oscar@mail.com" },
  { id: "16", name: "Pam", email: "pam@mail.com" },
  { id: "17", name: "Quinn", email: "quinn@mail.com" },
  { id: "18", name: "Rita", email: "rita@mail.com" },
  { id: "19", name: "Sam", email: "sam@mail.com" },
  { id: "20", name: "Tina", email: "tina@mail.com" },
];

export default function Followers() {
  const [followers, setFollowers] = useState<Follow[]>([]); // Initially load the first 3 followers
  const [next, setNext] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false); // Loading more state
  const [refreshing, setRefreshing] = useState(false); // Refreshing state
  const { user } = useSession();
  if (!user) {
    console.error("Current User not found"); // should never happen
    return null;
  }
  
  // Function to fetch more followers
  const fetchMoreFollowers = async () => {
    if (loadingMore || next === null) return;
    setLoadingMore(true);
    const res = await api.fetchFollowers(user.id, next);
    console.log(res);
    setFollowers(res.results);
    setNext(res.next);
    setLoadingMore(false);
  };

  // Function to refresh followers
  const refreshFollowers = async () => {
    setRefreshing(true);
    setNext(null); // Reset next to null to start from the beginning
    await fetchMoreFollowers(); // Fetch more followers
    setRefreshing(false);
  };

  useEffect(() => {
      // Initial fetch of the list of people the user is following
      const fetchInitialFollowing = async () => {
        try {
          const res = await api.fetchFollowers(user.id, null);
          setFollowers(res.results);
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
      {followers.length > 0 ? (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.name}>{item.follower_details.username}</Text>
              <Text style={styles.email}>{item.follower_details.email}</Text>
            </View>
          )}
          onEndReached={() => {console.log("here"); fetchMoreFollowers()}} // Triggered when the user scrolls to the end
          onEndReachedThreshold={0.5} // Trigger when 50% of the list is scrolled
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : null
          }
          refreshing={refreshing} // Pull-to-refresh state
          onRefresh={refreshFollowers} 
          // Triggered when the user performs a pull-to-refresh
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>No followers found.</Text>
        </View>
      )
      }
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
