import { Redirect, router } from 'expo-router';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';

import { useState } from 'react';

const RegisterPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [lastname, setLastname] = useState('');

  return (
    <View style={styles.container}>

      {/* Logo and App Name */}
      <View>
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

        <TextInput
          style={styles.input}
          placeholder="Enter First Name"
          placeholderTextColor="#888"
          secureTextEntry
          value={firstname}
          onChangeText={setFirstname}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Middle Name"
          placeholderTextColor="#888"
          secureTextEntry
          value={middlename}
          onChangeText={setMiddlename}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Last Name"
          placeholderTextColor="#888"
          secureTextEntry
          value={lastname}
          onChangeText={setLastname}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => alert("Logging in...")}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={
          () => router.replace("/login")
        }
      >
        <Text style={styles.loginText}>Have an account? Login!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
  },

  inputContainer: {
    width: '100%',
    // height: "50%",
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 10,
  },

  title: {
    fontSize: 32,
    color: "#00c5e3",
    fontWeight: '800',
    fontStyle: 'italic',
  },

  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#00c5e3',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },

  description: {
    fontSize: 16,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#00c5e3',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
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
    marginTop: 5,
    marginBottom: 20,
  },
});

export default RegisterPage;
