import { useRouter } from "expo-router";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Keyboard,
} from "react-native";
import { useState, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import axiosInstance from "@/utils/axiosInstance";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useStorageState } from "@/hooks/useStorageState";

type RegError = {
  email?: string | null;
  username?: string | null;
  password?: string | null;
  passwordConfirm?: string | null;
  terms?: string | null;
};

const RegisterPage = () => {
  // State variables for form fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [[], setUser] = useStorageState("user");
  const [[], setSession] = useStorageState("session");
  const router = useRouter();

  // State for form validation errors
  const [errors, setErrors] = useState<RegError>({});

  // Loading state for registration process
  const [isLoading, setIsLoading] = useState(false);

  // State to track if form is valid
  const [isFormValid, setIsFormValid] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Default logo size, input position and keyboard height
  const logoSize = useSharedValue(150);
  const inputTranslateY = useSharedValue(0);


  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        try {
          logoSize.value = withSpring(80, { damping: 15, stiffness: 100 }); // Shrink logo
          inputTranslateY.value = withSpring(-70, { damping: 12, stiffness: 80 }); // Move inputs up
        } catch (error) {
          console.error("Animation error:", error);
          logoSize.value = 80;
          inputTranslateY.value = -70;
        }
      }
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        logoSize.value = withSpring(150, { damping: 15, stiffness: 100 }); // Restore logo
        inputTranslateY.value = withSpring(0, { damping: 12, stiffness: 80 }); // Move inputs back
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // Logo animation
  const animatedLogoStyle = useAnimatedStyle(() => ({
    width: logoSize.value,
    height: logoSize.value,
  }));

  // Input animation
  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: inputTranslateY.value }],
  }));

  // Validate email format
  const validateEmail = (email: any) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Check form validity whenever inputs change
  useEffect(() => {
    // Check if all fields are filled and there are no errors
    const isValid =
      email.trim() !== "" &&
      username.trim() !== "" &&
      password.trim() !== "" &&
      passwordConfirm.trim() !== "" &&
      validateEmail(email) &&
      username.length >= 3 &&
      password.length >= 8 &&
      password === passwordConfirm &&
      agreedToTerms;

    setIsFormValid(isValid);
  }, [email, username, password, passwordConfirm, agreedToTerms]);

  // Validate form inputs
  const validateInputs = () => {
    const newErrors:RegError = {};

    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";

    if (!username) newErrors.username = "Username is required";
    else if (username.length < 3)
      newErrors.username = "Username must be at least 3 characters";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!passwordConfirm)
      newErrors.passwordConfirm = "Please confirm your password";
    else if (password !== passwordConfirm)
      newErrors.passwordConfirm = "Passwords do not match";

    if (!agreedToTerms)
      newErrors.terms =
        "You must agree to the Terms of Service and Privacy Policy";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration process
  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      // clear previous session
      setUser(null);
      setSession(null);
      // Attempt to register
      const response = await axiosInstance.post("auth/register/", {
        email: email,
        password: password,
        username: username,
      });

      if (response.status === 201) {
        Alert.alert(
          "Registration Successful",
          "Your account has been created successfully. Please login.",
          [{ text: "OK", onPress: () => router.replace("/login") }]
        );
      } else {
        Alert.alert("Registration Failed", "Please try again later.");
      }
    } catch (error:any) {
      console.error("Registration error:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with an error status
        const responseData = error.response.data;
        if (responseData.email) {
          Alert.alert(
            "Registration Failed",
            "This email is already registered."
          );
        } else if (responseData.username) {
          Alert.alert("Registration Failed", "This username is already taken.");
        } else {
          Alert.alert(
            "Registration Failed",
            "Please check your information and try again."
          );
        }
      } else {
        // Network error or other issues
        Alert.alert(
          "Connection Error",
          "Please check your internet connection and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true} // Enables keyboard awareness on Android
      extraScrollHeight={20} // Adjust scrolling height
      keyboardShouldPersistTaps="handled" // Allows tapping outside to dismiss keyboard
    >
      {/* Logo and App Name */}
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require("@/assets/images/PurePost-Transparent-Edgeless.png")}
          style={[styles.logoImage, animatedLogoStyle]}
        />
        <Text style={styles.title}>PurePost</Text>
      </View>

      {/* Input Fields */}
      <Animated.View style={[styles.inputContainer, animatedInputStyle]}>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Enter Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: null });
          }}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder="Enter Username"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            if (errors.username) setErrors({ ...errors, username: null });
          }}
        />
        {errors.username && (
          <Text style={styles.errorText}>{errors.username}</Text>
        )}

        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Enter Password (min 8 characters)"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: null });
          }}
          autoComplete="off"
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <TextInput
          style={[styles.input, errors.passwordConfirm && styles.inputError]}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={passwordConfirm}
          onChangeText={(text) => {
            setPasswordConfirm(text);
            if (errors.passwordConfirm)
              setErrors({ ...errors, passwordConfirm: null });
          }}
        />
        {errors.passwordConfirm && (
          <Text style={styles.errorText}>{errors.passwordConfirm}</Text>
        )}

        {/* Terms of Service Agreement */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => {
              setAgreedToTerms(!agreedToTerms);
              if (errors.terms) setErrors({ ...errors, terms: null });
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
          >
            {agreedToTerms ? (
              <Ionicons name="checkbox" size={20} color="#00c5e3" />
            ) : (
              <Ionicons name="square-outline" size={20} color="#666" />
            )}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.termsText}>
              I have read and agree to the
              <Text
                style={styles.termsLink}
                onPress={() => router.push("/guidePolicy?tab=termsOfService")}
              >
                {" Terms of Service"}
              </Text>
              {" and "}
              <Text
                style={styles.termsLink}
                onPress={() => router.push("/guidePolicy?tab=privacyPolicy")}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
        {errors.terms && (
          <Text style={styles.termsErrorText}>{errors.terms}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            (isLoading || !isFormValid) && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.registerText}>Register</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Login Button */}
      <View style={styles.loginContainer}>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.loginText}>Have an account? Login!</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "column",
    padding: 0,
  },

  logoContainer: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    top: "5%",
  },

  inputContainer: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: "18%",
  },

  loginContainer: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: "5%",
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 10,
    width: "80%",
  },

  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },

  termsText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    lineHeight: 20,
  },

  termsLink: {
    color: "#00c5e3",
    textDecorationLine: "underline",
  },

  termsErrorText: {
    color: "#ff3b30",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "center",
  },

  title: {
    fontSize: 32,
    color: "#00c5e3",
    fontWeight: "800",
    fontStyle: "italic",
  },

  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#00c5e3",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
  },

  inputError: {
    borderColor: "#ff3b30",
    backgroundColor: "#fff0f0",
  },

  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    alignSelf: "flex-start",
    marginLeft: "10%",
    marginBottom: 5,
  },

  button: {
    backgroundColor: "#00c5e3",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
    height: 50,
    justifyContent: "center",
  },

  buttonDisabled: {
    backgroundColor: "#87d9e8",
    opacity: 0.7,
  },

  registerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },

  logoImage: {
    width: 150,
    height: 150,
  },

  loginText: {
    color: "#00c5e3",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default RegisterPage;
