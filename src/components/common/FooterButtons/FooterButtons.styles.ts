import { StyleSheet } from "react-native";

export default StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 20,
  },
  footerButton: {
    backgroundColor: '#FFA500',
    borderRadius: 30,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});