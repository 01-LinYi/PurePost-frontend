import { Text, View } from "@/components/Themed";
import { formatDate } from "@/utils/dateUtils";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBadge } from "@/components/report/StatusBadge";

interface ReportInfoCardProps {
  createdAt: string;
  status: string;
  reason: string;
}

export const ReportInfoCard = ({
  createdAt,
  status,
  reason,
}: ReportInfoCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        <Feather name="file-text" size={20} color="#00c5e3" /> Report Info
      </Text>

      <View style={styles.row}>
        <Feather name="calendar" size={18} color="#555" style={styles.icon} />
        <Text style={styles.text}>Time: {formatDate(createdAt)}</Text>
      </View>

      <View style={styles.row}>
        <Feather
          name="alert-triangle"
          size={18}
          color="#555"
          style={styles.icon}
        />
        <Text style={styles.text}>Type: {reason}</Text>
      </View>

      <View style={styles.row}>
        <Feather
          name="check-circle"
          size={18}
          color="#00c5e3"
          style={styles.icon}
        />
        <StatusBadge status={status}></StatusBadge>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#00c5e3",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#00c5e3",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    color: "#444",
  },
  status: {
    fontWeight: "500",
    color: "#00c5e3",
  },
});
