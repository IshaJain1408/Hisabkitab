import { getSheetData } from "./GetSheetData";
import { updateInventoryStock } from "./UpdateInventoryStock";
import { appendData } from "./AppendData";
import { logInventoryChange } from "./logInventoryChange";
import { handleError } from "../../../utils/ErrorHandler";
import { markRowAsUpdated } from "./MarkRowAsUpdated";
import { showErrorPopup } from "../../../components/popup/errorPopup/ErrorPopup";
import { showSuccessPopup } from "../../../components/popup/successPopup/SuccessPopup";
import { getTimestamp } from "../../../utils/DateUtils";
import { PurchaseData } from "../../../types/Index";


const HEADER_OFFSET = 2; 
const NO_ATTACHMENT = "No Attachment";
const DEFAULT_FLAGS = ["FALSE", "FALSE"];


export async function handlePurchase(
  spreadsheetId: string | null,
  accessToken: string,
  data: PurchaseData,
  editRowIndex?: number,
  fetchCustomerData?: () => void,
  setShowModal?: (v: boolean) => void
) {
  if (!spreadsheetId || !accessToken) return showErrorPopup({ title: 'Error', message: 'Sheet not initialized' });

  const timestamp = `'${getTimestamp()}`;
  const newQty = parseInt(data.quantity || "0", 10);

  const rowValues = prepareRowValues(data, timestamp);

  try {
    const purchaseData = await getSheetData(spreadsheetId, accessToken, "Purchase");
    if (!purchaseData) return showErrorPopup({ title: 'Error', message: 'Failed to load purchase data' });

    if (editRowIndex !== undefined) {
      await handleEditPurchase(spreadsheetId, accessToken, purchaseData, editRowIndex, data, newQty);
    } else if (newQty > 0) {
      await updateInventoryForProduct(spreadsheetId, accessToken, data.productName, newQty, data.unit, data.purchasingPrice);

    }

    const success = await appendData(spreadsheetId, accessToken, "Purchase", [rowValues]);
    if (!success) return showErrorPopup({ title: 'Error', message: 'Failed to save purchase' });

    const oldQty = await getOldPurchaseQtyIfEditing(purchaseData, editRowIndex);
    await logInventoryChange(spreadsheetId, accessToken, data.productName, editRowIndex ? newQty - oldQty : newQty, "Purchase");

    showSuccessPopup(editRowIndex !== undefined ? 'Purchase updated!' : 'Purchase saved!');
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    handleError("Purchase save/update", error, "An error occurred while saving the purchase");
  }
}

function prepareRowValues(data: PurchaseData, timestamp: string): (string)[] {
  return [data.productName, data.purchasingPrice, data.quantity, data.unit, NO_ATTACHMENT, timestamp, ...DEFAULT_FLAGS];
}

async function getOldPurchaseQtyIfEditing(purchaseData: string[][], editRowIndex?: number): Promise<number> {
  if (editRowIndex === undefined) return 0;
  const oldRow = purchaseData[editRowIndex - HEADER_OFFSET];
  return oldRow ? parseInt(oldRow[2] || "0", 10) : 0;
}

async function handleEditPurchase(
  spreadsheetId: string,
  accessToken: string,
  purchaseData: string[][],
  editRowIndex: number,
  data: PurchaseData,
  newQty: number
) {
  const oldRow = purchaseData[editRowIndex - HEADER_OFFSET];
  const oldQty = oldRow ? parseInt(oldRow[2] || "0", 10) : 0;
  const oldName = oldRow ? (oldRow[0] || "").trim() : "";

  await markRowAsUpdated(spreadsheetId, accessToken, "Purchase", editRowIndex);

  if (oldName === data.productName) {
    const deltaQty = newQty - oldQty;
    await updateInventoryForProduct(spreadsheetId, accessToken, data.productName, deltaQty, data.unit, data.purchasingPrice);
  } else {
    await updateInventoryForProduct(spreadsheetId, accessToken, oldName, -oldQty, data.unit, data.purchasingPrice);
    await updateInventoryForProduct(spreadsheetId, accessToken, data.productName, newQty, data.unit, data.purchasingPrice);
  }
}

async function updateInventoryForProduct(
  spreadsheetId: string,
  accessToken: string,
  productName: string,
  quantity: number,
  unit: string,
  purchasingPrice: string 
) {
  if (!productName || quantity === 0) return;

  await updateInventoryStock(
    spreadsheetId,
    accessToken,
    {
      productName,
      purchasingPrice,
      quantity: quantity.toString(),
      unit,
    },
    undefined,
    undefined,
    undefined,
    true,
    false
  );
}