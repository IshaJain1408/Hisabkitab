
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleAuthService } from '../services/GoogleAuthService';
import { GoogleSheetService } from '../services/GoogleSheetService';

export const useCustomerScreenLogic = () => {
  const [showModal, setShowModal] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<string[][]>([]);
  const navigation = useNavigation();

  const handleGoogleLogin = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const userInfo = await GoogleAuthService.signIn();
      const idToken = userInfo?.data?.idToken;
      const serverAuthCode = userInfo?.data?.serverAuthCode;

      if (idToken) {
        await AsyncStorage.setItem('google_id_token', idToken);
      }
      if (serverAuthCode) {
        await AsyncStorage.setItem('access_token', serverAuthCode);
      }

      setUser(userInfo);
    } catch (error) {
      console.log('Google Sign-In Error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const initializeSheetData = useCallback(async () => {
    const token = await AsyncStorage.getItem('access_token');
    const savedSheetId = await AsyncStorage.getItem('spreadsheetId');
    if (!token) return;

    if (
      !savedSheetId ||
      !(await GoogleSheetService.sheetExists(savedSheetId, token))
    ) {
      const newSheetId = await GoogleSheetService.createSheet(token);
      if (newSheetId) {
        await AsyncStorage.setItem('spreadsheetId', newSheetId);
        setSpreadsheetId(newSheetId);
      }
    } else {
      setSpreadsheetId(savedSheetId);
    }
    setAccessToken(token);
  }, []);

const handlePurchaseSave = async (data: {
  productName: string;
  purchasingPrice: string;
  sellingPrice: string;
  quantity: string;
}) => {
  if (!spreadsheetId || !accessToken) {
    Alert.alert('Sheet not initialized');
    return;
  }

  const timestamp = new Date().toLocaleString();
  const values = [[
    data.productName,
    data.purchasingPrice,
    data.sellingPrice,
    data.quantity,
    timestamp,
  ]];

  try {
    console.log('Step 1: Appending to Purchase Sheet...');
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

    console.log('Step 2: Updating Inventory...');
    // ✅ This is the missing line:
    await GoogleSheetService.updateInventoryStock(
      spreadsheetId,
      accessToken,
      data.productName,
      parseInt(data.quantity, 10)
    );

    console.log('Step 3: Logging inventory change...');
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
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sales!A2:A`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const json = await response.json();
    const existingRows = json.values || [];
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

    const inventoryResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!A2:B`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const inventoryJson = await inventoryResponse.json();
    const inventoryRows: string[][] = inventoryJson.values || [];

    const rowIndex = inventoryRows.findIndex(
      (row) => row[0]?.toLowerCase().trim() === productName.toLowerCase()
    );

    if (rowIndex !== -1) {
      const currentQuantity = parseInt(inventoryRows[rowIndex][1] || '0', 10);
      const newQuantity = Math.max(currentQuantity - quantityToReduce, 0);

      const updatedAt = new Date().toLocaleString();

      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!B${rowIndex + 2}:C${rowIndex + 2}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [[newQuantity.toString(), updatedAt]],
          }),
        }
      );

      if (!updateResponse.ok) {
        console.error('Failed to update inventory after sale');
      }
    } else {
      console.warn(`Product "${productName}" not found in inventory`);
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
  sellingPrice: string;
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
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!A2:B`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const json = await response.json();
    const rows: string[][] = json.values || [];

    console.log('Existing Inventory Rows:', rows);

    const rowIndex = rows.findIndex(
      (row) => row[0]?.toLowerCase().trim() === productName.toLowerCase()
    );

    if (rowIndex !== -1) {
      const currentQuantity = parseInt(rows[rowIndex][1] || '0', 10);
      const newQuantity = currentQuantity + quantity;
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventory!B${rowIndex + 2}:C${rowIndex + 2}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [[newQuantity.toString(), updatedAt]],
          }),
        }
      );

      if (!updateResponse.ok) throw new Error('Failed to update inventory');
    } else {
      const newRow = [[productName, quantity.toString(), updatedAt]];

      const success = await GoogleSheetService.appendData(
        spreadsheetId,
        accessToken,
        'Inventory',
        newRow
      );

      if (!success) {
        throw new Error(`Failed to append new product "${productName}"`);
      }
    }

    console.log('Logging inventory update to Inventory Log...');
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
    const token = await AsyncStorage.getItem('access_token');
    if (!token || !spreadsheetId) return;

    const sheetNames = ['Purchase', 'Sales', 'Inventory', 'Inventory Log'];

    const allData: string[][] = [];

    for (const sheetName of sheetNames) {
      const sheetData = await GoogleSheetService.getSheetData(
        spreadsheetId,
        token,
        sheetName
      );
      if (sheetData && sheetData.length > 0) {
        const taggedData = sheetData.map((row) => [sheetName, ...row]);
        allData.push(...taggedData);
      }
    }

    setCustomers(allData);
  } catch (error) {
    console.error('Error fetching customer data from all sheets:', error);
  }
}, [spreadsheetId]);


  const fetchCurrentUser = useCallback(async () => {
    try {
      const currentUser = await GoogleAuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        fetchCustomerData();
      } else {
        await handleGoogleLogin();
        fetchCustomerData();
      }
    } catch (err) {
      console.error('Error checking sign-in status:', err);
    }
  }, [handleGoogleLogin, fetchCustomerData]);

  const handleLogout = async () => {
    try {
      await GoogleAuthService.signOut();
      await AsyncStorage.removeItem('google_id_token');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('spreadsheet_id');
      setUser(null);
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
