import { InventoryActionType } from "../services/GoogleSheetService";

export interface CustomerListProps {
  customers: string[][];
  activeTab: string;
  deleteRow: (sheetName: InventoryActionType, rowIndex: number) => Promise<void>;
  onEdit: (rowData: string[], rowIndex: number) => void;
}

export interface RowDisplayData {
  productName: string;
  displayValue: string;
  timestamp: string;
  isAdded?: boolean;
  statusLabel?: string;
}
