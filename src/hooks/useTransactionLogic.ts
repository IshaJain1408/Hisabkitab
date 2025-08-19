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
import { markRowAsUpdated } from '../services/sheetMethods/markRowAsUpdated';
import { updateInventoryStock } from '../services/sheetMethods/updateInventoryStock';
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

  const handlePurchaseSave = async (
    data: { productName: string; purchasingPrice: string; quantity: string; unit: string; file?: { uri: string; name: string; type: string } },
    editRowIndex?: number
  ) => {
    if (!spreadsheetId || !accessToken) return Alert.alert('Sheet not initialized');

    const timestamp = new Date().toLocaleString('en-IN');
    const newQty = parseInt(data.quantity, 10);
    const rowValues = [data.productName, data.purchasingPrice, data.quantity, data.unit, 'No Attachment', timestamp, '', 'FALSE'];

    try {
      const purchaseData = await GoogleSheetService.getSheetData(spreadsheetId, accessToken, 'Purchase');
      if (!purchaseData) return Alert.alert('Failed to load purchase data');

      let oldQty = 0;
      const newName = data.productName.trim();

      if (editRowIndex !== undefined) {
        const oldRow = purchaseData[editRowIndex - 2];
        oldQty = parseInt(oldRow?.[2] || '0', 10);
        const oldName = oldRow?.[0]?.trim();
        const quantityChange = newQty - oldQty;

        await markRowAsUpdated(spreadsheetId, accessToken, 'Purchase', editRowIndex);

        if (oldName === newName) {
          if (quantityChange !== 0) {
            await GoogleSheetService.updateInventoryStock(spreadsheetId, accessToken, newName, quantityChange, data.purchasingPrice, data.unit);
          }
        } else {
          if (oldQty > 0) await GoogleSheetService.updateInventoryStock(spreadsheetId, accessToken, oldName, -oldQty);
          await GoogleSheetService.updateInventoryStock(spreadsheetId, accessToken, newName, newQty, data.purchasingPrice, data.unit);
        }
      } else if (newQty > 0) {
        await GoogleSheetService.updateInventoryStock(spreadsheetId, accessToken, newName, newQty, data.purchasingPrice, data.unit);
      }

      const success = await GoogleSheetService.appendData(spreadsheetId, accessToken, 'Purchase', [rowValues]);
      if (!success) return Alert.alert('Failed to save purchase');

      await GoogleSheetService.logInventoryChange(spreadsheetId, accessToken, newName, editRowIndex !== undefined ? newQty - oldQty : newQty, 'Purchase');

      Alert.alert(editRowIndex !== undefined ? 'Purchase updated!' : 'Purchase saved!');
      setShowModal(false);
      fetchCustomerData();
    } catch (error) {
      console.error('Purchase save/update error:', error);
      Alert.alert('An error occurred while saving the purchase');
    }
  };


