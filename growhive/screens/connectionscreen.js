import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Image, Modal, Animated, TextInput, Dimensions, StyleSheet
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabView, SceneMap } from 'react-native-tab-view';
import GrowHiveHeader from './GrowHiveHeader.js';
import styles from './ConnectionStyles.js';
import { COLORS } from './constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

const INITIAL_SENT_REQUESTS = [
  { id: 's1', name: 'Amit Singh', education: 'AI, IIIT Hyderabad', image: 'https://i.pravatar.cc/64?img=10', status: 'Sent', date: 1718000000000 },
  { id: 's2', name: 'Priya Sharma', education: 'Design, NID', image: 'https://i.pravatar.cc/64?img=12', status: 'Accepted', date: 1717000000000 },
];
const RECEIVED_REQUESTS = [
  { id: 'r1', name: 'Rahul Jain', education: 'Data Science, MIT', image: 'https://i.pravatar.cc/64?img=14', status: 'Accept', date: 1719000000000 },
  { id: 'r2', name: 'Sneha Kapoor', education: 'Robotics, IISc Bangalore', image: 'https://i.pravatar.cc/64?img=16', status: 'Accept', date: 1716000000000 },
];
const HARDCODED_CONNECTIONS = [
  { id: 'c1', name: 'Harsh', education: 'CSE, IIT Kanpur', image: 'https://i.pravatar.cc/64?img=27', date: 1718001000000 },
  { id: 'c2', name: 'Nisha', education: 'EEE, VIT', image: 'https://i.pravatar.cc/64?img=28', date: 1718002000000 },
  // ...more
];

const SORT_OPTIONS = [
  { key: 'default', label: 'Default' },
  { key: 'latest', label: 'Sort by Latest' },
  { key: 'earliest', label: 'Sort by Earliest' },
];

// --- ANIMATED CARD ---
function AnimatedCard({ children, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350 + index * 50,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
      {children}
    </Animated.View>
  );
}

// --- SEARCH BAR ---
function StylishSearchBar({ value, onChange, onClear }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.searchBar}>
      <Feather name="search" size={20} color={COLORS.secondary} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search connections"
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Feather name="x-circle" size={20} color={COLORS.secondary} style={{ marginRight: 2 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- SORT DROPDOWN ---
function SortDropdown({ visible, onSelect, onClose, selected, yOffset }) {
  if (!visible) return null;
  return (
    <Animated.View style={{
      position: 'absolute',
      right: 24,
      top: yOffset,
      backgroundColor: '#fff',
      borderRadius: 12,
      shadowColor: COLORS.secondary,
      shadowOpacity: 0.13,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 5,
      zIndex: 100,
      minWidth: 170,
      paddingVertical: 6,
    }}>
      {SORT_OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.key}
          onPress={() => { onSelect(opt.key); onClose(); }}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 18,
            backgroundColor: selected === opt.key ? '#e0e7ef' : 'transparent',
          }}
        >
          <Text style={{
            color: selected === opt.key ? COLORS.secondary : '#23272F',
            fontWeight: selected === opt.key ? 'bold' : 'normal',
            fontSize: 16
          }}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

// --- THREE DOTS MENU ---
function DotsMenu({ visible, onClose, onUnfollow, onMute, onManage }) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.menuModalOverlay}>
        <View style={styles.menuModal}>
          <TouchableOpacity style={styles.menuItem} onPress={onManage}>
            <Feather name="bell" size={20} color="#23272F" />
            <Text style={styles.menuItemText}>Manage notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onMute}>
            <Feather name="volume-x" size={20} color="#23272F" />
            <Text style={styles.menuItemText}>Mute</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={onUnfollow}>
            <Feather name="user-x" size={20} color={COLORS.secondary} />
            <Text style={[styles.menuItemText, styles.menuItemRed]}>Unfollow</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>
    </Modal>
  );
}

// --- CARDS ---
function MessageButton({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => onPress && onPress());
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.messageBtn}
        activeOpacity={0.86}
        onPress={animate}
      >
        <Text style={styles.messageBtnText}>Message</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ConnectionCard({ person, onMessage, onDots, index }) {
  return (
    <AnimatedCard index={index}>
      <View style={styles.card}>
        <Image source={{ uri: person.image }} style={styles.avatar} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.cardName}>{person.name}</Text>
          <Text style={styles.cardEdu}>{person.education}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 0 }}>
          <MessageButton onPress={() => onMessage(person)} />
          <TouchableOpacity style={styles.dotsBtn} onPress={() => onDots(person)}>
            <Feather name="more-vertical" size={22} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedCard>
  );
}

