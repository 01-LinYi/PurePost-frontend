import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface TermsAgreementProps {
    onAgreementChange?: (agree: boolean) => void;
}

const TermsAgreement: React.FC<TermsAgreementProps> = ({ onAgreementChange }) => {
    const [agreeTerms, setAgreeTerms] = useState(false);
    
    const toggleAgreement = () => {
        const newValue = !agreeTerms;
        setAgreeTerms(newValue);
        if (onAgreementChange) {
            onAgreementChange(newValue);
        }
    };
    
    return (
        <View style={styles.termsContainer}>
            <TouchableOpacity 
                style={styles.checkbox} 
                onPress={toggleAgreement}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeTerms }}
            >
                {agreeTerms ? (
                    <Ionicons name="checkbox" size={20} color="#00c5e3" />
                ) : (
                    <Ionicons name="square-outline" size={20} color="#666" />
                )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
                I have read and agree to the 
                <Text 
                    style={styles.termsLink}
                    onPress={() => router.push("/guidePolicy?tab=termsOfService")}
                >
                    {' Terms of Service'}
                </Text>
                {' and '}
                <Text 
                    style={styles.termsLink}
                    onPress={() => router.push("/guidePolicy?tab=privacyPolicy")}
                >
                    Privacy Policy
                </Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 16,
        paddingHorizontal: '10%',
        width: '100%',
    },
    checkbox: {
        marginRight: 10,
        marginTop: 2,
    },
    termsText: {
        fontSize: 14,
        color: '#555',
        flex: 1,
        lineHeight: 20,
    },
    termsLink: {
        color: '#00c5e3',
        textDecorationLine: 'underline',
    },
});

export default TermsAgreement;