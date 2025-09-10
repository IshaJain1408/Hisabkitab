import { InventoryActionType } from "../services/spreadsheet/google/GoogleSheetService";

export interface SheetListProps {
  sheets: string[][];
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
