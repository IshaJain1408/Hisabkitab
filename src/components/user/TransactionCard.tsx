import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatOnlyTime } from '../../utils/DateUtils';
import { RowDisplayData } from '../../types/TransactionTypes';
import { Alert } from 'react-native';

interface Props {
  rowData: string[];
  displayData: RowDisplayData;
  activeTab: string;
  onEdit: (row: string[], index: number) => void;
  deleteRow: (sheetName: string, index: number) => void;
  originalIndex: number;
}

const TransactionCard: React.FC<Props> = ({
  rowData,
  displayData,
  activeTab,
  onEdit,
  deleteRow,
  originalIndex,
}) => {
  const { productName, displayValue, timestamp, isAdded, statusLabel } =
    displayData;

  const getQuantity = () => {
    switch (activeTab) {
      case 'Purchase':
        return rowData[3];
      case 'Sales':
        return rowData[7];
      default:
        return null;
    }
  };

  const quantity = getQuantity();

  return (
    <View style={styles.transactionCard}>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.productName}>{productName || 'No Name'}</Text>
        {quantity && <Text style={styles.quantityText}>Qty: {quantity}</Text>}

        {activeTab === 'Inventory Log' && (
          <View style={styles.status}>
            <Text style={[styles.timestampText, { marginRight: 10 }]}>
              {formatOnlyTime(timestamp)}
            </Text>
            <Text
              style={[
                styles.statusText,
                isAdded ? styles.added : styles.removed,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.amountBox}>
        <Text style={styles.amountText}>{displayValue}</Text>
      </View>

      {(activeTab === 'Inventory' && rowData[8] === 'TRUE') ||
      (activeTab !== 'Inventory' && activeTab !== 'Inventory Log') ? (
        <>
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={() => onEdit(rowData, originalIndex + 2)}
          >
            <Ionicons
              name="create-outline"
              size={23}
              style={{ color: '#CC8FEC' }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={() =>
              Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this entry?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteRow(activeTab, originalIndex + 2),
                  },
                ],
              )
            }
          >
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  status: { flexDirection: 'row', alignItems: 'center' },
  productName: { fontSize: 17, fontWeight: '600', color: '#1A1A1A' },
  timestampText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  amountBox: {
    backgroundColor: '#FFF2E0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
    fontWeight: '500',
  },
  amountText: { color: '#F78C1F', fontWeight: '700', fontSize: 15 },
  added: { color: '#CC8FEC' },
  removed: { color: '#FF0000' },
  statusText: { fontWeight: '600', color: '#000' },
});

export default TransactionCard;
