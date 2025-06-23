import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

// --- IMPORTANT: Ensure CORRECT PATH for COLORS ---
import { COLORS } from '../screens/constants'; // Adjust this path if 'constants.js' is elsewhere

// IMPORTANT: Ensure NO SPACE AFTER http:// AND use your CURRENT LOCAL IP
const API_BASE_URL = 'http://192.168.1.2:5000/api/auth'; // <--- VERIFY THIS IP AND NO SPACE

const PROFICIENCY_OPTIONS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

const DOMAIN_OPTIONS = [
  'Select',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cybersecurity',
  'Web Development',
  'Mobile Development',
  'Blockchain',
  'Game Development',
  'UI/UX Design',
  'Cloud Computing',
];

export default function SkillsPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userToken, userId } = route.params || {};

  const [skillsOwned, setSkillsOwned] = useState([]); // Array of { skill: string, proficiency: string }
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState(''); // Proficiency for the NEW skill being added
  // --- FIX START: Ensure this state variable is correctly defined ---
  const [showProficiencyInput, setShowProficiencyInput] = useState(false); // State to control visibility of proficiency input
  // --- FIX END ---
  const [editingIndex, setEditingIndex] = useState(null);

  const [skillsToLearnList, setSkillsToLearnList] = useState([]); // Array of string skills
  const [newSkillToLearn, setNewSkillToLearn] = useState('');

  const [selectedDomain, setSelectedDomain] = useState(''); // State for domain
  const [loading, setLoading] = useState(false); // State for API call loading

  useEffect(() => {
    console.log('SkillsPage mounted.');
    console.log('Received userToken:', userToken ? 'Present' : 'Not Present');
    console.log('Received userId:', userId || 'Not Present');
    if (!userToken) {
      console.warn('SkillsPage: No userToken received. This might cause issues for API calls.');
    }
  }, []);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Add new skill owned (sets state to show proficiency input)
  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      setShowProficiencyInput(true); // Show proficiency picker for the new skill
    } else {
      Alert.alert('Input Required', 'Please enter a skill to add.');
    }
  };

  // Save proficiency for the newly entered skill
  const handleSaveProficiency = () => {
    if (newSkill.trim() && proficiency.trim()) {
      setSkillsOwned([
        ...skillsOwned,
        { skill: newSkill.trim(), proficiency: proficiency.trim() },
      ]);
      setNewSkill('');
      setProficiency('');
      setShowProficiencyInput(false); // Hide picker after saving
    } else {
      Alert.alert('Error', 'Please enter skill and select proficiency.');
    }
  };

  // Enter editing mode for an existing skill
  const handleEditSkill = (index) => {
    setEditingIndex(index);
    setProficiency(skillsOwned[index].proficiency);
    // You might also want to populate a separate input if the skill name can be edited
  };

  // Save edited proficiency for an existing skill
  const handleSaveEditedProficiency = () => {
    if (proficiency.trim()) {
      const updated = [...skillsOwned];
      updated[editingIndex].proficiency = proficiency.trim();
      setSkillsOwned(updated);
      setEditingIndex(null); // Exit editing mode
      setProficiency(''); // Clear proficiency state
    } else {
      Alert.alert('Error', 'Please select proficiency.');
    }
  };

  // Remove a skill owned
  const handleRemoveSkill = (index) => {
    Alert.alert(
      'Remove Skill',
      `Are you sure you want to remove "${skillsOwned[index].skill}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => setSkillsOwned(skillsOwned.filter((_, i) => i !== index)) }
      ]
    );
  };

  // Add skill to learn
  const handleAddSkillToLearn = () => {
    if (newSkillToLearn.trim() !== '') {
      setSkillsToLearnList([...skillsToLearnList, newSkillToLearn.trim()]);
      setNewSkillToLearn('');
    } else {
      Alert.alert('Input Required', 'Please enter a skill to learn.');
    }
  };

  // Remove skill to learn
  const handleRemoveSkillToLearn = (index) => {
    Alert.alert(
      'Remove Skill',
      `Are you sure you want to remove "${skillsToLearnList[index]}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => setSkillsToLearnList(skillsToLearnList.filter((_, i) => i !== index)) }
      ]
    );
  };

  // Handle Next button press - now sends data to backend
  const handleNext = async () => {
    if (skillsOwned.length === 0 && skillsToLearnList.length === 0 && selectedDomain === 'Select') {
      Alert.alert('Error', 'Please add at least one skill or select a domain to proceed.');
      return;
    }
    if (selectedDomain === 'Select' || !selectedDomain) { // Added check for empty string
      Alert.alert('Error', 'Please select a primary domain.');
      return;
    }

    setLoading(true);
    console.log('Attempting to save Skills, Domain, and Proficiency...');
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      };

      const response = await axios.put(
        `${API_BASE_URL}/complete-profile`,
        {
          skillsOwned: skillsOwned, // Send array of objects
          skillsToLearn: skillsToLearnList, // Send array of strings
          domain: selectedDomain,
        },
        config
      );

      console.log('Skills & Domain update success:', response.data);
      Alert.alert('Success', 'Skills and Domain saved!');

      console.log('Attempting to navigate to UploadCertificatesScreen...');
      navigation.navigate('UploadCertificatesScreen', { userToken, userId }); // Pass credentials forward

    } catch (error) {
      console.error('Skills & Domain update error:', error.response ? error.response.data : error.message);
      Alert.alert(
        'Update Failed',
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to save skills and domain. Please try again.'
      );
    } finally {
      setLoading(false);
      console.log('Skills & Domain process finished (loading reset).');
    }
  };

  const handleBack = () => {
    console.log('SkillsPage: Going back.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 38 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 36 }} />
        <Text style={styles.title}>Skills & Domain</Text>
        <Text style={styles.subtitle}>
          Showcase your expertise and chosen field.
        </Text>

        {/* Skills Owned */}
        <View style={styles.inputSection}>
          <View style={styles.inputLabelRow}>
            <MaterialIcons name="star" size={22} color={COLORS.accent} />
            <Text style={styles.inputLabel}>Skills Owned</Text>
          </View>
          {/* Add new skill input */}
          {editingIndex === null && !showProficiencyInput && ( // Use showProficiencyInput
            <View style={styles.skillAddRow}>
              <TextInput
                style={[styles.inputBox, { flex: 1, marginRight: 8 }]}
                placeholder="Add a skill"
                placeholderTextColor={COLORS.muted}
                value={newSkill}
                onChangeText={setNewSkill}
                onSubmitEditing={handleAddSkill}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddSkill}
                disabled={!newSkill.trim()}
              >
                <Icon name="plus-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
          {/* Proficiency dropdown for new skill */}
          {showProficiencyInput && editingIndex === null && ( // Use showProficiencyInput
            <View style={styles.proficiencyRow}>
              <Text style={styles.proficiencyLabel}>
                Proficiency for "{newSkill}":
              </Text>
              <View style={styles.dropdownContainer}>
                {PROFICIENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownOption,
                      proficiency === option && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => setProficiency(option)}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        proficiency === option && styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProficiency}
                disabled={!proficiency.trim()}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Edit proficiency for existing skill */}
          {editingIndex !== null && (
            <View style={styles.proficiencyRow}>
              <Text style={styles.proficiencyLabel}>
                Edit proficiency for "{skillsOwned[editingIndex].skill}":
              </Text>
              <View style={styles.dropdownContainer}>
                {PROFICIENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownOption,
                      proficiency === option && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => setProficiency(option)}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        proficiency === option && styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEditedProficiency}
                disabled={!proficiency.trim()}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* List of skills owned */}
          <View style={{ marginTop: 8 }}>
            {skillsOwned.map((item, idx) => (
              <View key={idx} style={styles.skillItemRow}>
                <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                <Text style={styles.skillText}>
                  {item.skill} <Text style={styles.skillProficiency}>({item.proficiency})</Text>
                </Text>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEditSkill(idx)}
                >
                  <Icon name="edit-2" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveSkill(idx)}
                >
                  <MaterialIcons name="close" size={20} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Skills to Learn */}
        <View style={styles.inputSection}>
          <View style={styles.inputLabelRow}>
            <MaterialIcons name="lightbulb-outline" size={22} color={COLORS.primary} />
            <Text style={styles.inputLabel}>Skills to Learn</Text>
          </View>
          {/* Add new skill to learn */}
          <View style={styles.skillAddRow}>
            <TextInput
              style={[styles.inputBox, { flex: 1, marginRight: 8 }]}
              placeholder="Add a skill to learn"
              placeholderTextColor={COLORS.muted}
              value={newSkillToLearn}
              onChangeText={setNewSkillToLearn}
              onSubmitEditing={handleAddSkillToLearn}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddSkillToLearn}
              disabled={!newSkillToLearn.trim()}
            >
              <Icon name="plus-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {/* List of skills to learn */}
          <View style={{ marginTop: 8 }}>
            {skillsToLearnList.map((skill, idx) => (
              <View key={idx} style={styles.skillItemRow}>
                <MaterialIcons name="lightbulb-outline" size={20} color={COLORS.secondary} />
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveSkillToLearn(idx)}
                >
                  <MaterialIcons name="close" size={20} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Primary Domain */}
        <View style={styles.inputSection}>
          <View style={styles.inputLabelRow}>
            <MaterialIcons name="category" size={22} color={COLORS.secondary} />
            <Text style={styles.inputLabel}>Primary Domain</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedDomain}
              onValueChange={(itemValue) => setSelectedDomain(itemValue)}
              style={styles.picker}
              dropdownIconColor={COLORS.secondary}
            >
              {DOMAIN_OPTIONS.map((domain, i) => (
                <Picker.Item key={i} label={domain} value={domain} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={28} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.card} size="small" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 26,
    paddingTop: 38,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    color: COLORS.text,
    marginBottom: 5,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginBottom: 22,
    lineHeight: 22,
    fontFamily: 'Poppins_400Regular',
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: 'Poppins_700Bold',
  },
  inputBox: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.shadow,
    padding: 10,
    minHeight: 44,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    textAlignVertical: 'top',
  },
  skillAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proficiencyRow: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.shadow,
    padding: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  proficiencyLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 8,
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  dropdownOption: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.shadow,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 6,
  },
  dropdownOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dropdownOptionText: {
    color: COLORS.text,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  dropdownOptionTextSelected: {
    color: COLORS.card,
    fontFamily: 'Poppins_700Bold',
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    alignSelf: 'flex-end',
  },
  saveBtnText: {
    color: COLORS.card,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  skillItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.shadow,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  skillText: {
    marginLeft: 8,
    fontFamily: 'Poppins_400Regular',
    color: COLORS.text,
    fontSize: 15,
    flex: 1,
  },
  skillProficiency: {
    color: COLORS.muted,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  editBtn: {
    marginLeft: 8,
    padding: 4,
  },
  removeBtn: {
    marginLeft: 4,
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
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
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonText: {
    color: COLORS.card,
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  pickerWrapper: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.shadow,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: 44,
    width: '100%',
    color: COLORS.text,
    fontFamily: 'Poppins_400Regular',
  },
});
