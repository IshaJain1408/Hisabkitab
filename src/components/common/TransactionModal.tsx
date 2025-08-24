import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PurchaseForm from '../forms/PurchaseForm';
import TransactionForm from '../forms/TransactionForm';
import InventoryForm from '../forms/InventoryForm';
interface Props {
  visible: boolean;
  onClose: () => void;
  activeTab: string;
  onSave: (data: any, editRowIndex?: number) => void;
  initialValues?: any;
  editRowIndex?: number;
}

const TransactionModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  activeTab,
  initialValues,
  editRowIndex,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.popupModal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {editRowIndex !== undefined ? 'Edit' : 'Add'}{' '}
            {activeTab === 'Purchase'
              ? 'Purchase'
              : activeTab === 'Sales'
              ? 'Sale'
              : activeTab === 'Inventory'
              ? 'Inventory'
              : 'Transaction'}
          </Text>

          {activeTab === 'Purchase' && (
            <PurchaseForm
              onSave={data => onSave(data, editRowIndex)}
              onClose={onClose}
              initialValues={initialValues}
              editRowIndex={editRowIndex}
            />
          )}
          {activeTab === 'Sales' && (
            <TransactionForm
              onSave={data => onSave(data, editRowIndex)}
              onClose={onClose}
              initialValues={initialValues}
              editRowIndex={editRowIndex}
            />
          )}
          {activeTab === 'Inventory' && (
            <InventoryForm
              onSave={data => onSave(data, editRowIndex)}
              onClose={onClose}
              initialValues={initialValues}
              editRowIndex={editRowIndex}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  popupModal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelText: {
    color: 'red',
    marginTop: 15,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 5,
    fontSize: 12,
    marginLeft: 5,
  },
});
