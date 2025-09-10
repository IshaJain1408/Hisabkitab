import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SheetState {
  spreadsheetId: string | null;
  sheets: string[][];
}

const initialState: SheetState = {
  spreadsheetId: null,
  sheets: [],
};

export const sheetSlice = createSlice({
  name: 'sheet',
  initialState,
  reducers: {
    setSpreadsheetId(state, action: PayloadAction<string>) {
      state.spreadsheetId = action.payload;
    },
    setSheets(state, action: PayloadAction<string[][]>) {
      state.sheets = action.payload;
    },
  },
});

export const { setSpreadsheetId, setSheets } = sheetSlice.actions;
export default sheetSlice.reducer;
