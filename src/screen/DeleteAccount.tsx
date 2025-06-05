import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator, TextInput, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { DeleteAccountNavigationProp } from '../index';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface DeleteAccountProps {
    navigation: DeleteAccountNavigationProp;
}

const DeleteAccount = ({ navigation }: DeleteAccountProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const currentUser: FirebaseAuthTypes.User | null = auth().currentUser;

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const handleDeleteAccount = async () => {
        if (!currentUser) {
            showSnackbar('No user logged in.');
            navigation.goBack();
            return;
        }

        if (!password) {
            showSnackbar('Please enter your password to confirm.');
            return;
        }

        setLoading(true);
        try {
            const credential = auth.EmailAuthProvider.credential(currentUser.email!, password);
            await currentUser.reauthenticateWithCredential(credential);

            const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
            if (userDoc.exists() && userDoc.data()?.profilePic) {
                const picUrl: string = userDoc.data()!.profilePic;
                try {
                    const picRef = storage().refFromURL(picUrl);
                    await picRef.delete();
                } catch (_) {
                    // Silent fail on profile pic deletion
                }
            }

            await firestore().collection('users').doc(currentUser.uid).delete();
            await currentUser.delete();
            showSnackbar('Your account has been deleted.');
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                showSnackbar('Please log out and log back in to delete your account.');
            } else if (error.code === 'auth/wrong-password') {
                showSnackbar('Incorrect password. Please try again.');
            } else {
                showSnackbar(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff0000" />
                <Text style={{ marginTop: 10 }}>Deleting Account...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.card}>
                <Icon name="delete-forever" size={50} color="red" style={styles.icon} />
                <Text style={styles.title}>Delete Account</Text>
                <Text style={styles.description}>
                    This will permanently delete your account and all associated data.
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#999"
                />
                <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
                    <Icon name="delete" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Delete Account</Text>
                </Pressable>
                <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Icon name="cancel" size={20} color="#333" />
                    <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
            </View>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{ backgroundColor: '#333' }}
            >
                {snackbarMessage}
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

export default DeleteAccount;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 25,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    icon: {
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e53935',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
    },
    cancelText: {
        color: '#333',
        fontSize: 16,
        marginLeft: 8,
    },
});
