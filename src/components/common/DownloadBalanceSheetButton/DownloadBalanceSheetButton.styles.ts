import { StyleSheet } from "react-native";

export default StyleSheet.create({
  button: {
    backgroundColor: '#f7931e',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});