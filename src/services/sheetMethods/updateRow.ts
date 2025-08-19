import { axiosInstance } from "../axiosInstance";

export async function updateRow(
  spreadsheetId: string,
  token: string,
  sheetName: string,
  rowIndex: number,
  rowData: any[]
) {
  try {
    const lastCol = String.fromCharCode('A'.charCodeAt(0) + rowData.length - 1);
    const range = `${sheetName}!A${rowIndex}:${lastCol}${rowIndex}`;
    const body = { values: [rowData] };

    await axiosInstance.put(
      `/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(`Row ${rowIndex} updated in ${sheetName}.`);
  } catch (error) {
    console.error('Error updating row:', error);
  }
}
