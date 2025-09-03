import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import styles from './DownloadBalanceSheetButton.styles';
import Icon from 'react-native-vector-icons/Feather';
import { RootStackParamList } from '../../../types/Types';

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

export default DownloadBalanceSheetButton;
