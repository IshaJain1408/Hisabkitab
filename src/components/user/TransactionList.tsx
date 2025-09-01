import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { CustomerListProps } from '../../types/TransactionTypes';
import { SECTION_TITLES } from '../../constants/TransactionConstants';
import {
  isRowEmpty,
  shouldIncludeRow,
  getRowDisplayData,
} from '../../utils/RowUtils';
import { parseDate, formatOnlyDate } from '../../utils/DateUtils';
import TransactionCard from './TransactionCard';
import { InventoryActionType } from '../../services/spreadsheet/google/GoogleSheetService';

const TransactionList: React.FC<CustomerListProps> = ({
  customers,
  activeTab,
  deleteRow,
  onEdit,
}) => {
  const groupedBySheet: Record<string, string[][]> = {};
  customers.forEach(row => {
    const sheet = row[0];
    groupedBySheet[sheet] = [...(groupedBySheet[sheet] || []), row];
  });

  const filteredData = (groupedBySheet[activeTab] || []).filter(row => {
    const rowWithoutSheetName = row.slice(1);
    return !isRowEmpty(rowWithoutSheetName) && shouldIncludeRow(row, activeTab);
  });

  const dataWithOriginalIndex = filteredData.map(row => ({
    row,
    originalIndex: groupedBySheet[activeTab].indexOf(row),
  }));

  const sortedData = [...dataWithOriginalIndex].sort(
    (a, b) => parseDate(b.row[3]).getTime() - parseDate(a.row[3]).getTime(),
  );

  if (sortedData.length <= 0) {
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
        {SECTION_TITLES[activeTab] || activeTab}
      </Text>

      {sortedData.map(({ row, originalIndex }, index) => {
        const displayData = getRowDisplayData(row, activeTab);

        let renderDateLabel = null;
        if (activeTab === 'Inventory Log') {
          const currentDate = formatOnlyDate(displayData.timestamp);
          if (currentDate !== lastRenderedDate) {
            renderDateLabel = (
              <Text style={styles.statusContainer}>{currentDate}</Text>
            );
            lastRenderedDate = currentDate;
          }
        }

        return (
          <View key={index}>
            {renderDateLabel}
            <TransactionCard
              rowData={row}
              displayData={displayData}
              activeTab={activeTab}
              onEdit={onEdit}
              deleteRow={(sheetName: string, index: number) => {
                deleteRow(sheetName as InventoryActionType, index);
              }}
              originalIndex={originalIndex}
            />
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
  imageContainer: { alignItems: 'center', marginTop: 100 },
  image: { width: 300, height: 300 },
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
});

export default TransactionList;
