import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/Store';
import {
  setSpreadsheetId as setSpreadsheetIdAction,
  setSheets as setSheetsAction,
} from '../redux/slices/SheetSlice';
import { setAccessToken as setAccessTokenAction } from '../redux/slices/UserSlice';
import { GoogleAuthService } from '../services/spreadsheet/google/GoogleAuthService';
import { GoogleSheetService } from '../services/spreadsheet/google/GoogleSheetService';
import { SheetNames } from '../constants/TransactionConstants';

export const useSheetData = (isConnected: boolean | null) => {
  const dispatch = useDispatch();
  const { spreadsheetId } = useSelector((state: RootState) => state.sheet);

  const initializeSheetData = useCallback(async () => {
    let token = await GoogleAuthService.getAccessToken();
    if (!token) {
      await GoogleAuthService.signIn();
      token = await GoogleAuthService.getAccessToken();
    }

    if (!token) return;
    const savedSheetId = await AsyncStorage.getItem('spreadsheetId');
    let finalSheetId = savedSheetId;

    const sheetExists = savedSheetId && await GoogleSheetService.sheetExists(savedSheetId, token);
    if (!sheetExists) {
      finalSheetId = await GoogleSheetService.createSheet(token);
      if (finalSheetId) await AsyncStorage.setItem('spreadsheetId', finalSheetId);
    }

    if (finalSheetId) dispatch(setSpreadsheetIdAction(finalSheetId));
    dispatch(setAccessTokenAction(token));
  }, [dispatch]);

  const fetchSheetData = useCallback(async () => {
    try {
      if (!spreadsheetId) return;
      const cached = await AsyncStorage.getItem("userSheetCache");
      if (cached) dispatch(setSheetsAction(JSON.parse(cached)));

      if (isConnected) {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) return;
        const allData: string[][] = [];

        for (const sheetName of SheetNames) {
          const sheetData = await GoogleSheetService.getSheetData(spreadsheetId, token, sheetName);
          if (sheetData?.length) {
            allData.push(...sheetData.map(row => [sheetName, ...row]));
          }
        }

        dispatch(setSheetsAction(allData));
        await AsyncStorage.setItem("userSheetCache", JSON.stringify(allData));
      }
    } catch (error) {
      console.error('Error fetching sheet data:', error);
    }
  }, [spreadsheetId, dispatch, isConnected]);

  return { initializeSheetData, fetchSheetData };
};
