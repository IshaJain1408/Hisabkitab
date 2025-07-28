import { getSheetData } from './getSheetData';

export async function getBalanceSheet(
  spreadsheetId: string,
  token: string,
): Promise<{
  totalPurchase: number;
  totalSales: number;
  inventoryValue: number;
  profit: number;
}> {
  const [purchaseData, salesData, inventoryData] = await Promise.all([
    getSheetData(spreadsheetId, token, 'Purchase'),
    getSheetData(spreadsheetId, token, 'Sales'),
    getSheetData(spreadsheetId, token, 'Inventory'),
  ]);

  const totalPurchase = (purchaseData || [])
    .map(row => parseFloat(row[2]) * parseInt(row[3], 10))
    .filter(v => !isNaN(v))
    .reduce((sum, val) => sum + val, 0);

  const totalSales = (salesData || [])
    .map(row => parseFloat(row[5]))
    .filter(v => !isNaN(v))
    .reduce((sum, val) => sum + val, 0);

  const inventoryValue = (inventoryData || [])
    .map(row => {
      const productName = row[0];
      const stock = parseInt(row[1], 10);
      const purchaseRow = purchaseData?.find(p => p[0] === productName);
      const purchasePrice = purchaseRow ? parseFloat(purchaseRow[1]) : 0;
      return !isNaN(stock) && !isNaN(purchasePrice) ? stock * purchasePrice : 0;
    })
    .reduce((sum, val) => sum + val, 0);

  const cogs = totalPurchase - inventoryValue;
  const profit = totalSales - cogs;

  return { totalPurchase, totalSales, inventoryValue, profit };
}
