// Path: Backend/Frontend/screens/HackathonStyles.js
import { StyleSheet } from 'react-native';
import { COLORS } from './constants'; // Assuming you have a constants file for colors

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50, // Adjust for notch devices
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: COLORS.primary,
  },
  notificationBell: {
    padding: 5,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  someContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: COLORS.textDark,
    marginLeft: 20,
    marginBottom: 15,
  },
  horizontalScrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 300, // Fixed width for horizontal scroll cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  topContentRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  leftColumn: {
    flex: 2,
    paddingRight: 10,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 24,
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: COLORS.primary,
    flexShrink: 1,
  },
  cardSubTitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textDark,
  },
  dot: {
    fontSize: 18,
    color: COLORS.textDark,
    marginHorizontal: 5,
    lineHeight: 12, // Adjust line height to align dot
  },
  cardDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.textDark,
    marginTop: 5,
  },
  rolesHeader: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 3,
    textAlign: 'right',
  },
  rolesWantedText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.textGray,
    textAlign: 'right',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -8,
  },
  moreAvatars: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreAvatarsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.textGray,
  },
  participantsCountText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.textGray,
    marginLeft: 5,
  },
  joinBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  participatingStatus: {
    // Styles for accepted/pending status buttons
    backgroundColor: COLORS.green, // Default for accepted
  },
  noHackathonsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: 20,
    width: '100%',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.logoBlue, // Your FAB color
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Modal Styles (Common for both Create and Join)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    marginBottom: 15,
    color: COLORS.primary,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 15,
    fontFamily: 'Poppins_400Regular',
    color: COLORS.textDark,
  },
  modalBtn: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: COLORS.logoBlue,
  },
  modalBtnText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  cancelText: {
    marginTop: 15,
    color: COLORS.textGray,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  // Specific to Join Request Modal (as already defined in your NotificationsScreen)
  modalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 10,
    textAlign: 'center',
  },
  // Specific to NotificationScreen card and buttons
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  requestTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    marginBottom: 5,
    color: COLORS.primary,
  },
  requestUser: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 3,
  },
  requestMessage: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.textGray,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  requestDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.logoGreen,
  },
  rejectButton: {
    backgroundColor: COLORS.red,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
});

export default styles;