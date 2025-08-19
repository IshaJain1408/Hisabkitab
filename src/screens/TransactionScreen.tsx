import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import TransactionModal from '../components/common/TransactionModal';
import { useTransactionLogic } from '../hooks/useTransactionLogic';
import TransactionList from '../components/user/TransactionList';

const tabs = ['Purchase', 'Sales', 'Inventory', 'Inventory Log'];

const TransactionScreen = () => {
  const [editData, setEditData] = useState<any>(null);
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);

  const {
    showModal,
    customers,
    setShowModal,
    handleTransactionSave: handleSaleSave,
    handlePurchaseSave,
    handleInventorySave,
    fetchCurrentUser,
    fetchCustomerData,
    deleteCustomerRow,
  } = useTransactionLogic();

  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState('Purchase');

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
      fetchCustomerData();

      if (
        route.params?.selectedTab &&
        tabs.includes(route.params.selectedTab)
      ) {
        setActiveTab(route.params.selectedTab);
      }
    }, [fetchCurrentUser, fetchCustomerData, route.params?.selectedTab]),
  );

  const getButtonText = () => {
    switch (activeTab) {
      case 'Purchase':
        return 'Add Purchase';
      case 'Sales':
        return 'Add Sale';
      case 'Inventory':
        return 'Add New Item';
      default:
        return '';
    }
  };

  const handleAction = () => {
    if (activeTab !== 'Inventory Log') {
      setEditData(null);
      setEditIndex(undefined);
      setShowModal(true);
    }
  };

  const handleEdit = (rowData: string[], rowIndex: number) => {
    let parsedData: any = {};
    if (activeTab === 'Purchase') {
      parsedData = {
        productName: rowData[1] || '',
        purchasingPrice: rowData[2] || '',
        quantity: rowData[3] || '',
        unit: rowData[4] || 'pcs',
      };
    } else if (activeTab === 'Sales') {
      parsedData = {
        name: rowData[3] || '',
        productName: rowData[4] || '',
        number: rowData[5] || '',
        amount: rowData[6] || '',
        quantity: rowData[7] || '',
        message: rowData[8] || '',
      };
    } else if (activeTab === 'Inventory') {
      parsedData = {
        productName: rowData[1] || '',
        purchasingPrice: rowData[5] || '',
        quantity: rowData[2] || '',
        unit: rowData[6] || 'pcs',
      };
    }
    setEditData(parsedData);
    setEditIndex(rowIndex);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <TransactionList
        activeTab={activeTab}
        customers={customers}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  actionButton: {
    marginBottom: 50,
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
  },

  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default TransactionScreen;
