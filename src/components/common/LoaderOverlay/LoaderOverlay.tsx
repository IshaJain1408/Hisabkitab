import React from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';
import styles from './LoaderOverlay.styles';

const LoaderOverlay = ({ visible }: { visible: boolean }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    </Modal>
  );
};

export default LoaderOverlay;
