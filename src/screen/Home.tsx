import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Snackbar } from 'react-native-paper';
import { HomeNavigationProp, UserProfile } from '../index';

interface HomeProps {
    navigation: HomeNavigationProp;
}

const Home = ({ navigation }: HomeProps) => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const currentUser = auth().currentUser;

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const subscriber = firestore()
            .collection('users')
            .doc(currentUser.uid)
            .onSnapshot(
                documentSnapshot => {
                    if (documentSnapshot.exists()) {
                        setUserData(documentSnapshot.data() as UserProfile);
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                },
                error => {
                    setSnackbarMessage('Failed to load user data.');
                    setSnackbarVisible(true);
                    setLoading(false);
                }
            );

        return () => subscriber();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await auth().signOut();
        } catch (error: any) {
            setSnackbarMessage(error.message);
            setSnackbarVisible(true);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Loading User Data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome!</Text>
            {userData ? (
                <View style={styles.card}>
                    {/* Profile Picture and User Details in the Same Row */}
                    <View style={styles.profileRow}>
                        {userData.profilePic ? (
                            <Image source={{ uri: userData.profilePic }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <MaterialCommunityIcons name="account" size={80} color="#aaa" />
                            </View>
                        )}
                        <View style={styles.userDetails}>
                            <View style={styles.row}>
                                <MaterialCommunityIcons name="account" size={24} color="#444" />
                                <Text style={styles.userDataText}>Name: {userData.name}</Text>
                            </View>
                            <View style={styles.row}>
                                <MaterialCommunityIcons name="email" size={24} color="#444" />
                                <Text style={styles.userDataText}>Email: {userData.email}</Text>
                            </View>
                            <View style={styles.row}>
                                <MaterialCommunityIcons name="account-box" size={24} color="#444" />
                                <Text style={styles.userDataText}>Username: {userData.username}</Text>
                            </View>
                            <View style={styles.row}>
                                <MaterialCommunityIcons name="phone" size={24} color="#444" />
                                <Text style={styles.userDataText}>Mobile: {userData.mobileNumber}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            ) : (
                <Text>User data not available. Please ensure your profile is set up.</Text>
            )}

            <Pressable style={styles.buttonPrimary} onPress={() => navigation.navigate('Profile')}>
                <MaterialCommunityIcons name="account" size={20} color="#fff" />
                <Text style={styles.buttonText}>Profile</Text>
            </Pressable>

            <Pressable style={styles.buttonDanger} onPress={handleLogout}>
                <MaterialCommunityIcons name="logout" size={20} color="#fff" />
                <Text style={styles.buttonText}>Logout</Text>
            </Pressable>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2f4f7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    card: {
        width: '100%',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
         // Center the profile picture
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    userDataText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#444',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4caf50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 10,
    },
    buttonDanger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f44336',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    snackbar: {
        backgroundColor: '#323232',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userDetails: {
        marginLeft: 15,
        flex: 1,
    },
});
