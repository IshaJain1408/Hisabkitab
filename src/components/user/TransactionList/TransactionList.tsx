import React from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import styles from './TransactionList.styles';
import { CustomerListProps } from '../../../types/TransactionTypes';
import { SECTION_TITLES } from '../../../constants/TransactionConstants';
import {
  isRowEmpty,
  shouldIncludeRow,
  getRowDisplayData,
} from '../../../utils/RowUtils';
import { parseDate, formatOnlyDate } from '../../../utils/DateUtils';
import TransactionCard from '../transactionCard/TransactionCard';
import { InventoryActionType } from '../../../services/spreadsheet/google/GoogleSheetService';

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
    const isValidRow =
      !isRowEmpty(rowWithoutSheetName) && shouldIncludeRow(row, activeTab);

    if (activeTab === 'Inventory') {
      const qty = Number(row[2]);
      if (isNaN(qty) || qty <= 0) {
        return false;
      }
    }

    return isValidRow;
  });

  const dataWithOriginalIndex = filteredData.map(row => ({
    row,
    originalIndex: groupedBySheet[activeTab].indexOf(row),
  }));

  const sortedData = [...dataWithOriginalIndex].sort(
    (a, b) => parseDate(b.row[3]).getTime() - parseDate(a.row[3]).getTime(),
  );

  console.log(sortedData, 'sortedData');

  if (sortedData.length <= 0) {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/empty.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  }

  let lastRenderedDate = '';

  return (
    <ScrollView style={styles.container}>
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
              deleteRow={(sheetName: string, rowIndex: number) => {
                deleteRow(sheetName as InventoryActionType, rowIndex);
              }}
              originalIndex={originalIndex}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

export default TransactionList;
