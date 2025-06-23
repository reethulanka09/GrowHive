// Path: Backend/Frontend/screens/HackathonsStackScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import styles from './HackathonStyles'; // Ensure this path is correct
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { COLORS } from './constants'; // Ensure this path is correct
import hackathonApi from '../api/hackathonapi'; // Ensure this path is correct
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const HackathonsStackScreen = ({ navigation }) => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for Create Hackathon Modal (note: the FAB now navigates to CreateHackathonScreen, this modal logic might be redundant if not used elsewhere)
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💡');
  const [color, setColor] = useState('#FFD700');
  // Note: The fields below are duplicated from CreateHackathonScreen. They are only relevant if you use THIS modal for creation.
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [roomLimit, setRoomLimit] = useState('');
  const [rolesWanted, setRolesWanted] = useState('');
  // --- IMPORTANT: Dynamically get creatorId from AsyncStorage ---
  const [creatorId, setCreatorId] = useState(null); // Initialize as null, will be set from AsyncStorage

  // NEW STATES for Join Request Modal
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [sendingJoinRequest, setSendingJoinRequest] = useState(false);


  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  // --- NEW: Fetch creatorId from AsyncStorage on component mount ---
  useEffect(() => {
    const getUserId = async () => {
      try {
        // Debug: log all AsyncStorage contents
        const allKeys = await AsyncStorage.getAllKeys();
        const allItems = await AsyncStorage.multiGet(allKeys);
        console.log('AsyncStorage contents:', allItems);

        // const id = await AsyncStorage.getItem('userId');
        const id = 12312;
        if (id) {
          setCreatorId(id.toString());
          console.log('HackathonsStackScreen: Fetched creatorId from AsyncStorage:', id);
        } else {
          console.warn('HackathonsStackScreen: User ID not found in AsyncStorage. My Hackathons filter may not work.');
          Alert.alert(
            'User Not Found',
            'Could not find your user ID. Please log in again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Optionally, navigate to login screen
                  // navigation.navigate('Login');
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error('HackathonsStackScreen: Error fetching user ID from AsyncStorage:', error);
        Alert.alert('Error', 'Failed to load user information. Please restart the app.');
      }
    };
    getUserId();
  }, []); // Run once on component mount
  // -------------------------------------------------------------


  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await hackathonApi.get('/hackathons');
      setHackathons(response.data);
      console.log('Fetched ALL Hackathons Data:', response.data); // Log all data
      // Example of logging specific data from a hackathon for debugging the 'creator' field
      if (response.data.length > 0) {
        response.data.forEach((h, index) => {
          console.log(`Hackathon ${index}: Title="${h.title}", Creator="${h.creator}", Creator Type="${typeof h.creator}"`);
          if (h.creator && typeof h.creator === 'object' && h.creator._id) {
            console.log(`  -> Creator ID from object: ${h.creator._id}`);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      Alert.alert('Error', 'Failed to fetch hackathons.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Only fetch hackathons once creatorId is available
  useEffect(() => {
    if (creatorId) { // Only fetch if creatorId is set
      console.log('Frontend Creator ID (state in HackathonsStackScreen):', creatorId);
      fetchHackathons();
    }
  }, [fetchHackathons, creatorId]); // Re-run when creatorId changes (i.e., when it's first loaded)

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHackathons();
  }, [fetchHackathons]);

  // This handleCreateHackathon function is for the MODAL within THIS file,
  // which seems to be bypassed by the FAB navigation.
  // If you're using the separate CreateHackathonScreen, this can be removed or ignored.
  const handleCreateHackathon = async () => {
    if (!title || !description || !date || !location || !roomLimit || !rolesWanted) {
      Alert.alert('Missing Info', 'Please fill in all hackathon fields!');
      return;
    }

    setLoading(true);
    try {
      const newHackathon = {
        title,
        desc: description,
        icon,
        color,
        org: 'Your Org', // This should probably be dynamic based on the creator's org
        date,
        location,
        roomLimit: parseInt(roomLimit),
        rolesWanted: rolesWanted.split(',').map(role => role.trim()),
        creator: creatorId, // Use the dynamically loaded creatorId
        participants: [], // New hackathons start with no participants
        avatars: [], // Avatars will be populated from accepted participants
        btnColor: COLORS.logoGreen,
      };
      console.log('Attempting to create hackathon via internal modal with:', newHackathon);
      await hackathonApi.post('/hackathons', newHackathon);
      setCreateModalVisible(false); // Close create modal
      fetchHackathons(); // Refresh the list
      Alert.alert('Success', 'Hackathon created successfully!');
      // Clear form
      setTitle('');
      setDescription('');
      setIcon('💡');
      setColor('#FFD700');
      setDate('');
      setLocation('');
      setRoomLimit('');
      setRolesWanted('');
    } catch (error) {
      console.error('Error creating hackathon via internal modal:', error);
      Alert.alert('Error', `Failed to create hackathon: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinNow = (hackathon) => {
    // --- NEW: Check for creatorId before proceeding ---
    if (!creatorId) {
      Alert.alert('Authentication Required', 'Please log in to join hackathons.');
      return;
    }
    // ----------------------------------------------------

    // Check if the current user is the creator
    if (hackathon.creator && hackathon.creator.toString() === creatorId.toString()) {
      Alert.alert('Cannot Join', 'You are the creator of this hackathon.');
      return;
    }

    // Check if the user already has a pending or accepted status
    // Ensure hackathon.participants and p.user exist before accessing properties
    const existingParticipantStatus = hackathon.participants?.find(
      p => p.user && p.user.toString() === creatorId.toString()
    )?.status;


    if (existingParticipantStatus === 'accepted') {
      Alert.alert('Already Joined', 'You are already an accepted participant in this hackathon!');
      return;
    } else if (existingParticipantStatus === 'pending') {
      Alert.alert('Request Pending', 'You already have a pending join request for this hackathon. Please wait for the creator to approve it.');
      return;
    }

    // If no existing status, or if it was 'rejected', open the modal
    setSelectedHackathon(hackathon);
    setJoinRequestMessage(''); // Clear previous message
    setJoinModalVisible(true); // Open the join request modal
  };

  const submitJoinRequest = async () => {
    if (!selectedHackathon || !creatorId) return; // Ensure creatorId is available

    setSendingJoinRequest(true);
    try {
      await hackathonApi.post(`/hackathons/${selectedHackathon._id}/request-join`, {
        message: joinRequestMessage,
        userId: creatorId // Pass the dynamically loaded creatorId
      });

      setJoinModalVisible(false);
      setJoinRequestMessage('');
      setSelectedHackathon(null);
      fetchHackathons(); // Refresh list to show updated status (e.g., "Request Pending")
      Alert.alert('Join Request Sent', `Your request to join "${selectedHackathon.title}" has been sent. The creator will be notified.`);

    } catch (error) {
      console.error('Error sending join request:', error.response?.data?.message || error.message || error);
      Alert.alert('Error', `Failed to send join request: ${error.response?.data?.message || 'Unknown error'}`);
    } finally {
      setSendingJoinRequest(false);
    }
  };


  const renderHackathonCard = (h) => {
    // Check if creatorId is null (not yet loaded) or if h.creator is missing/invalid
    if (!creatorId || !h.creator) {
      console.log(`Skipping render for hackathon ${h.title} due to missing creatorId or h.creator:`, { creatorId, hCreator: h.creator });
      return null; // Don't render if creatorId is not loaded or h.creator is missing
    }

    // Ensure h.creator is a string or has an _id for comparison
    const hackathonCreatorId = typeof h.creator === 'object' && h.creator !== null && h.creator._id
      ? h.creator._id.toString()
      : h.creator.toString(); // Fallback if it's already a string ID

    const isCreator = hackathonCreatorId === creatorId.toString();

    const currentUserParticipant = h.participants?.find( // Use optional chaining for safety
      (p) => p.user && p.user._id && p.user._id.toString() === creatorId.toString()
    );

    const isAcceptedParticipant = currentUserParticipant?.status === 'accepted';
    const hasPendingRequest = currentUserParticipant?.status === 'pending';
    // const isParticipating = isAcceptedParticipant || hasPendingRequest; // This variable is not used below, so removed for clarity


    // Determine avatars to display (if participants array is populated correctly from backend)
    const displayAvatars = (h.participants || [])
      .filter(p => p.status === 'accepted' && p.user && p.user.avatar) // Only show accepted participants' avatars
      .slice(0, 3)
      .map(p => p.user.avatar); // Assuming 'avatar' is a field in the populated user object

    const acceptedParticipantsCount = (h.participants || []).filter(p => p.status === 'accepted').length;


    return (
      <View key={h._id} style={styles.card}>
        <View style={styles.topContentRow}>
          <View style={styles.leftColumn}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBox, { backgroundColor: h.color }]}>
                <Text style={styles.iconText}>{h.icon}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{h.title}</Text>
            </View>
            <Text style={styles.cardSubTitle}>by {h.org}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>🗓️ {h.date}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.infoText}>📍 {h.location}</Text>
            </View>
            <Text style={styles.cardDesc} numberOfLines={1}>
              {h.desc}
            </Text>
          </View>
          <View style={styles.rightColumn}>
            <Text style={styles.rolesHeader}>Roles Needed:</Text>
            {h.rolesWanted && h.rolesWanted.length > 0 ? (
              <Text style={styles.rolesWantedText} numberOfLines={4}>
                {h.rolesWanted.join(', ')}
              </Text>
            ) : (
              <Text style={styles.rolesWantedText}>N/A</Text>
            )}
          </View>
        </View>

        <View style={styles.participantsRow}>
          <View style={styles.avatarGroup}>
            {displayAvatars.map((avatarUri, idx) => (
              <Image key={idx} source={{ uri: avatarUri }} style={styles.avatar} />
            ))}
            {displayAvatars.length < acceptedParticipantsCount && (
              <View style={styles.moreAvatars}>
                <Text style={styles.moreAvatarsText}>+{acceptedParticipantsCount - displayAvatars.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.participantsCountText}>
            {acceptedParticipantsCount} joined
          </Text>

          {isCreator ? (
            <View style={[styles.joinBtn, styles.participatingStatus, { backgroundColor: COLORS.logoBlue }]}>
              <Text style={styles.joinBtnText}>My Hackathon</Text>
            </View>
          ) : isAcceptedParticipant ? (
            <View style={[styles.joinBtn, styles.participatingStatus, { backgroundColor: COLORS.green }]}>
              <Text style={styles.joinBtnText}>Participating</Text>
            </View>
          ) : hasPendingRequest ? (
            <View style={[styles.joinBtn, styles.participatingStatus, { backgroundColor: COLORS.orange }]}>
              <Text style={styles.joinBtnText}>Request Pending</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.joinBtn, { backgroundColor: h.btnColor }]}
              onPress={() => handleJoinNow(h)} // This now opens the modal
            >
              <Text style={styles.joinBtnText}>Join Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>GrowHive</Text>
          {/* The notification bell here might navigate to the NotificationsScreen */}
          <TouchableOpacity
            style={styles.notificationBell}
            onPress={() => navigation.navigate('Notifications')} // Assuming 'Notifications' is your screen name in navigation
          >
            <MaterialIcons name="notifications" size={24} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        <View style={styles.someContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1669023414162-5bb06bbff0ec?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
            style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }}
            resizeMode="cover"
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>My Hackathons</Text>
          {loading || !creatorId ? ( // Show loader if still loading or creatorId not available
            <ActivityIndicator size="large" color={COLORS.logoBlue} />

          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
              {hackathons.filter(h => {
                // Added console log for debugging the filter
                const hackathonCreatorId = typeof h.creator === 'object' && h.creator !== null && h.creator._id
                  ? h.creator._id.toString()
                  : h.creator?.toString(); // Use optional chaining for safety

                const match = hackathonCreatorId === creatorId.toString();
                console.log(`Filtering: Hackathon "${h.title}" (Creator: ${hackathonCreatorId}) vs Current User (${creatorId}) - Match: ${match}`);
                return match;
              }).length > 0 ? (
                hackathons.filter(h => {
                  const hackathonCreatorId = typeof h.creator === 'object' && h.creator !== null && h.creator._id
                    ? h.creator._id.toString()
                    : h.creator?.toString();
                  return hackathonCreatorId === creatorId.toString();
                }).map(renderHackathonCard)
              ) : (
                <Text style={styles.noHackathonsText}>You haven't created any hackathons yet.</Text>
              )}
            </ScrollView>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Other Hackathons</Text>
          {loading || !creatorId ? (
            <ActivityIndicator size="large" color={COLORS.logoBlue} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
              {hackathons.filter(h => {
                const hackathonCreatorId = typeof h.creator === 'object' && h.creator !== null && h.creator._id
                  ? h.creator._id.toString()
                  : h.creator?.toString();
                return hackathonCreatorId !== creatorId.toString();
              }).length > 0 ? (
                hackathons.filter(h => {
                  const hackathonCreatorId = typeof h.creator === 'object' && h.creator !== null && h.creator._id
                    ? h.creator._id.toString()
                    : h.creator?.toString();
                  return hackathonCreatorId !== creatorId.toString();
                }).map(renderHackathonCard)
              ) : (
                <Text style={styles.noHackathonsText}>No other hackathons available.</Text>
              )}
            </ScrollView>
          )}
        </View>

      </ScrollView>

      {/* FAB Button - navigates to the dedicated CreateHackathonScreen */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateHackathon')}>
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Create Hackathon Modal - This modal's logic (and its handleCreateHackathon)
                is likely redundant since the FAB navigates to a separate screen.
                Consider removing it if not used. */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Hackathon</Text>
            <TextInput
              style={styles.input}
              placeholder="Hackathon Title"
              placeholderTextColor={COLORS.muted}
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor={COLORS.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (e.g.,YYYY-MM-DD)"
              placeholderTextColor={COLORS.muted}
              value={date}
              onChangeText={setDate}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Location (e.g., Virtual, City)"
              placeholderTextColor={COLORS.muted}
              value={location}
              onChangeText={setLocation}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Room Limit (e.g., 50)"
              placeholderTextColor={COLORS.muted}
              value={roomLimit}
              onChangeText={setRoomLimit}
              keyboardType="numeric"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Roles Wanted (comma-separated, e.g., FE,BE,UX)"
              placeholderTextColor={COLORS.muted}
              value={rolesWanted}
              onChangeText={setRolesWanted}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleCreateHackathon} // This is the modal's internal create function
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Create Hackathon</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NEW: Join Request Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={joinModalVisible}
        onRequestClose={() => {
          setJoinModalVisible(false);
          setSelectedHackathon(null);
          setJoinRequestMessage('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join {selectedHackathon?.title || 'Hackathon'}</Text>
            <Text style={styles.modalSubtitle}>Tell the creator why you want to join:</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} // Adjusted for multiline
              placeholder="Your message..."
              placeholderTextColor={COLORS.muted}
              value={joinRequestMessage}
              onChangeText={setJoinRequestMessage}
              multiline
              numberOfLines={4}
              editable={!sendingJoinRequest}
            />
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: COLORS.logoGreen }]}
              onPress={submitJoinRequest}
              disabled={sendingJoinRequest}
            >
              {sendingJoinRequest ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Submit Join Request</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setJoinModalVisible(false);
                setSelectedHackathon(null);
                setJoinRequestMessage('');
              }}
              disabled={sendingJoinRequest}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HackathonsStackScreen;