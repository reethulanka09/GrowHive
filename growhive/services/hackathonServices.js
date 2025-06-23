// Path: Backend/Frontend/services/hackathonService.js

// import AsyncStorage from '@react-native-async-storage/async-storage'; // REMOVE THIS LINE
import * as SecureStore from 'expo-secure-store'; // ADD THIS LINE

// Define your API base URL
// IMPORTANT: Replace with your backend IP/URL and port
// Ensure this points to the base of your *backend* API, not just /api/auth
const API_BASE_ROOT_URL = 'http://192.168.1.2:5000'; // <<< Changed to root URL of your backend


// Function to get the authentication token from SecureStore
const getToken = async () => {
    try {
        const token = await SecureStore.getItemAsync('userToken'); // Use SecureStore
        return token;
    } catch (error) {
        console.error('Error retrieving token from SecureStore:', error);
        return null;
    }
};

// Generic function to handle API requests
const request = async (method, path, data = null, isProtected = false) => {
    // Construct the full URL.
    // For hackathons, it will be http://192.168.1.2:5000/api/hackathons
    const url = `${API_BASE_ROOT_URL}${path}`;
    const headers = {
        'Content-Type': 'application/json',
    };

    if (isProtected) {
        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            throw new Error('No token found. Please log in.');
        }
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(url, config);
        const responseData = await response.json();

        if (!response.ok) {
            const error = responseData.message || 'Something went wrong';
            throw new Error(error);
        }

        return responseData;
    } catch (error) {
        console.error(`Error during ${method} request to ${url}:`, error);
        throw error;
    }
};

const hackathonService = {
    // Get all hackathons (public route)
    getHackathons: async () => {
        return request('GET', '/api/hackathons', null, false); // Full path /api/hackathons
    },

    // Create a new hackathon (protected route)
    createHackathon: async (hackathonData) => {
        return request('POST', '/api/hackathons', hackathonData, true); // Full path /api/hackathons, protected
    },

    // Request to join a hackathon (protected route)
    requestToJoinHackathon: async (hackathonId, message) => {
        return request('POST', `/api/hackathons/${hackathonId}/request-join`, { message }, true); // Protected
    },

    // You can add more service methods here (e.g., getHackathonById, updateHackathon)
};

export default hackathonService;