
import { sheetExists } from './sheetMethods/SheetExists';
import { createSheet } from './sheetMethods/CreateSheet';
import { appendData } from './sheetMethods/AppendData';
import { getSheetData } from './sheetMethods/GetSheetData';
import { updateInventoryStock } from './sheetMethods/UpdateInventoryStock';
import { logInventoryChange } from './sheetMethods/LogInventoryChange';
import { handlePurchase } from './sheetMethods/HandlePurchase';
import { handleSale } from './sheetMethods/HandleSale';
import { getBalanceSheet } from './sheetMethods/GetBalanceSheet';
import { updateRowStatus } from './sheetMethods/DeleteRow';
import { updateRow } from './sheetMethods/UpdateRow';
import { markRowAsUpdated } from './sheetMethods/MarkRowAsUpdated';

export type InventoryActionType = 'Purchase' | 'Sale' | 'Inventory';

export class GoogleSheetService {
  static sheetExists = sheetExists;
  static createSheet = createSheet;
  static appendData = appendData;
  static getSheetData = getSheetData;
  static updateInventoryStock = updateInventoryStock;
  static logInventoryChange = logInventoryChange;
  static handlePurchase = handlePurchase;
  static handleSale = handleSale;
  static getBalanceSheet = getBalanceSheet;
  static deleteRow = updateRowStatus;
  static updateRow = updateRow;
    static markRowAsUpdated = markRowAsUpdated;

}
