import { normalizeString, parseIntSafe } from "../../../utils/SheetUtils";
import { getSheetData } from "./GetSheetData";
import { getTimestamp } from "../../../utils/DateUtils";
import { appendData } from "./AppendData";
import { axiosInstance } from "../../config/AxiosInstance";
import { logInventoryChange } from "./logInventoryChange";
import { handleError } from "../../../utils/ErrorHandler";
import { markRowAsUpdated } from "./MarkRowAsUpdated";
import { showErrorPopup } from "../../../components/popup/ErrorPopup";
import { showSuccessPopup } from "../../../components/popup/SuccessPopup";
import { SaleData } from "../../../types/Index";


export async function handleSale(
  spreadsheetId: string | null,
  accessToken: string,
  data: SaleData,
  editRowIndex?: number,
  fetchCustomerData?: () => void,
  setShowModal?: (v: boolean) => void
) {
  if (!spreadsheetId || !accessToken) {
    return  showErrorPopup({ title: "Initialization Error", message: "Spreadsheet ID or access token is missing." });
  }

  try {
    const productName = (data.productName || "").trim();
    const newQty = parseIntSafe(data.quantity);
    const inventoryRows = await getSheetData(spreadsheetId, accessToken, "Inventory");
    if (!inventoryRows) return showErrorPopup({ title: "Error", message: "Failed to fetch inventory." });

    const rowIndex = inventoryRows.findIndex(
      row => normalizeString(row[0]) === normalizeString(productName) && (row[6] || "").toLowerCase() === "false"
    );

    if (rowIndex === -1) {
      return showErrorPopup({ title: "Product Not Found", message: `The product "${productName}" does not exist in inventory.` });
    }

    let oldQty = 0;
    if (editRowIndex !== undefined) {
      const saleData = await getSheetData(spreadsheetId, accessToken, "Sales");
      if (!saleData) return showErrorPopup({ title: "Error", message: "Failed to load sale data for editing." });
      const dataIndex = editRowIndex - 2;
      const oldRow = saleData[dataIndex];
      oldQty = oldRow ? parseInt(oldRow[6] || "0", 10) : 0;
      await markRowAsUpdated(spreadsheetId, accessToken, "Sales", editRowIndex);
    }

    const currentStock = parseIntSafe(inventoryRows[rowIndex][1]);
    const adjustedStock = currentStock + oldQty - newQty;

    if (adjustedStock < 0) {
      return showErrorPopup({
        title: "Insufficient Stock",
        message: `Only ${currentStock} units available in stock for "${productName}".`
      });
    }

    const salesData = (await getSheetData(spreadsheetId, accessToken, "Sales")) || [];
    const transactionId = (salesData.length + 1).toString();
    const timestamp = `'${getTimestamp()}`;

    const values = [
      [
        transactionId,
        timestamp,
        data.name,
        productName,
        data.number,
        data.amount,
        newQty.toString(),
        data.message,
        "FALSE",
        "FALSE",
      ],
    ];

    const success = await appendData(spreadsheetId, accessToken, "Sales", values);
    if (!success) return showErrorPopup({ title: "Save Failed", message: "Failed to save sale." });


    const updatedAt =  `'${getTimestamp()}`;
    await axiosInstance.put(
      `/${spreadsheetId}/values/Inventory!B${rowIndex + 2}:C${rowIndex + 2}?valueInputOption=USER_ENTERED`,
      { values: [[adjustedStock.toString(), updatedAt]] },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    await logInventoryChange(spreadsheetId, accessToken, productName, newQty - oldQty, "Sales");

    showSuccessPopup(editRowIndex !== undefined ? "Sale updated!" : "Sale saved!");
    setShowModal?.(false);
    fetchCustomerData?.();
  } catch (error) {
    handleError("Sale save", error, "An error occurred while saving the sale.");
  }
}
