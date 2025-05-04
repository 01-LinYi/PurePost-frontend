import { View, Text } from "../Themed";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type ReportActionsProps = {
  onViewPost: () => void;
  onResolve: () => void;
  onReject: () => void;
  onBack: () => void;
};

export const ReportActions = ({
  onViewPost,
  onResolve,
  onReject,
  onBack,
}: ReportActionsProps) => {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.button} onPress={onViewPost}>
        <Feather name="eye" size={20} color="#fff" />
        <Text style={styles.buttonText}>View Post</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onResolve}>
        <Feather name="check-circle" size={20} color="#fff" />
        <Text style={styles.buttonText}>Resolve</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onReject}>
        <Feather name="x-circle" size={20} color="#fff" />
        <Text style={styles.buttonText}>Reject</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onBack}>
        <Feather name="arrow-left-circle" size={20} color="#fff" />
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00c5e3",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 150,
    justifyContent: "center",
    height: 40,
  },
  buttonText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
