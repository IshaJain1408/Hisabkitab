import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');
const drawerWidth = width * 0.75

export default StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  drawerContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: drawerWidth,
    backgroundColor: '#fff',
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  nameLocation: {
    flexDirection: 'column',
  },
  drawerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  drawerLocation: {
    fontSize: 14,
    color: 'gray',
  },
  closeIcon: {
    position: 'absolute',
    right: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuIconLeft: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});
