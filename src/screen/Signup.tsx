import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    Pressable, ActivityIndicator, ScrollView,
    KeyboardTypeOptions
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Snackbar } from 'react-native-paper';
import { SignupNavigationProp, UserProfile } from '../index';

interface SignupProps {
    navigation: SignupNavigationProp;
}

const Signup = ({ navigation }: SignupProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackVisible, setSnackVisible] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    const showSnackbar = (message: string) => {
        setSnackMessage(message);
        setSnackVisible(true);
    };

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword || !name || !username || !mobileNumber) {
            showSnackbar('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            showSnackbar('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            // Check if email or username already exists
            const emailQuery = await firestore()
                .collection('users')
                .where('email', '==', email)
                .get();

            const usernameQuery = await firestore()
                .collection('users')
                .where('username', '==', username)
                .get();

            if (!emailQuery.empty) {
                showSnackbar('Email already exists.');
                setLoading(false);
                return;
            }

            if (!usernameQuery.empty) {
                showSnackbar('Username already exists.');
                setLoading(false);
                return;
            }

            // Create a new user in Firebase Authentication
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Save user data in Firestore
            const newUserProfile: UserProfile = {
                uid: user.uid,
                name,
                email: user.email!,
                username,
                mobileNumber,
                createdAt: firestore.FieldValue.serverTimestamp(),
            };

            await firestore().collection('users').doc(user.uid).set(newUserProfile);
            showSnackbar('Account created successfully!');
        } catch (error: any) {
            showSnackbar(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (icon: string, placeholder: string, value: string, onChange: (text: string) => void, keyboardType: KeyboardTypeOptions = 'default', secure = false) => (
        <View style={styles.inputContainer}>
            <Icon name={icon} size={20} color="#888" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
                placeholderTextColor="#999"
                keyboardType={keyboardType}
                secureTextEntry={secure}
                autoCapitalize="none"
            />
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Icon name="person-add" size={40} color="#6200ee" style={styles.titleIcon} />
                    <Text style={styles.title}>Create Account</Text>
                </View>

                {renderInput('person', 'Name', name, setName)}
                {renderInput('email', 'Email', email, setEmail, 'email-address')}
                {renderInput('account-circle', 'Username', username, setUsername)}
                {renderInput('phone', 'Mobile Number', mobileNumber, setMobileNumber, 'phone-pad')}
                {renderInput('lock', 'Password', password, setPassword, 'default', true)}
                {renderInput('lock-outline', 'Confirm Password', confirmPassword, setConfirmPassword, 'default', true)}

                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                    onPress={handleSignup}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
                    <Text style={styles.linkText}>Already have an account? Login</Text>
                </Pressable>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#6200ee" />
                    </View>
                )}

                <Snackbar
                    visible={snackVisible}
                    onDismiss={() => setSnackVisible(false)}
                    duration={3000}
                    action={{
                        label: 'OK',
                        onPress: () => setSnackVisible(false),
                    }}
                >
                    {snackMessage}
                </Snackbar>
            </View>
        </ScrollView>
    );
};

export default Signup;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f4f8',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6200ee',
    },
    titleIcon: {
        marginRight: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        width: '100%',
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#6200ee',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#6200ee',
        fontSize: 15,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
