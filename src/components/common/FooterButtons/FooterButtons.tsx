import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from './FooterButtons.styles';

interface FooterButtonsProps {
  onMoneyInPress: () => void;
  onMoneyOutPress: () => void;
}

const FooterButtons: React.FC<FooterButtonsProps> = ({
  onMoneyInPress,
  onMoneyOutPress,
}) => (
  <View style={styles.footer}>
    <TouchableOpacity style={styles.footerButton} onPress={onMoneyInPress}>
      <Text style={styles.footerButtonText}>Money In</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.footerButton} onPress={onMoneyOutPress}>
      <Text style={styles.footerButtonText}>Money Out</Text>
    </TouchableOpacity>
  </View>
);

export default FooterButtons;