function SentCard({ person, onWithdraw, index }) {
  return (
    <AnimatedCard index={index}>
      <View style={styles.card}>
        <Image source={{ uri: person.image }} style={styles.avatar} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.cardName}>{person.name}</Text>
          <Text style={styles.cardEdu}>{person.education}</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'flex-end', flex: 0 }}>
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() => onWithdraw(person)}
          >
            <Text style={[styles.messageBtnText, { color: COLORS.secondary }]}>Sent</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedCard>
  );
}

function ReceivedCard({ person, index }) {
  return (
    <AnimatedCard index={index}>
      <View style={styles.card}>
        <Image source={{ uri: person.image }} style={styles.avatar} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.cardName}>{person.name}</Text>
          <Text style={styles.cardEdu}>{person.education}</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'flex-end', flex: 0 }}>
          <TouchableOpacity style={styles.messageBtn}>
            <Text style={[styles.messageBtnText, { color: COLORS.secondary }]}>{person.status}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedCard>
  );
}

// --- MAIN SCREEN ---
export default function ConnectionsScreen({ navigation }) {
  const [index, setIndex] = useState(2); // Default to Connections tab
  const [routes] = useState([
    { key: 'sent', title: 'Sent' },
    { key: 'received', title: 'Received' },
    { key: 'connections', title: 'Connections' },
  ]);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sentRequests, setSentRequests] = useState(INITIAL_SENT_REQUESTS);
  const [connections, setConnections] = useState([
    ...HARDCODED_CONNECTIONS,
    ...INITIAL_SENT_REQUESTS.filter(req => req.status === 'Accepted').map(req => ({
      id: req.id,
      name: req.name,
      education: req.education,
      image: req.image,
      date: req.date,
    })),
  ]);
  const [search, setSearch] = useState('');
  const [sortDropdown, setSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showSortBar, setShowSortBar] = useState(false);
  const [dotsMenu, setDotsMenu] = useState({ visible: false, person: null });
  const [sortBarAnim] = useState(new Animated.Value(0));
  const indicatorAnim = useRef(new Animated.Value(2)).current; // start at index 2

  // Animate sort bar down/up
  const openSortBar = () => {
    setShowSortBar(true);
    Animated.timing(sortBarAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };
  const closeSortBar = () => {
    Animated.timing(sortBarAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setShowSortBar(false));
  };

  // For TabView
  const handleSwipeIndexChange = (i) => {
    Animated.spring(indicatorAnim, {
      toValue: i,
      useNativeDriver: false,
      bounciness: 8,
      speed: 14,
    }).start();
    setIndex(i);
  };

  // Filter and sort logic
  let sentData = sentRequests;
  let receivedData = RECEIVED_REQUESTS;
  let connData = connections;
  // Search & sort for connections
  let filteredConnData = connData.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.education.toLowerCase().includes(search.toLowerCase())
  );
  if (sortBy === 'latest') filteredConnData = [...filteredConnData].sort((a, b) => (b.date || 0) - (a.date || 0));
  else if (sortBy === 'earliest') filteredConnData = [...filteredConnData].sort((a, b) => (a.date || 0) - (b.date || 0));

  // --- Tab Scenes ---
  const renderScene = SceneMap({
    sent: () => (
      <FlatList
        data={sentData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SentCard person={item} onWithdraw={handleWithdraw} index={index} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.muted }}>No sent requests.</Text>}
      />
    ),
    received: () => (
      <FlatList
        data={receivedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReceivedCard person={item} index={index} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.muted }}>No received requests.</Text>}
      />
    ),
    connections: () => (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: -4 }}>
          <View style={{ flex: 1 }}>
            <StylishSearchBar
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
            />
          </View>
          <TouchableOpacity
            style={{
              marginRight: 18,
              marginLeft: 2,
              backgroundColor: '#e0e7ef',
              borderRadius: 12,
              padding: 8,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: COLORS.secondary,
              shadowOpacity: 0.09,
              shadowOffset: { width: 0, height: 1 },
              shadowRadius: 4,
              elevation: 2
            }}
            onPress={() => setSortDropdown(!sortDropdown)}
          >
            <MaterialCommunityIcons name="swap-vertical" size={22} color={COLORS.secondary} />
          </TouchableOpacity>
          <SortDropdown
            visible={sortDropdown}
            onSelect={setSortBy}
            onClose={() => setSortDropdown(false)}
            selected={sortBy}
            yOffset={100}
          />
        </View>
        {showSortBar && (
          <Animated.View style={{
            width: SCREEN_WIDTH,
            paddingHorizontal: 18,
            paddingBottom: 2,
            transform: [{
              translateY: sortBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-40, 0]
              })
            }],
            opacity: sortBarAnim
          }}>
            <View style={styles.sortBar}>
              <Feather name="filter" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
              <Text style={[
                styles.sortBarText,
                sortBy !== 'default' && styles.sortBarActive
              ]}>
                {SORT_OPTIONS.find(opt => opt.key === sortBy)?.label}
              </Text>
            </View>
          </Animated.View>
        )}
        <FlatList
          data={filteredConnData}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ConnectionCard
              person={item}
              onMessage={handleMessage}
              onDots={handleDots}
              index={index}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.muted }}>No connections yet.</Text>}
        />
      </View>
    ),
  });

  // --- Custom Tab Bar with Animated Indicator ---
  const renderTabBar = props => {
    const tabWidth = SCREEN_WIDTH * 0.94 / props.navigationState.routes.length;
    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <Animated.View
            style={[
              styles.indicator,
              {
                width: tabWidth - 8,
                left: indicatorAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [4, tabWidth + 4, tabWidth * 2 + 4],
                }),
              }
            ]}
          />
          {props.navigationState.routes.map((route, i) => {
            const isActive = index === i;
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => handleSwipeIndexChange(i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {route.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Withdraw logic
  const handleWithdraw = (person) => {
    setSelectedPerson(person);
    setWithdrawModal(true);
  };
  const confirmWithdraw = () => {
    if (index === 2) {
      setConnections(prev => prev.filter(item => item.id !== selectedPerson.id));
    } else if (index === 0) {
      setSentRequests(prev => prev.filter(item => item.id !== selectedPerson.id));
    }
    setWithdrawModal(false);
    setSelectedPerson(null);
  };

  // Message navigation
  const handleMessage = (person) => {
    navigation && navigation.navigate && navigation.navigate('ChatScreen', { user: person });
  };

  // Dots menu actions
  const handleDots = (person) => {
    setDotsMenu({ visible: true, person });
  };
  const handleUnfollow = () => {
    setConnections(prev => prev.filter(item => item.id !== dotsMenu.person.id));
    setDotsMenu({ visible: false, person: null });
  };
  const handleMute = () => {
    setDotsMenu({ visible: false, person: null });
  };
  const handleManage = () => {
    setDotsMenu({ visible: false, person: null });
  };

  // Sort bar animation effect
  React.useEffect(() => {
    if (index === 2 && sortBy !== 'default') {
      openSortBar();
    } else {
      closeSortBar();
    }
  }, [sortBy, index]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GrowHiveHeader />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleSwipeIndexChange}
        initialLayout={{ width: SCREEN_WIDTH }}
        swipeEnabled
      />

      {/* Withdraw Modal */}
      <Modal
        transparent
        visible={withdrawModal}
        animationType="fade"
        onRequestClose={() => setWithdrawModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 28,
            width: '80%',
            alignItems: 'center',
            shadowColor: COLORS.secondary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 12 }}>Withdraw Connection</Text>
            <Text style={{ color: COLORS.secondary, fontSize: 15, textAlign: 'center' }}>
              Are you sure you want to withdraw connection with {selectedPerson?.name}?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#e0e7ef',
                  borderRadius: 8,
                  paddingVertical: 10,
                  marginRight: 8,
                  alignItems: 'center'
                }}
                onPress={() => setWithdrawModal(false)}
              >
                <Text style={{ color: COLORS.secondary, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  paddingVertical: 10,
                  marginLeft: 8,
                  alignItems: 'center',
                  borderWidth: 1.7,
                  borderColor: COLORS.secondary,
                }}
                onPress={confirmWithdraw}
              >
                <Text style={{ color: COLORS.secondary, fontWeight: 'bold' }}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dots menu */}
      <DotsMenu
        visible={dotsMenu.visible}
        onClose={() => setDotsMenu({ visible: false, person: null })}
        onUnfollow={handleUnfollow}
        onMute={handleMute}
        onManage={handleManage}
      />
    </View>
  );
}
