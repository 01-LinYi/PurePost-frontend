import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

// This is a development homepage for the post/ directory
export default function PostsIndex() {
  const router = useRouter();

  // Sample post IDs for testing
  const postRoutes = [{ id: "1", title: "Sample Post" }];

  // Development testing routes
  const devRoutes = [
    { id: "create", title: "Create Post Page" },
    { id: "saved", title: "Saved Posts Folder" },
  ];

  // Placeholder for redirection logic
  // You can implement redirect logic here
  // For example:
  // React.useEffect(() => {
  //   // Uncomment to enable redirect
  //   // router.replace('/post/list');
  // }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Post Screens</Text>
        <FlatList
          data={devRoutes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.routeButton}
              onPress={() => router.push(`/post/${item.id}`)}
            >
              <Text style={styles.routeText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posts Detail page</Text>
        <FlatList
          data={postRoutes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.routeButton}
              onPress={() => router.push(`/post/${item.id}`)}
            >
              <Text style={styles.routeText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.redirectSection}>
        <Text style={styles.redirectTitle}>Redirect Space</Text>
        <Text style={styles.redirectHint}>
          Uncomment the useEffect in the source code to enable automatic
          redirection
        </Text>

        {/* Space for additional redirect implementation */}
        {/* 
          // This is where you would implement redirect logic
          // Example implementation:
          
          import { Redirect } from 'expo-router';
          
          // To use redirect component:
          return <Redirect href="/post/list" />;
        */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  routeButton: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 15,
    color: "#444",
  },
  redirectSection: {
    padding: 16,
    marginVertical: 16,
    backgroundColor: "#fffde7",
    borderWidth: 1,
    borderColor: "#ffe082",
    borderRadius: 8,
    borderStyle: "dashed",
  },
  redirectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#ff8f00",
  },
  redirectHint: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
