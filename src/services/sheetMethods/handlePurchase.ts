import { appendData } from './appendData';
import { updateInventoryStock } from './updateInventoryStock';
import { logInventoryChange } from './logInventoryChange';

export async function handlePurchase(
  spreadsheetId: string,
  token: string,
  productName: string,
  purchaseData: string[][],
  quantity: number
): Promise<void> {
  try {
    await appendData(spreadsheetId, token, 'Purchase', purchaseData);
    await updateInventoryStock(spreadsheetId, token, productName, quantity);
    await logInventoryChange(spreadsheetId, token, productName, quantity, 'Purchase');
  } catch (error) {
    console.error('Error in handlePurchase:', error);
  }
}