import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Svg, Path } from 'react-native-svg';

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const iconAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(1)).current;

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Please fill all fields');
      return;
    }

    Animated.parallel([
      Animated.timing(iconAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Alert.alert('Message Sent!', `Thank you, ${name}. We’ll reach out soon.`);
      setName('');
      setEmail('');
      setMessage('');
      iconAnim.setValue(0);
      textAnim.setValue(1);
    });
  };

  const iconTranslate = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LottieView
        source={require('../assets/Animation - 1749013885897.json')}
        autoPlay
        loop
        style={styles.lottie}
      />

      <Text style={styles.header}>Contact Us</Text>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Your Message"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
      />

      <Pressable style={styles.sendButton} onPress={handleSubmit}>
        <Animated.View
          style={[styles.iconWrapper, { transform: [{ translateX: iconTranslate }] }]}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path fill="none" d="M0 0h24v24H0z" />
            <Path
              fill="#fff"
              d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
            />
          </Svg>
        </Animated.View>
        <Animated.Text style={[styles.sendText, { opacity: textAnim }]}>
          Send
        </Animated.Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F7F9FA',
    flexGrow: 1,
    justifyContent: 'center',
  },
  lottie: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginBottom: -30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: 'royalblue',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  iconWrapper: {
    marginRight: 10,
  },
  sendText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ContactScreen;
