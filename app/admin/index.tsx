// AdminModeratorPanel.js - Streamlined content moderation interface
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// Mock data
const MOCK_REPORTS = [
  {
    id: "r1",
    type: "Spam",
    content: {
      id: "p1",
      text: "Check out this amazing product! Click here to buy www.scam-link.com",
      author: {
        username: "user123",
        avatarUrl: "https://via.placeholder.com/40",
      },
      likes: 12,
      comments: 3,
    },
    reporter: { username: "gooduser1" },
    reason: "Spam advertising",
    createdAt: "10m ago",
  },
  {
    id: "r2",
    type: "Violence",
    content: {
      id: "p2",
      text: "This video shows how to make dangerous items, so cool!",
      media: [{ type: "video", thumbnail: "https://via.placeholder.com/100" }],
      author: {
        username: "riskypost",
        avatarUrl: "https://via.placeholder.com/40",
      },
      likes: 203,
      comments: 56,
    },
    reporter: { username: "safetyuser" },
    reason: "Dangerous content",
    createdAt: "32m ago",
  },
  {
    id: "r3",
    type: "Harassment",
    content: {
      id: "p3",
      text: "You are such a terrible person, I hate everything you post",
      author: {
        username: "angryuser",
        avatarUrl: "https://via.placeholder.com/40",
      },
      likes: 0,
      comments: 4,
    },
    reporter: { username: "victim001" },
    reason: "Personal attack",
    createdAt: "1h ago",
  },
];

// Content Moderation Panel Component
const ContentModerationPanel = () => {
  const [activeTab, setActiveTab] = useState("reports"); // reports, content, users
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const router = useRouter();

  // Base statistics
  const stats = {
    pendingReports: 18,
    processedToday: 43,
    violationRate: "23%",
  };

  // Render report card
  const renderReportItem = (report: any) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={[styles.reportTypeTag, getReportTypeStyle(report.type)]}>
          <Text style={styles.reportTypeText}>{report.type}</Text>
        </View>
        <Text style={styles.timestamp}>{report.createdAt}</Text>
      </View>

      <View style={styles.contentPreview}>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: report.content.author.avatarUrl }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{report.content.author.username}</Text>
        </View>

        <Text style={styles.contentText} numberOfLines={2}>
          {report.content.text}
        </Text>

        {report.content.media && (
          <View style={styles.mediaPreview}>
            <Image
              source={{ uri: report.content.media[0].thumbnail }}
              style={styles.mediaThumbnail}
            />
            <View style={styles.videoIcon}>
              <Ionicons name="play" size={16} color="#1F2937" />
            </View>
          </View>
        )}
      </View>

      <View style={styles.reportInfo}>
        <Text style={styles.reporterText}>
          Reported by{" "}
          <Text style={styles.highlightText}>{report.reporter.username}</Text>
        </Text>
        <Text style={styles.reasonText}>
          Reason: <Text style={styles.highlightText}>{report.reason}</Text>
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.dismissButton]}>
          <Ionicons name="close-outline" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Dismiss</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.detailsButton}>
          <Ionicons name="eye-outline" size={18} color="#1A365D" />
          <Text style={styles.detailsText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.takeActionButton]}
        >
          <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Take Action</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Get style based on report type
  const getReportTypeStyle = (type: string) => {
    switch (type) {
      case "Spam":
        return { backgroundColor: "#F59E0B" };
      case "Violence":
        return { backgroundColor: "#EF4444" };
      case "Harassment":
        return { backgroundColor: "#8B5CF6" };
      default:
        return { backgroundColor: "#6B7280" };
    }
  };

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Moderation</Text>
        <View style={styles.placeholderView} />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: "#F59E0B" }]}>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats.pendingReports}</Text>
            <Text style={styles.statTitle}>Pending</Text>
          </View>
          <Ionicons name="flag-outline" size={22} color="#F59E0B" />
        </View>

        <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats.processedToday}</Text>
            <Text style={styles.statTitle}>Processed Today</Text>
          </View>
          <Ionicons name="checkmark-circle-outline" size={22} color="#10B981" />
        </View>

        <View style={[styles.statCard, { borderLeftColor: "#EF4444" }]}>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats.violationRate}</Text>
            <Text style={styles.statTitle}>Violation Rate</Text>
          </View>
          <Ionicons name="alert-circle-outline" size={22} color="#EF4444" />
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#6B7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScrollView}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === "all" && styles.activeFilterChip,
            ]}
            onPress={() => setFilterType("all")}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === "all" && styles.activeFilterChipText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === "spam" && styles.activeFilterChip,
            ]}
            onPress={() => setFilterType("spam")}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === "spam" && styles.activeFilterChipText,
              ]}
            >
              Spam
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === "violence" && styles.activeFilterChip,
            ]}
            onPress={() => setFilterType("violence")}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === "violence" && styles.activeFilterChipText,
              ]}
            >
              Violence
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === "harassment" && styles.activeFilterChip,
            ]}
            onPress={() => setFilterType("harassment")}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === "harassment" && styles.activeFilterChipText,
              ]}
            >
              Harassment
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === "nudity" && styles.activeFilterChip,
            ]}
            onPress={() => setFilterType("nudity")}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === "nudity" && styles.activeFilterChipText,
              ]}
            >
              Nudity
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Reports List */}
      <FlatList
        data={MOCK_REPORTS}
        renderItem={({ item }) => renderReportItem(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reportsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeholderView: {
    width: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 1,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderLeftWidth: 3,
    marginHorizontal: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    elevation: 1,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  searchFilterContainer: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  filtersScrollView: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#1A365D",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
  },
  activeFilterChipText: {
    color: "#FFFFFF",
  },
  reportsList: {
    padding: 12,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reportTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reportTypeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
  },
  contentPreview: {
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  username: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  contentText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20,
  },
  mediaPreview: {
    height: 100,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  mediaThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  reportInfo: {
    marginBottom: 14,
  },
  reporterText: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: "#4B5563",
  },
  highlightText: {
    color: "#1F2937",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  dismissButton: {
    backgroundColor: "#6B7280",
    marginRight: 8,
  },
  takeActionButton: {
    backgroundColor: "#10B981",
    marginLeft: 8,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 13,
    marginLeft: 4,
  },
  detailsText: {
    color: "#1A365D",
    fontWeight: "500",
    fontSize: 13,
    marginLeft: 4,
  },
});

export default ContentModerationPanel;
