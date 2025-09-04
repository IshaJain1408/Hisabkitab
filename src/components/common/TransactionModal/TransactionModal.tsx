import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from './TransactionModal.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PurchaseForm from '../../forms/PurchaseForm';
import SaleForm from '../../forms/SaleForm';
import InventoryForm from '../../forms/InventoryForm';
interface Props {
  visible: boolean;
  onClose: () => void;
  activeTab: string;
  onSave: (data: any, editRowIndex?: number) => Promise<void> | void;
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
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: any) => {
    try {
      setLoading(true);
      await onSave(data, editRowIndex);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      setLoading(false);
    }
  };

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
          {loading ? (
            <ActivityIndicator size="large" color="#FFA500" />
          ) : (
            <>
              {activeTab === 'Purchase' && (
                <PurchaseForm
                  onSave={handleSave}
                  onClose={onClose}
                  initialValues={initialValues}
                  editRowIndex={editRowIndex}
                />
              )}
              {activeTab === 'Sales' && (
                <SaleForm
                  onSave={handleSave}
                  onClose={onClose}
                  initialValues={initialValues}
                  editRowIndex={editRowIndex}
                />
              )}
              {activeTab === 'Inventory' && (
                <InventoryForm
                  onSave={handleSave}
                  onClose={onClose}
                  initialValues={initialValues}
                  editRowIndex={editRowIndex}
                />
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TransactionModal;
