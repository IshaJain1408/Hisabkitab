import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
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
