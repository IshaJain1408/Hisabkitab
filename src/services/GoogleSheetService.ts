type InventoryActionType = 'Purchase' | 'Sale' | 'Inventory';

export class GoogleSheetService {

  static async sheetExists(spreadsheetId: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.ok;
    } catch (error) {
      console.error('Sheet existence check failed:', error);
      return false;
    }
  }

  static async createSheet(token: string): Promise<string | null> {
    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: `HisabKitab_Report_${Date.now()}` },
          sheets: [
            { properties: { title: 'Purchase' } },
            { properties: { title: 'Sales' } },
            { properties: { title: 'Inventory' } },
            { properties: { title: 'Inventory Log' } },
          ],
        }),
      });

      const sheetData = await response.json();
      const spreadsheetId = sheetData?.spreadsheetId;
      if (!spreadsheetId) {
        console.error('Sheet creation failed:', sheetData);
        return null;
      }

      await Promise.all([
        this.setSheetHeaders(token, spreadsheetId, 'Purchase', [
          ['Product Name', 'Purchasing Price', 'Selling Price', 'Quantity', 'Timestamp'],
        ]),
        this.setSheetHeaders(token, spreadsheetId, 'Sales', [
          ['Transaction ID', 'Timestamp', 'Customer Name', 'Product Name', 'Phone Number', 'Amount', 'Quantity', 'Message'],
        ]),
        this.setSheetHeaders(token, spreadsheetId, 'Inventory', [
          ['Product Name', 'Current Stock', 'Last Updated'],
        ]),
        this.setSheetHeaders(token, spreadsheetId, 'Inventory Log', [
          ['Product Name', 'Change in Stock', 'Timestamp', 'Source'],
        ]),
      ]);

      return spreadsheetId;
    } catch (error) {
      console.error('createSheet error:', error);
      return null;
    }
  }

  private static async setSheetHeaders(
    token: string,
    spreadsheetId: string,
    sheetName: string,
    headers: string[][]
  ) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: headers }),
      }
    );
  }

  static async appendData(
    spreadsheetId: string,
    token: string,
    sheetName: 'Purchase' | 'Sales' | 'Inventory' | 'Inventory Log',
    values: string[][]
  ): Promise<boolean> {
    try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        console.error(`Append error (${sheetName}):`, err);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`appendData error (${sheetName}):`, error);
      return false;
    }
  }

  static async getSheetData(
    spreadsheetId: string,
    token: string,
    sheetName: string
  ): Promise<string[][] | null> {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:Z`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        console.error(`Fetch data error (${sheetName}):`, err);
        return null;
      }

      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error(`getSheetData error (${sheetName}):`, error);
      return null;
    }
  }
  
 static async updateInventoryStock(
  spreadsheetId: string,
  token: string,
  productName: string,
  quantityChange: number
): Promise<void> {
  try {
    const inventoryData = await this.getSheetData(spreadsheetId, token, 'Inventory');

    if (!inventoryData) {
      console.error('Inventory data missing or could not be fetched.');
      return;
    }

    const sanitizedProductName = productName.trim();
    const index = inventoryData.findIndex(row => row[0]?.trim() === sanitizedProductName);
    const timestamp = new Date().toLocaleString();

    if (index === -1) {
      console.log('Product not found in inventory. Adding new...');
      const success = await this.appendData(spreadsheetId, token, 'Inventory', [
        [sanitizedProductName, quantityChange.toString(), timestamp],
      ]);

      if (success) {
        console.log(`New product "${sanitizedProductName}" added to Inventory.`);
      } else {
        console.error(`Failed to append product "${sanitizedProductName}" to Inventory.`);
      }

      return;
    }

    const currentStockStr = inventoryData[index][1] || '0';
    const currentStock = parseInt(currentStockStr, 10);
    const newStock = currentStock + quantityChange;
    const range = `Inventory!B${index + 2}:C${index + 2}`;

    console.log(`Updating stock at range ${range} to quantity: ${newStock}`);

    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[newStock.toString(), timestamp]],
        }),
      }
    );

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      console.error(`Failed to update inventory stock:`, err);
    } else {
      console.log(`Inventory updated: ${sanitizedProductName} = ${newStock}`);
    }
  } catch (error) {
    console.error('Error in updateInventoryStock:', error);
  }
  }

  static async getBalanceSheet(
  spreadsheetId: string,
  token: string
): Promise<{
  totalPurchase: number;
  totalSales: number;
  inventoryValue: number;
  profit: number;
}> {
  const [purchaseData, salesData, inventoryData] = await Promise.all([
    this.getSheetData(spreadsheetId, token, 'Purchase'),
    this.getSheetData(spreadsheetId, token, 'Sales'),
    this.getSheetData(spreadsheetId, token, 'Inventory'),
  ]);

  const totalPurchase = (purchaseData || [])
    .map(row => parseFloat(row[1]) * parseInt(row[3], 10))
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

static async logInventoryChange(
    spreadsheetId: string,
    token: string,
    productName: string,
    quantityChange: number,
    source: InventoryActionType
  ): Promise<void> {
    const timestamp = new Date().toLocaleString();
    const sign = quantityChange > 0 ? '+' : '';
    const values: string[][] = [[
      productName,
      `${sign}${quantityChange}`,
      timestamp,
      source
    ]];

    await this.appendData(spreadsheetId, token, 'Inventory Log', values);
  }

static async handlePurchase(
  spreadsheetId: string,
  token: string,
  productName: string,
  purchaseData: string[][],
  quantity: number
): Promise<void> {
  try {
    await this.appendData(spreadsheetId, token, 'Purchase', purchaseData);
    await this.updateInventoryStock(spreadsheetId, token, productName, quantity);
    await this.logInventoryChange(spreadsheetId, token, productName, quantity, 'Purchase');
  } catch (error) {
    console.error('Error in handlePurchase:', error);
  }
}


  static async handleSale(
    spreadsheetId: string,
    token: string,
    productName: string,
    saleData: string[][],
    quantity: number
  ): Promise<void> {
    await this.appendData(spreadsheetId, token, 'Sales', saleData);                        
    await this.updateInventoryStock(spreadsheetId, token, productName, -quantity);         
    await this.logInventoryChange(spreadsheetId, token, productName, -quantity, 'Sale');   
  }
}


