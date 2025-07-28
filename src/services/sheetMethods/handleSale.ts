import { appendData } from './appendData';
import { updateInventoryStock } from './updateInventoryStock';
import { logInventoryChange } from './logInventoryChange';

export async function handleSale(
  spreadsheetId: string,
  token: string,
  productName: string,
  saleData: string[][],
  quantity: number
): Promise<void> {
  await appendData(spreadsheetId, token, 'Sales', saleData);
  await updateInventoryStock(spreadsheetId, token, productName, -quantity);
  await logInventoryChange(spreadsheetId, token, productName, -quantity, 'Sale');
}