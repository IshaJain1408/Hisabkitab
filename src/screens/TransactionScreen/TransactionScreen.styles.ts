import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  actionButton: {
    marginBottom: 50,
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
  },

  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});