import { InventoryActionType } from "../google/GoogleSheetService";
import { getSheetData } from "./GetSheetData";

type BalanceSheet = {
  totalPurchase: number;
  totalSales: number;
  inventoryValue: number;
  profit: number;
};

export async function getBalanceSheet(
  spreadsheetId: string,
  token: string
): Promise<BalanceSheet> {
  const [purchaseData, salesData, inventoryData] = await Promise.all([
    getSheetData(spreadsheetId, token, "Purchase"),
    getSheetData(spreadsheetId, token, "Sales"),
    getSheetData(spreadsheetId, token, "Inventory"),
  ]);

  const validPurchaseRows = filterValidRows(purchaseData, "Purchase");
  const validSalesRows = filterValidRows(salesData, "Sales");
  const validInventoryRows = filterValidRows(inventoryData, "Inventory");

  const totalPurchase = calculateTotalPurchase(validPurchaseRows);
  const totalSales = calculateTotalSales(validSalesRows);
  const inventoryValue = calculateInventoryValue(validInventoryRows);

  const cogs = totalPurchase - inventoryValue;
  const profit = totalSales - cogs;
  return { totalPurchase, totalSales, inventoryValue, profit };
}


function normalize(value?: string): string {
  return (value ?? "").trim().toUpperCase();
}

function filterValidRows(
  data: string[][] | null | undefined,
  sheet: InventoryActionType
): string[][] {
  if (!data || data.length === 0) return [];

  const headerRow = data[0] ?? [];
  const hasHeaders = headerRow.includes("IsDeleted") || headerRow.includes("IsUpdated");

  const schema: Record<InventoryActionType, { deleted: number; updated: number }> = {
    Purchase: { deleted: 6, updated: 7 },
    Sales: { deleted: 8, updated: 9 },
    Inventory: { deleted: 3, updated: 6 },
  };

  const rows = hasHeaders ? data.slice(1) : data;
  const idxDeleted = hasHeaders ? headerRow.indexOf("IsDeleted") : schema[sheet].deleted;
  const idxUpdated = hasHeaders ? headerRow.indexOf("IsUpdated") : schema[sheet].updated;

  return rows.filter((row) => {
    const notDeleted = idxDeleted === -1 || normalize(row[idxDeleted]) === "FALSE";
    const notUpdated = idxUpdated === -1 || normalize(row[idxUpdated]) === "FALSE";
    return notDeleted && notUpdated;
  });
}

function calculateTotalPurchase(rows: string[][]): number {
  return rows
    .map((row) => parseFloat(row[1]) * parseInt(row[2],10))
    .filter((v) => !isNaN(v))
    .reduce((sum, val) => sum + val, 0);
}

function calculateTotalSales(rows: string[][]): number {
  return rows
    .map((row) => {
      const price = parseFloat(row[5]);
      const qty = parseInt(row[6],10);
      return !isNaN(price) && !isNaN(qty) ? price * qty : 0;
    })
    .reduce((sum, val) => sum + val, 0);
}

function calculateInventoryValue(rows: string[][]): number {
  return rows
    .map((row) => {
      const stock = parseInt(row[1],10);
      const purchasePrice = parseFloat(row[4]);
      return !isNaN(stock) && !isNaN(purchasePrice) ? stock * purchasePrice : 0;
    })
    .reduce((sum, val) => sum + val, 0);
}
