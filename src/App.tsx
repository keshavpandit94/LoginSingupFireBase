import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Import RootStackParamList for type safety
import { RootStackParamList } from './index';

// Auth Screens
import LoginScreen from './screen/Login';
import SignupScreen from './screen/Signup';

// App Screens (After Login)
import HomeScreen from './screen/Home';
import ProfileScreen from './screen/Profile';
import EditProfileScreen from './screen/EditProfile';
import DeleteAccountConfirmationScreen from './screen/DeleteAccount';
import { StatusBar } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>(); // Specify RootStackParamList here

const App = () => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return null; // Or a loading spinner
  }

  return (
    <NavigationContainer>
      <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is logged in
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="DeleteAccountConfirmation" component={DeleteAccountConfirmationScreen} options={{ headerShown: true, title: 'Delete Account' }} />
          </>
        ) : (
          // No user is logged in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
      </>
    </NavigationContainer>
  );
};

export default App;