
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';

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
import { axiosInstance } from '../services/axiosInstance';

export const useTransactionLogic = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const user = useSelector((state: RootState) => state.user.user);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const spreadsheetId = useSelector((state: RootState) => state.sheet.spreadsheetId);
  const customers = useSelector((state: RootState) => state.sheet.customers);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const userInfo = await GoogleAuthService.signIn();
      const idToken = userInfo?.data?.idToken;
      const serverAuthCode = userInfo?.data?.serverAuthCode;

      if (idToken) await AsyncStorage.setItem('google_id_token', idToken);
      if (serverAuthCode) await AsyncStorage.setItem('access_token', serverAuthCode);

      dispatch(setUserAction(userInfo));
    } catch (error) {
      console.log('Google Sign-In Error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, dispatch]);

  const initializeSheetData = useCallback(async () => {
    const token = await AsyncStorage.getItem('access_token');
    const savedSheetId = await AsyncStorage.getItem('spreadsheetId');
    if (!token) return;

    let finalSheetId = savedSheetId;
    if (!savedSheetId || !(await GoogleSheetService.sheetExists(savedSheetId, token))) {
      finalSheetId = await GoogleSheetService.createSheet(token);
      if (finalSheetId) await AsyncStorage.setItem('spreadsheetId', finalSheetId);
    }

    if (finalSheetId) dispatch(setSpreadsheetIdAction(finalSheetId));
    dispatch(setAccessTokenAction(token));
  }, [dispatch]);

  const handlePurchaseSave = async (data: {
    productName: string;
    purchasingPrice: string;
    quantity: string;
  }) => {
    if (!spreadsheetId || !accessToken) {
      Alert.alert('Sheet not initialized');
      return;
    }

const timestamp = new Date().toLocaleString('en-IN');
    const values = [[
      data.productName,
      data.purchasingPrice,
      data.quantity,
      timestamp,
    ]];

    try {
      const success = await GoogleSheetService.appendData(
        spreadsheetId,
        accessToken,
        'Purchase',
        values
      );
      if (!success) {
        Alert.alert('Failed to save purchase');
        return;
      }

      await GoogleSheetService.updateInventoryStock(
        spreadsheetId,
        accessToken,
        data.productName,
        parseInt(data.quantity, 10)
      );

      await GoogleSheetService.logInventoryChange(
        spreadsheetId,
        accessToken,
        data.productName,
        parseInt(data.quantity, 10),
        'Purchase'
      );

      Alert.alert('Purchase saved!');
      setShowModal(false);
      fetchCustomerData();
    } catch (error) {
      console.error('Purchase save error:', error);
      Alert.alert('An error occurred while saving the purchase');
    }
  };


const handleSaleSave = async (data: {
    name: string;
    productName: string;
    number: string;
    amount: string;
    quantity: string;
    message: string;
  }) => {
    if (!spreadsheetId || !accessToken) {
      Alert.alert('Sheet not initialized');
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/${spreadsheetId}/values/Sales!A2:A`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const existingRows = response.data.values || [];
      const transactionId = (existingRows.length + 1).toString();
      const timestamp = new Date().toLocaleString();

      const values = [[
        transactionId,
        timestamp,
        data.name,
        data.productName,
        data.number,
        data.amount,
        data.quantity,
        data.message,
      ]];

      const success = await GoogleSheetService.appendData(
        spreadsheetId,
        accessToken,
        'Sales',
        values
      );
      if (!success) {
        Alert.alert('Failed to save sale');
        return;
      }

      const productName = data.productName.trim();
      const quantityToReduce = parseInt(data.quantity, 10);

      const inventoryRes = await axiosInstance.get(
        `/${spreadsheetId}/values/Inventory!A2:B`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const inventoryRows: string[][] = inventoryRes.data.values || [];

      const rowIndex = inventoryRows.findIndex(
        (row) => row[0]?.toLowerCase().trim() === productName.toLowerCase()
      );

      if (rowIndex !== -1) {
        const currentQuantity = parseInt(inventoryRows[rowIndex][1] || '0', 10);
        const newQuantity = Math.max(currentQuantity - quantityToReduce, 0);
        const updatedAt = new Date().toLocaleString();

        await axiosInstance.put(
          `/${spreadsheetId}/values/Inventory!B${rowIndex + 2}:C${rowIndex + 2}?valueInputOption=USER_ENTERED`,
          { values: [[newQuantity.toString(), updatedAt]] },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          }
        );
      }

      await GoogleSheetService.logInventoryChange(
        spreadsheetId,
        accessToken,
        productName,
        quantityToReduce,
        'Sale'
      );

      Alert.alert('Sale saved!');
      setShowModal(false);
      fetchCustomerData();
    } catch (error) {
      console.error('Sale save error:', error);
      Alert.alert('An error occurred while saving the sale');
    }
  };

  const handleInventorySave = async (data: {
    productName: string;
    purchasingPrice: string;
    quantity: string;
  }) => {
    if (!spreadsheetId || !accessToken) {
      Alert.alert('Sheet not initialized');
      return;
    }

    const updatedAt = new Date().toLocaleString();
    const productName = data.productName.trim();
    const quantity = parseInt(data.quantity, 10);

    if (!productName || isNaN(quantity)) {
      Alert.alert('Invalid product name or quantity');
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/${spreadsheetId}/values/Inventory!A2:B`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const rows: string[][] = response.data.values || [];

      const rowIndex = rows.findIndex(
        (row) => row[0]?.toLowerCase().trim() === productName.toLowerCase()
      );

      if (rowIndex !== -1) {
        const currentQuantity = parseInt(rows[rowIndex][1] || '0', 10);
        const newQuantity = currentQuantity + quantity;

        await axiosInstance.put(
          `/${spreadsheetId}/values/Inventory!B${rowIndex + 2}:C${rowIndex + 2}?valueInputOption=USER_ENTERED`,
          { values: [[newQuantity.toString(), updatedAt]] },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          }
        );
      } else {
        const newRow = [[productName, quantity.toString(), updatedAt]];
        await GoogleSheetService.appendData(spreadsheetId, accessToken, 'Inventory', newRow);
      }

      await GoogleSheetService.logInventoryChange(
        spreadsheetId,
        accessToken,
        productName,
        quantity,
        'Inventory'
      );

      Alert.alert('Inventory updated!');
      setShowModal(false);
      fetchCustomerData();
    } catch (error) {
      console.error('Inventory update error:', error);
      Alert.alert('An error occurred while updating inventory');
    }
  };

  const fetchCustomerData = useCallback(async () => {
    try {
      const 
      token = await AsyncStorage.getItem('access_token');
      if (!token || !spreadsheetId) return;

      const sheetNames = ['Purchase', 'Sales', 'Inventory', 'Inventory Log'];
      const allData: string[][] = [];

      for (const sheetName of sheetNames) {
        const sheetData = await GoogleSheetService.getSheetData(spreadsheetId, token, sheetName);
        if ( sheetData && sheetData?.length > 0) {
          const taggedData = sheetData.map((row) => [sheetName, ...row]);
          allData.push(...taggedData);
        }
      }

      dispatch(setCustomersAction(allData));
    } catch (error) {
      console.error('Error fetching customer data from all sheets:', error);
    }
  }, [spreadsheetId, dispatch]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const currentUser = await GoogleAuthService.getCurrentUser();
      console.log(currentUser,"currentUser")
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
    await AsyncStorage.removeItem('google_id_token');
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('spreadsheetId');
    dispatch(logoutAction());

    navigation.reset({
      index: 0,
      routes: [{ name: 'WelcomeScreen' as never }],
    });
  } catch (error) {
    console.log('Logout Error:', error);
  }
};


  

  useEffect(() => {
    initializeSheetData();
  }, [initializeSheetData]);

  return {
    user,
    showModal,
    search,
    customers,
    setSearch,
    setShowModal,
    handleTransactionSave: handleSaleSave,
    handlePurchaseSave,
    handleInventorySave,
    fetchCurrentUser,
    fetchCustomerData,
    handleLogout,
  };
};
