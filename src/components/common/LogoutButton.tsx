import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => (
  <TouchableOpacity style={styles.addButton} onPress={onLogout}>
    <Text style={styles.addButtonText}>Logout</Text>
  </TouchableOpacity>
);

export default LogoutButton;

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