const handleSaleSave = async (
  data: { name: string; productName: string; number: string; amount: string; quantity: string; message: string },
  editRowIndex?: number
) => {
  if (!spreadsheetId || !accessToken) 
    return Alert.alert('Initialization Error', 'Spreadsheet ID or access token is missing.');

  try {
    const productName = data.productName.trim();
    const newQty = parseInt(data.quantity, 10);

    const inventoryRes = await axiosInstance.get(
      `/${spreadsheetId}/values/Inventory!A2:G`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const inventoryRows: string[][] = inventoryRes.data.values || [];
    const rowIndex = inventoryRows.findIndex(
      row => row[0]?.toLowerCase().trim() === productName.toLowerCase() && (row[6] || '').toLowerCase() === 'false'
    );
    if (rowIndex === -1) 
      return Alert.alert('Product Not Found', `The product "${productName}" does not exist in inventory.`);

    let oldQty = 0;
    if (editRowIndex !== undefined) {
      const saleData = await GoogleSheetService.getSheetData(spreadsheetId, accessToken, 'Sales');
      if (!saleData) return Alert.alert('Failed to load sale data for editing');
      const oldRow = saleData[editRowIndex];
      oldQty = parseInt(oldRow?.[6] || '0', 10);
      await markRowAsUpdated(spreadsheetId, accessToken, 'Sales', editRowIndex);
    }

    const currentStock = parseInt(inventoryRows[rowIndex][1] || '0', 10);
    const adjustedStock = currentStock + oldQty - newQty;
    if (adjustedStock < 0) {
      return Alert.alert(
        'Insufficient Stock', 
        `Only ${currentStock} units available in stock for "${productName}".`
      );
    }

    const salesRes = await axiosInstance.get(
      `/${spreadsheetId}/values/Sales!A2:A`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const existingRows = salesRes.data.values || [];
    const transactionId = (existingRows.length + 1).toString();
    const timestamp = new Date().toLocaleString('en-IN');

    const values = [[
      transactionId, timestamp, data.name, productName,
      data.number, data.amount, newQty.toString(),
      data.message, '', 'FALSE'
    ]];
    const success = await GoogleSheetService.appendData(
      spreadsheetId, accessToken, 'Sales', values
    );
    if (!success) return Alert.alert('Save Failed', 'Failed to save sale.');

    const updatedAt =  new Date().toLocaleString('en-IN')
    await axiosInstance.put(
      `/${spreadsheetId}/values/Inventory!B${rowIndex + 2}:C${rowIndex + 2}?valueInputOption=USER_ENTERED`,
      { values: [[adjustedStock.toString(), updatedAt]] },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

        await GoogleSheetService.logInventoryChange(
      spreadsheetId, accessToken, productName, newQty - oldQty, 'Sale'
    );

    Alert.alert('Success', editRowIndex !== undefined ? 'Sale updated!' : 'Sale saved!');
    setShowModal(false);
    fetchCustomerData();
  } catch (error) {
    console.error('Sale save error:', error);
    Alert.alert('Error', 'An error occurred while saving the sale.');
  }
};

const handleInventorySave = async (
    data: { productName: string; purchasingPrice: string; quantity: string; unit?: string },
    editRowIndex?: number
  ) => {
    if (!spreadsheetId || !accessToken) return Alert.alert('Sheet not initialized');

    const updatedAt =  new Date().toLocaleString('en-IN');
    const productName = data.productName.trim();
    const quantity = parseInt(data.quantity, 10);
    const unit = data.unit || 'pcs';

    if (!productName || isNaN(quantity)) return Alert.alert('Invalid product name or quantity');

    try {
      const response = await axiosInstance.get(`/${spreadsheetId}/values/Inventory!A2:G`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const rows: string[][] = response.data.values || [];

      let rowIndex: number | undefined;
      let oldProductName = productName;

      if (editRowIndex !== undefined) {
        rowIndex = editRowIndex - 2;
        oldProductName = rows[rowIndex]?.[0]?.trim() || productName;
      } else {
        const duplicateIndex = rows.findIndex(row => row[0]?.toLowerCase().trim() === productName.toLowerCase());
        if (duplicateIndex !== -1) return Alert.alert('Duplicate Product', `The product "${productName}" already exists in inventory.`);
      }

      const newRow = [[productName, quantity.toString(), updatedAt, '', data.purchasingPrice, unit, 'FALSE']];

      if (rowIndex !== -1 && rowIndex !== undefined) {
        const existingRow = rows[rowIndex];
        const hasChanges = productName !== oldProductName || quantity !== parseInt(existingRow[1] || '0', 10) || data.purchasingPrice !== existingRow[4] || unit !== existingRow[5];

        if (hasChanges) {
          await markRowAsUpdated(spreadsheetId, accessToken, 'Inventory', rowIndex + 2);
          await GoogleSheetService.appendData(spreadsheetId, accessToken, 'Inventory', newRow);
        }
      } else {
        await GoogleSheetService.appendData(spreadsheetId, accessToken, 'Inventory', newRow);
      }

      await GoogleSheetService.logInventoryChange(spreadsheetId, accessToken, productName, quantity, 'Inventory');

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
        await updateInventoryStock(spreadsheetId, accessToken, productName, -quantity);
        await logInventoryChange(spreadsheetId, accessToken, productName, -quantity, 'Inventory');
    } else if (sheetName === 'Sales') {
        await updateInventoryStock(spreadsheetId, accessToken, productName, quantity);
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
