export interface CustomerListProps {
  customers: string[][];
  activeTab: string;
  deleteRow: (sheetName: string, rowIndex: number) => void;
  onEdit: (rowData: string[], rowIndex: number) => void;
}

export interface RowDisplayData {
  productName: string;
  displayValue: string;
  timestamp: string;
  isAdded?: boolean;
  statusLabel?: string;
}
