import { StyleSheet } from "react-native";

export default StyleSheet.create({
container: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    color: '#1A1A1A',
  },
  imageContainer: { alignItems: 'center', marginTop: 100 },
  image: { width: 300, height: 300 },
  statusContainer: {
    backgroundColor: '#FFF2E0',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontWeight: '600',
    color: '#000',
    borderRadius: 20,
    marginTop: 16,
  },
});