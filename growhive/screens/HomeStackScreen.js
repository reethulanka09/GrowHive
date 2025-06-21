import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Modal, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { createStackNavigator } from '@react-navigation/stack';

import { COLORS, CAROUSEL_DATA, COURSES } from './constants';
import styles from './HomeStyles.js';


const { width } = Dimensions.get('window');

function LearnerAvatars({ avatars, count }) {
  return (
    <View style={styles.avatarsRow}>
      <View style={styles.avatarsStack}>
        {avatars.slice(0, 2).map((uri, idx) => (
          <Image
            key={idx}
            source={{ uri }}
            style={[
              styles.avatarImage,
              idx !== 0 && styles.avatarImageOverlap,
            ]}
          />
        ))}
      </View>
      <Text style={styles.avatarsCount}>
        {count} learners
      </Text>
    </View>
  );
}

function CourseCard({ course }) {
  return (
    <View style={styles.courseCard}>
      <Image
        source={{ uri: course.image }}
        style={styles.courseImage}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.courseCardHeader}>
          <View style={styles.courseTitleContainer}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseMentor}>-{course.mentor}</Text>
          </View>
          <Text style={styles.courseDuration}>{course.duration}</Text>
        </View>
        <View style={styles.courseCardFooter}>
          <LearnerAvatars avatars={course.learnersAvatars} count={course.learners} />
          <TouchableOpacity>
            <MaterialCommunityIcons
              name={course.bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={course.bookmarked ? COLORS.secondary : '#bdbdbd'}
              style={styles.bookmarkIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Modal to show all courses
function AllCoursesModal({ visible, onClose, courses }) {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>All Free Learning</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.sectionAction, { fontSize: 16 }]}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function HomeScreen() {
  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const [showAll, setShowAll] = useState(false);

  if (!fontsLoaded) return <View style={styles.screenBackground} />;

  // Show only first 3 cards in preview
  const previewCourses = COURSES.slice(0, 3);

  return (
    <View style={styles.screenBackground}>
      <ScrollView
        style={[styles.scrollView, { marginTop: 0 }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.greetingContainer, { marginTop: 12, paddingTop: 0 }]}>
          <Text style={styles.greetingText}>Hello, Yuva!</Text>
          <Text style={styles.greetingSubText}>Together, We Thrive.</Text>
        </View>
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={width - 25}
            height={140}
            autoPlay={true}
            data={CAROUSEL_DATA}
            scrollAnimationDuration={1400}
            style={styles.carousel}
            renderItem={({ item }) => (
              <View style={styles.carouselItem}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                <View style={styles.carouselOverlay}>
                  <Text style={styles.carouselTitle}>{item.title}</Text>
                  <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            )}
          />
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Free Learning</Text>
          <TouchableOpacity onPress={() => setShowAll(true)}>
            <Text style={styles.sectionAction}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.coursesContainer}>
          {previewCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>
      </ScrollView>
      <AllCoursesModal visible={showAll} onClose={() => setShowAll(false)} courses={COURSES} />
    </View>
  );
}

const Stack = createStackNavigator();

export default function HomeStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
