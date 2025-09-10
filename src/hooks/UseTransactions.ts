import { handleSale } from '../services/spreadsheet/methods/HandleSale';
import { handlePurchase } from '../services/spreadsheet/methods/HandlePurchase';
import { updateInventoryStock } from '../services/spreadsheet/methods/UpdateInventoryStock';
import { deleteRow } from '../services/spreadsheet/methods/DeleteRow';
import { InventoryActionType } from '../services/spreadsheet/google/GoogleSheetService';
import { InventoryData, PurchaseData, SaleData } from '../types/Index';

export const useTransactions = (
  spreadsheetId: string | null,
  accessToken: string | null,
  fetchSheetData: () => Promise<void>,
  setShowModal: (value: boolean) => void,
) => {
  const handlePurchaseSave = (data: PurchaseData, editRowIndex?: number) => {
    if (!spreadsheetId || !accessToken) return;
    return handlePurchase(
      spreadsheetId,
      accessToken,
      data,
      editRowIndex,
      fetchSheetData,
      setShowModal,
    );
  };

  const handleSaleSave = (data: SaleData, editRowIndex?: number) => {
    if (!spreadsheetId || !accessToken) return;
    return handleSale(
      spreadsheetId,
      accessToken,
      data,
      editRowIndex,
      fetchSheetData,
      setShowModal,
    );
  };

  const handleInventorySave = (data: InventoryData, editRowIndex?: number) => {
    if (!spreadsheetId || !accessToken) return;
    return updateInventoryStock(
      spreadsheetId,
      accessToken,
      data,
      editRowIndex,
      fetchSheetData,
      setShowModal,
    );
  };

  const deleteCustomerRow = async (
    sheetName: InventoryActionType,
    rowIndex: number,
  ): Promise<void> => {
    if (!spreadsheetId || !accessToken) return;
    await deleteRow(
      spreadsheetId,
      accessToken,
      sheetName,
      rowIndex,
      fetchSheetData,
    );
  };
  return {
    handlePurchaseSave,
    handleSaleSave,
    handleInventorySave,
    deleteCustomerRow,
  };
};
