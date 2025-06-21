import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { createStackNavigator } from '@react-navigation/stack';
import styles from './SearchStyles.js';
import GrowHiveHeader from './GrowHiveHeader.js';
import { COLORS } from './constants';

// Skills Filter Options
const SKILLS = ['All Skills', 'Programming', 'Design', 'Data Science'];

// Courses Data (20 courses)
const COURSES = [
  // ... (Use the 12 from your file, and add 8 more similar objects)
  { id: '1', name: 'BatMan', education: 'Computer Science, IIT Delhi', image: 'https://i.pravatar.cc/64?img=1', skills: ['Python', 'Programming', 'Machine Learning'], wants: ['Web Dev'] },
  { id: '2', name: 'Satya', education: 'Electronics, VIT Vellore', image: 'https://i.pravatar.cc/64?img=3', skills: ['JavaScript', 'Programming', 'React'], wants: ['AI'] },
  { id: '3', name: 'Aishwarya', education: 'Design, NID', image: 'https://i.pravatar.cc/64?img=4', skills: ['UI/UX', 'Figma', 'Design'], wants: ['Frontend'] },
  { id: '4', name: 'Senorita', education: 'Data Science, BITS Pilani', image: 'https://i.pravatar.cc/64?img=5', skills: ['Data Analysis', 'SQL', 'Data Science'], wants: ['Cloud'] },
  { id: '5', name: 'Karthik', education: 'Mechanical, NIT Trichy', image: 'https://i.pravatar.cc/64?img=7', skills: ['CAD', 'Matlab', 'Design'], wants: ['Robotics'] },
  { id: '6', name: 'Priyanka', education: 'Software Engineering, Anna University', image: 'https://i.pravatar.cc/64?img=8', skills: ['Programming', 'C++', 'Algorithms'], wants: ['Backend'] },
  { id: '7', name: 'Arjun', education: 'Graphic Design, Srishti Institute', image: 'https://i.pravatar.cc/64?img=9', skills: ['Design', 'Adobe Photoshop', 'Illustrator'], wants: ['Branding'] },
  { id: '8', name: 'Meera', education: 'Statistics, ISI Kolkata', image: 'https://i.pravatar.cc/64?img=11', skills: ['Data Science', 'R', 'Python'], wants: ['Big Data'] },
  { id: '9', name: 'Vikas', education: 'IT, JNTU Hyderabad', image: 'https://i.pravatar.cc/64?img=13', skills: ['Programming', 'Go', 'Microservices'], wants: ['Cloud'] },
  { id: '10', name: 'Sara', education: 'Fashion Design, NIFT', image: 'https://i.pravatar.cc/64?img=15', skills: ['Design', 'Sketching', 'Fashion Illustration'], wants: ['Textiles'] },
  { id: '11', name: 'Rohit', education: 'Data Science, IIT Bombay', image: 'https://i.pravatar.cc/64?img=17', skills: ['Data Science', 'Deep Learning', 'Python'], wants: ['AI'] },
  { id: '12', name: 'Sneha', education: 'CSE, BMS College', image: 'https://i.pravatar.cc/64?img=18', skills: ['Programming', 'Design', 'JavaScript'], wants: ['UI/UX'] },
  // 8 more...
  { id: '13', name: 'Vivek', education: 'EEE, SRM University', image: 'https://i.pravatar.cc/64?img=19', skills: ['Embedded', 'C', 'VLSI'], wants: ['IoT'] },
  { id: '14', name: 'Divya', education: 'Biotech, Manipal', image: 'https://i.pravatar.cc/64?img=20', skills: ['Biology', 'Genetics', 'Research'], wants: ['Bioinformatics'] },
  { id: '15', name: 'Nikhil', education: 'Civil, IIT Madras', image: 'https://i.pravatar.cc/64?img=21', skills: ['AutoCAD', 'Construction'], wants: ['Project Mgmt'] },
  { id: '16', name: 'Aarti', education: 'MBA, IIM Bangalore', image: 'https://i.pravatar.cc/64?img=22', skills: ['Management', 'Finance'], wants: ['Consulting'] },
  { id: '17', name: 'Suresh', education: 'Physics, IISER Pune', image: 'https://i.pravatar.cc/64?img=23', skills: ['Quantum', 'Mathematics'], wants: ['Research'] },
  { id: '18', name: 'Anjali', education: 'English, DU', image: 'https://i.pravatar.cc/64?img=24', skills: ['Writing', 'Editing'], wants: ['Publishing'] },
  { id: '19', name: 'Ramesh', education: 'CSE, PES University', image: 'https://i.pravatar.cc/64?img=25', skills: ['Java', 'Spring'], wants: ['Backend'] },
  { id: '20', name: 'Lakshmi', education: 'Maths, Christ University', image: 'https://i.pravatar.cc/64?img=26', skills: ['Statistics', 'Teaching'], wants: ['EdTech'] },
];

// Profile Card Component
function ProfileCard({ person }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: person.image }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardName}>{person.name}</Text>
        <Text style={styles.cardEdu}>{person.education}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5 }}>
          {person.skills.map((skill, idx) => (
            <View key={idx} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {person.wants.map((want, idx) => (
            <View key={idx} style={styles.wantTag}>
              <Text style={styles.wantText}>Want to learn: {want}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function SearchScreen() {
  const [skill, setSkill] = useState('All Skills');
  const [searchText, setSearchText] = useState('');
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return <View style={styles.container} />;

  const contentData = COURSES.filter(person => {
    const skillMatch = skill === 'All Skills' || person.skills.some(s => s.toLowerCase() === skill.toLowerCase());
    const searchMatch = person.name.toLowerCase().includes(searchText.toLowerCase()) || person.education.toLowerCase().includes(searchText.toLowerCase());
    return skillMatch && searchMatch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GrowHiveHeader />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#b5b5b5" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search for people..."
            placeholderTextColor="#b5b5b5"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        {/* Skill Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {SKILLS.map((skillItem) => (
            <TouchableOpacity
              key={skillItem}
              onPress={() => setSkill(skillItem)}
              style={[styles.filterChip, { backgroundColor: skill === skillItem ? '#34e3b0' : '#f3f4f6' }]}
            >
              <Text style={[styles.filterText, { color: skill === skillItem ? '#fff' : '#23272F' }]}>
                {skillItem}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Content List */}
        <View style={styles.content}>
          {contentData.length > 0 ? (
            <FlatList
              data={contentData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ProfileCard person={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <View style={styles.centerEmpty}>
              <Text style={styles.emptyText}>No courses found.</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const Stack = createStackNavigator();
export default function SearchStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SearchMain" component={SearchScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
