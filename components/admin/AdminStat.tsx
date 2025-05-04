import { StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import React from "react";

// AdminStatProps
interface AdminStatProps {
  stats: {
    users: number; // Total number of users
    posts: number; // Total number of posts
    pendingReports: number; // Total number of pending reports
  };
  isLoading: boolean;
  error: Error | null;
}

const AdminStat: React.FC<AdminStatProps> = ({ stats, isLoading, error }) => {
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  if (!stats) {
    return <Text>No data available</Text>;
  }
  const statItems = [
    { label: "Users", value: stats.users },
    { label: "Posts", value: stats.posts },
    { label: "Pending Reports", value: stats.pendingReports },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((stat, index) => (
        <View key={index} style={styles.statBox}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  statBox: {
    alignItems: "center",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00c5e3",
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
});

export default AdminStat;
