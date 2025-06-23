import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins'; // Import Poppins fonts

const COLORS = {
  primary: '#34e3b0',
  secondary: '#2563eb',
  accent: '#F472B6',
  background: '#f4faff',
  card: '#fff',
  text: '#23272F',
  muted: '#6b7280',
  shadow: '#e0e7ef',
  logoBlue: '#2563eb',
  logoGreen: '#34e3b0',
};

const API_BASE_URL = 'http://192.168.1.2:5000/api';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Load Poppins fonts
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  // Log to check if fonts are loaded
  if (fontsLoaded) {
    console.log('Fonts are loaded for ChangePasswordScreen!');
  } else {
    console.log('Fonts are NOT loaded yet for ChangePasswordScreen...');
  }


  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters long.');
        return;
    }

    setLoading(true);
    try {
      const userToken = await SecureStore.getItemAsync('userToken');

      if (!userToken) {
        Alert.alert('Authentication Error', 'You are not logged in. Please log in again.');
        navigation.replace('Login');
        return;
      }

      const response = await axios.put(`${API_BASE_URL}/users/change-password`, {
        oldPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Success', response.data.message || 'Password changed successfully!');
      
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      navigation.goBack(); 

    } catch (error) {
      console.error('Failed to change password:', error.response ? error.response.data : error.message);
      let errorMessage = 'Failed to change password. Please try again.';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Invalid old password or session expired. Please log in again.';
        await SecureStore.deleteItemAsync('userToken');
        navigation.replace('Login');
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ fontFamily: 'Poppins_400Regular', marginTop: 10, color: COLORS.text }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LottieView
        source={require('../assets/password-lock.json')}
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Change Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Old Password"
        placeholderTextColor={COLORS.muted}
        secureTextEntry
        onChangeText={setOldPassword}
        value={oldPassword}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor={COLORS.muted}
        secureTextEntry
        onChangeText={setNewPassword}
        value={newPassword}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        placeholderTextColor={COLORS.muted}
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  animation: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold', // Applied Poppins_700Bold
    fontWeight: 'bold',
    color: '#0D2A64',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: COLORS.card,
    color: COLORS.text,
    fontFamily: 'Poppins_400Regular', // Applied Poppins_400Regular
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold', // Applied Poppins_600SemiBold
    textAlign: 'center',
  },
});