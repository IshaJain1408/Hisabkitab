import { getSheetData } from "./GetSheetData";
import { updateInventoryStock } from "./UpdateInventoryStock";
import { appendData } from "./AppendData";
import { logInventoryChange } from "./logInventoryChange";
import { handleError } from "../../../utils/ErrorHandler";
import { markRowAsUpdated } from "./MarkRowAsUpdated";
import { showErrorPopup } from "../../../components/popup/ErrorPopup";
import { showSuccessPopup } from "../../../components/popup/SuccessPopup";
import { getTimestamp } from "../../../utils/DateUtils";
import { PurchaseData } from "../../../types/Index";


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

  const rowValues = [
    data.productName,
    data.purchasingPrice,
    data.quantity,
    data.unit,
    "No Attachment",
    timestamp,
    "FALSE",
    "FALSE",
  ];

  try {
    const purchaseData = await getSheetData(spreadsheetId, accessToken, "Purchase");
    if (!purchaseData) return showErrorPopup({ title: 'Error', message: 'Failed to load purchase data' });

    const newName = (data.productName || "").trim();

    if (editRowIndex !== undefined) {
      await processPurchaseEdit(spreadsheetId, accessToken, purchaseData, editRowIndex, newName, newQty, data);
    } else if (newQty > 0) {
      await updateInventoryStock(
        spreadsheetId,
        accessToken,
        {
          productName: newName,
          purchasingPrice: data.purchasingPrice,
          quantity: newQty.toString(),
          unit: data.unit,
        },
        undefined,
        undefined,
        undefined,
        true,
        false
      );
    }

    const success = await appendData(spreadsheetId, accessToken, "Purchase", [rowValues]);
    if (!success) return showErrorPopup({ title: 'Error', message: 'Failed to save purchase' });

    const oldQty = await getOldPurchaseQtyIfEditing(purchaseData, editRowIndex);
    await logInventoryChange(spreadsheetId, accessToken, newName, editRowIndex !== undefined ? newQty - oldQty : newQty, "Purchase");

    showSuccessPopup(editRowIndex !== undefined ? 'Purchase updated!' : 'Purchase saved!');
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    handleError("Purchase save/update", error, "An error occurred while saving the purchase");
  }
}

async function getOldPurchaseQtyIfEditing(purchaseData: string[][], editRowIndex?: number): Promise<number> {
  if (editRowIndex === undefined) return 0;
  const oldRow = purchaseData[editRowIndex - 2];
  return oldRow ? parseInt(oldRow[2] || "0", 10) : 0;
}

async function processPurchaseEdit(
  spreadsheetId: string,
  accessToken: string,
  purchaseData: string[][],
  editRowIndex: number,
  newName: string,
  newQty: number,
  data: PurchaseData
) {
  const oldRow = purchaseData[editRowIndex - 2];
  const oldQty = oldRow ? parseInt(oldRow[2] || "0", 10) : 0;
  const oldName = oldRow ? (oldRow[0] || "").trim() : "";

  await markRowAsUpdated(spreadsheetId, accessToken, "Purchase", editRowIndex);

  if (oldName === newName) {
    const deltaQty = newQty - oldQty;
    await updateInventoryStock(
      spreadsheetId,
      accessToken,
      {
        productName: newName,
        purchasingPrice: data.purchasingPrice,
        quantity: deltaQty.toString(),
        unit: data.unit,
      },
      undefined,
      undefined,
      undefined,
      true,
      false
    );
  } else {
    await updateInventoryStock(
      spreadsheetId,
      accessToken,
      {
        productName: oldName,
        purchasingPrice: data.purchasingPrice,
        quantity: (-oldQty).toString(),
        unit: data.unit,
      },
      undefined,
      undefined,
      undefined,
      true,
      false
    );

    await updateInventoryStock(
      spreadsheetId,
      accessToken,
      {
        productName: newName,
        purchasingPrice: data.purchasingPrice,
        quantity: newQty.toString(),
        unit: data.unit,
      },
      undefined,
      undefined,
      undefined,
      true,
      false
    );
  }
}
