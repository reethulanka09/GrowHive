import { StyleSheet, Platform } from 'react-native';
import { COLORS } from './constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBarContainer: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f7fa',
    borderRadius: 28,
    padding: 4,
    width: '94%',
    alignSelf: 'center',
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 22,
    zIndex: 1,
  },
  tabLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#23272F',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: COLORS.secondary,
  },
  indicator: {
    position: 'absolute',
    height: '82%',
    backgroundColor: '#fff',
    borderRadius: 22,
    top: '9%',
    zIndex: 0,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginTop: 2,
    paddingHorizontal: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginHorizontal: 18,
    marginBottom: 16,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e0e7ef',
  },
  cardName: {
    fontSize: 17,
    color: '#23272F',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  cardEdu: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: 'Poppins_400Regular',
  },
  messageBtn: {
    minWidth: 98,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    overflow: 'hidden',
    borderWidth: 1.7,
    borderColor: COLORS.secondary,
    backgroundColor: '#fff',
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
  },
  messageBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  dotsBtn: {
    padding: 8,
    marginLeft: 4,
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 0,
    minWidth: 220,
    alignItems: 'stretch',
    elevation: 7,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#23272F',
    marginLeft: 10,
  },
  menuItemRed: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  sortBar: {
    backgroundColor: '#e0e7ef',
    borderRadius: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 0,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortBarText: {
    color: '#23272F',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  sortBarActive: {
    color: COLORS.secondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: '#e8f0fe',
    borderRadius: 16,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 17,
    color: COLORS.text,
    fontFamily: 'Poppins_400Regular',
    backgroundColor: 'transparent',
  },
});
