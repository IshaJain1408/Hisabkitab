import { appendData } from './appendData';
import { InventoryActionType } from '../GoogleSheetService';

export async function logInventoryChange(
  spreadsheetId: string,
  token: string,
  productName: string,
  quantityChange: number,
  source: InventoryActionType
): Promise<void> {
  const timestamp = new Date().toLocaleString();
  const sign = quantityChange > 0 ? '+' : '';
  const values = [[productName, `${sign}${quantityChange}`, timestamp, source]];

  await appendData(spreadsheetId, token, 'Inventory Log', values);
}