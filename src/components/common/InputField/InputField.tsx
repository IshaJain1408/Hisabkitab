import React from 'react';
import { View, TextInput, Text } from 'react-native';
import styles from './InputField.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  icon?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: any) => void;
  error?: string;
  keyboardType?: 'default' | 'numeric';
}

const InputField: React.FC<Props> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType = 'default',
}) => (
  <>
    <View style={styles.inputContainer}>
      {icon && (
        <Ionicons name={icon} size={20} color="#666" style={styles.icon} />
      )}
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
      />
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
  </>
);

export default InputField;
