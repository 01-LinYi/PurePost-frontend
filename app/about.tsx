import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from '@/components/CachedImage';

const AboutPage = () => {
    return (
        <View style={styles.container}>
            <Image source={require('@/assets/images/purePostTransparent.png')} style={{ width: 200, height: 200 }} />
            <Text style={styles.title}>About Us</Text>
            <Text style={styles.description}>
            Welcome to PurePost! We are dedicated to providing the best service for our users.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default AboutPage;