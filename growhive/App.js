// Path: App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Import all your screens
import WelcomeScreen from './Loginscreens/WelcomeScreen';
import HomeStackScreen from './screens/HomeStackScreen';
import SearchStackScreen from './screens/SearchStackScreen';
import ScheduleStackScreen from './screens/ScheduleStackScreen';
import HackathonsStackScreen from './screens/HackathonsStackScreen';
import SignupScreen from './Loginscreens/SignupScreen';
import ConnectionsScreen from './screens/connectionscreen';
import CustomDrawerContent from './screens/CustomDrawerContent';
import { navigationRef } from './screens/navigationref';
import HomeHeader from './screens/HomeHeader';
import { COLORS } from './screens/constants';
import ChatListScreen from './screens/ChatListScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SavedScreen from './screens/SavedScreen';
import ChatProfileScreen from './screens/ChatScreen';
import ContactScreen from './screens/ContactScreen';
import PremiumScreen from './screens/PremiumScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './Loginscreens/LoginScreen';
import PersonalDetailsScreen from './screens/PersonalDetailsScreen';
import ContinuedSignupScreen from './Loginscreens/ContinuedSignupScreen';
import { ThemeProvider } from './screens/ThemeContext';
import DateOfBirthScreen from './screens/DateofBirthScreen';
import SkillsPage from './screens/SkillsPage';
import UploadCertificatesScreen from './screens/UploadCertificatesScreen';
import CreateHackathonScreen from './screens/CreateHackathonScreen';
// --- NEW IMPORT FOR HACKATHON NOTIFICATIONS ---
import HackathonsNotificationsScreen from './screens/HackathonsNotifications';
// ----------------------------------------------------


const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        // Only show header for 'Home' tab if it's explicitly handled by HomeHeader
        // Otherwise, you might want to manage headers within each StackScreen if they are complex
        headerShown: route.name === 'Home',
        header: route.name === 'Home'
          ? () => <HomeHeader navigation={navigation} />
          : undefined,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          backgroundColor: COLORS.background,
          borderTopColor: '#e5e7eb'
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home" size={size} color={color} />;
          } else if (route.name === 'Search') {
            return <Ionicons name="search" size={size} color={color} />;
          } else if (route.name === 'Schedule') {
            return <Feather name="calendar" size={size} color={color} />;
          } else if (route.name === 'Hackathons') {
            return <MaterialCommunityIcons name="bee" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name="person-circle" size={size} color={color} />;
          }
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Search" component={SearchStackScreen} options={{ headerShown: false, title: 'Search' }} />
      <Tab.Screen name="Schedule" component={ScheduleStackScreen} options={{ headerShown: false, title: 'Schedule' }} />
      <Tab.Screen name="Hackathons" component={HackathonsStackScreen} options={{ headerShown: false, title: 'Hackathons' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false, title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContinuedSignupScreen"
        component={ContinuedSignupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DateofBirthScreen"
        component={DateOfBirthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalDetailsScreen"
        component={PersonalDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SkillsPage"
        component={SkillsPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UploadCertificatesScreen"
        component={UploadCertificatesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      {/* ---------------------------------------------------- */}
      {/* NEW: Add CreateHackathonScreen to the MainStack - Already Present */}
      <Stack.Screen
        name="CreateHackathon" // This is the name used in navigation.navigate('CreateHackathon')
        component={CreateHackathonScreen}
        options={{ headerShown: false }} // You can choose to show a header or not
      />
      {/* ---------------------------------------------------- */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: 'Chats',
          headerTitleStyle: {
            fontFamily: 'Poppins_700Bold',
            color: COLORS.primary,
            fontSize: 24,
            paddingLeft: -15,
          },
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: COLORS.background,
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 4,
            elevation: 8,
          },
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatProfileScreen}
        options={{ headerTitle: 'Chat' }}
      />
      {/* General NotificationsScreen added to the MainStack for direct navigation */}
      <Stack.Screen
        name="Notifications" // Changed from NotificationsScreen to Notifications for cleaner navigation calls
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      {/* --- NEW STACK SCREEN FOR HACKATHON-SPECIFIC NOTIFICATIONS --- */}
      <Stack.Screen
        name="HackathonRequests" // A distinct name for hackathon-specific notifications
        component={HackathonsNotificationsScreen}
        options={{ headerShown: false }} // The component has its own custom header
      />
      {/* ---------------------------------------------------- */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      {/* You might also need to add HackathonDetailScreen if not already present,
                as your HackathonsNotificationsScreen can navigate to it. */}
      {/* <Stack.Screen
                name="HackathonDetailScreen"
                component={HackathonDetailScreen} // Make sure to import this screen
                options={{ headerShown: false }}
            /> */}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <Drawer.Navigator
          id="MainDrawer"
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              backgroundColor: '#fff',
              width: 240,
            },
            overlayColor: 'rgba(0,0,0,0.3)',
          }}
          drawerContent={props => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen name="MainStack" component={MainStack} />
          {/* Drawer screens that are typically accessed via the drawer menu */}
          <Drawer.Screen
            name="ConnectionsScreen"
            component={ConnectionsScreen}
            options={{
              drawerLabel: 'Connections', // Display in drawer
              drawerIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
              drawerItemStyle: { height: 'auto' }, // Ensure it's visible
            }}
          />
          <Drawer.Screen
            name="SavedScreen"
            component={SavedScreen}
            options={{
              drawerLabel: 'Saved Items',
              drawerIcon: ({ color, size }) => <Ionicons name="bookmark-outline" size={size} color={color} />,
              drawerItemStyle: { height: 'auto' },
            }}
          />
          <Drawer.Screen
            name="PremiumScreen"
            component={PremiumScreen}
            options={{
              drawerLabel: 'Go Premium',
              drawerIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} />,
              drawerItemStyle: { height: 'auto' },
            }}
          />
          <Drawer.Screen
            name="ContactScreen"
            component={ContactScreen}
            options={{
              drawerLabel: 'Contact Us',
              drawerIcon: ({ color, size }) => <Ionicons name="mail-outline" size={size} color={color} />,
              drawerItemStyle: { height: 'auto' },
            }}
          />
          {/* If you want Notifications to be accessible from the drawer as well */}
          <Drawer.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              drawerLabel: 'Notifications',
              drawerIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
              drawerItemStyle: { height: 'auto' },
            }}
          />
          {/* --- OPTIONAL: ADD HACKATHON NOTIFICATIONS TO DRAWER IF DESIRED --- */}
          {/* If you also want 'Hackathon Requests' directly in the drawer, uncomment this: */}
          {/* <Drawer.Screen
                        name="HackathonRequestsDrawer" // Use a different name if "HackathonRequests" is already in Stack
                        component={HackathonsNotificationsScreen}
                        options={{
                            drawerLabel: 'Hackathon Requests',
                            drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="bell-ring-outline" size={size} color={color} />,
                            drawerItemStyle: { height: 'auto' },
                        }}
                    /> */}
          {/* ---------------------------------------------------- */}
        </Drawer.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}