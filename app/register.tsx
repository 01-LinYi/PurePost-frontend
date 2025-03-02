import { Redirect, router } from 'expo-router';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';

import { useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';

const RegisterPage = () => {

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  return (
    <View style={styles.container}>

      {/* Logo and App Name */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/PurePost-Transparent-Edgeless.png')}
          style={styles.logoImage}
        />
        <Text style={styles.title}>PurePost</Text>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          placeholderTextColor="#888"
          secureTextEntry
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Password Again"
          placeholderTextColor="#888"
          secureTextEntry
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={
            async () => {
              if (password !== passwordConfirm) {
                alert("Passwords do not match");
                return;
              }

              const response = await axiosInstance.post("auth/register/", {
                "email": email,
                "password": password,
                "username": username,
              });

              if (response.status !== 201) {
                console.error("Registration failed:", response);
                alert("Registration failed");
                return;
              }
              
              // TODO: Show a success notification
              router.replace("/login");
          }}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <View style={styles.loginContainer}>
        <TouchableOpacity onPress={ () => router.replace("/login")}>
          <Text style={styles.loginText}>Have an account? Login!</Text>
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

  loginContainer: {
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
    backgroundColor: '#00c5e3',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },

  forgotPasswordText: {
    color: '#00c5e3',
    fontSize: 16,
    fontWeight: '500',
  },

  registerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: '600',
  },

  logoImage: {
    width: 150,
    height: 150,
  },

  loginText: {
    color: '#00c5e3',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterPage;
