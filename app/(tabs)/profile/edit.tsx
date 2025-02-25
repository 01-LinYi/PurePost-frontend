import { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";

export default function EditProfileScreen() {
  const router = useRouter();

  // User profile data
  const [email] = useState("johndoe@example.com"); // Static email
  const [name, setName] = useState("John Doe");
  const [bio, setBio] = useState("I love coding and coffee!");
  const [location, setLocation] = useState("San Francisco, CA");
  const [dob, setDob] = useState("1990-01-01");

  // Save changes
  const handleSave = () => {
    Alert.alert("Profile Saved", "Your changes have been saved successfully!");
    router.back(); // Go back to the previous page
  };

  // Cancel changes
  const handleCancel = () => {
    Alert.alert("Discard Changes", "Are you sure you want to discard changes?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => router.back() }, // Return to the previous screen
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Avatar with Centered Layout */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() =>
            Alert.alert("Change Avatar", "Avatar upload coming soon!")
          }
        >
          <Image
            source={{
              uri: "https://picsum.photos/150", // Replace with a real avatar URL
            }}
            style={styles.avatar}
          />
          <Text style={styles.changeAvatarText}>Change Avatar</Text>
        </TouchableOpacity>

        {/* Edit Profile Form */}
        <View style={styles.form}>
          {/* Email (Non-Editable) */}
          <Text style={styles.label}>Email</Text>
          <Text style={styles.email}>{email}</Text>
          {/* Name Input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#aaa"
          />

          {/* Bio Input */}
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
          />

          {/* Location Input */}
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
            placeholderTextColor="#aaa"
          />

          {/* Date of Birth Input */}
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Buttons Container */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 5,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  changeAvatarText: {
    fontSize: 16,
    color: "#00c5e3", // Match the primary brand color
    textDecorationLine: "underline",
  },
  form: {
    width: "100%",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top", // Fix text alignment for multiline input
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f44336", // Red button for cancel
  },
  saveButton: {
    backgroundColor: "#4caf50", // Green button for save
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
  },
});