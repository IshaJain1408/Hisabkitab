import { axiosInstance } from '../axiosInstance';
import { setSheetHeaders } from './setSheetHeaders';

export async function createSheet(token: string): Promise<string | null> {
  try {
    const response = await axiosInstance.post(
      `/`,
      {
        properties: { title: `HisabKitab_Report_${Date.now()}` },
        sheets: [
          { properties: { title: 'Purchase' } },
          { properties: { title: 'Sales' } },
          { properties: { title: 'Inventory' } },
          { properties: { title: 'Inventory Log' } }
        ]
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const spreadsheetId = response?.data?.spreadsheetId;
    if (!spreadsheetId) {
      console.error('Sheet creation failed:', response.data);
      return null;
    }

    await Promise.all([
      setSheetHeaders(token, spreadsheetId, 'Purchase', [
        ['Product Name', 'Purchasing Price', 'Quantity', 'Timestamp']
      ]),
      setSheetHeaders(token, spreadsheetId, 'Sales', [
        ['Transaction ID', 'Timestamp', 'Customer Name', 'Product Name', 'Phone Number', 'Amount', 'Quantity', 'Message']
      ]),
      setSheetHeaders(token, spreadsheetId, 'Inventory', [
        ['Product Name', 'Current Stock', 'Last Updated']
      ]),
      setSheetHeaders(token, spreadsheetId, 'Inventory Log', [
        ['Product Name', 'Change in Stock', 'Timestamp', 'Source']
      ])
    ]);

    return spreadsheetId;
  } catch (error) {
    console.error('createSheet error:', error);
    return null;
  }
}
