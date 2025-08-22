import { Alert } from "react-native";
import { markRowAsUpdated } from "./MarkRowAsUpdated";
import { axiosInstance } from "../axiosInstance";
import { GoogleSheetService } from "../GoogleSheetService";


export async function updateInventoryStock(
  spreadsheetId: string | null,
  accessToken: string,
  data: { productName: string; purchasingPrice: string; quantity: string; unit?: string },
  editRowIndex?: number,
  fetchCustomerData?: () => void,
  setShowModal?: (v: boolean) => void
): Promise<void> {
  if (!spreadsheetId || !accessToken) return Alert.alert('Sheet not initialized');

  const updatedAt = new Date().toLocaleString('en-IN');
  const productName = data.productName.trim();
  const quantity = parseInt(data.quantity, 10);
  const unit = data.unit || 'pcs';

  if (!productName || isNaN(quantity)) {
    return Alert.alert('Invalid product name or quantity');
  }

  try {
    const response = await axiosInstance.get(
      `/${spreadsheetId}/values/Inventory!A2:G`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const rows: string[][] = response.data.values || [];

    let rowIndex: number | undefined;
    let oldProductName = productName;

    if (editRowIndex !== undefined) {
      rowIndex = editRowIndex - 2;
      oldProductName = rows[rowIndex]?.[0]?.trim() || productName;
    } else {
      const duplicateIndex = rows.findIndex(
        row => row[0]?.toLowerCase().trim() === productName.toLowerCase()
      );
      if (duplicateIndex !== -1) {
        return Alert.alert(
          'Duplicate Product',
          `The product "${productName}" already exists in inventory.`
        );
      }
    }

    const newRow = [[
      productName,
      quantity.toString(),
      updatedAt,
      '',
      data.purchasingPrice,
      unit,
      'FALSE'
    ]];

    if (rowIndex !== -1 && rowIndex !== undefined) {
      const existingRow = rows[rowIndex];
      const currentStock = parseInt(existingRow[1] || '0', 10);
      let newStock = quantity;
       if (newStock < 0) newStock = 0;

      const hasChanges =
        productName !== oldProductName ||
        newStock !== currentStock ||
        data.purchasingPrice !== existingRow[4] ||
        unit !== existingRow[5];

      if (hasChanges) {
        await markRowAsUpdated(spreadsheetId, accessToken, 'Inventory', rowIndex + 2);
        await GoogleSheetService.appendData(spreadsheetId, accessToken, 'Inventory', newRow);
      }
    } else {
      await GoogleSheetService.appendData(spreadsheetId, accessToken, 'Inventory', newRow);
    }
    await GoogleSheetService.logInventoryChange(
      spreadsheetId,
      accessToken,
      productName,
      quantity,
      'Inventory'
    );

    Alert.alert('Inventory updated!');
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    console.error('Inventory update error:', error);
    Alert.alert('An error occurred while updating inventory');
  }
}




