// Path: HackathonsNotifications.js

import React, { useState, useEffect, useCallback } from 'react'; // Added useState, useEffect, useCallback
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Added useFocusEffect
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { COLORS } from './constants';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator, // For loading state
  Alert // For error handling
} from 'react-native';

export default function HackathonsNotificationsScreen() {
  const navigation = useNavigation();

  // State for notifications data
  const [notifications, setNotifications] = useState({
    Today: [],
    'Last 7 days': [],
    'Last 30 days': [],
  });
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);

  // Load fonts
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  // --- Data Fetching Logic ---
  const fetchHackathonNotifications = useCallback(async () => {
    setIsLoading(true); // Start loading
    setError(null);    // Clear any previous errors

    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://192.168.10.149/hackathon-notifications');
      if (!response.ok) {
        // Handle HTTP errors
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Assuming your backend returns data in a structured format
      // like the static 'hackathonNotifications' object.
      // If it returns a flat array, you'll need to process it into sections.
      const organizedData = organizeNotificationsIntoSections(data); // Implement this helper function
      setNotifications(organizedData);

    } catch (err) {
      console.error("Failed to fetch hackathon notifications:", err);
      setError("Failed to load hackathon notifications. Please try again later.");
      Alert.alert("Error", "Could not load notifications. Check your internet connection or try again.");
    } finally {
      setIsLoading(false); // End loading
    }
  }, []); // Empty dependency array means this function is created once

  // Function to organize flat data into sections (if your API returns a flat array)
  const organizeNotificationsIntoSections = (rawData) => {
    const today = [];
    const last7Days = [];
    const last30Days = [];
    const now = new Date();

    rawData.forEach(item => {
      const itemDate = new Date(item.timestamp); // Assuming 'timestamp' field from API
      const diffTime = Math.abs(now - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) { // Within today (or past 24 hours)
        today.push(item);
      } else if (diffDays <= 7) {
        last7Days.push(item);
      } else if (diffDays <= 30) {
        last30Days.push(item);
      }
      // You might want a 'Older' category for anything beyond 30 days
    });

    return {
      Today: today,
      'Last 7 days': last7Days,
      'Last 30 days': last30Days,
    };
  };

  // --- Lifecycle Hooks ---

  // Fetch data when the component first mounts
  useEffect(() => {
    if (fontsLoaded) { // Only fetch if fonts are loaded, or handle font loading differently
      fetchHackathonNotifications();
    }
  }, [fontsLoaded, fetchHackathonNotifications]); // Rerun if fonts change (or remove fontsLoaded if you load them globally)

  // Re-fetch data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchHackathonNotifications();
      // Optional: return a cleanup function if needed
      return () => {
        // For example, if you have listeners or subscriptions
      };
    }, [fetchHackathonNotifications])
  );

  // Function to handle action button presses
  const handleActionPress = (action, notificationType, notificationId) => {
    console.log(`Action: ${action}, Type: ${notificationType}, ID: ${notificationId}`);
    // Implement specific logic based on action and notification type
    // This will likely involve making another API call to update the notification status
    // and then re-fetching the notifications to update the UI.

    if (action === 'Accept' && notificationType === 'team_invite') {
      Alert.alert('Success', 'Team invite accepted!');
      // TODO: Call API to accept invite, then:
      // fetchHackathonNotifications(); // Re-fetch to update UI
    } else if (action === 'Decline' && notificationType === 'team_invite') {
      Alert.alert('Declined', 'Team invite declined.');
      // TODO: Call API to decline invite, then:
      // fetchHackathonNotifications(); // Re-fetch to update UI
    } else if (action === 'View Hackathon') {
      // Navigate to hackathon detail screen (assuming you have one)
      navigation.navigate('HackathonDetailScreen', { hackathonId: notificationId });
    }
    // Add more conditions as needed for other action types
  };

  if (!fontsLoaded) {
    return <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading Fonts...</Text>;
  }

  if (error) {
    return (
      <View style={styles.centeredMessage}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHackathonNotifications}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Custom header with shadow */}
      <View style={styles.customHeader}>
        <Ionicons
          name="chevron-back"
          size={28}
          color={COLORS.primary}
          onPress={() => navigation.goBack()}
          style={{ paddingRight: 10 }}
        />
        <Text style={styles.headerTitle}>Hackathon Requests</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container}>
        {Object.entries(notifications).map(([section, items]) => (
          // Only render section if there are items in it
          items.length > 0 && (
            <View key={section}>
              <Text style={styles.sectionTitle}>{section}</Text>
              {items.map((item) => (
                <View key={item.id} style={styles.notificationRow}>
                  <Image source={item.avatar || require('../assets/user.png')} style={styles.avatar} /> {/* Fallback avatar */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.message}>
                      <Text style={styles.username}>{item.user} </Text>
                      {item.message}
                    </Text>
                    <Text style={styles.time}>{item.time}</Text> {/* Assuming 'time' comes from API or derived */}
                  </View>
                  {item.actions?.map((action) => (
                    <TouchableOpacity
                      key={action}
                      style={[
                        styles.actionButton,
                        action === 'Accept' ? styles.acceptAction :
                          action === 'Decline' ? styles.declineAction :
                            styles.defaultAction,
                      ]}
                      onPress={() => handleActionPress(action, item.type, item.id)}
                    >
                      <Text
                        style={[
                          styles.actionText,
                          action === 'Decline' && { color: COLORS.text },
                          action === 'Accept' && { color: COLORS.white },
                        ]}
                      >
                        {action}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )
        ))}
        {Object.values(notifications).every(arr => arr.length === 0) && !isLoading && !error && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color={COLORS.muted} />
            <Text style={styles.emptyStateText}>No hackathon requests found.</Text>
            <Text style={styles.emptyStateSubText}>
              Check back later for new invitations or team requests!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  headerTitle: {
    color: COLORS.secondary,
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: COLORS.secondary,
    marginBottom: 8,
    marginTop: 15,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  message: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
  username: {
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text,
  },
  time: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptAction: {
    backgroundColor: COLORS.success,
  },
  declineAction: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  defaultAction: {
    backgroundColor: COLORS.primary,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: COLORS.muted,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text,
    marginTop: 15,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
  }
});