import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  setUser as setUserAction,
  logout as logoutAction,
} from '../redux/slices/UserSlice';
import { GoogleAuthService } from '../services/spreadsheet/google/GoogleAuthService';

export const useGoogleAuth = (fetchSheetData?: () => Promise<void>) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleGoogleLogin = useCallback(async () => {
    try {
      const userInfo = await GoogleAuthService.signIn();
      const { idToken, serverAuthCode } = userInfo?.data || {};

      if (idToken) await AsyncStorage.setItem('google_id_token', idToken);
      if (serverAuthCode)
        await AsyncStorage.setItem('access_token', serverAuthCode);

      dispatch(setUserAction(userInfo));
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  }, [dispatch]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const currentUser = await GoogleAuthService.getCurrentUser();
      if (currentUser) {
        dispatch(setUserAction(currentUser));
        fetchSheetData && fetchSheetData();
      } else {
        await handleGoogleLogin();
        fetchSheetData && fetchSheetData();
      }
    } catch (err) {
      console.error('Error checking sign-in status:', err);
    }
  }, [dispatch, handleGoogleLogin, fetchSheetData]);

  const handleLogout = async () => {
    try {
      await GoogleAuthService.signOut();
      await AsyncStorage.multiRemove(['google_id_token', 'access_token']);
      dispatch(logoutAction());
      navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeScreen' as never }],
      });
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return { handleGoogleLogin, handleLogout, fetchCurrentUser };
};
