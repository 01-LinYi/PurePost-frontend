import { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { useSession } from "@/components/SessionProvider";
import { useRouter } from "expo-router";
const SettingsScreen = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { logOut, deleteAccount } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => {
          console.log("Logging out...");
          logOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Delete",
      "Once you delete your account, there is no going back. Please be certain.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Delete",
          style: "destructive",
          onPress: () => {
            // require password to confirm account deletion
            Alert.prompt(
              "Enter Password",
              "Please enter your password to confirm account deletion",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Account",
                  style: "destructive",
                  onPress: async (password) => {
                    if (!password) {
                      Alert.alert("Error", "Password is required");
                      return;
                    }

                    setIsDeleting(true);

                    try {
                      const success = await deleteAccount(password);

                      if (success) {
                        Alert.alert(
                          "Success",
                          "Your account has been deleted successfully",
                          [
                            {
                              text: "OK",
                              onPress: () => router.replace("/login"),
                            },
                          ]
                        );
                      } else {
                        Alert.alert(
                          "Error",
                          "Failed to delete account. Please check your password and try again."
                        );
                      }
                    } catch (error) {
                      console.error("Account deletion error:", error);
                      Alert.alert(
                        "Error",
                        "An unexpected error occurred while deleting your account"
                      );
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ],
              "secure-text"
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Setting</Text>
        <View style={styles.placeholderRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Operation</Text>

          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <View style={styles.optionContent}>
              <Ionicons name="log-out-outline" size={22} color="#333" />
              <Text style={styles.optionText}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.dangerOption]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <View style={styles.optionContent}>
              <Ionicons name="trash-outline" size={22} color="#ff3b30" />
              <Text style={styles.dangerText}>
                {isDeleting ? "Processing" : "Delete Account"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Other Information</Text>
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              router.push("/guidePolicy");
            }}
          >
            <View style={styles.optionContent}>
              <Ionicons name="document-text-outline" size={22} color="#333" />
              <Text style={styles.optionText}>User Guide and Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>ver 1.0.0</Text>
            <Text style={styles.infoSubtext}>
              Once you delete your account, there is no going back. Please be
              certain.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholderRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginLeft: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  dangerOption: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dangerText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#ff3b30",
  },
  infoContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  infoSubtext: {
    fontSize: 13,
    color: "#999",
    lineHeight: 18,
    textAlign: "center",
  },
});

export default SettingsScreen;
