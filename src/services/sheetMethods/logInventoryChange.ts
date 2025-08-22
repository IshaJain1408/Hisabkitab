import { appendData } from './AppendData';
import { InventoryActionType } from '../GoogleSheetService';

export async function logInventoryChange(
  spreadsheetId: string,
  token: string,
  productName: string,
  quantityChange: number,
  source: InventoryActionType,
  timestamp?: string   
): Promise<void> {
  const finalTimestamp = timestamp || new Date().toLocaleString('en-IN'); 
  const sign = quantityChange > 0 ? '+' : '';
  const values = [[productName, `${sign}${quantityChange}`, finalTimestamp, source]];

  await appendData(spreadsheetId, token, 'Inventory Log', values);
}
