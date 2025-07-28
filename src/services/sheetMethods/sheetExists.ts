import { SHEETS_API_BASE } from '../apiConstants';

export async function sheetExists(spreadsheetId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch (error) {
    console.error('Sheet existence check failed:', error);
    return false;
  }
}