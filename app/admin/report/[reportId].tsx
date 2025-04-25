import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View } from "@/components/Themed";
import { Button, ScrollView , StyleSheet} from "react-native";
import { rejectReport, resolveReport } from "@/hooks/admin/useAdminReport";
import { useReportDetails } from "@/hooks/admin/useReportDetails";
import { formatDate } from "@/utils/dateUtils";
import { StakeholderInfoCard } from "@/components/report/StakeholderInfo";
import { ReportInfoCard } from "@/components/report/ReportInfoCard";
import { PostContentCard } from "@/components/report/ReportPostSummary";
import { ReportActions } from "@/components/report/ReportActions";

const ReportDetail: React.FC = () => {
  const router = useRouter();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const { report, loading, error } = useReportDetails(reportId);

  const handleNotFound = () => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Report ID: {reportId}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : report ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.cardWrapper}>
            <ReportInfoCard
              createdAt={formatDate(report.createdAt)}
              status={report.status_display}
              reason={report.reason.label}
            />
          </View>

          <View style={styles.cardWrapper}>
            <StakeholderInfoCard
              title="Reported By"
              username={report.reporter.username}
              avatarUrl={report.reporter.profilePicture}
            />
          </View>

          <View style={styles.cardWrapper}>
            <StakeholderInfoCard
              title="Post Author"
              username={report.post.user.username}
            />
          </View>

          <View style={styles.cardWrapper}>
            <PostContentCard
              content={report.post.content}
              imageUrl={report.post?.image || undefined}
            />
          </View>

          <View style={styles.cardWrapper}>
            <ReportActions
              onViewPost={() => router.push(`/post/${report.post.id}`)}
              onResolve={async () => {
                await resolveReport(reportId);
                router.back();
              }}
              onReject={async () => {
                await rejectReport(reportId);
                router.back();
              }}
              onBack={() => router.back()}
            />
          </View>
        </ScrollView>
      ) : (
        handleNotFound()
      )}
    </View>
  );
};

export default ReportDetail;

const styles = StyleSheet.create({
    scrollContainer: {
      backgroundColor: "#ffffff",
      paddingBottom: 20,
    },
    cardWrapper: {
      marginBottom: 16,
      paddingHorizontal: 16,
    },
  });
  