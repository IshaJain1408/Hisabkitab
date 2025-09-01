import { sheetExists } from '../methods/SheetExists';
import { createSheet } from '../methods/CreateSheet';
import { appendData } from '../methods/AppendData';
import { getSheetData } from '../methods/GetSheetData';
import { updateInventoryStock } from '../methods/UpdateInventoryStock';
import { logInventoryChange } from '../methods/logInventoryChange';
import { handlePurchase } from '../methods/HandlePurchase';
import { handleSale } from '../methods/HandleSale';
import { deleteRow } from '../methods/DeleteRow';
import { updateRow } from '../methods/UpdateRow';
import { markRowAsUpdated } from '../methods/MarkRowAsUpdated';
import { getBalanceSheet } from '../methods/GetBalanceSheet';

export type InventoryActionType = 'Purchase' | 'Sales' | 'Inventory';

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
  static deleteRow = deleteRow;
  static updateRow = updateRow;
  static markRowAsUpdated = markRowAsUpdated;

}
