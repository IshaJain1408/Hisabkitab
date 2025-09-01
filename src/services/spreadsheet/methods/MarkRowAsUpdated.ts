
import { axiosInstance } from "../../config/AxiosInstance";

export async function markRowAsUpdated(
  spreadsheetId: string,
  token: string,
  sheetName: string,
  rowIndex: number
) {
  try {
  let column = 'H'; 
    if (sheetName === 'Sales') column = 'J';    
    else if (sheetName === 'Inventory') column = 'G'; 
    else if (sheetName === 'Purchase') column = 'H'; 

    const range = `${sheetName}!${column}${rowIndex}`;
        console.log('Marking updated at:', range);


    const body = { values: [['TRUE']] };

    const response = await axiosInstance.put(
      `/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`Row ${rowIndex} marked as updated in ${sheetName}.`, response.data);
    return true;
  } catch (error: any) {
    console.error('Error marking row as updated:', error.response?.data || error.message);
    return false;
  }
}


