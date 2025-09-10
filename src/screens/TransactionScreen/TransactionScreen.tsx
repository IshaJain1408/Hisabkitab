import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './TransactionScreen.styles';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import TransactionModal from '../../components/common/TransactionModal/TransactionModal';
import { useTransactionLogic } from '../../hooks/UseTransactionLogic';
import TransactionList from '../../components/user/TransactionList/TransactionList';
import {
  SheetNames,
  TabButtonText,
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
  const [activeTab, setActiveTab] = useState('Purchases');

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
      fetchSheetData();

      if (
        route.params?.selectedTab &&
        SheetNames.includes(route.params.selectedTab)
      ) {
        setActiveTab(route.params.selectedTab);
      }
    }, [fetchCurrentUser, fetchSheetData, route.params?.selectedTab]),
  );

  const getButtonText = () => {
    return TabButtonText[activeTab] || '';
  };

  const handleAction = () => {
    if (activeTab !== 'Inventory Logs') {
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
      {activeTab !== 'Inventory Logs' && (
        <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
          <Text style={styles.actionButtonText}>{getButtonText()}</Text>
        </TouchableOpacity>
      )}
      {showModal && (
        <TransactionModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSave={
            activeTab === 'Purchases'
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
