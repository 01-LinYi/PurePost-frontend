import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';


const LoginPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.container}>
            <View>
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
                    onPress={
                        () => alert("Logging in...")
                    }
                >
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => alert("Resetting password...")}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>



            <TouchableOpacity 
                onPress={
                    () => router.replace("/register")
                }
            >
                <Text style={styles.registerText}>Don't have an account? Create one!</Text>
            </TouchableOpacity>
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
    inputContainer: {
        width: '100%',
        alignItems: 'center',
        // marginTop: 30,
    },
    title: {
        fontSize: 32,
        color: "#00c5e3",
        fontWeight: '800',
        fontStyle: 'italic',
        // position: 'absolute',
        // top: 300,
    },
    input: {
        width: '90%',
        height: 50,
        borderWidth: 1,
        borderColor: '#00c5e3',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginVertical: 10,
        marginTop: 10,
        backgroundColor: '#f9f9f9',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
    },
    button: {
        // position: 'absolute',
        // bottom: 240,
        width: '90%',
        backgroundColor: '#00c5e3',
        paddingVertical: 10,
        // paddingHorizontal: 30,
        alignItems: 'center',
        borderRadius: 8,
        // margin: 20,
    },
    registerText: {
        color: '#00c5e3',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 5,
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#00c5e3',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 10,
        marginBottom: 20,
    },
    loginText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
    },
    absoluteImage: {
        width: 150,
        height: 150,
        // position: 'absolute',
        // top: 150,
    },
});

export default LoginPage;