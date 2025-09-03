import { Dimensions, StyleSheet } from "react-native";

const { height: screenHeight } = Dimensions.get('window');


export default StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  scrollContent: {
    minHeight: screenHeight,
    padding: 16,
  },
  cardContainer: {
    gap: 15,
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 6,
  },
  cardImage: {
    width: 100,
    height: 100,
    marginRight: 20,
    resizeMode: 'contain',
  },
  cardTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    paddingRight: 20,
    textAlign: 'right',
  },
});