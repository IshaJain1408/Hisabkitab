import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Header from '../components/common/Header';
import TransactionModal from '../components/common/TransactionModal';
import CustomerList from '../components/customer/CustomerList';
import { useCustomerScreenLogic } from '../hooks/useCustomerScreenLogic';
import DownloadBalanceSheetButton from '../components/common/DownloadBalanceSheetButton';

const tabs = ['Purchase', 'Sales', 'Inventory', 'Inventory Log'];

const CustomerScreen = () => {
  const {
    user,
    showModal,
    customers,
    setShowModal,
    handleTransactionSave: handleSaleSave,
    handlePurchaseSave,
    handleInventorySave,
    handleLogout,
    fetchCurrentUser,
    fetchCustomerData,
  } = useCustomerScreenLogic();
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
      <Header handleLogout={handleLogout} userName={user?.user?.name || ''} />
      <DownloadBalanceSheetButton />
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <CustomerList
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

export default CustomerScreen;

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
