import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import styles from './WelcomeScreen.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthService } from '../../services/spreadsheet/google/GoogleAuthService';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setAccessToken, setUser } from '../../redux/slices/UserSlice';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      const userInfo = await GoogleAuthService.signIn();
      const idToken = userInfo?.data?.idToken;
      const profile = userInfo?.data?.user;

      if (idToken) {
        await AsyncStorage.setItem('google_id_token', idToken);
        const token = await GoogleAuthService.getAccessToken();

        if (token) {
          await AsyncStorage.setItem('access_token', token);
          dispatch(setAccessToken(token));
        }

        await AsyncStorage.setItem('user_photo', profile?.photo || '');
        dispatch(setUser(userInfo));

        navigation.replace('HomeScreen');
      }
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      Alert.alert('Login Failed', error?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>
          <Text style={styles.hisab}>Hisab</Text>
          <Text style={styles.kitab}>Kitab</Text>
        </Text>
        <Text style={styles.subtitle}>Budget Better. Live Smarter</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Sign In With Google</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;
