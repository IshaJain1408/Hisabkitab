import { axiosInstance } from '../AxiosInstance';

export async function appendData(
  spreadsheetId: string,
  token: string,
  sheetName: 'Purchase' | 'Sales' | 'Inventory' | 'Inventory Log',
  values: string[][]
): Promise<boolean> {
  try {
    await axiosInstance.post(
      `/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      { values },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return true;
  } catch (error: any) {
    console.error(`appendData error (${sheetName}):`, error?.response?.data || error);
    return false;
  }
}