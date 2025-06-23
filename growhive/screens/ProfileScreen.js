import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import GrowHiveHead from './GrowHivehead';
import { COLORS } from './constants';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// IMPORTANT: Ensure this API_BASE_URL matches your backend's base URL
const API_BASE_URL = 'http://192.168.1.2:5000/api';
// Define the base URL for serving static files (images)
// This is your backend's base URL WITHOUT the '/api' suffix
const STATIC_FILES_BASE_URL = 'http://192.168.1.2:5000';

const MAX_SKILLS_TO_SHOW = 4;

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Loading Name...');
  const [userEmail, setUserEmail] = useState('Loading Email...'); // Keep state for internal use if needed
  const [bio, setBio] = useState('Loading bio...');
  const [skillsOwned, setSkillsOwned] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null); // This will store the *full URL* for display
  const [uploadingImage, setUploadingImage] = useState(false); // New state for upload indicator

  const [showAllSkills, setShowAllSkills] = useState(false);

  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userToken = await SecureStore.getItemAsync('userToken');

      if (!userToken) {
        console.warn('No user token found. Redirecting to login.');
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const userData = response.data;

      setUserName(userData.name || 'User');
      setUserEmail(userData.email || 'No email'); // Still fetch and set, just not displayed here
      setBio(userData.bio || 'No bio provided.');
      const skillsForDisplay = (userData.skillsOwned || []).map(s => s.skill);
      setSkillsOwned(skillsForDisplay);

      const fullImageUrl = userData.profileImageUrl
        ? `${STATIC_FILES_BASE_URL}/${userData.profileImageUrl}`
        : null;
      setProfileImageUrl(fullImageUrl);

      await SecureStore.setItemAsync('userName', userData.name);
      await SecureStore.setItemAsync('userEmail', userData.email);
      const { password, ...profileToStore } = userData;
      await SecureStore.setItemAsync('userProfile', JSON.stringify(profileToStore));

    } catch (error) {
      console.error('Failed to fetch user profile from backend:', error.response ? error.response.data : error.message);
      let errorMessage = 'Failed to load profile. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        await SecureStore.deleteItemAsync('userToken');
        navigation.replace('Login');
      }
      Alert.alert('Profile Load Failed', errorMessage);

      try {
        const storedUserName = await SecureStore.getItemAsync('userName');
        const storedUserEmail = await SecureStore.getItemAsync('userEmail');
        const storedUserProfile = await SecureStore.getItemAsync('userProfile');
        if (storedUserName) setUserName(storedUserName);
        if (storedUserEmail) setUserEmail(storedUserEmail);
        if (storedUserProfile) {
          const profileData = JSON.parse(storedUserProfile);
          setBio(profileData.bio || 'No bio provided.');
          const skillsForDisplay = (profileData.skillsOwned || []).map(s => s.skill);
          setSkillsOwned(skillsForDisplay);
          const storedFullImageUrl = profileData.profileImageUrl
            ? `${STATIC_FILES_BASE_URL}/${profileData.profileImageUrl}`
            : null;
          setProfileImageUrl(storedFullImageUrl);
        }
      } catch (e) {
        console.error("Failed to load fallback profile from SecureStore:", e);
        setUserName('Error loading');
        setUserEmail('Error loading');
        setBio('Could not load profile data.');
        setSkillsOwned([]);
        setProfileImageUrl(null);
      }
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need permission to access your gallery.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7, // Lower quality for faster upload
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setProfileImageUrl(selectedImageUri); // Optimistically update the UI
      uploadProfileImage(selectedImageUri); // Call the new upload function
    }
  };

  const uploadProfileImage = async (imageUri) => {
    setUploadingImage(true);
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      if (!userToken) {
        Alert.alert('Authentication Error', 'No user token found. Please log in again.');
        navigation.replace('Login');
        return;
      }

      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageUri,
        name: `profile_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });

      const response = await axios.put(`${API_BASE_URL}/upload/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });

      const newRelativeImageUrl = response.data.profileImageUrl;
      const newFullImageUrl = `${STATIC_FILES_BASE_URL}/${newRelativeImageUrl}`;
      setProfileImageUrl(newFullImageUrl); // Update state with the full URL

      Alert.alert('Success', 'Profile image updated successfully!');
      fetchUserProfile(); // Re-fetch to ensure all data is in sync

    } catch (error) {
      console.error('Error uploading image:', error.response ? error.response.data : error.message);
      let errorMessage = 'Failed to upload image. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.status === 413) {
        errorMessage = 'Image file is too large. Please select a smaller image (max 5MB).';
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        await SecureStore.deleteItemAsync('userToken');
        navigation.replace('Login');
      }
      Alert.alert('Upload Failed', errorMessage);
      fetchUserProfile(); // Re-fetch to show the previous or default image
    } finally {
      setUploadingImage(false);
    }
  };


  if (!fontsLoaded || loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ fontFamily: 'Poppins_400Regular', marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  const displayedSkills = showAllSkills ? skillsOwned : skillsOwned.slice(0, MAX_SKILLS_TO_SHOW);
  const hasMoreSkills = skillsOwned.length > MAX_SKILLS_TO_SHOW;

  return (
    <SafeAreaView style={styles.container}>
      <GrowHiveHead />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header (Image, Name, Bio) */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={
                profileImageUrl
                  ? { uri: profileImageUrl }
                  : require('../assets/profile.jpeg')
              }
              style={styles.profileImage}
            />
            <TouchableOpacity onPress={pickImage} style={styles.editIcon} disabled={uploadingImage}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="add" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.profileDetailsRight}>
            <Text style={styles.name}>{userName}</Text>
            {/* Removed the emailText component from here */}
            <Text style={styles.profileBioText}>{bio}</Text>
          </View>
        </View>

        {/* Skills Section (for display summary) */}
        {skillsOwned.length > 0 && (
          <View style={styles.skillsSection}>
            <View style={styles.skillsContainerCompact}>
              {displayedSkills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {hasMoreSkills && !showAllSkills && (
                <TouchableOpacity onPress={() => setShowAllSkills(true)} style={styles.showMoreHideButton}>
                  <Text style={styles.showMoreHideButtonText}>Show More</Text>
                </TouchableOpacity>
              )}
              {showAllSkills && (
                <TouchableOpacity onPress={() => setShowAllSkills(false)} style={styles.showMoreHideButton}>
                  <Text style={styles.showMoreHideButtonText}>Show Less</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatsBlock label="Connections" count="25" />
          <StatsBlock label="Courses Learned" count="10" />
          <StatsBlock label="Hackathons" count="3" />
        </View>

        {/* Section Rows */}
        <SectionRow
          icon="person-circle-outline"
          label="Personal Information"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SectionRow
          icon="lock-closed-outline"
          label="Change Password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <SectionRow
          icon="bar-chart-outline"
          label="Proficiency"
          onPress={() => navigation.navigate('ManageProficiencies')}
        />
        <SectionRow
          icon="settings-outline"
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <SectionRow
          icon="alert-circle-outline"
          label="Blocked Users"
          onPress={() => navigation.navigate('BlockedUsers')}
        />
        <SectionRow
          icon="alert-octagon-outline"
          label="Reported Users"
          onPress={() => navigation.navigate('ReportedUsers')}
        />
        <SectionRow
          icon="log-out-outline"
          label="Log Out"
          onPress={async () => {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userId');
            await SecureStore.deleteItemAsync('userName');
            await SecureStore.deleteItemAsync('userEmail');
            await SecureStore.deleteItemAsync('userProfile');
            Alert.alert("Logged Out", "You have been logged out successfully.");
            navigation.replace('Login');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const StatsBlock = ({ label, count }) => (
  <View style={styles.statBox}>
    <Text style={styles.statNumber}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SectionRow = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.sectionRow} onPress={onPress}>
    <View style={styles.sectionLeft}>
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={styles.sectionText}>{label}</Text>
    </View>
    {label === 'Personal Information' && (
      <MaterialCommunityIcons name="square-edit-outline" size={20} color={COLORS.primary} />
    )}
    {label !== 'Personal Information' && (
      <Ionicons name="chevron-forward-outline" size={20} color={COLORS.muted} />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    paddingTop: 80,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginRight: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileDetailsRight: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    color: '#222',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  // Removed emailText style as it's no longer directly used in the display
  // emailText: {
  //   fontSize: 14,
  //   fontFamily: 'Poppins_400Regular',
  //   color: '#666',
  //   marginBottom: 5,
  // },
  profileBioText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#555',
    lineHeight: 18,
  },
  skillsSection: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  skillsContainerCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillTag: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  showMoreHideButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  showMoreHideButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text,
    marginLeft: 15,
  },
});

export default ProfileScreen;