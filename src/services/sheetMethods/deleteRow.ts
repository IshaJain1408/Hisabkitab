import { Alert } from "react-native";
import { getSheetData } from "./GetSheetData";
import { normalizeString, parseIntSafe } from "../../utils/SheetUtils";
import { logInventoryChange } from "./logInventoryChange";
import { updateRow } from "./UpdateRow";
import { handleError } from "../../utils/ErrorHandler";

type InventoryActionType = "Purchase" | "Sales" | "Inventory";

const statusColumnIndex: Record<InventoryActionType, number> = {
  Purchase: 6,  
  Sales: 8,     
  Inventory: 3, 
};


function extractProductInfo(sheetName: InventoryActionType, row: string[]): { productName: string; quantity: number } {
  switch (sheetName) {
    case "Sales":
      return { productName: row[3]?.trim() || "", quantity: parseIntSafe(row[6]) };
    case "Purchase":
      return { productName: row[0]?.trim() || "", quantity: parseIntSafe(row[2]) };
    case "Inventory":
      return { productName: row[0]?.trim() || "", quantity: parseIntSafe(row[1]) };
  }
}

async function adjustInventoryOnDelete(
  spreadsheetId: string,
  accessToken: string,
  sheetName: InventoryActionType,
  productName: string,
  quantity: number
) {
  const inventoryDataRaw = await getSheetData(spreadsheetId, accessToken, "Inventory");
  if (!inventoryDataRaw) {
    Alert.alert("Inventory data not found, cannot update");
    return;
  }

  const inventoryData = inventoryDataRaw.filter(r => r && r.length > 0);
  const invIndex = inventoryData.findIndex(
    invRow => normalizeString(invRow[0]) === normalizeString(productName)
  );

  if (invIndex === -1) {
    return Alert.alert(`Product "${productName}" not found in Inventory`);
  }

  const existingRow = inventoryData[invIndex];
  const currentStock = parseIntSafe(existingRow[1]);

  const newStock =
    sheetName === "Sales"
      ? currentStock + quantity 
      : currentStock - quantity; 

  const sheetRowIndex = inventoryDataRaw.findIndex(r => r === existingRow) + 2;

  await updateRow(spreadsheetId, accessToken, "Inventory", sheetRowIndex, [
    existingRow[0],
    newStock.toString(),
    new Date().toLocaleString("en-IN"),
    existingRow[3] || "FALSE",
    existingRow[4] || "0",
    existingRow[5] || "pcs",
    existingRow[6] || "FALSE",
    existingRow[7] || "TRUE",
  ]);

  await logInventoryChange(
    spreadsheetId,
    accessToken,
    productName,
    sheetName === "Sales" ? +quantity : -quantity,
    sheetName
  );
}

async function markRowAsDeleted(
  spreadsheetId: string,
  accessToken: string,
  sheetName: InventoryActionType,
  rowIndex: number,
  row: string[]
) {
  const statusColIndex = statusColumnIndex[sheetName];
  const updatedRow = [...row];

  while (updatedRow.length <= statusColIndex) updatedRow.push("");
  updatedRow[statusColIndex] = "TRUE";

  if (sheetName === "Purchase") {
    updatedRow[2] = "0"; 
  }

  return await updateRow(spreadsheetId, accessToken, sheetName, rowIndex, updatedRow);
}

export async function deleteRow(
  spreadsheetId: string | null,
  accessToken: string | null,
  sheetName: InventoryActionType,
  rowIndex: number,
  fetchCustomerData?: () => Promise<void>
) {
  if (!spreadsheetId || !accessToken) {
    return Alert.alert("Sheet not initialized");
  }

  try {
    const sheetData = await getSheetData(spreadsheetId, accessToken, sheetName);
    const arrayIndex = rowIndex - 2;

    if (!sheetData || arrayIndex < 0 || arrayIndex >= sheetData.length) {
      return Alert.alert("Row not found");
    }

    const row = sheetData[arrayIndex];
    const { productName, quantity } = extractProductInfo(sheetName, row);

    if (quantity > 0 && sheetName !== "Inventory") {
      await adjustInventoryOnDelete(spreadsheetId, accessToken, sheetName, productName, quantity);
    }

    const updated = await markRowAsDeleted(spreadsheetId, accessToken, sheetName, rowIndex, row);

    if (updated) {
      Alert.alert("Row marked as deleted successfully!");
      if (fetchCustomerData) await fetchCustomerData();
    } else {
      Alert.alert("Failed to mark row as deleted");
    }
  } catch (error) {
    handleError("Delete row", error, "Failed to mark row as deleted");
  }
}
