import React, { useState } from "react";
import { StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { Text, View } from "@/components/Themed";

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
  const [followers, setFollowers] = useState(allFollowers.slice(0, 10)); // Initially load the first 3 followers
  const [loadingMore, setLoadingMore] = useState(false); // Loading more state
  const [refreshing, setRefreshing] = useState(false); // Refreshing state
  const [page, setPage] = useState(1); // Current page number
  const itemsPerPage = 10; // Number of items per page

  // Function to fetch more followers
  const fetchMoreFollowers = () => {
    if (loadingMore || followers.length >= allFollowers.length) return;

    setLoadingMore(true);

    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * itemsPerPage; // Calculate starting index for the next page
      const endIndex = startIndex + itemsPerPage; // Calculate ending index for the next page
      const newFollowers = allFollowers.slice(startIndex, endIndex); // Get the next set of followers

      setFollowers((prevFollowers) => [...prevFollowers, ...newFollowers]);
      setPage(nextPage);
      setLoadingMore(false);

      if (followers.length + newFollowers.length >= allFollowers.length) {
        // Alert.alert("All Followers Loaded", "You have loaded all available followers.");
      }
    }, 1000); // Simulate network delay
  };

  // Function to refresh followers
  const refreshFollowers = () => {
    if (followers.length >= allFollowers.length) return; // Stop refreshing if all followers are loaded

    setRefreshing(true);

    setTimeout(() => {
      const refreshedFollowers = allFollowers.slice(
        0,
        followers.length + itemsPerPage
      ); // Load more items on refresh
      setFollowers(refreshedFollowers);
      setRefreshing(false);

      if (refreshedFollowers.length >= allFollowers.length) {
        Alert.alert(
          "All Followers Loaded",
          "You have loaded all available followers."
        );
      }
    }, 1000); // Simulate network delay
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={followers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        )}
        onEndReached={fetchMoreFollowers} // Triggered when the user scrolls to the end
        onEndReachedThreshold={0.5} // Trigger when 50% of the list is scrolled
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : null
        }
        refreshing={refreshing} // Pull-to-refresh state
        onRefresh={refreshFollowers} // Triggered when the user performs a pull-to-refresh
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
