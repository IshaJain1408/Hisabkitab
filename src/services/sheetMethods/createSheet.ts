import { axiosInstance } from '../AxiosInstance';
import { setSheetHeaders } from './SetSheetHeaders';

export async function createSheet(token: string): Promise<string | null> {
  try {
    const response = await axiosInstance.post(
      `/`,
      {
        properties: { title: `HisabKitab_Report` },
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
  ['Product Name', 'Purchasing Price', 'Quantity', 'Unit', 'Attachment Link', 'Timestamp', 'Status','IsUpdated']
      ]),
      setSheetHeaders(token, spreadsheetId, 'Sales', [
        ['Transaction ID', 'Timestamp', 'Customer Name', 'Product Name', 'Phone Number', 'Amount', 'Quantity', 'Message','Status','IsUpdated']
      ]),
      setSheetHeaders(token, spreadsheetId, 'Inventory', [
        ['Product Name', 'Current Stock', 'Last Updated','Status','Purchasing Price','Unit','IsUpdated']
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
