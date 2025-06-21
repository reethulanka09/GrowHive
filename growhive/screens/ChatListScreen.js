import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { COLORS } from './constants';
import { Feather } from '@expo/vector-icons';

export default function ChatListScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        setFilteredUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(user =>
          user.name.toLowerCase().includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search, users]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!filteredUsers.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.text, fontSize: 18, fontFamily: 'Poppins_700Bold' }}>No users found.</Text>
      </View>
    );
  }

  // Dummy time for demonstration; replace with real data if available
  const getTime = () => "12:45 PM";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.searchBarWrapper}>
        <Feather name="search" size={22} color="#2563eb" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search people"
          placeholderTextColor="#8ca0b3"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Chat', { otherUser: item })}
          >
            <Image
              source={{ uri: item.avatar }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.status}>Tap to chat</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{getTime()}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: '#f3f6fa',
    borderRadius: 30,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: COLORS.text,
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 14,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    backgroundColor: '#eee',
    borderWidth: 0,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
  timeContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
});
