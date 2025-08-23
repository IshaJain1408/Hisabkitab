import { Alert } from "react-native";
import { logInventoryChange } from "./logInventoryChange";
import { axiosInstance } from "../AxiosInstance";
import { appendData } from "./AppendData";
import { markRowAsUpdated } from "./MarkRowAsUpdated";
import { getSheetData } from "./GetSheetData";

export async function handleSale(
  spreadsheetId: string | null,
  accessToken: string,
  data: { name: string; productName: string; number: string; amount: string; quantity: string; message: string },
  editRowIndex?: number,
  fetchCustomerData?: () => void,
  setShowModal?: (v: boolean) => void
) {
  if (!spreadsheetId || !accessToken)
    return Alert.alert('Initialization Error', 'Spreadsheet ID or access token is missing.');

  try {
    const productName = data.productName.trim();
    const newQty = parseInt(data.quantity, 10);

    const inventoryRes = await axiosInstance.get(
      `/${spreadsheetId}/values/Inventory!A2:G`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const inventoryRows: string[][] = inventoryRes.data.values || [];
    const rowIndex = inventoryRows.findIndex(
      row => row[0]?.toLowerCase().trim() === productName.toLowerCase() && (row[6] || '').toLowerCase() === 'false'
    );
    if (rowIndex === -1)
      return Alert.alert('Product Not Found', `The product "${productName}" does not exist in inventory.`);

    let oldQty = 0;
    if (editRowIndex !== undefined) {
      const saleData = await getSheetData(spreadsheetId, accessToken, 'Sales');
      if (!saleData) return Alert.alert('Failed to load sale data for editing');
      const oldRow = saleData[editRowIndex];
      oldQty = parseInt(oldRow?.[6] || '0', 10);
      await markRowAsUpdated(spreadsheetId, accessToken, 'Sales', editRowIndex);
    }

    const currentStock = parseInt(inventoryRows[rowIndex][1] || '0', 10);
    const adjustedStock = currentStock + oldQty - newQty;
    if (adjustedStock < 0) {
      return Alert.alert('Insufficient Stock', `Only ${currentStock} units available in stock for "${productName}".`);
    }

    const salesRes = await axiosInstance.get(
      `/${spreadsheetId}/values/Sales!A2:A`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const existingRows = salesRes.data.values || [];
    const transactionId = (existingRows.length + 1).toString();
    const timestamp = new Date().toLocaleString('en-IN');

    const values = [[
      transactionId, timestamp, data.name, productName,
      data.number, data.amount, newQty.toString(),
      data.message, '', 'FALSE'
    ]];
    const success = await appendData(spreadsheetId, accessToken, 'Sales', values);
    if (!success) return Alert.alert('Save Failed', 'Failed to save sale.');

    const updatedAt = new Date().toLocaleString('en-IN');
    await axiosInstance.put(
      `/${spreadsheetId}/values/Inventory!B${rowIndex + 2}:C${rowIndex + 2}?valueInputOption=USER_ENTERED`,
      { values: [[adjustedStock.toString(), updatedAt]] },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    await logInventoryChange(spreadsheetId, accessToken, productName, newQty - oldQty, 'Sale');

    Alert.alert('Success', editRowIndex !== undefined ? 'Sale updated!' : 'Sale saved!');
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    console.error('Sale save error:', error);
    Alert.alert('Error', 'An error occurred while saving the sale.');
  }
}