import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert, // Import Alert for user feedback
  ActivityIndicator, // For showing loading on button
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Circle } from 'react-native-svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../screens/constants';
import {
  useFonts,
  Poppins_700Bold,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.10.149:5000/api/auth';

export default function SignupScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    console.log('Attempting signup...'); // Debug log
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        name,
        email,
        password,
      });

      console.log('Signup success response:', response.data); // Debug log: full response
      Alert.alert('Success', response.data.message);

      console.log('Attempting to navigate to DateofBirthScreen...'); // Debug log BEFORE navigation
      navigation.navigate('DateofBirthScreen', {
        userToken: response.data.token,
        userId: response.data._id
      });
      console.log('Navigation call sent.'); // Debug log AFTER navigation call

    } catch (error) {
      console.error('Signup error:', error.response ? error.response.data : error.message);
      Alert.alert('Signup Failed', error.response ? error.response.data.message : 'Something went wrong.');
    } finally {
      setLoading(false);
      console.log('Signup process finished (loading reset).'); // Debug log
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Layered Gradient & Blob Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#33e6b3', '#1fa2ff', '#0a8fd8']}
          style={{ flex: 1 }}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Svg height={height} width={width} style={{ position: 'absolute' }}>
          <Ellipse
            cx={width * 0.8}
            cy={height * 0.1}
            rx={110}
            ry={60}
            fill="#fff"
            fillOpacity={0.14}
          />
          <Circle
            cx={width * 0.18}
            cy={height * 0.22}
            r={70}
            fill="#33e6b3"
            fillOpacity={0.08}
          />
          <Ellipse
            cx={width * 0.5}
            cy={height * 0.93}
            rx={180}
            ry={80}
            fill="#1fa2ff"
            fillOpacity={0.09}
          />
        </Svg>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {/* Title */}
          <Text style={styles.titleText}>Create Account</Text>
          <Text style={styles.subtitleText}>
            Join us and start your journey!
          </Text>

          {/* Signup Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={COLORS.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              name="email-outline"
              placeholderTextColor={COLORS.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordInput}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={passwordVisible ? 'eye' : 'eye-off'}
                  size={22}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider with OR */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Signup (Frontend only for now, needs backend integration) */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#fff' }]}>
              <AntDesign name="google" size={28} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#22223B' }]}>
              <FontAwesome name="github" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#0A66C2' }]}>
              <AntDesign name="linkedin-square" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup} // Call handleSignup
            disabled={loading} // Disable button while loading
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {/* Already have an account */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 40,
    marginTop: 70,
  },
  titleText: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
    textShadowColor: 'rgba(30,41,59,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 28,
    opacity: 0.85,
  },
  form: {
    width: '88%',
    marginTop: 0,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 18,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 13,
    zIndex: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: '80%',
    alignSelf: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    opacity: 0.8,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 22,
    gap: 18,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  signupButton: {
    backgroundColor: '#33e6b3',
    borderRadius: 16,
    paddingVertical: 17,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#33e6b3',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
    width: '88%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    letterSpacing: 0.7,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#e0e7ef',
    textAlign: 'center',
    marginTop: 8,
  },
  loginLinkText: {
    color: '#33e6b3',
    fontFamily: 'Poppins_600SemiBold',
  },
  loginLink: {
    marginTop: 8,
  },
});
