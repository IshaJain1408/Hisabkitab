import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hisab: {
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  kitab: {
    color: '#FC991A',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 100,
  },
  logoBox: {
    alignItems: 'center',
    marginTop: 100,
  },
  subText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#FC991A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: width * 0.7,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',

    fontSize: 16,
  },
});