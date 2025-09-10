import {
  DeletedColumnIndex,
  UpdatedColumnIndex,
} from '../constants/TransactionConstants';
import { RowDisplayData } from '../types/transactionTypes';

export const isRowEmpty = (row: string[]) =>
  row.every(cell => !cell || cell.trim() === '');

export const shouldIncludeRow = (row: string[], activeTab: string): boolean => {
  const deletedIndex = DeletedColumnIndex[activeTab];
  const updatedIndex = UpdatedColumnIndex[activeTab];

  if (deletedIndex === undefined || updatedIndex === undefined) return true;

  const isDeleted = row[deletedIndex]?.toLowerCase() || '';
  const isUpdated =
    (row[updatedIndex] || '').toString().toLowerCase() === 'true';

  return isDeleted !== 'true' && !isUpdated;
};

export const getRowDisplayData = (
  row: string[],
  activeTab: string,
): RowDisplayData => {
  switch (activeTab) {
    case 'Purchases':
      return {
        productName: row[1],
        displayValue: `₹ ${row[2]}`,
        timestamp: row[5],
      };
    case 'Sales':
      return {
        productName: row[4],
        displayValue: `₹ ${row[6]}`,
        timestamp: row[7],
      };
    case 'Inventory':
      return {
        productName: row[1],
        displayValue: `Qty ${row[2]}`,
        timestamp: row[5],
      };
    case 'Inventory Logs': {
      const qtyNumber = Number(row[2]);
      const isAdded =
        (row[4] === 'Purchases' || row[4] === 'Inventory') && qtyNumber >= 0;
      return {
        productName: row[1],
        displayValue: `Qty ${Math.abs(qtyNumber)}`,
        timestamp: row[3],
        isAdded,
        statusLabel: isAdded ? 'Item Added' : 'Item Removed',
      };
    }
    default:
      return { productName: '', displayValue: '', timestamp: '' };
  }
};
