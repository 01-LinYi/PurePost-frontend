import React from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { formatDate } from "@/utils/dateUtils";

const REPORT_TYPES = {
  inappropriate: {
    label: "Inappropriate Content",
    description: "Content containing pornography, violence, or other material violating community guidelines",
    color: "#E74C3C",
    icon: "warning"  // MaterialIcons
  },
  deepfake: {
    label: "Deepfake",
    description: "Misleading content created using AI or other manipulation technologies",
    color: "#C0392B",
    icon: "face-recognition"  // MaterialCommunityIcons
  },
  spam: {
    label: "Spam",
    description: "Repetitive posts or irrelevant commercial advertisements",
    color: "#8E44AD",
    icon: "mail"  // MaterialIcons
  },
  harassment: {
    label: "Harassment",
    description: "Personal attacks, threats, or persistent unwanted behavior toward individuals",
    color: "#D35400",
    icon: "account-alert"  // MaterialCommunityIcons
  },
  misinformation: {
    label: "Misinformation",
    description: "Deliberately inaccurate or misleading information",
    color: "#F39C12",
    icon: "info"  // MaterialIcons
  },
  copyright: {
    label: "Copyright Infringement",
    description: "Unauthorized use of copyrighted material",
    color: "#16A085",
    icon: "copyright"  // MaterialIcons
  },
  other: {
    label: "Other Issue",
    description: "Issues that don't fall into the above categories",
    color: "#3498DB",
    icon: "flag"  // MaterialIcons
  }
};

const CONTENT_TYPES = {
  image: {
    label: "Image",
    color: "#00C5E3",
  },
  video: {
    label: "Video",
    color: "#FFC06B",
  },
  text: {
    label: "Text",
    color: "#52D9A8",
  },
  default: {
    label: "Content",
    color: "#A9D7E3",
  },
};

function getReportTypeLabel(type: string): string {
  return (
    REPORT_TYPES[type as keyof typeof REPORT_TYPES]?.label || REPORT_TYPES.other.label
  );
}

function getReportTypeColor(type: string): string {
  return REPORT_TYPES[type as keyof typeof REPORT_TYPES]?.color || "#00C5E3";
}

function getContentTypeColor(type: string): string {
  return (
    CONTENT_TYPES[type as keyof typeof CONTENT_TYPES]?.color ||
    CONTENT_TYPES.default.color
  );
}

function TypeIndicator({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 4,
        height: 40,
        backgroundColor: color,
        borderRadius: 2,
        marginRight: 12,
      }}
    />
  );
}

// Stat Card Component
function StatCard({
  title,
  count,
  icon,
  onPress,
}: {
  title: string;
  count: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={`${title}: ${count}`}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

// Section Header Component
function SectionHeader({
  title,
  count,
  onViewAll,
}: {
  title: string;
  count: number;
  onViewAll: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count > 0 && (
        <TouchableOpacity
          onPress={onViewAll}
          accessibilityLabel={`View all ${count} ${title.toLowerCase()}`}
        >
          <Text style={styles.viewAllText}>View all ({count})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  // Custom hook to fetch dashboard data
  const { stats, pendingReports, recentContent, isLoading, error } =
    useAdminDashboard();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load: {error.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.reload()}
          accessibilityLabel="Retry loading data"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const AllContentCount = stats?.posts || 0;
  const pendingReportCount = stats?.pendingReportsNum || 0;
  const activeUserCount = stats?.users || 0;
  const hasReports = Array.isArray(pendingReports) && pendingReports.length > 0;
  const hasContent = Array.isArray(recentContent) && recentContent.length > 0;

  return (
    <ScrollView style={styles.container}>
      {/* Stats Cards Section */}
      <View style={styles.statsContainer}>
        <StatCard
          title="All Content"
          count={AllContentCount}
          icon="document-text"
          onPress={() => router.push('/admin/content')}
        />
        <StatCard
          title="Active Reports"
          count={pendingReportCount}
          icon="flag"
          onPress={() => router.push("/admin/report")}
        />
        <StatCard title="All Users" count={activeUserCount} icon="people" />
      </View>

      {/* Recent Reports Section */}
      <SectionHeader
        title="Recent Reports"
        count={hasReports ? pendingReports.length : 0}
        onViewAll={() => router.push("/admin/report")}
      />
      <View style={styles.listContainer}>
        {hasReports ? (
          pendingReports.slice(0, 3).map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.listItem}
              onPress={() => router.push(`/admin/report/${report.id}`)}
              accessibilityLabel={`Report: ${getReportTypeLabel(report.type)}`}
            >
              <TypeIndicator color={getReportTypeColor(report.type)} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>
                  {getReportTypeLabel(report.type)}
                </Text>
                <Text style={styles.listItemSubtitle} numberOfLines={1}>
                  {report.reason}
                </Text>
                <Text style={styles.listItemInfo}>
                  {formatDate(report.createdAt)} · {report.reporterName}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A9D7E3" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No pending reports</Text>
        )}
      </View>

      {/* Recent Content Section */}
      <SectionHeader
        title="Recent Content"
        count={hasContent ? recentContent.length : 0}
        onViewAll={() => router.push("/admin/content")}
      />
      <View style={styles.listContainer}>
        {hasContent ? (
          recentContent.slice(0, 3).map((content) => (
            <TouchableOpacity
              key={content.id}
              style={styles.listItem}
              onPress={() => router.push(`/admin/content/${content.id}`)}
              accessibilityLabel={`Content: ${
                "Untitled Content"
              }`}
            >
              <TypeIndicator color={getContentTypeColor("text")} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle} numberOfLines={1}>
                  {"Untitled Content"}
                </Text>
                <Text style={styles.listItemSubtitle} numberOfLines={1}>
                  {"content.preview"}
                </Text>
                <Text style={styles.listItemInfo}>
                  {formatDate(content.created_at)} · {content.user.username}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A9D7E3" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent content</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FDFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F7FDFF",
  },
  loadingText: {
    color: "#00C5E3",
    fontSize: 16,
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#00C5E3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "31%",
    alignItems: "center",
    shadowColor: "#00C5E3",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#00C5E3",
  },
  statCount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  statTitle: {
    fontSize: 12,
    color: "#7A8D95",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00A2BB",
  },
  viewAllText: {
    fontSize: 14,
    color: "#00C5E3",
  },
  listContainer: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#00C5E3",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0FBFF",
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  listItemSubtitle: {
    fontSize: 13,
    color: "#7A8D95",
    marginBottom: 4,
  },
  listItemInfo: {
    fontSize: 12,
    color: "#A9D7E3",
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#A9D7E3",
  },
});
