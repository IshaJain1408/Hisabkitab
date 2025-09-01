import { getTimestamp } from "../../../utils/DateUtils";
import { normalizeString, parseIntSafe } from "../../../utils/SheetUtils";
import { getSheetData } from "./GetSheetData";
import { logInventoryChange } from "./logInventoryChange";
import { handleError } from "../../../utils/ErrorHandler";
import { updateRow } from "./UpdateRow";
import { appendData } from "./AppendData";
import { showErrorPopup } from "../../../components/popup/ErrorPopup";
import { showSuccessPopup } from "../../../components/popup/SuccessPopup";
import { InventoryData } from "../../../types/Index";

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
    return showErrorPopup({ title: "Initialization Error", message: "Sheet not initialized" });
  }
  const updatedAt =`'${getTimestamp()}`;
  const productName = (data.productName || "").trim();
  const quantity = parseIntSafe(data.quantity);
  const unit = data.unit || "pcs";

  if (!productName || Number.isNaN(quantity)) {
    return showErrorPopup({ title: "Invalid Data", message: "Invalid product name or quantity" });
  }

  try {
    const inventoryData = await getSheetData(spreadsheetId, accessToken, "Inventory");
    if (!inventoryData) return showErrorPopup({ title: "Error", message: "Failed to load inventory data" });

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
    if (isMyProduct) {
      showSuccessPopup("Inventory updated!");
    }
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
