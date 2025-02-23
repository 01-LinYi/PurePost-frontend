import { useState } from "react";
import { StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";

export default function EditProfileScreen() {
  const router = useRouter();

  // User profile data
  const [name, setName] = useState("John Doe");
  const [username, setUsername] = useState("@johndoe");
  const [bio, setBio] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum."
  );

  // save
  const handleSave = () => {
    Alert.alert("Profile Saved", "Your changes have been saved successfully!");
    router.back(); // 返回上一页
  };

  // cancel
  const handleCancel = () => {
    Alert.alert("Discard Changes", "Are you sure you want to discard changes?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => router.back() }, // return to previous screen
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => Alert.alert("Change Avatar", "Avatar upload coming soon!")}>
          <Image
            source={{
              uri: "https://picsum.photos/150", // 替换为真实头像 URL
            }}
            style={styles.avatar}
          />
          <Text style={styles.changeAvatarText}>Change Avatar</Text>
        </TouchableOpacity>

        {/* Edit Profile Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#aaa"
          />

          {/* Username Input */}
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#aaa"
          />


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
        </View>

        {/* 按钮组 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
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
    padding: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
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
    color: "#007bff",
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
    textAlignVertical: "top", // 修复多行输入框的文字对齐问题
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
    backgroundColor: "#f44336", // 红色
  },
  saveButton: {
    backgroundColor: "#4caf50", // 绿色
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});