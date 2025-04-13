import { useState } from "react";
import { StyleSheet, SafeAreaView, Alert, TextInput, TouchableOpacity, View, Text } from "react-native";
import { useSession } from "@/components/SessionProvider";
import * as api from "utils/api";
import { useRouter } from "expo-router";

const VerifyEmailScreen = () => {
  const { setUserVerify } = useSession();
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstResend, setIsFirstResend] = useState(true); // Track if it's the first resend
  const router = useRouter();

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code.");
      return;
    }

    try {
      setIsSubmitting(true);
      const error = await api.verifyEmailCode(verificationCode);
      if (error === null) {
        setUserVerify(true);
        Alert.alert("Success", "Your email has been verified.");
        router.replace("/setting");
      } else {
        Alert.alert("Error", error);
      }
    } catch (error) {
      console.error("Error verifying email code:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsSubmitting(true);
      const sendMailError = await api.sendVerificationEmail();
      console.log(sendMailError);
      if (sendMailError === null) {
        Alert.alert("Success", "A new verification code has been sent to your email.");
        setIsFirstResend(false); // Update state after the first click
      } else {
        Alert.alert("Error", sendMailError);
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit code"
        placeholderTextColor="#888"
        keyboardType="numeric"
        maxLength={6}
        value={verificationCode}
        onChangeText={setVerificationCode}
      />
      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Submitting..." : "Verify"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleResendCode}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Sending..." : isFirstResend ? "Send Code" : "Resend Code"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/setting")}>
        <Text style={styles.backToSettingsText}>Back to Settings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

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
  backToSettingsText: {
    color: "#00c5e3",
    fontSize: 16,
    textDecorationLine: "underline",
    marginTop: 10,
  },
});

export default VerifyEmailScreen;
