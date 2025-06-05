import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { Snackbar, Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { ProfileNavigationProp, UserProfile } from '../index';

interface ProfileProps {
  navigation: ProfileNavigationProp;
}

interface options {
  mediaType: 'photo' | 'video' | 'mixed'; // Use the correct MediaType type
  quality?: number; // Use a number between 0 and 1 for quality
}

// Replace with your Cloudinary values
const CLOUDINARY_UPLOAD_PRESET = 'authfirebaseprofileimage';
const CLOUDINARY_CLOUD_NAME = 'dlpikrqvd';

const Profile = ({ navigation }: ProfileProps) => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userDocRef = firestore().collection('users').doc(currentUser.uid);
    const subscriber = userDocRef.onSnapshot(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) { // Corrected to call the exists() method
          const data = documentSnapshot.data() as UserProfile;
          setUserData(data);
          setProfilePicUrl(data.profilePic ?? null); // Fetch and set the profile picture URL
        } else {
          setUserData(null);
          setProfilePicUrl(null);
        }
        setLoading(false);
      },
      () => {
        showSnackbar('Failed to load profile data.');
        setLoading(false);
      }
    );

    return () => subscriber();
  }, [currentUser]);

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const handleChoosePhoto = () => {
    const options: options = {
      mediaType: 'photo',
      quality: 1, // Use a number between 0 and 1 for high quality
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;

      const asset = response.assets?.[0];
      if (!asset?.uri) {
        showSnackbar('Invalid image selected.');
        return;
      }

      setLoading(true);
      try {
        console.log('Cloudinary Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
        console.log('Cloudinary Cloud Name:', CLOUDINARY_CLOUD_NAME);

        // Upload the new image to Cloudinary
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: asset.fileName ?? 'profile.jpg',
          type: asset.type ?? 'image/jpeg',
        } as any);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        const imageUrl = uploadRes.data.secure_url;
        const publicId = uploadRes.data.public_id; // Get the public ID of the uploaded image
        console.log('Image uploaded successfully:', imageUrl);

        // Update Firestore with the new profile picture URL and Public ID
        await firestore().collection('users').doc(currentUser?.uid!).update({
          profilePic: imageUrl,
          profilePicPublicId: publicId, // Save the public ID for future deletions
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        // Update the local state to reflect the new profile picture
        setProfilePicUrl(imageUrl);
        showSnackbar('Profile picture updated successfully!');
      } catch (error: any) {
        console.error('Upload failed:', error.response?.data || error.message);
        showSnackbar('Upload failed: ' + (error.response?.data?.error?.message || error.message));
      } finally {
        setLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>User data not found.</Text>
        <Pressable style={styles.redButton} onPress={() => auth().signOut()}>
          <MaterialCommunityIcons name="logout" size={18} color="white" />
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>

      {/* Profile Picture with Change Icon */}
      <View style={styles.profilePictureContainer}>
        {profilePicUrl ? (
          <Image source={{ uri: profilePicUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialCommunityIcons name="account" size={80} color="#aaa" />
          </View>
        )}
        <Pressable style={styles.changePictureIcon} onPress={handleChoosePhoto}>
          <MaterialCommunityIcons name="camera" size={24} color="white" />
        </Pressable>
      </View>

      {/* User Details */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{userData.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{userData.username}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Mobile:</Text>
            <Text style={styles.value}>{userData.mobileNumber}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Buttons */}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('EditProfile', { userData })}
      >
        <MaterialCommunityIcons name="account-edit" size={18} color="white" />
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>

      <Pressable
        style={styles.redButton}
        onPress={() => navigation.navigate('DeleteAccountConfirmation')}
      >
        <MaterialCommunityIcons name="delete" size={18} color="white" />
        <Text style={styles.buttonText}>Delete Account</Text>
      </Pressable>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}
        style={{ backgroundColor: '#333' }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

export default Profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#444',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  placeholderImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    width: '100%',
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    elevation: 4,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    color: '#555',
    flexShrink: 1,
    textAlign: 'right',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#03dac6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
  },
  redButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  profilePictureContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  changePictureIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6200ee',
    borderRadius: 50,
    padding: 6,
    elevation: 2,
  },
});
