import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SheetState {
  spreadsheetId: string | null;
  customers: string[][];
}

const initialState: SheetState = {
  spreadsheetId: null,
  customers: [],
};

export const sheetSlice = createSlice({
  name: 'sheet',
  initialState,
  reducers: {
    setSpreadsheetId(state, action: PayloadAction<string>) {
      state.spreadsheetId = action.payload;
    },
    setCustomers(state, action: PayloadAction<string[][]>) {
      state.customers = action.payload;
    },
  },
});

export const { setSpreadsheetId, setCustomers } = sheetSlice.actions;
export default sheetSlice.reducer;
