import { axiosInstance } from '../../config/AxiosInstance';

export async function getSheetData(
  spreadsheetId: string,
  token: string,
  sheetName: string
): Promise<string[][] | null> {
  try {
    const response = await axiosInstance.get(
      `/${spreadsheetId}/values/${sheetName}!A2:Z`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response?.data?.values || [];
  } catch (error: any) {
    console.error(`Fetch data error (${sheetName}):`, error?.response?.data || error);
    return null;
  }
}