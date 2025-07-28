
import { sheetExists } from './sheetMethods/sheetExists';
import { createSheet } from './sheetMethods/createSheet';
import { appendData } from './sheetMethods/appendData';
import { getSheetData } from './sheetMethods/getSheetData';
import { updateInventoryStock } from './sheetMethods/updateInventoryStock';
import { logInventoryChange } from './sheetMethods/logInventoryChange';
import { handlePurchase } from './sheetMethods/handlePurchase';
import { handleSale } from './sheetMethods/handleSale';
import { getBalanceSheet } from './sheetMethods/getBalanceSheet';

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
}
