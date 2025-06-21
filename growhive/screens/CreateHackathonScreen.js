// Path: Backend/Frontend/screens/CreateHackathonScreen.js

import React, { useState, useEffect } from 'react'; // Added useEffect
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { COLORS } from './constants';
import hackathonService from '../services/hackathonServices';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function CreateHackathonScreen() {
    const navigation = useNavigation();

    // State for the current user's ID (the creator)
    const [currentUserId, setCurrentUserId] = useState(null); // Initialize as null

    // Existing fields
    const [title, setTitle] = useState('');
    const [org, setOrg] = useState(''); // Organizer
    const [desc, setDesc] = useState(''); // Description
    const [color, setColor] = useState('#6A5ACD'); // Default color, can be made selectable
    const [icon, setIcon] = useState('💡'); // Default icon, can be made selectable
    const [btnColor, setBtnColor] = useState('#3366ff'); // Default button color

    // NEW FIELDS
    const [date, setDate] = useState(''); // e.g., "July 25, 2024" or "2024-07-25"
    const [location, setLocation] = useState('');
    const [roomLimit, setRoomLimit] = useState(''); // Will be converted to Number
    const [rolesWanted, setRolesWanted] = useState(''); // Comma-separated string e.g., "Frontend, Backend, Design"

    const [loading, setLoading] = useState(false);

    let [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_700Bold,
        Poppins_600SemiBold,
    });

    // --- NEW: Fetch user ID from AsyncStorage on component mount ---
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                // Assuming you store the user ID directly or within a token
                const userId = await AsyncStorage.getItem('userId'); // or 'userToken', then parse it if it's a JWT
                if (userId) {
                    setCurrentUserId(userId);
                    console.log('Fetched currentUserId from AsyncStorage:', userId);
                } else {
                    console.warn('User ID not found in AsyncStorage. Hackathon creator will be missing!');
                    Alert.alert('Authentication Warning', 'Could not find your user ID. Hackathon might not be correctly associated.');
                }
            } catch (error) {
                console.error('Error fetching user ID from AsyncStorage:', error);
                Alert.alert('Error', 'Failed to retrieve user data for hackathon creation.');
            }
        };
        fetchUserId();
    }, []); // Run once on component mount
    // -------------------------------------------------------------

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.logoBlue} />
                <Text style={styles.loadingText}>Loading Fonts...</Text>
            </View>
        );
    }

    const handleCreateHackathon = async () => {
        // Basic validation
        if (!title || !org || !desc || !date || !location || !roomLimit || !rolesWanted) {
            Alert.alert('Missing Fields', 'Please fill in all hackathon details.');
            return;
        }
        if (isNaN(roomLimit) || parseInt(roomLimit) <= 0) {
            Alert.alert('Invalid Input', 'Room Limit must be a positive number.');
            return;
        }
        // --- NEW: Check if currentUserId is available ---
        if (!currentUserId) {
            Alert.alert('Authentication Required', 'Cannot create hackathon without a logged-in user. Please log in again.');
            console.error('Creator ID is missing during hackathon creation attempt.');
            return;
        }
        // --------------------------------------------------

        setLoading(true);
        try {
            const hackathonData = {
                title,
                org,
                desc,
                date,
                location,
                roomLimit: parseInt(roomLimit), // Convert to number
                rolesWanted: rolesWanted.split(',').map(role => role.trim()).filter(role => role), // Split and trim roles
                color,
                icon,
                btnColor,
                // --- NEW: Include creatorId in the payload ---
                creator: currentUserId, // Backend should save this as a reference to the User model
                // ---------------------------------------------
                // avatars and participants are handled by the backend
            };

            console.log('Attempting to create hackathon with data:', hackathonData);
            const response = await hackathonService.createHackathon(hackathonData); // Capture response for better logging
            console.log('Hackathon creation API response:', response); // Log the full response

            Alert.alert('Success', 'Hackathon created successfully!');
            navigation.goBack(); // Go back to Hackathons list
        } catch (error) {
            console.error('Error creating hackathon:', error.message);
            // --- NEW: Log more details if available ---
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            // -------------------------------------------
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to create hackathon. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>Create New Hackathon</Text>

                {/* Hackathon Name (Title) */}
                <Text style={styles.inputLabel}>Hackathon Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., CodeFest 2025"
                    placeholderTextColor={COLORS.muted}
                    value={title}
                    onChangeText={setTitle}
                    editable={!loading}
                />

                {/* Organizer */}
                <Text style={styles.inputLabel}>Organizer</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Google, GrowHive"
                    placeholderTextColor={COLORS.muted}
                    value={org}
                    onChangeText={setOrg}
                    editable={!loading}
                />

                {/* Description */}
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="A brief description of the hackathon..."
                    placeholderTextColor={COLORS.muted}
                    value={desc}
                    onChangeText={setDesc}
                    multiline
                    numberOfLines={4}
                    editable={!loading}
                />

                {/* NEW FIELD: Date */}
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., July 25, 2024 or 2024-07-25"
                    placeholderTextColor={COLORS.muted}
                    value={date}
                    onChangeText={setDate}
                    editable={!loading}
                />

                {/* NEW FIELD: Location */}
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Virtual, New York, Event Hall A"
                    placeholderTextColor={COLORS.muted}
                    value={location}
                    onChangeText={setLocation}
                    editable={!loading}
                />

                {/* NEW FIELD: Room Limit */}
                <Text style={styles.inputLabel}>Room Limit (Max Participants)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., 50, 100"
                    placeholderTextColor={COLORS.muted}
                    value={roomLimit}
                    onChangeText={setRoomLimit}
                    keyboardType="numeric"
                    editable={!loading}
                />

                {/* NEW FIELD: Roles Wanted */}
                <Text style={styles.inputLabel}>Roles Wanted (comma-separated)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g., Frontend Dev, Backend Dev, UI/UX Designer"
                    placeholderTextColor={COLORS.muted}
                    value={rolesWanted}
                    onChangeText={setRolesWanted}
                    multiline
                    numberOfLines={3}
                    editable={!loading}
                />

                {/* You can add UI for color and icon selection later if desired */}
                {/* For now, they are hardcoded defaults in useState */}

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateHackathon}
                    disabled={loading || !currentUserId} // Disable if loading or userId is not available
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.createButtonText}>Create Hackathon</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.backButtonText}>Back to Hackathons</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        fontFamily: 'Poppins_400Regular',
        marginTop: 10,
        color: COLORS.textGray,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
        alignItems: 'center',
    },
    header: {
        fontSize: 26,
        fontFamily: 'Poppins_700Bold',
        color: COLORS.darkGray,
        marginBottom: 30,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: COLORS.darkGray,
        alignSelf: 'flex-start',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 10,
        backgroundColor: '#fff',
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: COLORS.textGray,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    createButton: {
        backgroundColor: COLORS.logoGreen,
        width: '100%',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
        shadowColor: COLORS.logoGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
    },
    backButton: {
        marginTop: 20,
        padding: 15,
        width: '100%',
        alignItems: 'center',
    },
    backButtonText: {
        color: COLORS.logoBlue,
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
});