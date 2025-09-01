import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: '600', marginTop: 10 },
  message: {
    fontSize: 14,
    color: '#444',
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: '600' },
});
