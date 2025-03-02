import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "@/components/GradientButton";
import AvatarPicker from "@/components/AvatarPicker";


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
  const [avatar, setAvatar] = useState("https://picsum.photos/200");
  // repalce with your image
  const [isLoading, setIsLoading] = useState(false);

  // User profile data
  const [email] = useState("johndoe@example.com"); // Static email
  const [name, setName] = useState("John Doe");
  const [username] = useState("@johndoe"); // Static username
  const [bio, setBio] = useState(
    "Software Developer | Tech Enthusiast | Coffee Lover"
  );
  const [location, setLocation] = useState("San Francisco, CA");
  const [birthday, setBirthday] = useState("January 1, 1990");

  // Handle avatar change
  const handleAvatarChange = (uri: string) => {
    setAvatar(uri);
    Alert.alert("Avatar Changed", "Your profile photo has been updated!");
    // In a real app, you might upload the image to a server here
    // or prepare it for submission when the form is saved
  };

  // Save changes
  const handleSave = () => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully!"
      );
      router.back();
    }, 800);
  };

  // Cancel changes
  const handleCancel = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => router.back() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Section */}
        <View style={styles.profileCard}>
          {/* Replace the old avatar section with our new component */}
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

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={COLORS.textLight}
            />
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
  avatarSection: {
    position: "relative",
  },
  avatarGradientBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
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
