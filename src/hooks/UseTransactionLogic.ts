import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { GoogleAuthService } from '../services/spreadsheet/google/GoogleAuthService';
import { setUser as setUserAction } from '../redux/slices/UserSlice';
import { useConnection } from './UseConnection';
import { useGoogleAuth } from './UseGoogleAuth';
import { useSheetData } from './UseSheetData';
import { useTransactions } from './UseTransactions';

export const useTransactionLogic = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state: RootState) => state.user);
  const { spreadsheetId, sheets } = useSelector(
    (state: RootState) => state.sheet,
  );

  const [showModal, setShowModal] = useState(false);
  const isConnected = useConnection();

  const { handleGoogleLogin, handleLogout } = useGoogleAuth();
  const { initializeSheetData, fetchSheetData } = useSheetData(isConnected);
  const {
    handlePurchaseSave,
    handleSaleSave,
    handleInventorySave,
    deleteCustomerRow,
  } = useTransactions(spreadsheetId, accessToken, fetchSheetData, setShowModal);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const currentUser = await GoogleAuthService.getCurrentUser();
      if (currentUser) {
        dispatch(setUserAction(currentUser));
        await fetchSheetData();
      } else {
        await handleGoogleLogin();
        await fetchSheetData();
      }
    } catch (err) {
      console.error('Error checking sign-in status:', err);
    }
  }, [dispatch, fetchSheetData, handleGoogleLogin]);

  useEffect(() => {
    initializeSheetData();
  }, [initializeSheetData]);

  return {
    user,
    sheets,
    showModal,
    setShowModal,
    handlePurchaseSave,
    handleTransactionSave: handleSaleSave,
    handleInventorySave,
    fetchSheetData,
    fetchCurrentUser,
    handleGoogleLogin,
    handleLogout,
    deleteCustomerRow,
  };
};
