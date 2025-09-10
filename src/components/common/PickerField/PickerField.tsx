import React from 'react';
import { View, Text } from 'react-native';
import styles from './PickerField.styles';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Option {
  label: string;
  value: string;
}

interface Props {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Option[];
  error?: string;
  icon?: string;
}

const PickerField: React.FC<Props> = ({
  selectedValue,
  onValueChange,
  options,
  error,
  icon,
}) => {
  return (
    <View style={styles.container}>
      {icon && (
        <Ionicons name={icon} size={20} color="#666" style={styles.icon} />
      )}
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.pickerInput}
      >
        {options.map(opt => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default PickerField;
