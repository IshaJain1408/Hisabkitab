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

export const deleteRow = async (
  spreadsheetId: string | null,
  accessToken: string | null,
  sheetName: InventoryActionType,
  rowIndex: number,
  fetchCustomerData?: () => Promise<void>
) => {
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
    let productName = "";
    let quantity = 0;

    switch (sheetName) {
      case "Sales":
        productName = row[3]?.trim() || "";
        quantity = parseIntSafe(row[6]);
        break;
      case "Purchase":
        productName = row[0]?.trim() || "";
        quantity = parseIntSafe(row[2]);
        break;
      case "Inventory":
        productName = row[0]?.trim() || "";
        quantity = parseIntSafe(row[1]);
        break;
    }

    if (quantity > 0 && sheetName !== "Inventory") {
      const inventoryDataRaw = await getSheetData(spreadsheetId, accessToken, "Inventory");
      if (!inventoryDataRaw) {
        Alert.alert("Inventory data not found, cannot update");
        return;
      }

      const inventoryData = inventoryDataRaw.filter(r => r && r.length > 0);
      const invIndex = inventoryData.findIndex(
        invRow => normalizeString(invRow[0]) === normalizeString(productName)
      );

      if (invIndex !== -1) {
        const existingRow = inventoryData[invIndex];
        const currentStock = parseIntSafe(existingRow[1]);

        let newStock = currentStock;
        if (sheetName === "Sales") {
          newStock = currentStock + quantity; 
        } else if (sheetName === "Purchase") {
          newStock = currentStock - quantity; 
        }

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
      } else {
        Alert.alert(`Product "${productName}" not found in Inventory`);
      }
    }

    const statusColIndex = statusColumnIndex[sheetName];
    const updatedRow = [...row];
    while (updatedRow.length <= statusColIndex) updatedRow.push("");
    updatedRow[statusColIndex] = "TRUE";

    if (sheetName === "Purchase") {
      updatedRow[2] = "0";
    }


    const updated = await updateRow(spreadsheetId, accessToken, sheetName, rowIndex, updatedRow);

    if (updated) {
      Alert.alert("Row marked as deleted successfully!");
      if (fetchCustomerData) await fetchCustomerData();
    } else {
      Alert.alert("Failed to mark row as deleted");
    }
  } catch (error) {
    handleError("Delete row", error, "Failed to mark row as deleted");
  }
};
