import React, { useEffect, useState } from 'react';
import { Modal, View, Text } from 'react-native';
import styles from './SuccessPopup.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

let showSuccess: ((message: string) => void) | null = null;

export const SuccessPopup = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  showSuccess = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={50} color="#FFA500" />
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export const showSuccessPopup = (msg: string) => {
  if (showSuccess) showSuccess(msg);
  else console.warn('SuccessPopup not mounted in App.tsx');
};
