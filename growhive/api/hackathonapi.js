// Path: Backend/Frontend/api/hackathonApi.js

import axios from 'axios';

const BASE_URL = 'http://192.168.1.3:5000/api'; // <--- Make sure it's exactly this

const hackathonApi = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default hackathonApi;