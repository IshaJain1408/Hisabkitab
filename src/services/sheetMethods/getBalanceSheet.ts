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
  const filterValidRows = (data: string[][] | null | undefined): string[][] =>
    (data ?? []).filter(
      row =>
        row[row.length - 1] !== 'TRUE' && 
        row[row.length - 2]?.toLowerCase() !== 'delete' 
    );

  const validPurchase = filterValidRows(purchaseData);
  const validSales = filterValidRows(salesData);
  const validInventory = filterValidRows(inventoryData);
  const totalPurchase = validPurchase
    .map(row => parseFloat(row[1]) * parseInt(row[2], 10) )
    .filter(v => !isNaN(v))
    .reduce((sum, val) => sum + val, 0);

const totalSales = validSales
  .map(row => {
    const price = parseFloat(row[5]);  
    const qty = parseInt(row[6], 10);  
    return !isNaN(price) && !isNaN(qty) ? price * qty : 0;
  })
  .reduce((sum, val) => sum + val, 0);


const inventoryValue = validInventory
  .map(row => {
    const stock = parseInt(row[1], 10);      
    const purchasePrice = parseFloat(row[4]);
    return !isNaN(stock) && !isNaN(purchasePrice) ? stock * purchasePrice : 0;
  })
  .reduce((sum, val) => sum + val, 0);


  const cogs = totalPurchase - inventoryValue;
  const profit = totalSales - cogs;

  console.log(' Balance Sheet:', {
    totalPurchase,
    totalSales,
    inventoryValue,
    profit,
  });

  return { totalPurchase, totalSales, inventoryValue, profit };
}
