import { normalizeString, parseIntSafe } from "../../../utils/SheetUtils";
import { getSheetData } from "./GetSheetData";
import { getTimestamp } from "../../../utils/DateUtils";
import { appendData } from "./AppendData";
import { axiosInstance } from "../../config/AxiosInstance";
import { logInventoryChange } from "./logInventoryChange";
import { handleError } from "../../../utils/ErrorHandler";
import { markRowAsUpdated } from "./MarkRowAsUpdated";
import { showErrorPopup } from "../../../components/popup/ErrorPopup/ErrorPopup";
import { showSuccessPopup } from "../../../components/popup/SuccessPopup/SuccessPopup";
import { SaleData } from "../../../types/Index";

const HEADER_OFFSET = 2;
const DEFAULT_FLAGS = ["FALSE", "FALSE"];

export async function handleSale(
  spreadsheetId: string | null,
  accessToken: string,
  data: SaleData,
  editRowIndex?: number,
  fetchCustomerData?: () => void,
  setShowModal?: (v: boolean) => void
) {
  if (!spreadsheetId || !accessToken) {
    return showErrorPopup({ title: "Initialization Error", message: "Spreadsheet ID or access token is missing." });
  }

  try {
    const productName = (data.productName || "").trim();
    const newQty = parseIntSafe(data.quantity);

    const inventoryRows = await getSheetData(spreadsheetId, accessToken, "Inventory");
    if (!inventoryRows) return showErrorPopup({ title: "Error", message: "Failed to fetch inventory." });

    const rowIndex = findInventoryRow(inventoryRows, productName);
    if (rowIndex === -1) return showErrorPopup({ title: "Product Not Found", message: `The product "${productName}" does not exist in inventory.` });

    const oldQty = editRowIndex !== undefined ? await handleEditSaleMark(spreadsheetId, accessToken, editRowIndex) : 0;
    const adjustedStock = calculateAdjustedStock(inventoryRows[rowIndex], oldQty, newQty);

    if (adjustedStock < 0) return showErrorPopup({ title: "Insufficient Stock", message: `Only ${parseIntSafe(inventoryRows[rowIndex][1])} units available in stock for "${productName}".` });

    const transactionId = await getNextTransactionId(spreadsheetId, accessToken);
    const timestamp = `'${getTimestamp()}`;

    const rowValues = buildSaleRow(transactionId, timestamp, data, newQty);

    const success = await appendData(spreadsheetId, accessToken, "Sales", rowValues);
    if (!success) return showErrorPopup({ title: "Save Failed", message: "Failed to save sale." });

    await updateInventoryStock(spreadsheetId, accessToken, rowIndex, adjustedStock);
    await logInventoryChange(spreadsheetId, accessToken, productName, newQty - oldQty, "Sales");

    showSuccessPopup(editRowIndex !== undefined ? "Sale updated!" : "Sale saved!");
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    handleError("Sale save", error, "An error occurred while saving the sale.");
  }
}

function findInventoryRow(inventoryRows: string[][], productName: string): number {
  return inventoryRows.findIndex(
    row => normalizeString(row[0]) === normalizeString(productName) && (row[6] || "").toLowerCase() === "false"
  );
}

async function handleEditSaleMark(spreadsheetId: string, accessToken: string, editRowIndex: number): Promise<number> {
  const salesData = await getSheetData(spreadsheetId, accessToken, "Sales");
  if (!salesData) {
    showErrorPopup({ title: "Error", message: "Failed to load sale data for editing." });
    return 0;
  }

  const oldRow = salesData[editRowIndex - HEADER_OFFSET];
  const oldQty = oldRow ? parseInt(oldRow[6] || "0", 10) : 0;
  await markRowAsUpdated(spreadsheetId, accessToken, "Sales", editRowIndex);

  return oldQty;
}

function calculateAdjustedStock(inventoryRow: string[], oldQty: number, newQty: number): number {
  const currentStock = parseIntSafe(inventoryRow[1]);
  return currentStock + oldQty - newQty;
}

async function getNextTransactionId(spreadsheetId: string, accessToken: string): Promise<string> {
  const salesData = (await getSheetData(spreadsheetId, accessToken, "Sales")) || [];
  return (salesData.length + 1).toString();
}

function buildSaleRow(transactionId: string, timestamp: string, data: SaleData, newQty: number): string[][] {
  return [[
    transactionId,
    timestamp,
    data.name,
    data.productName,
    data.number,
    data.amount,
    newQty.toString(),
    data.message,
    ...DEFAULT_FLAGS
  ]];
}

async function updateInventoryStock(spreadsheetId: string, accessToken: string, rowIndex: number, adjustedStock: number) {
  const updatedAt = `'${getTimestamp()}`;
  await axiosInstance.put(
    `/${spreadsheetId}/values/Inventory!B${rowIndex + HEADER_OFFSET}:C${rowIndex + HEADER_OFFSET}?valueInputOption=USER_ENTERED`,
    { values: [[adjustedStock.toString(), updatedAt]] },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
}
