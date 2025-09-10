import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f4f4f4',
  },
    icon: { marginRight: 8 },
    pickerInput: {
    flex: 1,
  },
  error: { color: 'red', fontSize: 12, marginLeft: 5 },
});