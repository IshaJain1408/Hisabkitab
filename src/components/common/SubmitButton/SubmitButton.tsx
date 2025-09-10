import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from './SubmitButton.styles';

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
