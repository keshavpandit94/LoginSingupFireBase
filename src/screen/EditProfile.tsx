import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView, Pressable, } from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Card, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import icons
import { EditProfileNavigationProp, EditProfileRouteProp } from '../index';

interface EditProfileProps {
    navigation: EditProfileNavigationProp;
    route: EditProfileRouteProp;
}

const EditProfile = ({ navigation, route }: EditProfileProps) => {
    const { userData } = route.params;

    const [name, setName] = useState<string>(userData?.name || '');
    const [username, setUsername] = useState<string>(userData?.username || '');
    const [mobileNumber, setMobileNumber] = useState<string>(userData?.mobileNumber || '');
    const [loading, setLoading] = useState<boolean>(false);
    const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const currentUser = auth().currentUser;

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const handleUpdateProfile = async () => {
        if (!name || !username || !mobileNumber) {
            showSnackbar('All fields are required.');
            return;
        }

        if (!currentUser) {
            showSnackbar('No authenticated user found.');
            return;
        }

        setLoading(true);
        try {
            await firestore().collection('users').doc(currentUser.uid).update({
                name,
                username,
                mobileNumber,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            showSnackbar('Profile updated successfully!');
            setTimeout(() => navigation.goBack(), 1000);
        } catch (error: any) {
            showSnackbar(error.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ea" />
                <Text>Updating Profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Card style={styles.card}>
                    <Card.Title
                        title="Edit Profile"
                        titleStyle={styles.title}
                        left={(props) => <Icon {...props} name="account-edit" size={30} color="#6200ea" />}
                    />
                    <Card.Content>
                        <View style={styles.inputContainer}>
                            <Icon name="account" size={20} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Icon name="account-circle" size={20} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Icon name="phone" size={20} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mobile Number"
                                keyboardType="phone-pad"
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <Pressable style={styles.primaryButton} onPress={handleUpdateProfile}>
                            <Icon name="content-save" size={20} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.primaryButtonText}>Save Changes</Text>
                        </Pressable>

                        <View style={styles.spacer} />

                        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                            <Icon name="cancel" size={20} color="#555" style={styles.buttonIcon} />
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </Pressable>
                    </Card.Content>
                </Card>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={styles.snackbar}
                >
                    {snackbarMessage}
                </Snackbar>
            </View>
        </ScrollView>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderRadius: 12,
        padding: 10,
        backgroundColor: '#ffffff',
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
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
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: '#6200ea',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    secondaryButton: {
        flexDirection: 'row',
        marginTop: 10,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 16,
        color: '#555',
        marginLeft: 8,
    },
    buttonIcon: {
        marginRight: 8,
    },
    spacer: {
        height: 10,
    },
    snackbar: {
        backgroundColor: '#333',
        marginBottom: 16,
    },
});
