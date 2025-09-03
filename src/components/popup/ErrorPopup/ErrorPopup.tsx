import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import styles from './ErrorPopup.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

let showError: ((options: { title: string; message: string }) => void) | null =
  null;

export const ErrorPopup = () => {
  const [visible, setVisible] = useState(false);
  const [popupData, setPopupData] = useState({ title: '', message: '' });

  showError = ({ title, message }) => {
    setPopupData({ title, message });
    setVisible(true);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={40} color="red" />
          <Text style={styles.title}>{popupData.title}</Text>
          <Text style={styles.message}>{popupData.message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const showErrorPopup = (options: { title: string; message: string }) => {
  if (showError) showError(options);
  else console.warn('ErrorPopup not mounted in App.tsx');
};
