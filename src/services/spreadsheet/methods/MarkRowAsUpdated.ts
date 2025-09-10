import { axiosInstance } from '../../config/AxiosInstance';

export async function markRowAsUpdated(
  spreadsheetId: string,
  token: string,
  sheetName: string,
  rowIndex: number,
) {
  try {
    let column = 'H';
    if (sheetName === 'Sales') column = 'J';
    else if (sheetName === 'Inventory') column = 'G';
    else if (sheetName === 'Purchase') column = 'H';

    const range = `${sheetName}!${column}${rowIndex}`;

    const body = { values: [['TRUE']] };

    await axiosInstance.put(
      `/${spreadsheetId}/values/${encodeURIComponent(
        range,
      )}?valueInputOption=USER_ENTERED`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return true;
  } catch (error: any) {
    console.error(
      'Error marking row as updated:',
      error.response?.data || error.message,
    );
    return false;
  }
}
