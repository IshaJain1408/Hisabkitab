import { appendData } from './appendData';
import { getSheetData } from './getSheetData';
import { axiosInstance } from '../axiosInstance';

export async function updateInventoryStock(
  spreadsheetId: string,
  token: string,
  productName: string,
  quantityChange: number,
  purchasingPrice?: string,
  unit?: string
): Promise<void> {
  try {
    const inventoryData = await getSheetData(spreadsheetId, token, 'Inventory');
    if (!inventoryData) return;

    const name = productName.trim();
    const index = inventoryData.findIndex(row => row[0]?.trim() === name);
    const timestamp = new Date().toLocaleString('en-IN');
    const isUpdated = 'FALSE';

    if (index === -1) {
      const newQty = quantityChange < 0 ? 0 : quantityChange; 
      await appendData(
        spreadsheetId,
        token,
        'Inventory',
        [[
          name,
          newQty.toString(),
          timestamp,
          '',
          purchasingPrice || '',
          unit || '',
          isUpdated
        ]]
      );
      return;
    }

    const currentStock = parseInt(inventoryData[index][1] || '0', 10);
    let newStock = currentStock + quantityChange;

    if (newStock < 0) newStock = 0;

    const updatedPrice = purchasingPrice || inventoryData[index][4] || '';
    const updatedUnit = unit || inventoryData[index][5] || '';

    const range = `Inventory!B${index + 2}:G${index + 2}`;
    await axiosInstance.put(
      `/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        values: [[
          newStock.toString(),
          timestamp,
          '',
          updatedPrice,
          updatedUnit,
          isUpdated
        ]]
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

  } catch (error) {
    console.error('Error in updateInventoryStock:', error);
  }
}


