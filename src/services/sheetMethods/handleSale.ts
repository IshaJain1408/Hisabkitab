import { axiosInstance } from "../axiosInstance";
import { appendData } from "./appendData";
import { logInventoryChange } from "./logInventoryChange";
import { markRowAsUpdated } from "./markRowAsUpdated";
import { updateInventoryStock } from "./updateInventoryStock";

export async function handleSale(
  spreadsheetId: string,
  token: string,
  productName: string,
  saleData: string[][],
  quantity: number
): Promise<void> {
  const existingSalesRes = await axiosInstance.get(
    `/${spreadsheetId}/values/Sales!A2:A`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const existingRows = existingSalesRes.data.values || [];
  const newRowIndex = existingRows.length + 2; 

  await appendData(spreadsheetId, token, 'Sales', saleData);

  await markRowAsUpdated(spreadsheetId, token, 'Sales', newRowIndex);

  await updateInventoryStock(spreadsheetId, token, productName, -quantity);
  await logInventoryChange(spreadsheetId, token, productName, -quantity, 'Sale');
}
