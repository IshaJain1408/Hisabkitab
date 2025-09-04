import { DELETED_COLUMN_INDEX, UPDATED_COLUMN_INDEX } from '../constants/TransactionConstants';
import { RowDisplayData } from '../types/transactionTypes';

export const isRowEmpty = (row: string[]) => row.every(cell => !cell || cell.trim() === '');

export const shouldIncludeRow = (row: string[], activeTab: string): boolean => {
  const deletedIndex = DELETED_COLUMN_INDEX[activeTab];
  const updatedIndex = UPDATED_COLUMN_INDEX[activeTab];

  if (deletedIndex === undefined || updatedIndex === undefined) return true;

  const status = row[deletedIndex]?.toLowerCase() || '';
  const isUpdated = (row[updatedIndex] || '').toString().toLowerCase() === 'true';

  return status !== 'true' && !isUpdated;
};

export const getRowDisplayData = (row: string[], activeTab: string): RowDisplayData => {
  switch (activeTab) {
    case 'Purchase':
      return { productName: row[1], displayValue: `₹ ${row[2]}`, timestamp: row[5] };
    case 'Sales':
      return { productName: row[4], displayValue: `₹ ${row[6]}`, timestamp: row[7] };
    case 'Inventory':
      return { productName: row[1], displayValue: `Qty ${row[2]}`, timestamp: row[5] };
    case 'Inventory Log': {
      const qtyNumber = Number(row[2]);
      const isAdded = (row[4] === 'Purchase' || row[4] === 'Inventory') && qtyNumber >= 0;
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
