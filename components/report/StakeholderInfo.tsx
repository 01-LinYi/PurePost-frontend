import { Image } from "../CachedImage";
import { Text, View } from "../Themed";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

interface StakeholderInfoCardProps {
  title: string;
  username: string;
  email?: string;
  avatarUrl?: string;
}


export const StakeholderInfoCard = ({
  title,
  username,
  email,
  avatarUrl,
}: StakeholderInfoCardProps) => {
  return (
    <View style={styles.card}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <MaterialIcons name="person" size={48} color="#ccc" style={styles.avatar} />
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>👤 Username: {username}</Text>
        {email && <Text style={styles.text}>📧 Email: {email}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#00c5e3",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#00c5e3",
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: "#444",
    marginBottom: 2,
  },
});

