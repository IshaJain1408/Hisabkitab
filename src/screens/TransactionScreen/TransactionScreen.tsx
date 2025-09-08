import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './TransactionScreen.styles';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import TransactionModal from '../../components/common/TransactionModal/TransactionModal';
import { useTransactionLogic } from '../../hooks/UseTransactionLogic';
import TransactionList from '../../components/user/TransactionList/TransactionList';
import {
  SHEET_NAMES,
  TAB_BUTTON_TEXT,
} from '../../constants/TransactionConstants';
import { parseRowData } from '../../utils/TransactionHelpers';

const TransactionScreen = () => {
  const [editData, setEditData] = useState<any>(null);
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);

  const {
    showModal,
    sheets,
    setShowModal,
    handleTransactionSave: handleSaleSave,
    handlePurchaseSave,
    handleInventorySave,
    fetchCurrentUser,
    fetchSheetData,
    deleteCustomerRow,
  } = useTransactionLogic();

  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState('Purchase');

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
      fetchSheetData();

      if (
        route.params?.selectedTab &&
        SHEET_NAMES.includes(route.params.selectedTab)
      ) {
        setActiveTab(route.params.selectedTab);
      }
    }, [fetchCurrentUser, fetchSheetData, route.params?.selectedTab]),
  );

  const getButtonText = () => {
    return TAB_BUTTON_TEXT[activeTab] || '';
  };

  const handleAction = () => {
    if (activeTab !== 'Inventory Log') {
      setEditData(null);
      setEditIndex(undefined);
      setShowModal(true);
    }
  };

  const handleEdit = (rowData: string[], rowIndex: number) => {
    setEditData(parseRowData(activeTab, rowData));
    setEditIndex(rowIndex);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <TransactionList
        activeTab={activeTab}
        sheets={sheets}
        deleteRow={deleteCustomerRow}
        onEdit={handleEdit}
      />
      {activeTab !== 'Inventory Log' && (
        <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
          <Text style={styles.actionButtonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      )}
      {showModal && (
        <TransactionModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSave={
            activeTab === 'Purchase'
              ? handlePurchaseSave
              : activeTab === 'Inventory'
              ? handleInventorySave
              : handleSaleSave
          }
          activeTab={activeTab}
          initialValues={editData}
          editRowIndex={editIndex}
        />
      )}
    </View>
  );
};

export default TransactionScreen;
