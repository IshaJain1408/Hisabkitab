import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

const SubmitButton: React.FC<Props> = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export default SubmitButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
