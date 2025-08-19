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
  const purchasingPrice = purchaseData[0][1];
  try {
    await appendData(spreadsheetId, token, 'Purchase', purchaseData);
    await updateInventoryStock(spreadsheetId, token, productName, quantity,  purchasingPrice
);
    await logInventoryChange(spreadsheetId, token, productName, quantity, 'Purchase');
  } catch (error) {
    console.error('Error in handlePurchase:', error);
  }
}