import { axiosInstance } from '../AxiosInstance';

const getStatusColumn = (sheetName: string): string => {
  switch (sheetName) {
    case 'Purchase':
      return 'G'; 
    case 'Sales':
      return 'I';
    case 'Inventory':
      return 'D'; 
    default:
      return 'E'; 
  }
};

export const updateRowStatus = async (
  spreadsheetId: string,
  accessToken: string,
  sheetName: string,
  rowIndex: number,
  status: string = 'deleted'
): Promise<boolean> => {
  try {
    const column = getStatusColumn(sheetName);
    const range = `${sheetName}!${column}${rowIndex + 1}`;
    const requestBody = {
      values: [[status]],
    };

    await axiosInstance.put(
      `/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return true;
  } catch (error) {
    console.error('Error updating row status:', error);
    return false;
  }
};
