import { StyleSheet } from "react-native";

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: '600', marginTop: 10 },
  message: {
    fontSize: 14,
    color: '#444',
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: '600' },
});