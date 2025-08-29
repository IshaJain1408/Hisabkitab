// import { Alert } from "react-native";
// import { GoogleSheetService } from "../GoogleSheetService";
// import { updateRow } from "./UpdateRow";
// import { getSheetData } from "./GetSheetData";

// interface InventoryData {
//   productName: string;
//   purchasingPrice: string;
//   quantity: string;
//   unit?: string;
// }

// export async function updateInventoryStock(
//   spreadsheetId: string | null,
//   accessToken: string,
//   data: InventoryData,
//   editRowIndex?: number,
//   fetchCustomerData?: () => void,
//   setShowModal?: (v: boolean) => void,
//   skipLog?: boolean,
//   isMyProduct: boolean = true
// ): Promise<void> {
//   if (!spreadsheetId || !accessToken) {
//     return Alert.alert("Sheet not initialized");
//   }

//   const updatedAt = new Date().toLocaleString("en-IN");
//   const productName = data.productName.trim();
//   const quantity = parseInt(data.quantity, 10);
//   const unit = data.unit || "pcs";

//   if (!productName || isNaN(quantity)) {
//     return Alert.alert("Invalid product name or quantity");
//   }

//   try {
//     const inventoryData = await getSheetData(spreadsheetId, accessToken, "Inventory");
//     if (!inventoryData) return Alert.alert("Failed to load inventory data");
//     const normalize = (str: string) => str?.toLowerCase().trim();
//    let rowIndex = -1;
// let existingRow: string[] | undefined = undefined;

// if (editRowIndex) {
//   rowIndex = inventoryData.findIndex((row, idx) => idx + 2 === editRowIndex);
//   existingRow = rowIndex !== -1 ? inventoryData[rowIndex] : undefined;
// } else {
//   rowIndex = inventoryData.findIndex(row => normalize(row[0] || "") === normalize(productName));
//   existingRow = rowIndex !== -1 ? inventoryData[rowIndex] : undefined;
// }

//     if (existingRow) {
//       const currentStock = parseInt(existingRow[1] || "0", 10);
//       const newStock = Math.max(0, currentStock + quantity);

//       if (existingRow[7] === "FALSE") {
//         await updateRow(spreadsheetId, accessToken, "Inventory", rowIndex + 2, [
//           existingRow[0],                
//           newStock.toString(),           
//           updatedAt,                      
//           existingRow[3] || "",          
//           data.purchasingPrice,         
//         unit,      
//           existingRow[6] || "FALSE",     
//           "FALSE"                         
//         ]);
//       } else {
//         const hasChanges = normalize(productName) !== normalize(existingRow[0] || "") ||
//           newStock !== currentStock ||
//           data.purchasingPrice !== existingRow[4] ||
//           unit !== existingRow[5];

//         if (hasChanges) {
//           await updateRow(spreadsheetId, accessToken, "Inventory", rowIndex + 2, [
//             ...existingRow.slice(0, 6),
//             "TRUE",
//             existingRow[7]
//           ]);
//           const newRow = [
//             productName,
//             quantity.toString(),
//             updatedAt,
//             "FALSE",
//             data.purchasingPrice,
//             unit,
//             "FALSE",
//             "TRUE"
//           ];
//           await GoogleSheetService.appendData(spreadsheetId, accessToken, "Inventory", [newRow]);
//         }
//       }
//     }
//     else {
//       console.log("existingRow[0] raw:");

//       const newRowData = [
//         productName,
//         quantity.toString(),
//         updatedAt,
//         "FALSE",
//         data.purchasingPrice,
//         unit,
//         "FALSE",
//         isMyProduct ? "TRUE" : "FALSE"
//       ];
//       await GoogleSheetService.appendData(spreadsheetId, accessToken, "Inventory", [newRowData]);
//     }

//     if (!skipLog) {
//       await GoogleSheetService.logInventoryChange(
//         spreadsheetId,
//         accessToken,
//         productName,
//         quantity,
//         "Inventory"
//       );
//     }

//     Alert.alert("Inventory updated!");
//     setShowModal?.(false);
//     fetchCustomerData?.();
//   } catch (error) {
//     console.error("Inventory update error:", error);
//     Alert.alert("An error occurred while updating inventory");
//   }
// }

// services/updateInventoryStock.ts
import { Alert } from "react-native";
import { getTimestamp } from "../../utils/DateUtils";
import { normalizeString, parseIntSafe } from "../../utils/SheetUtils";
import { getSheetData } from "./GetSheetData";
import { logInventoryChange } from "./logInventoryChange";
import { handleError } from "../../utils/ErrorHandler";
import { updateRow } from "./UpdateRow";
import { appendData } from "./AppendData";


