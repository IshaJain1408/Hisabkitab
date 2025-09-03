import { Dimensions, StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 42,
    backgroundColor: '#f1f3f6',
    flexGrow: 1,
  },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  button: {
    backgroundColor: '#FC991A',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  pdfContainer: {
    height: Dimensions.get('window').height * 0.7,
    marginTop: 20,
    },
    pdfViewer: {
    flex: 1,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
});