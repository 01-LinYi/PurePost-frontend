import { useSession } from '@/components/SessionProvider';
import { useStorageState } from '@/hooks/useStorageState';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';

const LoginPage = () => {
    const { logIn } = useSession();
    const [[], setUser] = useStorageState("user");
    const [[],setSession] = useStorageState("session");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [isFormValid, setIsFormValid] = useState(false);
    const router = useRouter();

    // Check form validity whenever inputs change
    useEffect(() => {
        const isValid = email.trim() !== '' && password.trim() !== '';
        setIsFormValid(isValid);
    }, [email, password]);

    // Validate form inputs
    const validateInputs = () => {
        const newErrors: any = {};

        if (!email) newErrors.email = "Email/Username is required";
        if (!password) newErrors.password = "Password is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle login process
    const handleLogin = async () => {
        if (!validateInputs()) return;

        setIsLoading(true);

        try {
            // clear previous session
            setUser(null);
            setSession(null);
            // Attempt to log in
            await logIn(email, password);
            router.replace("/(tabs)");
        } catch (error: any) {
            // Handle different error cases
            if (error.message && error.message.includes('401')) {
                Alert.alert("Login Failed", "Invalid email or password.");
            } else {
                Alert.alert("Login Error", error.message || "An unexpected error occurred. Please try again.");
            }
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle password reset
    const handleForgotPassword = () => {
        if (!email.trim()) {
            Alert.alert(
                "Email Required",
                "Please enter your email address first.",
                [{ text: "OK" }]
            );
            return;
        }

        // This would typically connect to a password reset API
        Alert.alert(
            "Password Reset",
            `We'll send password reset instructions to ${email}`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Send",
                    onPress: () => Alert.alert("Email Sent(Not really)", "Please check your email for password reset instructions.")
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('@/assets/images/PurePost-Transparent-Edgeless.png')}
                    style={styles.absoluteImage}
                />
                <Text style={styles.title}>PurePost</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Enter Username/Email"
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
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Enter Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: null });
                    }}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <TouchableOpacity
                    style={[
                        styles.button,
                        (isLoading || !isFormValid) && styles.buttonDisabled
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading || !isFormValid}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.loginText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
                <TouchableOpacity onPress={() => router.replace("/register")}>
                    <Text style={styles.registerText}>Don't have an account? Create one!</Text>
                </TouchableOpacity>
            </View>

            {/* Added Terms & Privacy Policy link */}
            <View style={styles.policyContainer}>
                <TouchableOpacity onPress={() => router.push("/guidePolicy?tab=termsOfService")}>
                    <Text style={styles.policyText}>
                        Terms of Service & Privacy Policy
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 0,
    },
    logoContainer: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        top: '5%',
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        top: '30%',
    },
    registerContainer: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: '5%',
    },
    // Added policy container styles
    policyContainer: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: '12%', // Position it above the register container
    },
    title: {
        fontSize: 32,
        color: "#00c5e3",
        fontWeight: '800',
        fontStyle: 'italic',
    },
    input: {
        width: '80%',
        height: 50,
        borderWidth: 1,
        borderColor: '#00c5e3',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
    },
    inputError: {
        borderColor: '#ff3b30',
        backgroundColor: '#fff0f0',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 14,
        alignSelf: 'flex-start',
        marginLeft: '10%',
        marginBottom: 5,
    },
    button: {
        width: '80%',
        backgroundColor: '#00c5e3',
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 8,
        height: 50,
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#87d9e8',
        opacity: 0.7,
    },
    registerText: {
        color: '#00c5e3',
        fontSize: 16,
        fontWeight: '500',
        marginVertical: 10,
    },
    forgotPasswordText: {
        color: '#00c5e3',
        fontSize: 16,
        fontWeight: '500',
        marginVertical: 5,
    },
    // Added policy text styles
    policyText: {
        color: '#888',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    loginText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
    },
    absoluteImage: {
        width: 150,
        height: 150,
    },
});

export default LoginPage;