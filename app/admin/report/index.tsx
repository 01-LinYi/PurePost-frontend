import React, { useEffect, useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { useAdminReports } from "@/hooks/admin/useAdminReport";
import { useReportStats } from "@/hooks/admin/useReportStats";
import { useRouter } from "expo-router";
import { Report } from "@/types/reportType";

export default function ReportScreen() {
  const [onlyPending, setOnlyPending] = useState(false);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const {
    reports,
    loading: reportLoading,
    error,
    refresh,
    hasNextPage,
  } = useAdminReports({
    onlyPending:onlyPending,
    page: page,
    pageSize: 10,
    fetchAll: false,
    forceRefresh: false,
  });

  const {
    stats,
    loading: statsLoading,
    refresh: reportRefresh,
  } = useReportStats();
  const { pendingReportsNum, allReportsNum } = {
    pendingReportsNum: stats?.by_status?.pending || 0,
    allReportsNum: stats?.total || 0,
  };

  useEffect(() => {
    setHasMore(hasNextPage);
  }, [hasNextPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await reportRefresh();
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
  };

  if (error) {
    Alert.alert("Error", error || "Something went wrong");
  }

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={styles.reportItem}>
      <Text style={styles.reportText}>
        Reported Content: {item.reason.label || "No Content"}
      </Text>
      {item.additionalInfo && (
        <Text style={styles.reportText}>
          Additional Info: {item.additionalInfo}
        </Text>
      )}
      <Text style={styles.statusText}>
        Status:{" "}
        <Text
          style={
            item.status === "pending"
              ? styles.pendingStatus
              : styles.resolvedStatus
          }
        >
          {item.status || "Pending"}
        </Text>
      </Text>
      <TouchableOpacity
        style={styles.handleButton}
        onPress={() => router.push(`/admin/report/${item.id}`)}
      >
        <Text style={styles.handleButtonText}>Handle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stats */}
      {statsLoading ? (
        <ActivityIndicator size="small" color="#00c5e3" />
      ) : (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            <Text style={styles.statsHighlight}>Pending Reports:</Text>{" "}
            {pendingReportsNum}
          </Text>
          <Text style={styles.statsText}>
            <Text style={styles.statsHighlight}>All Reports:</Text>{" "}
            {allReportsNum}
          </Text>
        </View>
      )}

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setOnlyPending(!onlyPending)}
        >
          <Text style={styles.filterButtonText}>
            {onlyPending ? "Show All Reports" : "Show Pending Reports"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Report List */}
      {reportLoading && page === 1 ? (
        <ActivityIndicator size="large" color="#00c5e3" />
      ) : reports.length === 0 ? (
        <Text style={styles.emptyText}>No reports available</Text>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator size="small" color="#00c5e3" />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

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
    marginBottom: 10,
    color: "#006D87",
  },
  statsContainer: {
    marginBottom: 20,
    backgroundColor: "#E6F9FF",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#00c5e3",
  },
  statsText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  statsHighlight: {
    fontWeight: "600",
    color: "#006D87",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: "#00c5e3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  reportItem: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#00c5e3",
    shadowColor: "#00c5e3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  statusText: {
    fontSize: 15,
    marginBottom: 12,
    color: "#555",
  },
  pendingStatus: {
    color: "#FF9500",
    fontWeight: "600",
  },
  resolvedStatus: {
    color: "#34C759",
    fontWeight: "600",
  },
  handleButton: {
    backgroundColor: "#00c5e3",
    padding: 10,
    borderRadius: 6,
    alignSelf: "flex-end",
    minWidth: 100,
    alignItems: "center",
  },
  handleButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontSize: 16,
  },
});
