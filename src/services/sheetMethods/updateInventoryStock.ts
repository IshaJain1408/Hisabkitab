import { appendData } from './appendData';
import { getSheetData } from './getSheetData';
import { axiosInstance } from '../axiosInstance';

export async function updateInventoryStock(
  spreadsheetId: string,
  token: string,
  productName: string,
  quantityChange: number
): Promise<void> {
  try {
    const inventoryData = await getSheetData(spreadsheetId, token, 'Inventory');
    if (!inventoryData) return;

    const sanitizedProductName = productName.trim();
    const index = inventoryData.findIndex(row => row[0]?.trim() === sanitizedProductName);
    const timestamp = new Date().toLocaleString();

    if (index === -1) {
      await appendData(spreadsheetId, token, 'Inventory', [[sanitizedProductName, quantityChange.toString(), timestamp]]);
      return;
    }

    const currentStock = parseInt(inventoryData[index][1] || '0', 10);
    const newStock = currentStock + quantityChange;
    const range = `Inventory!B${index + 2}:C${index + 2}`;

    await axiosInstance.put(
      `/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      { values: [[newStock.toString(), timestamp]] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error('Error in updateInventoryStock:', error);
  }
}