export interface InventoryData {
  productName: string;
  purchasingPrice: string;
  quantity: string;
  unit?: string;
}

/**
 * Update inventory stock. Preserves original signature and behavior.
 * - editRowIndex: when provided, attempt to update that specific sheet row.
 * - skipLog: when true, skip logging to inventory change sheet.
 * - isMyProduct: controls last column value when appending new row.
 */
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
  const updatedAt = getTimestamp();
  const productName = (data.productName || "").trim();
  const quantity = parseIntSafe(data.quantity);
  const unit = data.unit || "pcs";

  if (!productName || Number.isNaN(quantity)) {
    return Alert.alert("Invalid product name or quantity");
  }

  try {
    const inventoryData = await getSheetData(spreadsheetId, accessToken, "Inventory");
    if (!inventoryData) return Alert.alert("Failed to load inventory data");

    const { rowIndex, existingRow } = findExistingInventoryRow(inventoryData, productName, editRowIndex);
       let oldQty = 0;
    let newQty = quantity;


    if (existingRow) {
        oldQty = parseIntSafe(existingRow[1]);

      await handleExistingInventoryRow(
        spreadsheetId,
        accessToken,
        existingRow,
        rowIndex,
        productName,
        quantity,
        unit,
        data.purchasingPrice,
        updatedAt
      );
    } else {
      await appendInventoryRow(
        spreadsheetId,
        accessToken,
        productName,
        quantity,
        data.purchasingPrice,
        unit,
        updatedAt,
        isMyProduct
      );
    }
if (!skipLog) {
      const changeQty = editRowIndex !== undefined && existingRow
        ? newQty - oldQty
        : newQty;

      await logInventoryChange(
        spreadsheetId,
        accessToken,
        productName,
        changeQty,
        "Inventory"
      );
    }

    Alert.alert("Inventory updated!");
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    handleError("Inventory update", error, "An error occurred while updating inventory");
  }
}

function findExistingInventoryRow(
  inventoryData: string[][],
  productName: string,
  editRowIndex?: number
): { rowIndex: number; existingRow?: string[] } {
  const normalized = normalizeString(productName);
  let rowIndex = -1;
  let existingRow: string[] | undefined;

  if (editRowIndex) {
    rowIndex = inventoryData.findIndex((_, idx) => idx + 2 === editRowIndex);
    existingRow = rowIndex !== -1 ? inventoryData[rowIndex] : undefined;
  } else {
    rowIndex = inventoryData.findIndex(row => normalizeString(row[0]) === normalized);
    existingRow = rowIndex !== -1 ? inventoryData[rowIndex] : undefined;
  }

  return { rowIndex, existingRow };
}

async function handleExistingInventoryRow(
  spreadsheetId: string,
  accessToken: string,
  existingRow: string[],
  rowIndex: number,
  productName: string,
  quantity: number,
  unit: string,
  purchasingPrice: string,
  updatedAt: string
) {
  const currentStock = parseIntSafe(existingRow[1]);
  const newStock = Math.max(0, currentStock + quantity);

  if (existingRow[7] === "FALSE") {
    await updateRow(spreadsheetId, accessToken, "Inventory", rowIndex + 2, [
      existingRow[0] || productName,
      newStock.toString(),
      updatedAt,
      existingRow[3] || "",
      purchasingPrice,
      unit,
      existingRow[6] || "FALSE",
      "FALSE",
    ]);
    return;
  }

  const hasChanges =
    normalizeString(productName) !== normalizeString(existingRow[0]) ||
    newStock !== currentStock ||
    purchasingPrice !== existingRow[4] ||
    unit !== existingRow[5];

  if (hasChanges) {
    await updateRow(spreadsheetId, accessToken, "Inventory", rowIndex + 2, [
      ...existingRow.slice(0, 6),
      "TRUE",
      existingRow[7] || "FALSE",
    ]);

    const newRow = [
      productName,
      quantity.toString(),
      updatedAt,
      "FALSE",
      purchasingPrice,
      unit,
      "FALSE",
      "TRUE",
    ];
    await appendData(spreadsheetId, accessToken, "Inventory", [newRow]);
  }

}

async function appendInventoryRow(
  spreadsheetId: string,
  accessToken: string,
  productName: string,
  quantity: number,
  purchasingPrice: string,
  unit: string,
  updatedAt: string,
  isMyProduct: boolean
) {
  const newRowData = [
    productName,
    quantity.toString(),
    updatedAt,
    "FALSE",
    purchasingPrice,
    unit,
    "FALSE",
    isMyProduct ? "TRUE" : "FALSE",
  ];
  await appendData(spreadsheetId, accessToken, "Inventory", [newRowData]);
}
