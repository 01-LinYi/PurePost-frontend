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
import { useAppCache } from "@/components/CacheProvider";
import useSecureProfileCache from "@/hooks/useProfileCache";
import { useRouter, useFocusEffect } from "expo-router";
import { formatBytes } from "@/utils/fileUtils";

const SettingsScreen = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>("0 B");
  const { user, logOut, deleteAccount } = useSession();
  const router = useRouter();
  const { clearAllCache, getCacheStats } = useAppCache();
  const { clearCache } = useSecureProfileCache();

  const loadCacheSize = async () => {
    try {
      const stats = await getCacheStats();
      setCacheSize(formatBytes(stats.totalSize));
    } catch (error) {
      console.error("Failed to load cache size:", error);
    }
  };

  useFocusEffect(() => {
    loadCacheSize();
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => {
          console.log("Logging out...");
          clearAllCache(); // Clear app cache
          clearCache(); // Clear secure profile cache
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
                      const error = await deleteAccount(password);

                      if (!error) {
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

  const handleVerifyEmail = () => {
    if (user?.isVerified) {
      Alert.alert("Info", "Your email is already verified.");
    } else {
      router.replace("/verifyEmail");
    }
  };

  const handleClearCache = () => {
    if (cacheSize === "0 B") {
      return;
    }
    Alert.alert("Clear Cache", "Are you sure you want to clear the cache?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear Cache",
        style: "destructive",
        onPress: () => {
          // Clear cache logic here
          console.log("Clearing cache: " + cacheSize);
          clearAllCache(); // Clear app cache
          clearCache(); // Clear secure profile cache
          Alert.alert(
            "Cache Cleared",
            "The cache has been cleared successfully."
          );
        },
      },
    ]);
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

          {!user?.isVerified && (
            <TouchableOpacity style={styles.option} onPress={handleVerifyEmail}>
              <View style={styles.optionContent}>
                <Ionicons name="mail-outline" size={22} color="#333" />
                <Text style={styles.optionText}>
                  {user?.isVerified ? "Email Verified" : "Verify Email"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.option} onPress={handleClearCache}>
            <View style={styles.optionContent}>
              <Ionicons name="trash-bin-outline" size={22} color="#333" />
              <Text style={styles.optionText}>Clear Local Cache</Text>
            </View>
            <Text style={styles.cacheSizeText}>{cacheSize}</Text>
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

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              router.push("/(tabs)");
            }}
          >
            <View style={styles.optionContent}>
              <Ionicons name="bug" size={22} color="#333" />
              <Text style={styles.optionText}>Test Page (Dev Only)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, styles.adminOption]}
            onPress={() => {router.push("/admin");}}
          >
            <View style={styles.optionContent}>
              <Ionicons name="shield-outline" size={22} color="#007AFF" />
              <Text style={styles.adminText}>Content Moderation</Text>
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
    flex: 1,
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
  cacheSizeText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '400',
  },
  adminOption: {
    borderBottomWidth: 0,
  },
  adminText: {
    color: "#007AFF",
    fontSize: 16,
    marginLeft: 12,
  },
});

export default SettingsScreen;
