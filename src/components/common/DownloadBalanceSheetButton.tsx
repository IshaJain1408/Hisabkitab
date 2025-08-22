import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RootStackParamList } from '../../types/types';

const DownloadBalanceSheetButton: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDownload = () => {
    navigation.navigate('BalanceSheetScreen');
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleDownload}
      accessibilityLabel="Download Balance Sheet"
      accessible={true}
    >
      <View style={styles.innerContainer}>
        <Icon name="download" size={18} color="#fff" />
        <Text style={styles.buttonText}>Download Balance Sheet</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default DownloadBalanceSheetButton;
