// Path: Backend/Frontend/screens/NotificationsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // For refetching when screen is focused
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { COLORS } from './constants';
import hackathonApi from '../api/hackathonapi';
// Assuming you have a shared styles file or access to base styles
import commonStyles from './HackathonStyles'; // Import common styles

// This ID should eventually come from authenticated user data
const CURRENT_USER_ID = '666f20c15d48227091694503'; // REPLACE with a real creator's ID you're using for testing

const NotificationsScreen = ({ navigation }) => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingRequest, setProcessingRequest] = useState(false); // To disable buttons during API call

    const [fontsLoaded] = useFonts({
        Poppins_700Bold,
        Poppins_400Regular,
        Poppins_600SemiBold,
    });

    const fetchPendingRequests = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch requests for the current user (as creator)
            const response = await hackathonApi.get(`/hackathons/my-requests/${CURRENT_USER_ID}`);
            setPendingRequests(response.data);
            console.log('Fetched Pending Requests:', response.data);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            Alert.alert('Error', 'Failed to fetch join requests.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Use useFocusEffect to refetch data whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchPendingRequests();
        }, [fetchPendingRequests])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPendingRequests();
    }, [fetchPendingRequests]);

    const handleUpdateRequestStatus = async (hackathonId, requestId, status) => {
        setProcessingRequest(true);
        try {
            await hackathonApi.put(`/hackathons/${hackathonId}/requests/${requestId}/status`, {
                status: status,
                creatorId: CURRENT_USER_ID, // Send creatorId for backend verification
            });
            Alert.alert('Success', `Request ${status} successfully.`);
            fetchPendingRequests(); // Refresh the list
        } catch (error) {
            console.error('Error updating request status:', error.response?.data?.message || error.message);
            Alert.alert('Error', `Failed to ${status} request: ${error.response?.data?.message || 'Unknown error'}`);
        } finally {
            setProcessingRequest(false);
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.logoText}>Notifications</Text>
                {/* You might not need the bell icon here if this is the notification screen */}
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.logoBlue} style={{ marginTop: 50 }} />
                ) : pendingRequests.length === 0 ? (
                    <Text style={styles.noRequestsText}>No new join requests at the moment.</Text>
                ) : (
                    pendingRequests.map((request) => (
                        <View key={request.requestId} style={styles.requestCard}>
                            <Text style={styles.requestTitle}>Join Request for: <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{request.hackathonTitle}</Text></Text>
                            <Text style={styles.requestUser}>From: <Text style={{ fontFamily: 'Poppins_600SemiBold' }}>{request.requestingUser?.name || 'Unknown User'}</Text></Text>
                            {request.message ? (
                                <Text style={styles.requestMessage}>Message: "{request.message}"</Text>
                            ) : null}
                            <Text style={styles.requestDate}>Requested on: {new Date(request.requestedAt).toLocaleDateString()}</Text>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.acceptButton]}
                                    onPress={() => handleUpdateRequestStatus(request.hackathonId, request.requestId, 'accepted')}
                                    disabled={processingRequest}
                                >
                                    {processingRequest ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Accept</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rejectButton]}
                                    onPress={() => handleUpdateRequestStatus(request.hackathonId, request.requestId, 'rejected')}
                                    disabled={processingRequest}
                                >
                                    {processingRequest ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Reject</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

// Add styles specific to this NotificationsScreen
const notificationScreenStyles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 100, // Give some space for FAB if any
        alignItems: 'center',
    },
    requestCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    requestTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        marginBottom: 5,
        color: COLORS.primary,
    },
    requestUser: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: COLORS.textDark,
        marginBottom: 3,
    },
    requestMessage: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: COLORS.textGray,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    requestDate: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: COLORS.muted,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: COLORS.logoGreen,
    },
    rejectButton: {
        backgroundColor: COLORS.red, // Assuming you have a red color in COLORS
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
    },
    noRequestsText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: COLORS.textGray,
        marginTop: 50,
        textAlign: 'center',
    },
});

// It's better to explicitly define or import base styles
// For example, if your HackathonStyles.js exports 'styles' as default:
// const styles = StyleSheet.create({ ...commonStyles, ...notificationScreenStyles });
// Or if you have a base styles object elsewhere:
const styles = {
    ...commonStyles, // Merge common styles first
    ...notificationScreenStyles, // Then add screen-specific styles, overwriting if needed
};


export default NotificationsScreen;