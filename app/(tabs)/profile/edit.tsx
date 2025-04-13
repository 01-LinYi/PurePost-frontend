import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "@/components/GradientButton";
import AvatarPicker from "@/components/AvatarPicker";
import axiosInstance from "@/utils/axiosInstance";
import { formatUploadFileName } from "@/utils/formatUploadFileName";
import { Media } from "@/types/postType";
import { formatDate } from "@/utils/dateUtils"; // Use the previously created date formatting utility
import useProfileCache from "@/hooks/useProfileCache"; // Use the previously created cache hook

// Color palette based on #00c5e3
const COLORS = {
  primary: "#00c5e3",
  secondary: "#34D399",
  accent: "#3B82F6",
  background: "#F9FAFB",
  cardBackground: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#4B5563",
  textLight: "#6B7280",
  divider: "#F3F4F6",
  inputBackground: "#F9FAFB",
  inputBorder: "#E5E7EB",
};

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Use the cache hook to get user profile data
  const {
    profileData: cachedProfile,
    cacheStatus,
    saveProfileToCache,
  } = useProfileCache();

  // Try to get profile data from route parameters
  const routeProfileData = params.profileData
    ? JSON.parse(params.profileData as string)
    : null;

  // Mark whether data is being loaded
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<Media | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [birthday, setBirthday] = useState("");
  const [website, setWebsite] = useState("");

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Load initial profile data, prioritizing data passed through the route,
   * then cached data, and finally attempting to fetch from the API
   */
  const loadInitialData = async () => {
    setIsDataLoading(true);

    try {
      let profileData = null;

      // Prioritize data passed through route parameters
      if (routeProfileData) {
        console.log("Using profile data from route params");
        profileData = routeProfileData;
      }
      // Secondly, use cached data
      else if (cachedProfile) {
        console.log("Using cached profile data");
        profileData = cachedProfile;
      }
      // If neither, fetch from API
      else {
        console.log("Fetching profile data from API");
        const response = await axiosInstance.get("/users/my-profile/");
        if (response.data) {
          profileData = response.data;
          // Update cache
          saveProfileToCache(profileData);
        }
      }

      // If data is successfully retrieved, fill the form
      if (profileData) {
        fillFormWithProfileData(profileData);
      } else {
        Alert.alert(
          "Data Error",
          "Could not load your profile data. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      Alert.alert(
        "Error",
        "Failed to load your profile data. Please try again."
      );
    } finally {
      setIsDataLoading(false);
    }
  };

  /**
   * Fill the form with the retrieved profile data
   */
  const fillFormWithProfileData = (data:any) => {
    // Set avatar
    if (data.avatar) {
      setAvatar(data.avatar);
    }

    // Set other fields
    setEmail(data.email || "");
    setUsername(data.username ? `@${data.username.replace(/^@/, "")}` : "");
    setBio(data.bio || "");
    setLocation(data.location || "");
    setWebsite(data.website || "");

    // Handle birthday field (may have different field names)
    const birthdayVal = data.date_of_birth || data.birthday || "";
    setBirthday(birthdayVal ? formatDate(birthdayVal) : "");
  };

  // Handle avatar change
  const handleAvatarChange = (uri: string, file: any) => {
    setAvatar(uri);
    setAvatarFile(file);
  };

  // Check if the form has changed
  const hasFormChanged = (originalData: any) => {
    if (!originalData) return true;

    // Check if text fields have changed
    if (bio !== (originalData.bio || "")) return true;
    if (location !== (originalData.location || "")) return true;
    if (website !== (originalData.website || "")) return true;

    // Check birthday field
    const originalBirthday =
      originalData.date_of_birth || originalData.birthday || "";
    const formattedOriginalBirthday = originalBirthday
      ? formatDate(originalBirthday)
      : "";
    if (birthday !== formattedOriginalBirthday) return true;

    // Check if there is a new avatar file
    if (avatarFile) return true;

    return false;
  };

  // Save changes
  const handleSave = async () => {
    // Check if there are changes to avoid unnecessary API requests
    if (!hasFormChanged(routeProfileData || cachedProfile)) {
      Alert.alert(
        "No Changes",
        "You haven't made any changes to your profile."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Prepare form data
      const formData = new FormData();

      // Format avatar file
      if (avatarFile) {
        // Get original file name or create a default file name
        const originalFileName =
          avatarFile.name ||
          `avatar.${avatarFile.image?.split(".").pop() ?? "png"}`;

        // Generate unique file name
        const uniqueFileName = formatUploadFileName("avatar", originalFileName);

        // Format file object
        const formattedFile = {
          uri: avatarFile.uri,
          type: avatarFile.type || "image/png",
          name: uniqueFileName,
        };

        formData.append("avatar", formattedFile as any);
      }

      // Only add changed fields to reduce request payload
      const originalData = routeProfileData || cachedProfile;


      if (!originalData || bio !== (originalData.bio || "")) {
        formData.append("bio", bio);
      }

      if (!originalData || location !== (originalData.location || "")) {
        formData.append("location", location);
      }

      if (!originalData || website !== (originalData.website || "")) {
        formData.append("website", website);
      }

      // Handle birthday field
      const originalBirthday =
        originalData?.date_of_birth || originalData?.birthday || "";
      const formattedOriginalBirthday = originalBirthday
        ? formatDate(originalBirthday)
        : "";

      if (!originalData || birthday !== formattedOriginalBirthday) {
        // Convert formatted date back to the format expected by the API
        try {
          // Try to convert readable date back to ISO format
          const date = new Date(birthday);
          if (!isNaN(date.getTime())) {
            formData.append("birthday", date.toISOString().split("T")[0]);
          } else {
            formData.append("birthday", birthday);
          }
        } catch (e) {
          formData.append("birthday", birthday);
        }
      }

      // Send API request
      const response = await axiosInstance.patch(
        "users/update-profile/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update cache
      if (response.data) {
        await saveProfileToCache(response.data);
      }

      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully!"
      );

      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Update Failed",
        "There was a problem updating your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    // Only show confirmation dialog if there are changes
    if (hasFormChanged(routeProfileData || cachedProfile)) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  // Show loading state
  if (isDataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Section */}
        <View style={styles.profileCard}>
          <AvatarPicker
            currentAvatar={avatar}
            onAvatarChange={handleAvatarChange}
            size={100}
          />
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{username}</Text>
              <Ionicons name="lock-closed" size={16} color={COLORS.textLight} />
            </View>
            <Text style={styles.helperText}>Username cannot be changed</Text>
          </View>

          {/* Email Display */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{email}</Text>
              <Ionicons name="lock-closed" size={16} color={COLORS.textLight} />
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>


          {/* Bio Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Your location"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* Website Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="Your website"
              placeholderTextColor={COLORS.textLight}
              keyboardType="url"
            />
          </View>

          {/* Birthday Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birthday</Text>
            <TextInput
              style={styles.input}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="Your birthday"
              placeholderTextColor={COLORS.textLight}
            />
            <Text style={styles.helperText}>
              Format: Month Day, Year (e.g. January 1, 1990)
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <GradientButton
            text="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            gradientColors={[COLORS.primary, COLORS.accent]}
            style={styles.saveButton}
            borderRadius={8}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  placeholder: {
    width: 24, // Same width as the back button for proper centering
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: COLORS.cardBackground,
    marginBottom: 12,
  },
  formSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginHorizontal: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  readOnlyInput: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readOnlyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
  saveButton: {
    flex: 2,
  },
});
