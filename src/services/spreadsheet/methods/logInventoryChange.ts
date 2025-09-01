import { appendData } from './AppendData';
import { InventoryActionType } from '../google/GoogleSheetService';
import { getTimestamp } from '../../../utils/DateUtils';

export async function logInventoryChange(
  spreadsheetId: string,
  token: string,
  productName: string,
  quantityChange: number,
  source: InventoryActionType,
  timestamp?: string   
): Promise<void> {
  const finalTimestamp = timestamp || `'${getTimestamp()}`; 
  const sign = quantityChange > 0 ? '+' : '';
  const values = [[productName, `${sign}${quantityChange}`, finalTimestamp, source]];

  await appendData(spreadsheetId, token, 'Inventory Log', values);
}
