import { useState, useEffect } from "react";
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
import { formatDate, parseDateString } from "@/utils/dateUtils";
import useProfileCache from "@/hooks/useProfileCache"; 
import { useProfileData } from "@/hooks/useProfileData";

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

  const routeProfileData = params.profileData
    ? JSON.parse(params.profileData as string)
    : null;

  const { profileData: cachedProfile, saveProfileToCache } = useProfileCache();

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    avatar: "",
    avatarFile: null as Media | null,
    email: "",
    username: "",
    bio: "",
    location: "",
    birthday: "",
    website: "",
  });

  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsDataLoading(true);

    try {
      let profileData = null;

      // priority: route params > cache > API
      if (routeProfileData) {
        console.log("Using profile data from route params");
        profileData = routeProfileData;
      } else if (cachedProfile) {
        console.log("Using cached profile data");
        profileData = cachedProfile;
      } else {
        console.log("Fetching profile data from API");
        profileData = useProfileData({
          userId: "me",
          isOwnProfile: true,
        }).profileData;
      }

      if (profileData) {
        fillFormWithProfileData(profileData);
        setOriginalData(profileData);
      } else {
        Alert.alert("数据错误", "无法加载您的个人资料数据。请稍后再试。");
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      Alert.alert("错误", "加载个人资料数据失败。请再试一次。");
    } finally {
      setIsDataLoading(false);
    }
  };

  const fillFormWithProfileData = (data: any) => {
    setFormData({
      avatar: data.avatar || "",
      avatarFile: null,
      email: data.email || "",
      username: data.username ? `@${data.username.replace(/^@/, "")}` : "",
      bio: data.bio || "",
      location: data.location || "",
      website: data.website || "",
      birthday:
        data.date_of_birth || data.birthday
          ? formatDate(data.date_of_birth || data.birthday)
          : "",
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (uri: string, file: any) => {
    handleChange("avatar", uri);
    handleChange("avatarFile", file);
  };

  const hasFormChanged = () => {
    if (!originalData) return true;

    // Check if the form data has changed compared to the original data
    if (formData.bio !== (originalData.bio || "")) return true;
    if (formData.location !== (originalData.location || "")) return true;
    if (formData.website !== (originalData.website || "")) return true;

    // Check if the birthday has changed
    const originalBirthday =
      originalData.date_of_birth || originalData.birthday || "";
    const formattedOriginalBirthday = originalBirthday
      ? formatDate(originalBirthday)
      : "";
    if (formData.birthday !== formattedOriginalBirthday) return true;

    // Check if the avatar has changed
    if (formData.avatarFile) return true;

    return false;
  };

  // Prepare form data for submission
  const prepareFormData = () => {
    const apiFormData = new FormData();

    // Handle avatar file
    if (formData.avatarFile) {
      const originalFileName =
        formData.avatarFile.name ||
        `avatar.${formData.avatarFile.image?.split(".").pop() ?? "png"}`;
      const uniqueFileName = formatUploadFileName("avatar", originalFileName);

      const formattedFile = {
        uri: formData.avatarFile.uri,
        type: formData.avatarFile.type || "image/png",
        name: uniqueFileName,
      };

      apiFormData.append("avatar", formattedFile as any);
    }

    // Only add changed fields to reduce request payload
    if (!originalData || formData.bio !== (originalData.bio || "")) {
      apiFormData.append("bio", formData.bio);
    }

    if (!originalData || formData.location !== (originalData.location || "")) {
      apiFormData.append("location", formData.location);
    }

    if (!originalData || formData.website !== (originalData.website || "")) {
      apiFormData.append("website", formData.website);
    }

    // Handle birthday field
    const originalBirthday =
      originalData?.date_of_birth || originalData?.birthday || "";
    const formattedOriginalBirthday = originalBirthday
      ? formatDate(originalBirthday)
      : "";

    if (!originalData || formData.birthday !== formattedOriginalBirthday) {
      // Parse and format the date
      const formattedBirthday = parseDateString(formData.birthday);
      apiFormData.append("date_of_birth", formattedBirthday);
    }

    return apiFormData;
  };


  const handleSave = async () => {
    if (!hasFormChanged()) {
      Alert.alert("No Changes", "No changes detected to save.");
      return;
    }

    setIsSubmitting(true);

    try {

      const apiFormData = prepareFormData();

      // Send
      const response = await axiosInstance.patch(
        "users/update-profile/",
        apiFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // update local cache
      if (response.data) {
        await saveProfileToCache(response.data);
      }

      Alert.alert("Success", "Profile updated successfully.");

      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    // Only show confirmation dialog if there are changes
    if (hasFormChanged()) {
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
            currentAvatar={formData.avatar}
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
              <Text style={styles.readOnlyText}>{formData.username}</Text>
              <Ionicons name="lock-closed" size={16} color={COLORS.textLight} />
            </View>
            <Text style={styles.helperText}>Username cannot be changed</Text>
          </View>

          {/* Email Display */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{formData.email}</Text>
              <Ionicons name="lock-closed" size={16} color={COLORS.textLight} />
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          {/* Bio Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => handleChange("bio", text)}
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
              value={formData.location}
              onChangeText={(text) => handleChange("location", text)}
              placeholder="Your location"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* Website Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={formData.website}
              onChangeText={(text) => handleChange("website", text)}
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
              value={formData.birthday}
              onChangeText={(text) => handleChange("birthday", text)}
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
            loading={isSubmitting}
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
