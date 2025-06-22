import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const COLORS = {
  primary: '#34e3b0',
  secondary: '#2563eb',
  accent: '#F472B6',
  background: '#f6fbfa',
  card: '#fff',
  text: '#23272F',
  muted: '#6b7280',
  shadow: '#e0e7ef',
  logoBlue: '#2563eb',
  logoGreen: '#34e3b0',
};

const API_BASE_URL = 'http://192.168.1.3:5000/api';

const FloatingLabelInput = ({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  editable = true,
}) => (
  <View style={styles.inputWrapper}>
    <View style={styles.labelContainer}>
      <Ionicons name={icon} size={16} color={COLORS.text} />
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <TextInput
      style={styles.textInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.muted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      editable={editable}
    />
  </View>
);

const DropdownInput = ({ icon, label, value, onSelect, options, placeholder }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (item) => {
    onSelect(item);
    setIsVisible(false);
  };

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={16} color={COLORS.text} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.dropdownText, !value && { color: COLORS.muted }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.text} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // State for displaying date (user-friendly format)
  const [dateOfBirth, setDateOfBirth] = useState('');
  // State for sending date to backend (ISO string)
  const [dobForBackend, setDobForBackend] = useState(null);
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [university, setUniversity] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [skillsOwned, setSkillsOwned] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState('');
  const [domain, setDomain] = useState('');
  const [workLinks, setWorkLinks] = useState('');
  const [achievements, setAchievements] = useState('');


  const domainOptions = [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Cybersecurity',
    'Web Development', 'Mobile Development', 'Blockchain', 'Game Development',
    'UI/UX Design', 'Cloud Computing', 'Select',
  ];

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  const universityOptions = [
    'Aditya College of Engineering',
    'Acharya Nagarjuna University',
    'Andhra University',
    'GITAM University',
    'Vignan University',
    'VIT-AP University',
    'SRM University AP',
    'K L University',
    'Amrita Vishwa Vidyapeetham',
    'Centurion University',
    'RGUKT Nuzvidu',
    'RGUKT Srikakulam',
    'JNTU Anantapur',
    'JNTU Kakinada',
    'SVU Tirupati',
    'Sree Vidyanikethan Engineering College',
    'Gayatri Vidya Parishad College of Engineering',
    'Pragati Engineering College',
    'CMR College of Engineering & Technology',
    'Vignan Institute of Technology & Science',
  ];

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      if (!userToken) {
        console.warn('No user token found. Redirecting to login.');
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/profile`, { // Corrected endpoint to /api/users/profile
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const userData = response.data;
      setName(userData.name || '');
      setEmail(userData.email || '');

      // Handle date of birth: store ISO string for backend, display locale string for UI
      if (userData.dateOfBirth) {
        const parsedDate = new Date(userData.dateOfBirth);
        if (!isNaN(parsedDate.getTime())) { // Check if the date is valid
          setDobForBackend(parsedDate.toISOString()); // Store ISO string
          setDateOfBirth(parsedDate.toLocaleDateString()); // Format for display
        } else {
          setDobForBackend(null);
          setDateOfBirth('');
        }
      } else {
        setDobForBackend(null);
        setDateOfBirth('');
      }

      setGender(userData.gender || '');
      setEducation(userData.education || '');
      setUniversity(userData.university || '');
      setLocation(userData.location || '');
      setPhoneNumber(userData.phoneNumber || '');
      setBio(userData.bio || '');
      // Ensure skillsOwned and skillsToLearn are handled correctly for display
      setSkillsOwned(userData.skillsOwned ? userData.skillsOwned.map(s => s.skill).join(', ') : '');
      setSkillsToLearn(userData.skillsToLearn ? userData.skillsToLearn.join(', ') : '');
      setDomain(userData.domain || '');
      setWorkLinks(userData.workLinks || '');
      setAchievements(userData.achievements || '');

    } catch (error) {
      console.error('Failed to fetch user profile:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  // New handler for date input to manage both display and backend formats
  const handleDateChange = (text) => {
    setDateOfBirth(text); // Always update the display string

    // Attempt to parse the user's input. Assumes MM/DD/YYYY or M/D/YYYY for parsing
    const parts = text.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      // Basic validation for ranges (you can make this more robust)
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        // Create a Date object in UTC to avoid timezone issues during conversion
        const potentialDate = new Date(Date.UTC(year, month - 1, day));
        // Check if the created date is valid and matches the input (e.g., prevent 31st of Feb)
        if (!isNaN(potentialDate.getTime()) && potentialDate.getUTCMonth() === month - 1 && potentialDate.getUTCDate() === day) {
          setDobForBackend(potentialDate.toISOString()); // Store as ISO string
          return; // Valid date, no need to proceed further
        }
      }
    }
    // If parsing failed or invalid, set dobForBackend to null
    setDobForBackend(null);
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      const userToken = await SecureStore.getItemAsync('userToken');
      if (!userToken) {
        Alert.alert('Authentication Error', 'Please log in again.');
        navigation.replace('Login');
        return;
      }

      // If dateOfBirth has text but couldn't be parsed into a valid date for backend
      if (dateOfBirth && !dobForBackend) {
        Alert.alert('Invalid Date Format', 'Please enter a valid date of birth (e.g., MM/DD/YYYY).');
        setLoading(false);
        return;
      }

      // Skills parsing for backend
      const skillsOwnedArray = skillsOwned
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(skill => ({ skill: skill, proficiency: 'Beginner' })); // Default proficiency

      const skillsToLearnArray = skillsToLearn
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');

      const updatedProfile = {
        name,
        dateOfBirth: dobForBackend, // Use the ISO string stored in dobForBackend
        gender: gender || null,
        education: education || null,
        university: university || null,
        location: location || null,
        phoneNumber: phoneNumber || null,
        bio: bio || null,
        skillsOwned: skillsOwnedArray,
        skillsToLearn: skillsToLearnArray,
        domain: domain === 'Select' ? null : domain, // Handle 'Select' option for domain
        workLinks: workLinks || null,
        achievements: achievements || null,
      };

      await axios.put(`${API_BASE_URL}/users/profile`, updatedProfile, { // Corrected endpoint to /api/users/profile
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save profile:', error.response ? error.response.data : error.message);
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        await SecureStore.deleteItemAsync('userToken');
        navigation.replace('Login');
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Removed the header View containing the back button and title, as per your previous code */}

          <FloatingLabelInput icon="person" label="Name" value={name} onChangeText={setName} />
          <FloatingLabelInput icon="mail" label="Email" value={email} editable={false} />
          {/* Use the new handleDateChange for the Date of Birth input */}
          <FloatingLabelInput
            icon="calendar"
            label="Date of Birth"
            value={dateOfBirth} // Display the formatted string
            onChangeText={handleDateChange} // Use the new handler
            placeholder="MM/DD/YYYY" // Informative placeholder for user
            keyboardType="numbers-and-punctuation" // Suggests numbers and slashes
          />
          <DropdownInput
            icon="people"
            label="Gender"
            value={gender}
            onSelect={setGender}
            options={genderOptions}
            placeholder="Select Gender"
          />
          <FloatingLabelInput icon="school" label="Education" value={education} onChangeText={setEducation} placeholder="e.g., Bachelor's Degree" />
          <DropdownInput icon="business" label="University" value={university} onSelect={setUniversity} options={universityOptions} placeholder="Select your university" />
          <FloatingLabelInput icon="location" label="Location" value={location} onChangeText={setLocation} placeholder="e.g., Visakhapatnam, India" />
          <FloatingLabelInput icon="call" label="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
          <FloatingLabelInput icon="information-circle" label="Bio" value={bio} onChangeText={setBio} placeholder="Tell us about yourself..." />

          <FloatingLabelInput
            icon="checkmark-circle"
            label="Skills Owned"
            value={skillsOwned}
            onChangeText={setSkillsOwned}
            placeholder="e.g., HTML, CSS, JavaScript"
          />
          <FloatingLabelInput
            icon="code-slash"
            label="Skills To Learn"
            value={skillsToLearn}
            onChangeText={setSkillsToLearn}
            placeholder="e.g., React Native, Python, AI"
          />

          <DropdownInput icon="briefcase" label="Domain" value={domain} onSelect={setDomain} options={domainOptions} placeholder="Select your domain" />
          <FloatingLabelInput icon="link" label="Work Links" value={workLinks} onChangeText={setWorkLinks} placeholder="e.g., GitHub, LinkedIn, Portfolio URL" />
          <FloatingLabelInput icon="trophy" label="Achievements" value={achievements} onChangeText={setAchievements} placeholder="List your achievements" />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
    paddingTop: 40,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  inputWrapper: {
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: COLORS.card,
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: COLORS.card,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  labelText: {
    marginLeft: 5,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    paddingTop: 2,
    fontFamily: 'Poppins_400Regular',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
    minHeight: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    fontFamily: 'Poppins_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    width: '85%',
    maxHeight: '70%',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: COLORS.text,
    fontFamily: 'Poppins_700Bold',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.shadow,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: 'Poppins_400Regular',
  },
  closeButton: {
    backgroundColor: '#34e3b0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_700Bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_700Bold',
  },
});

export default EditProfileScreen;