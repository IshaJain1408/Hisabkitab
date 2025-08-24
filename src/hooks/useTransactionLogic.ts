import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/Store';
import {
  setUser as setUserAction,
  setAccessToken as setAccessTokenAction,
  logout as logoutAction,
} from '../redux/slices/UserSlice';
import {
  setSpreadsheetId as setSpreadsheetIdAction,
  setCustomers as setCustomersAction,
} from '../redux/slices/SheetSlice';

import { GoogleAuthService } from '../services/GoogleAuthService';
import { GoogleSheetService, InventoryActionType } from '../services/GoogleSheetService';
import { handleSale } from '../services/sheetMethods/HandleSale';
import { handlePurchase } from '../services/sheetMethods/HandlePurchase';
import { updateInventoryStock } from '../services/sheetMethods/UpdateInventoryStock';
import { deleteRow } from '../services/sheetMethods/DeleteRow';
import NetInfo from "@react-native-community/netinfo";



export const useTransactionLogic = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, accessToken } = useSelector((state: RootState) => state.user);
  const { spreadsheetId, customers } = useSelector((state: RootState) => state.sheet);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

   useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

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
      if (!spreadsheetId) return;
      const cached = await AsyncStorage.getItem("userSheetCache");
      if (cached) {
        dispatch(setCustomersAction(JSON.parse(cached)));
      }

      if (isConnected) {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) return;

        const sheetNames = ['Purchase', 'Sales', 'Inventory', 'Inventory Log'];
        const allData: string[][] = [];

        for (const sheetName of sheetNames) {
          const sheetData = await GoogleSheetService.getSheetData(spreadsheetId, token, sheetName);
          if (sheetData?.length) {
            allData.push(...sheetData.map(row => [sheetName, ...row]));
          }
        }
        dispatch(setCustomersAction(allData));
        await AsyncStorage.setItem("userSheetCache", JSON.stringify(allData));
      }

    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  }, [spreadsheetId, dispatch, isConnected]);

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
      await AsyncStorage.multiRemove(['google_id_token', 'access_token']);
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

const deleteCustomerRow = (sheetName: InventoryActionType, rowIndex: number) => {
  return deleteRow(spreadsheetId, accessToken, sheetName, rowIndex, fetchCustomerData);
  };

  useEffect(() => {
    const loadCachedData = async () => {
      const cached = await AsyncStorage.getItem("userSheetCache");
      if (cached) {
        dispatch(setCustomersAction(JSON.parse(cached)));
      }
    };
    loadCachedData();
    initializeSheetData();
  }, [initializeSheetData, dispatch]);
  
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
