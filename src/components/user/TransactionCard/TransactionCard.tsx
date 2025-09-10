import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './TransactionCard.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatOnlyTime } from '../../../utils/DateUtils';
import { RowDisplayData } from '../../../types/TransactionTypes';
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
      case 'Purchases':
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
      <View style={styles.productInfoContainer}>
        <Text style={styles.productName}>{productName || 'No Name'}</Text>
        {quantity && <Text style={styles.quantityText}>Qty: {quantity}</Text>}

        {activeTab === 'Inventory Logs' && (
          <View style={styles.status}>
            <Text style={[styles.timestampText, styles.marginRight10]}>
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
      (activeTab !== 'Inventory' && activeTab !== 'Inventory Logs') ? (
        <>
          <TouchableOpacity
            style={styles.marginLeft10}
            onPress={() => onEdit(rowData, originalIndex + 2)}
          >
            <Ionicons name="create-outline" size={23} style={styles.editIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.marginLeft10}
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

export default TransactionCard;
