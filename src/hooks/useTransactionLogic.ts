import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/Store';
import {
  setUser as setUserAction,
  setAccessToken as setAccessTokenAction,
  logout as logoutAction,
} from '../redux/slices/userSlice';
import {
  setSpreadsheetId as setSpreadsheetIdAction,
  setCustomers as setCustomersAction,
} from '../redux/slices/sheetSlice';

import { GoogleAuthService } from '../services/GoogleAuthService';
import { GoogleSheetService } from '../services/GoogleSheetService';
import { handleSale } from '../services/sheetMethods/HandleSale';
import { handlePurchase } from '../services/sheetMethods/HandlePurchase';
import { updateInventoryStock } from '../services/sheetMethods/UpdateInventoryStock';
import { Alert } from 'react-native';
import { logInventoryChange } from '../services/sheetMethods/logInventoryChange';


export const useTransactionLogic = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { user, accessToken } = useSelector((state: RootState) => state.user);
  const { spreadsheetId, customers } = useSelector((state: RootState) => state.sheet);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const userInfo = await GoogleAuthService.signIn();
      const { idToken, serverAuthCode } = userInfo?.data || {};

      if (idToken) await AsyncStorage.setItem('google_id_token', idToken);
      if (serverAuthCode) await AsyncStorage.setItem('access_token', serverAuthCode);

      dispatch(setUserAction(userInfo));
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, dispatch]);

  const initializeSheetData = useCallback(async () => {
    const token = await AsyncStorage.getItem('access_token');
    const savedSheetId = await AsyncStorage.getItem('spreadsheetId');
    if (!token) return;

    let finalSheetId = savedSheetId;
    const sheetExists = savedSheetId && await GoogleSheetService.sheetExists(savedSheetId, token);

    if (!sheetExists) {
      finalSheetId = await GoogleSheetService.createSheet(token);
      if (finalSheetId) await AsyncStorage.setItem('spreadsheetId', finalSheetId);
    }

    if (finalSheetId) dispatch(setSpreadsheetIdAction(finalSheetId));
    dispatch(setAccessTokenAction(token));
  }, [dispatch]);

  const fetchCustomerData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token || !spreadsheetId) return;

      const sheetNames = ['Purchase', 'Sales', 'Inventory', 'Inventory Log'];
      const allData: string[][] = [];

      for (const sheetName of sheetNames) {
        const sheetData = await GoogleSheetService.getSheetData(spreadsheetId, token, sheetName);
        if (sheetData?.length) {
          allData.push(...sheetData.map(row => [sheetName, ...row]));
        }
      }

      dispatch(setCustomersAction(allData));
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  }, [spreadsheetId, dispatch]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const currentUser = await GoogleAuthService.getCurrentUser();
      if (currentUser) {
        dispatch(setUserAction(currentUser));
        fetchCustomerData();
      } else {
        await handleGoogleLogin();
        fetchCustomerData();
      }
    } catch (err) {
      console.error('Error checking sign-in status:', err);
    }
  }, [handleGoogleLogin, fetchCustomerData, dispatch]);

  const handleLogout = async () => {
    try {
      await GoogleAuthService.signOut();
      await AsyncStorage.multiRemove(['google_id_token', 'access_token', 'spreadsheetId']);
      dispatch(logoutAction());

      navigation.reset({ index: 0, routes: [{ name: 'WelcomeScreen' as never }] });
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handlePurchaseSave = (
    data: { productName: string; purchasingPrice: string; quantity: string; unit: string; file?: any },
    editRowIndex?: number
  ) => handlePurchase(spreadsheetId, accessToken, data, editRowIndex, fetchCustomerData, setShowModal);

  const handleSaleSave = (
    data: { name: string; productName: string; number: string; amount: string; quantity: string; message: string },
    editRowIndex?: number
  ) => handleSale(spreadsheetId, accessToken, data, editRowIndex, fetchCustomerData, setShowModal);

  const handleInventorySave = (
    data: { productName: string; purchasingPrice: string; quantity: string; unit?: string },
    editRowIndex?: number
  ) => updateInventoryStock(spreadsheetId, accessToken, data, editRowIndex, fetchCustomerData, setShowModal);

 const deleteCustomerRow = async (sheetName: string, rowIndex: number) => {
  if (!spreadsheetId || !accessToken) return Alert.alert('Sheet not initialized');

  try {
    const sheetData = await GoogleSheetService.getSheetData(spreadsheetId, accessToken, sheetName);
    if (!sheetData || !sheetData[rowIndex - 2]) return Alert.alert('Row not found');

    const row = sheetData[rowIndex - 2];
    const productName = row[0]?.trim();
    let quantity = 0;

    if (sheetName === 'Sales') {
      quantity = Number(row[6]) || 0;
    } else if (sheetName === 'Purchase') {
      quantity = Number(row[2]) || 0;
    } else if (sheetName === 'Inventory') {
      quantity = Number(row[1]) || 0;
    }

    if (quantity > 0) {
      if (sheetName === 'Purchase' || sheetName === 'Inventory') {
        await updateInventoryStock(spreadsheetId, accessToken, {
          productName,
          purchasingPrice: '0', 
          quantity: (-quantity).toString(),
          unit: 'pcs'
        });
        await logInventoryChange(spreadsheetId, accessToken, productName, -quantity, 'Inventory');
      } else if (sheetName === 'Sales') {
        await updateInventoryStock(spreadsheetId, accessToken, {
          productName,
          purchasingPrice: '0',
          quantity: quantity.toString(),
          unit: 'pcs'
        });
        await logInventoryChange(spreadsheetId, accessToken, productName, quantity, 'Sale');
      }
    }

    const success = await GoogleSheetService.deleteRow(spreadsheetId, accessToken, sheetName, rowIndex);
    if (success) {
      Alert.alert('Row deleted successfully!');
      fetchCustomerData();
    } else {
      Alert.alert('Failed to delete row');
    }
  } catch (error) {
    console.error('Error deleting row:', error);
    Alert.alert('Failed to delete row');
  }
};


  useEffect(() => { initializeSheetData(); }, [initializeSheetData]);

  return {
    user,
    customers,
    showModal,
    search,
    setShowModal,
    setSearch,
    handlePurchaseSave,
    handleTransactionSave: handleSaleSave,
    handleInventorySave,
    fetchCurrentUser,
    fetchCustomerData,
    handleGoogleLogin,
    handleLogout,
    deleteCustomerRow,
  };
};
