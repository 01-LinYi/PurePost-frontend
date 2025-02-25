import { StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import EditButton from "@/components/EditButton";

export default function TabProfileScreen() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Avatar */}
        <Image
          source={{
            uri: "https://picsum.photos/150",
          }}
          style={styles.avatar}
        />

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>johndoe@example.com</Text>
        </View>

        {/* Edit Button Positioned Below User Info */}
        <EditButton
          onPress={() => router.push("/profile/edit" as any)}
          style={styles.editButton}
        />

        {/* Stats (Posts, Followers, Following) */}
        <View style={styles.statsContainer}>
          <StatItem number="120" label="Posts" />
          <TouchableOpacity
            style={styles.stat}
            onPress={() => navigateTo("/profile/followers")}
            accessibilityRole="button"
            accessibilityLabel="View followers"
          >
            <StatItem number="350" label="Followers" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => navigateTo("/profile/following")}
            accessibilityRole="button"
            accessibilityLabel="View following"
          >
            <StatItem number="180" label="Following" />
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <InfoItem
            label="Bio"
            value="Software Developer | Tech Enthusiast | Coffee Lover"
          />
          <InfoItem label="Location" value="San Francisco, CA" />
          <InfoItem label="Date of Birth" value="January 1, 1990" />
        </View>

        {/* Division Line */}
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
          accessibilityLabel="Separator line"
        />

        {/* Text Content */}
        <Text style={styles.text}>
          Welcome to John Doe's profile! Here you can explore more about the
          user, see their posts, and connect with them.
        </Text>
        <Text style={styles.text}>
          Scroll down to see more content or explore additional features about
          the user.
        </Text>
      </View>
    </ScrollView>
  );
}

// StatItem component
function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// InfoItem component for displaying additional info
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
    marginBottom: 15,
    marginTop: 20,
    alignSelf: "center",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: "#555",
  },
  editButton: {
    alignSelf: "center", // Align the button to the center
    marginTop: 10,
  },
  infoContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#333",
    marginRight: 5,
  },
  infoValue: {
    color: "#555",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginVertical: 20,
    alignItems: "center",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#555",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  text: {
    fontSize: 16,
    color: "#444",
    marginVertical: 10,
    textAlign: "center",
    lineHeight: 22,
  },
});