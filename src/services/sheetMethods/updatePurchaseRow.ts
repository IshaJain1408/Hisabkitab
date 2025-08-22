import { appendData } from './appendData';
import { markRowAsUpdated } from './markRowAsUpdated';

export async function updatePurchaseRow(
  spreadsheetId: string,
  token: string,
  rowIndex: number,
  newData: string[]
) {
  try {
    await markRowAsUpdated(spreadsheetId, token, 'Purchase', rowIndex);

    await appendData(spreadsheetId, token, 'Purchase', [newData]);

    console.log(`Row ${rowIndex} updated and new entry added.`);
  } catch (error) {
    console.error('Error in updatePurchaseRow:', error);
  }
}
