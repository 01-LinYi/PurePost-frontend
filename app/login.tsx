import { useSession } from '@/components/SessionProvider';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


const LoginPage = () => {
    const { logIn } = useSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
                    style={styles.input}
                    placeholder="Enter Username/Email"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Enter Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        logIn(email, password)
                        .then(
                            () => router.replace("/(tabs)"),
                            () => alert("Invalid email or password.")
                        )
                        .catch((error) => alert(error.message));
                    }}
                >
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => alert("Resetting password...")}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
                <TouchableOpacity onPress={() => router.replace("/register")}>
                    <Text style={styles.registerText}>Don't have an account? Create one!</Text>
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
    description: {
        fontSize: 16,
        textAlign: 'center',
    },
    button: {
        width: '80%',
        backgroundColor: '#00c5e3',
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 8,
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