// Full updated ChatScreen.js with voice message, document picker & viewer

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { COLORS } from './constants';
import { Ionicons, Feather } from '@expo/vector-icons';

const MY_USER_ID = 'user1';

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageModal, setImageModal] = useState({ visible: false, uri: null });
  const [recording, setRecording] = useState(null);
  const [playingSound, setPlayingSound] = useState(null);
  const flatListRef = useRef(null);
  const chatId = getChatId(MY_USER_ID, otherUser.id);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: otherUser.avatar }}
            style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
          />
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 16, color: COLORS.text }}>
            {otherUser.name}
          </Text>
        </View>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 4 }}>
          <TouchableOpacity onPress={() => Alert.alert('Video Call', 'Start a video call!')}>
            <Ionicons name="videocam" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Phone Call', 'Start an audio call!')}>
            <Feather name="phone" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Feather name="more-vertical" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, otherUser]);

  useEffect(() => {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async (type = 'text', content = input.trim()) => {
    if (!content) return;
    try {
      const newMessage = {
        sender: MY_USER_ID,
        createdAt: serverTimestamp(),
        type,
      };
      if (type === 'text') newMessage.text = content;
      else if (type === 'image') newMessage.image = content;
      else if (type === 'document') newMessage.document = content;
      else if (type === 'voice') newMessage.voice = content;

      await addDoc(collection(db, 'chats', chatId, 'messages'), newMessage);
      setInput('');
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) await sendMessage('voice', uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const playSound = async (uri) => {
    try {
      if (playingSound) {
        await playingSound.unloadAsync();
        setPlayingSound(null);
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlayingSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error('Error playing sound', err);
    }
  };

  const pickImage = async () => {
    Alert.alert('Send Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            await sendMessage('image', result.assets[0].uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            await sendMessage('image', result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]?.uri) {
        await sendMessage('document', result.assets[0].uri);
      }
    } catch (e) {
      console.error('Error picking document', e);
    }
  };

  const clearChat = async () => {
    try {
      const q = query(collection(db, 'chats', chatId, 'messages'));
      const snapshot = await getDocs(q);
      const deletes = snapshot.docs.map((docSnap) => deleteDoc(doc(db, 'chats', chatId, 'messages', docSnap.id)));
      await Promise.all(deletes);
      Alert.alert('Chat Cleared');
    } catch (e) {
      console.error('Failed to clear chat', e);
    }
  };

  const handleMenuSelect = (option) => {
    setMenuVisible(false);
    if (option === 'Clear Chat') {
      Alert.alert('Clear Chat', 'Delete all messages?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearChat },
      ]);
    } else if (option === 'View Profile') {
      navigation.navigate('ProfileView', { user: otherUser });
    } else {
      Alert.alert(option, 'This feature is coming soon!');
    }
  };

  const menuOptions = [
    { label: 'Mute Notifications', icon: 'volume-mute' },
    { label: 'View Profile', icon: 'user' },
    { label: 'Media, Links & Docs', icon: 'folder' },
    { label: 'Search', icon: 'search' },
    { label: 'Block', icon: 'slash' },
    { label: 'Clear Chat', icon: 'trash-2' },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.sender === MY_USER_ID ? styles.bubbleRight : styles.bubbleLeft]}>
            {item.type === 'image' ? (
              <TouchableOpacity onPress={() => setImageModal({ visible: true, uri: item.image })}>
                <Image source={{ uri: item.image }} style={styles.sentImage} />
              </TouchableOpacity>
            ) : item.type === 'document' ? (
              <TouchableOpacity onPress={() => Linking.openURL(item.document)}>
                <Feather name="file-text" size={22} color={COLORS.primary} />
                <Text style={{ marginLeft: 8, textDecorationLine: 'underline', fontSize: 15 }}>Open Document</Text>
              </TouchableOpacity>
            ) : item.type === 'voice' ? (
              <TouchableOpacity onPress={() => playSound(item.voice)}>
                <Ionicons name="play-circle" size={28} color={COLORS.primary} />
                <Text style={{ marginLeft: 8 }}>Play Voice Note</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ fontSize: 15 }}>{item.text}</Text>
            )}
          </View>
        )}
        inverted
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 10 }}
      />

      {/* Input Bar */}
      <View style={styles.inputBarContainer}>
        <View style={styles.inputBar}>
          <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording}>
            <Ionicons name={recording ? 'mic-circle' : 'mic'} size={26} color={recording ? 'red' : '#888'} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage('text')}
          />
          <TouchableOpacity onPress={pickDocument}>
            <Feather name="paperclip" size={22} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="camera-outline" size={22} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sendMessage('text')} disabled={!input.trim()}>
            <Ionicons name="send" size={24} color={input.trim() ? COLORS.primary : '#bbb'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Modal */}
      <Modal visible={imageModal.visible} transparent onRequestClose={() => setImageModal({ visible: false, uri: null })}>
        <Pressable style={styles.fullScreenContainer} onPress={() => setImageModal({ visible: false, uri: null })}>
          <Image source={{ uri: imageModal.uri }} style={styles.fullScreenImage} resizeMode="contain" />
        </Pressable>
      </Modal>

      {/* Menu Modal */}
      <Modal animationType="fade" transparent visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuSheet}>
            {menuOptions.map((opt) => (
              <TouchableOpacity key={opt.label} style={styles.menuItem} onPress={() => handleMenuSelect(opt.label)}>
                <Feather name={opt.icon} size={20} color={COLORS.primary} style={{ marginRight: 14 }} />
                <Text style={{ fontSize: 16 }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    borderRadius: 18,
    margin: 8,
    padding: 12,
    maxWidth: '75%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.secondary,
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },
  sentImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },
  inputBarContainer: {
    padding: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    maxHeight: 120,
    minHeight: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
        width: '100%',
    height: '100%',
  },
});
