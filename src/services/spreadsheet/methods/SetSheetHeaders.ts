import { axiosInstance } from '../../config/AxiosInstance';

export async function setSheetHeaders(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  headers: string[][]
): Promise<void> {
  await axiosInstance.put(
    `/${spreadsheetId}/values/${sheetName}!A1:Z1?valueInputOption=USER_ENTERED`,
    { values: headers },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}