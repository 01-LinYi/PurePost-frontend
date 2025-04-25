import { Text, View } from "@/components/Themed";

const getColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "#facc15";
    case "RESOLVED":
      return "#22c55e";
    case "REJECTED":
      return "#ef4444";
    default:
      return "#ccc";
  }
};

export const StatusBadge = ({ status }: { status: string }) => {
  return (
    <View
      style={{
        backgroundColor: getColor(status),
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "bold" }}>{status}</Text>
    </View>
  );
};
