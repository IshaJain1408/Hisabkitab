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
  onCardPress: () => void;
  activeTab: string;
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

const formatDateTime = (input: string): string => {
  try {
    const date = parseDate(input);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${day} ${month} ${year}, ${time}`;
  } catch {
    return 'Invalid Date';
  }
};

const TransactionList: React.FC<CustomerListProps> = ({
  customers,
  activeTab,
}) => {
  const groupedBySheet: Record<string, string[][]> = {};

  customers.forEach(row => {
    const sheet = row[0];
    if (!groupedBySheet[sheet]) groupedBySheet[sheet] = [];
    groupedBySheet[sheet].push(row);
  });

  const filteredData = groupedBySheet[activeTab] || [];

  const sortedData = [...filteredData].sort(
    (a, b) => parseDate(b[3]).getTime() - parseDate(a[3]).getTime(),
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

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Text style={styles.sectionTitle}>
        {sectionTitles[activeTab] || activeTab}
      </Text>

      {sortedData.map((row, index) => {
        let productName = '';
        let amountText = '';
        let timestamp = '';
        let statusLabel = '';
        let isAdded = false;

        switch (activeTab) {
          case 'Purchase':
            productName = row[1];
            amountText = `₹ ${row[2]}`;
            timestamp = row[3];
            break;
          case 'Sales':
            productName = row[4];
            amountText = `₹ ${row[6]}`;
            timestamp = row[1];
            break;
          case 'Inventory':
            productName = row[1];
            amountText = `Qty ${row[2]}`;
            timestamp = row[2];
            break;
          case 'Inventory Log':
            productName = row[1];
            amountText = `Qty ${row[2]}`;
            timestamp = row[3];
            isAdded = row[4] === 'Purchase' || row[4] === 'Inventory';
            statusLabel = isAdded ? 'Item Added' : 'Item Removed';
            break;
        }

        return (
          <View key={index}>
            {activeTab === 'Inventory Log' && (
              <View
                style={[
                  styles.statusContainer,
                  isAdded ? styles.added : styles.removed,
                ]}
              >
                <Text style={styles.statusText}>
                  {`${statusLabel} ${formatDateTime(timestamp)}`}
                </Text>
              </View>
            )}

            <View style={styles.transactionCard}>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productName}>
                  {productName || 'No Name'}
                </Text>
              </View>

              <View style={styles.amountBox}>
                <Text style={styles.amountText}>{amountText}</Text>
              </View>
              {activeTab !== 'Inventory Log' && (
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
                            console.log('delete');
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
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
    marginVertical: 12,
    marginLeft: 8,
    color: '#1A1A1A',
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
    marginTop: 80,
  },
  image: {
    width: 200,
    height: 200,
  },
  statusContainer: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
  },
  added: {
    backgroundColor: '#FEEBCB',
  },
  removed: {
    backgroundColor: '#FECBCB',
  },
  statusText: {
    fontWeight: '600',
    color: '#000',
  },
});

export default TransactionList;
