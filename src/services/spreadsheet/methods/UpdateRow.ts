import { axiosInstance } from "../../config/AxiosInstance";

function getColumnLetter(col: number): string {
  let letter = "";
  while (col > 0) {
    const mod = (col - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    col = Math.floor((col - mod) / 26);
  }
  return letter;
}

export async function updateRow(
  spreadsheetId: string,
  token: string,
  sheetName: string,
  rowIndex: number,
  rowData: any[]
) {
  try {
    const lastCol = getColumnLetter(rowData.length);
    const safeSheetName = sheetName.includes(" ") ? `'${sheetName}'` : sheetName;
    const range = `${safeSheetName}!A${rowIndex}:${lastCol}${rowIndex}`;
    console.log("Updating Google Sheet range:", range);

    const body = { values: [rowData] };

    const response = await axiosInstance.put(
  `/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
  body,
  { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating row:", error);
  }
}
