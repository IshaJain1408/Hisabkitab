import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import TransactionModal from '../components/common/TransactionModal';
import { useTransactionLogic } from '../hooks/useTransactionLogic';
import TransactionList from '../components/user/TransactionList';

const tabs = ['Purchase', 'Sales', 'Inventory', 'Inventory Log'];

const TransactionScreen = () => {
  const {
    showModal,
    customers,
    setShowModal,
    handleTransactionSave: handleSaleSave,
    handlePurchaseSave,
    handleInventorySave,
    fetchCurrentUser,
    fetchCustomerData,
  } = useTransactionLogic();
  const route = useRoute<any>();

  const [activeTab, setActiveTab] = useState('Purchase');

  const handleCardPress = () => {};

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
        return null;
    }
  };

  const handleAction = () => {
    if (activeTab !== 'Inventory Log') {
      setShowModal(true);
    }
  };

  return (
    <View style={styles.container}>
      <TransactionList
        activeTab={activeTab}
        customers={customers}
        onCardPress={handleCardPress}
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
        />
      )}
    </View>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  sectionTitle: {
    marginTop: 25,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-start',
  },

  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F6EDE0',
    borderRadius: 6,
    marginRight: 1,
    marginBottom: 8,
  },

  activeTabButton: {
    backgroundColor: '#FFA500',
  },

  tabText: {
    color: '#000',
    fontWeight: '600',
  },

  activeTabText: {
    color: '#fff',
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
