import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
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

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 16 },
  error: { color: 'red', fontSize: 12, marginBottom: 5, marginLeft: 5 },
});
