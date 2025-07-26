import React from 'react';
import { View, TextInput, StyleSheet, Image } from 'react-native';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

const CustomerSearchBar: React.FC<Props> = ({ value, onChange }) => (
  <View style={styles.searchContainer}>
    <Image
      source={require('../../assets/Search.png')}
      style={styles.searchIcon}
    />
    <TextInput
      placeholder="Search"
      placeholderTextColor="#888"
      style={styles.searchInput}
      value={value}
      onChangeText={onChange}
    />
  </View>
);

export default CustomerSearchBar;

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});
