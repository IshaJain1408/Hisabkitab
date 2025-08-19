import React from 'react';
import { Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

interface CustomerListProps {
  customers: string[][];
  activeTab: string;
  deleteRow: (sheetName: string, rowIndex: number) => void;
  onEdit: (rowData: string[], rowIndex: number) => void;
}

const sectionTitles: Record<string, string> = {
  Purchase: 'Purchase History',
  Sales: 'Sales History',
  Inventory: 'Inventory Items',
  'Inventory Log': 'Inventory Logs',
};

const parseDate = (input: string): Date => {
  try {
    const [datePart, timePart] = input.split(',').map(part => part.trim());
    const [month, day, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  } catch {
    return new Date(0);
  }
};

const formatOnlyDate = (input: string): string => {
  try {
    const date = parseDate(input);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return 'Invalid Date';
  }
};
const formatOnlyTime = (input: string): string => {
  try {
    const date = parseDate(input);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid Time';
  }
};

const TransactionList: React.FC<CustomerListProps> = ({
  customers,
  activeTab,
  deleteRow,
  onEdit,
}) => {
  const groupedBySheet: Record<string, string[][]> = {};
  customers.forEach(row => {
    const sheet = row[0];
    if (!groupedBySheet[sheet]) groupedBySheet[sheet] = [];
    groupedBySheet[sheet].push(row);
  });

  const getStatusColumnIndex = (sheetName: string): number => {
    switch (sheetName) {
      case 'Purchase':
        return 7;
      case 'Sales':
        return 9;
      case 'Inventory':
        return 4;
      default:
        return -1;
    }
  };

  function getIsUpdatedColumnIndex(tab: string): number {
    switch (tab) {
      case 'Sales':
        return 10;
      case 'Inventory':
        return 7;
      case 'Purchase':
        return 8;
      default:
        return -1;
    }
  }

  const filteredData = (groupedBySheet[activeTab] || []).filter(row => {
    // Ignore completely empty rows (except the first column which is sheet name)
    const rowWithoutSheetName = row.slice(1);
    const isRowEmpty = rowWithoutSheetName.every(
      cell => !cell || cell.trim() === '',
    );
    if (isRowEmpty) return false;

    const statusIndex = getStatusColumnIndex(activeTab);
    const isUpdatedIndex = getIsUpdatedColumnIndex(activeTab);

    if (statusIndex === -1 || isUpdatedIndex === -1) return true;

    const status = row[statusIndex]?.toLowerCase() || '';
    const isUpdated =
      (row[isUpdatedIndex] || '').toString().toLowerCase() === 'true';

    return status !== 'deleted' && !isUpdated;
  });

  console.log(filteredData, 'filteredData');
  const dataWithOriginalIndex = filteredData.map(row => ({
    row,
    originalIndex: groupedBySheet[activeTab].indexOf(row),
  }));

  const sortedData = [...dataWithOriginalIndex].sort(
    (a, b) => parseDate(b.row[3]).getTime() - parseDate(a.row[3]).getTime(),
  );

  if (sortedData.length === 0) {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/empty.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  }

  let lastRenderedDate = '';

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Text style={styles.sectionTitle}>
        {sectionTitles[activeTab] || activeTab}
      </Text>

      {sortedData.map(({ row, originalIndex }, index) => {
        let productName = '';
        let amountText = '';
        let quantity = '';
        let timestamp = '';
        let statusLabel = '';
        let isAdded = false;

        switch (activeTab) {
          case 'Purchase':
            productName = row[1];
            amountText = `₹ ${row[2]}`;
            timestamp = row[5];
            break;
          case 'Sales':
            productName = row[4];
            amountText = `₹ ${row[6]}`;
            timestamp = row[7];
            break;
          case 'Inventory':
            productName = row[1];
            amountText = `Qty ${row[2]}`;
            timestamp = row[5];
            break;
          case 'Inventory Log':
            productName = row[1];
            const qtyNumber = Number(row[2]);
            quantity = `Qty ${Math.abs(qtyNumber)}`;
            timestamp = row[3];
            isAdded =
              (row[4] === 'Purchase' || row[4] === 'Inventory') &&
              qtyNumber >= 0;
            statusLabel = isAdded ? 'Item Added' : 'Item Removed';
            break;
        }

        let renderDateLabel = null;
        if (activeTab === 'Inventory Log') {
          const currentDate = formatOnlyDate(timestamp);
          if (currentDate !== lastRenderedDate) {
            renderDateLabel = (
              <View>
                <Text style={styles.statusContainer}>{currentDate}</Text>
              </View>
            );
            lastRenderedDate = currentDate;
          }
        }

        return (
          <View key={index}>
            {activeTab === 'Inventory Log' && renderDateLabel}

            <View style={styles.transactionCard}>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productName}>
                  {productName || 'No Name'}
                </Text>
                {activeTab === 'Inventory Log' && (
                  <View style={[styles.status]}>
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
                <Text style={styles.amountText}>{amountText || quantity}</Text>
              </View>
              {activeTab !== 'Inventory Log' && (
                <>
                  <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => {
                      onEdit(row, originalIndex + 2);
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={23}
                      style={{ color: '#CC8FEC' }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => {
                      Alert.alert(
                        'Confirm Delete',
                        'Are you sure you want to delete this entry?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                              deleteRow(activeTab, originalIndex + 1);
                            },
                          },
                        ],
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    color: '#1A1A1A',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  timestampText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  amountBox: {
    backgroundColor: '#FFF2E0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  amountText: {
    color: '#F78C1F',
    fontWeight: '700',
    fontSize: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 180,
  },
  image: {
    width: 200,
    height: 200,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  statusContainer: {
    backgroundColor: '#FFF2E0',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontWeight: '600',
    color: '#000',
    borderRadius: 20,
    marginTop: 16,
  },
  added: {
    color: '#CC8FEC',
  },
  removed: {
    color: '#FF0000',
  },
  statusText: {
    fontWeight: '600',
    color: '#000',
  },
});

export default TransactionList;
