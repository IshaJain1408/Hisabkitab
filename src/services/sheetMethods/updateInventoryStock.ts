import { Alert } from "react-native";
import { GoogleSheetService } from "../GoogleSheetService";
import { updateRow } from "./UpdateRow";
import { getSheetData } from "./GetSheetData";

interface InventoryData {
  productName: string;
  purchasingPrice: string;
  quantity: string;
  unit?: string;
}

export async function updateInventoryStock(
  spreadsheetId: string | null,
  accessToken: string,
  data: InventoryData,
  editRowIndex?: number,
  fetchCustomerData?: () => void,
  setShowModal?: (v: boolean) => void,
  skipLog?: boolean,
  isMyProduct: boolean = true
): Promise<void> {
  if (!spreadsheetId || !accessToken) {
    return Alert.alert("Sheet not initialized");
  }

  const updatedAt = new Date().toLocaleString("en-IN");
  const productName = data.productName.trim();
  const quantity = parseInt(data.quantity, 10);
  const unit = data.unit || "pcs";

  if (!productName || isNaN(quantity)) {
    return Alert.alert("Invalid product name or quantity");
  }

  try {
    const inventoryData = await getSheetData(spreadsheetId, accessToken, "Inventory");
    if (!inventoryData) return Alert.alert("Failed to load inventory data");
    const normalize = (str: string) => str?.toLowerCase().trim();

    const rowIndex = inventoryData.findIndex(
      row => normalize(row[0] || "") === normalize(productName)
    );

    const existingRow = rowIndex !== -1 ? inventoryData[rowIndex] : undefined;
    console.log(existingRow,rowIndex,"rowIndex")

    if (existingRow) {
      const currentStock = parseInt(existingRow[1] || "0", 10);
      const newStock = Math.max(0, currentStock + quantity);

      if (existingRow[7] === "FALSE") {
        await updateRow(spreadsheetId, accessToken, "Inventory", rowIndex + 2, [
          existingRow[0],                
          newStock.toString(),           
          updatedAt,                      
          existingRow[3] || "",          
          data.purchasingPrice,         
          existingRow[5] || unit,      
          existingRow[6] || "FALSE",     
          "FALSE"                         
        ]);
      } else {
        const hasChanges = normalize(productName) !== normalize(existingRow[0] || "") ||
          newStock !== currentStock ||
          data.purchasingPrice !== existingRow[4] ||
          unit !== existingRow[5];

        if (hasChanges) {
          await updateRow(spreadsheetId, accessToken, "Inventory", rowIndex + 2, [
            ...existingRow.slice(0, 6),
            "TRUE",
            existingRow[7]
          ]);
          const newRow = [
            productName,
            newStock.toString(),
            updatedAt,
            "FALSE",
            data.purchasingPrice,
            unit,
            "FALSE",
            "TRUE"
          ];
          await GoogleSheetService.appendData(spreadsheetId, accessToken, "Inventory", [newRow]);
        }
      }
    }
    else {
      console.log("existingRow[0] raw:");

      const newRowData = [
        productName,
        quantity.toString(),
        updatedAt,
        "FALSE",
        data.purchasingPrice,
        unit,
        "FALSE",
        isMyProduct ? "TRUE" : "FALSE"
      ];
      await GoogleSheetService.appendData(spreadsheetId, accessToken, "Inventory", [newRowData]);
    }

    if (!skipLog) {
      await GoogleSheetService.logInventoryChange(
        spreadsheetId,
        accessToken,
        productName,
        quantity,
        "Inventory"
      );
    }

    Alert.alert("Inventory updated!");
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    console.error("Inventory update error:", error);
    Alert.alert("An error occurred while updating inventory");
  }
}
