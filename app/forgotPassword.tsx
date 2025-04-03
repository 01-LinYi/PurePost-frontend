import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as api from "utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email"); // Track the current step
  const router = useRouter();

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const isEmailSent = await api.forgetPassword(email);
      if (!isEmailSent) {
        Alert.alert("Email not found!");
      } else {
        Alert.alert("Email sent!", "Please check your email for the reset code.");
        setStep("reset"); // Move to the reset step
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      Alert.alert("Error", "Failed to send password reset instructions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetCode.trim() || !newPassword.trim() || !newPasswordConfirm.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const resetPasswordError = await api.resetPassword(email, newPassword, resetCode);
      if (resetPasswordError !== undefined) {
        Alert.alert("Error", resetPasswordError);
      } else {
        Alert.alert("Success", "Your password has been reset.");
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      Alert.alert("Error", "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {step === "email" ? (
        <>
          <Text style={styles.title}>Forgot Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleEmailSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Submitting..." : "Send Reset Code"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Reset Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            editable={false} // Disable editing for email
          />
          <TextInput
            style={styles.input}
            placeholder="Enter reset code"
            placeholderTextColor="#888"
            value={resetCode}
            onChangeText={setResetCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#888"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter new password again"
            placeholderTextColor="#888"
            secureTextEntry
            value={newPasswordConfirm}
            onChangeText={setNewPasswordConfirm}
          />
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handlePasswordReset}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Submitting..." : "Reset Password"}
            </Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Text style={styles.backToLoginText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00c5e3",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#00c5e3",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    width: "80%",
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#87d9e8",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backToLoginText: {
    color: "#00c5e3",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
