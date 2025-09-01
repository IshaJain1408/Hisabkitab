import { getSheetData } from "./GetSheetData";

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
    
    const filterValidRowsByHeaders = (data: string[][] | null | undefined): string[][] => {
      if (!data || data.length < 2) return []; 
      const headerRow = data[0];
      const rows = data.slice(1); 

      const idxIsDeleted = headerRow.indexOf('IsDeleted');
      const idxIsUpdated = headerRow.indexOf('IsUpdated');

      return rows.filter(row => {
        const deleted = idxIsDeleted >= 0 ? row[idxIsDeleted] !== 'TRUE' : true;
        const updated = idxIsUpdated >= 0 ? row[idxIsUpdated] !== 'TRUE' : true;
        return deleted && updated;
      });
    };

    const validPurchase = filterValidRowsByHeaders(purchaseData);
    const validSales = filterValidRowsByHeaders(salesData);
    const validInventory = filterValidRowsByHeaders(inventoryData);
    const totalPurchase = validPurchase
        .map(row => parseFloat(row[1]) * parseInt(row[2]))
        .filter(v => !isNaN(v))
        .reduce((sum, val) => sum + val, 0);


const totalSales = validSales
  .map(row => {
    const price = parseFloat(row[5]);  
    const qty = parseInt(row[6]);  
    return !isNaN(price) && !isNaN(qty) ? price * qty : 0;
  })
  .reduce((sum, val) => sum + val, 0);


const inventoryValue = validInventory
  .map(row => {
    const stock = parseInt(row[1]);      
    const purchasePrice = parseFloat(row[4]);
    return !isNaN(stock) && !isNaN(purchasePrice) ? stock * purchasePrice : 0;
  })
  .reduce((sum, val) => sum + val, 0);


  const cogs = totalPurchase - inventoryValue;
  const profit = totalSales - cogs;
  return { totalPurchase, totalSales, inventoryValue, profit };
}