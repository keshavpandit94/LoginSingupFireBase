import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    Pressable, ActivityIndicator
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LoginNavigationProp } from '../index';

interface LoginProps {
    navigation: LoginNavigationProp;
}

const Login = ({ navigation }: LoginProps) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [snackVisible, setSnackVisible] = useState<boolean>(false);
    const [snackMessage, setSnackMessage] = useState<string>('');

    const handleLogin = async () => {
        if (!email || !password) {
            setSnackMessage('Please enter both email and password.');
            setSnackVisible(true);
            return;
        }

        setLoading(true);
        try {
            await auth().signInWithEmailAndPassword(email, password);
            // Redirect handled by auth state observer
        } catch (error: any) {
            setSnackMessage(error.message);
            setSnackVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Icon name="login" size={30} color="#6200ee" style={styles.titleIcon} />
                <Text style={styles.title}>Login</Text>
            </View>

            <View style={styles.inputContainer}>
                <Icon name="email" size={20} color="#888" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#aaa"
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#888" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#aaa"
                />
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    loading && styles.buttonDisabled
                ]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Logging In...' : 'Login'}
                </Text>
            </Pressable>

            <Pressable
                onPress={() => navigation.navigate('Signup')}
                style={styles.linkButton}
            >
                <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        padding: 24,
        justifyContent: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    titleIcon: {
        marginRight: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6200ee',
        textAlign: 'center',
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
        marginTop: 10,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        backgroundColor: '#bbb',
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
