// For user data stored in Firestore
export interface UserProfile {
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  username: string;
  mobileNumber: string;
  profilePic?: string; // Optional URL for profile picture
  createdAt?: firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.FieldValue;
}

// For navigation parameters
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: { userData: UserProfile };
  DeleteAccountConfirmation: undefined;
};

// Define navigation prop type for specific screens
export type LoginNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type SignupNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;
export type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
export type EditProfileNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;
export type DeleteAccountNavigationProp = StackNavigationProp<RootStackParamList, 'DeleteAccount'>;

// Define Route prop type for screens that receive params
import { RouteProp } from '@react-navigation/native';
export type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;