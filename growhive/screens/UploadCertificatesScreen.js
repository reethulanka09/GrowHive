import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../screens/constants'; // Make sure this path is correct
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useFonts, Poppins_700Bold, Poppins_600SemiBold, Poppins_400Regular } from '@expo-google-fonts/poppins';
import axios from 'axios';

// IMPORTANT: Ensure NO SPACE AFTER http:// AND use your CURRENT LOCAL IP
const API_BASE_URL = 'http://192.168.10.149:5000'; // Base URL for the backend (no /api/auth here)
// The upload endpoint will be API_BASE_URL/api/upload/certificates

export default function UploadCertificatesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userToken, userId } = route.params || {};

  const [selectedFiles, setSelectedFiles] = useState([]); // To store selected file objects
  const [workLinks, setWorkLinks] = useState('');
  const [achievements, setAchievements] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Poppins_400Regular,
  });

  useEffect(() => {
    console.log('UploadCertificatesScreen mounted.');
    console.log('Received userToken:', userToken ? 'Present' : 'Not Present');
    console.log('Received userId:', userId || 'Not Present');
    if (!userToken) {
      console.warn('UploadCertificatesScreen: No userToken received. This might cause issues for API calls.');
    }

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Restrict to PDF for certificates
        multiple: true, // Allow multiple file selection
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(prevFiles => {
          const newFiles = result.assets.filter(
            (newFile) => !prevFiles.some((existingFile) => existingFile.uri === newFile.uri)
          );
          return [...prevFiles, ...newFiles];
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'There was an error selecting the document.');
    }
  };

  const removeFile = (uriToRemove) => {
    Alert.alert(
      "Remove File",
      "Are you sure you want to remove this file from the list?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => setSelectedFiles(prevFiles => prevFiles.filter(file => file.uri !== uriToRemove)) }
      ]
    );
  };

  const handleUploadAndFinish = async () => {
    if (!workLinks.trim() || !achievements.trim()) {
      Alert.alert('Error', 'Please fill in Work Links and Achievements.');
      return;
    }

    setLoading(true);
    console.log('Starting upload and profile update...');

    try {
      // 1. Upload Certificates (if any)
      let uploadedCertificatesData = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
          // Append each file with a 'certificates' field name
          formData.append('certificates', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/pdf', // Ensure mimeType is sent
          });
        });

        console.log('Sending files to backend...');
        const uploadResponse = await axios.post(
          `${API_BASE_URL}/api/upload/certificates`, // NEW DEDICATED UPLOAD ENDPOINT
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data', // Crucial for file uploads
              'Authorization': `Bearer ${userToken}`,
            },
          }
        );
        uploadedCertificatesData = uploadResponse.data.uploadedFiles;
        console.log('Files uploaded successfully:', uploadedCertificatesData);
        Alert.alert('Upload Success', 'Certificates uploaded!');
      }

      // 2. Update Work Links and Achievements (and potentially certificate URLs) via complete-profile
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      };

      const profileUpdatePayload = {
        workLinks,
        achievements,
      };

      // If certificates were uploaded, send their metadata to be saved in user profile
      // Note: The backend 'complete-profile' endpoint will append/replace based on how you handle it.
      // My backend 'completeProfile' currently appends to the array.
      if (uploadedCertificatesData.length > 0) {
        // Here you might need to *fetch existing certificates first* if you want to append,
        // or ensure your backend merge logic is robust.
        // For simplicity, we assume the backend (uploadController) handles adding them directly.
        // The /complete-profile endpoint now simply ensures text fields are updated.
        // The certificate update is implicitly done by the upload endpoint.
        console.log('Work Links & Achievements update: no certificates array sent via complete-profile, handled by upload endpoint');
      }

      const profileUpdateResponse = await axios.put(
        `${API_BASE_URL}/api/auth/complete-profile`, // Existing profile update endpoint
        profileUpdatePayload,
        config
      );

      console.log('Work Links & Achievements update success:', profileUpdateResponse.data);
      Alert.alert('Success', 'Profile details saved! You are all set.');

      console.log('Navigating to MainTabs (Dashboard)...');
      navigation.navigate('MainTabs');

    } catch (error) {
      console.error('Upload/Profile update error:', error.response ? (error.response.data || error.response.statusText) : error.message);
      Alert.alert(
        'Setup Failed',
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : `Failed to complete setup. ${error.message}`
      );
    } finally {
      setLoading(false);
      console.log('Upload Certificates process finished (loading reset).');
    }
  };

  const handleBack = () => {
    console.log('UploadCertificatesScreen: Going back.');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: keyboardVisible ? 200 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Upload Certificates</Text>
        <Text style={styles.catchyTag}>Showcase your skills and achievements—upload your certificates now!</Text>

        {/* Upload Box */}
        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument} disabled={loading}>
          <AntDesign name="cloudupload" size={36} color={COLORS.primary} />
          <Text style={styles.uploadText}>
            {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Please upload in .pdf'}
          </Text>
        </TouchableOpacity>

        {selectedFiles.length > 0 && (
          <View style={styles.fileListContainer}>
            <Text style={styles.fileListHeader}>Selected Files:</Text>
            <FlatList
              data={selectedFiles}
              keyExtractor={(item) => item.uri}
              renderItem={({ item }) => (
                <View style={styles.fileItem}>
                  <MaterialIcons name="insert-drive-drive-file" size={20} color={COLORS.text} />
                  <Text style={styles.fileName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => removeFile(item.uri)} style={styles.removeFileButton}>
                    <AntDesign name="closecircleo" size={16} color={COLORS.muted} />
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Work Links */}
        <Text style={styles.label}>Work Links</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste your work links here"
          placeholderTextColor={COLORS.muted}
          value={workLinks}
          onChangeText={setWorkLinks}
          editable={!loading}
        />

        {/* Achievements */}
        <Text style={styles.label}>Achievements</Text>
        <TextInput
          style={[styles.input, styles.achievementsInput]}
          placeholder="Enter your achievements"
          placeholderTextColor={COLORS.muted}
          value={achievements}
          onChangeText={setAchievements}
          multiline
          textAlignVertical="top"
          editable={!loading}
        />

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={loading}>
            <MaterialIcons name="arrow-back" size={28} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleUploadAndFinish} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.card} size="small" />
            ) : (
              <Text style={styles.buttonText}>Finish Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  heading: {
    fontSize: 26,
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: 'Poppins_700Bold',
    marginTop: 50,
  },
  catchyTag: {
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.secondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
  },
  uploadBox: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'column',
    gap: 8,
  },
  uploadText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginTop: 8,
  },
  label: {
    color: COLORS.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 6,
    marginTop: 12,
    fontSize: 16,
  },
  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.shadow,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    marginBottom: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  achievementsInput: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  fileListContainer: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  fileListHeader: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text,
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.shadow,
  },
  fileName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: COLORS.text,
  },
  removeFileButton: {
    padding: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.shadow,
    elevation: 1,
  },
  nextButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.card,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
});
