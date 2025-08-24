import { Alert } from "react-native";
import { updateRow } from "./UpdateRow";
import { logInventoryChange } from "./logInventoryChange";
import { updateInventoryStock } from "./UpdateInventoryStock";
import { getSheetData } from "./GetSheetData";
import { InventoryActionType } from "../GoogleSheetService";

const statusColumnIndex: { [key in InventoryActionType]: number } = {
  Purchase: 6,
  Sales: 8,
  Inventory: 3
};

export const deleteRow = async (
  spreadsheetId: string | null,
  accessToken: string | null,
  sheetName:InventoryActionType,
  rowIndex: number,
  fetchCustomerData?: () => Promise<void>
) => {
  if (!spreadsheetId || !accessToken) {
    return Alert.alert('Sheet not initialized');
  }

  try {
    const sheetData = await getSheetData(spreadsheetId, accessToken, sheetName);
    const arrayIndex = rowIndex - 2; 

    if (!sheetData || arrayIndex < 0 || arrayIndex >= sheetData.length) {
      return Alert.alert('Row not found');
    }

    const row = sheetData[arrayIndex];
    let productName = '';
    let quantity = 0;

switch (sheetName) {
  case 'Sales':
    productName = row[3]?.trim() || ''; 
    quantity = Number(row[6]) || 0;
    break;
  case 'Purchase':
    productName = row[0]?.trim() || '';
    quantity = Number(row[2]) || 0;
    break;
  case 'Inventory':
    productName = row[0]?.trim() || '';
    quantity = Number(row[1]) || 0;
    break;
}


    if (quantity > 0) {
      console.log(quantity,sheetName,"quantity")
      if (sheetName === 'Purchase' || sheetName === 'Inventory') {
        await updateInventoryStock(spreadsheetId, accessToken, {
          productName,
          purchasingPrice: '0',
          quantity: (-quantity).toString(),
          unit: 'pcs'
        });
        await logInventoryChange(spreadsheetId, accessToken, productName, -quantity, 'Inventory');
      }
      else if (sheetName === 'Sales') {
        const inventoryDataRaw = await getSheetData(spreadsheetId, accessToken, 'Inventory');
        if (!inventoryDataRaw) {
          Alert.alert('Inventory data not found, cannot restore product');
          return;
        }

const inventoryData = inventoryDataRaw.filter(row => row && row.length > 0);

const normalize = (str: string) => str?.toLowerCase().replace(/\s+/g, ' ').trim();

const inventoryRowIndex = inventoryData.findIndex(
  invRow => normalize(invRow[0] || '') === normalize(productName)
);


if (inventoryRowIndex === -1) {
  Alert.alert(`Product "${productName}" not found in Inventory, skipping restore`);
} else {
  const existingRow = inventoryData[inventoryRowIndex];
  const currentStock = parseInt(existingRow[1] || "0", 10);
  const newStock = currentStock + quantity;

  const sheetRowIndex = inventoryDataRaw.findIndex(
    r => r === existingRow
  ) + 2;

  await updateRow(spreadsheetId, accessToken, 'Inventory', sheetRowIndex, [
    existingRow[0],
    newStock.toString(),
    existingRow[2] || new Date().toLocaleString("en-IN"),
    existingRow[3] || "",
    existingRow[4] || '0',
    existingRow[5] || "pcs",
    existingRow[6] || "FALSE",
    existingRow[7] || "TRUE"
  ]);

  await logInventoryChange(spreadsheetId, accessToken, productName, +quantity, 'Sales');
}
}
    }
    const statusColIndex = statusColumnIndex[sheetName];
    const updatedRow = [...row];
    while (updatedRow.length <= statusColIndex) updatedRow.push('');
    updatedRow[statusColIndex] = 'deleted';

    const updated = await updateRow(spreadsheetId, accessToken, sheetName, rowIndex, updatedRow);

    if (updated) {
      Alert.alert('Row marked as deleted successfully!');
      if (fetchCustomerData) await fetchCustomerData();
    } else {
      Alert.alert('Failed to mark row as deleted');
    }
  } catch (error) {
    console.error('Error deleting row:', error);
    Alert.alert('Failed to mark row as deleted');
  }
};


