import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthService } from '../services/GoogleAuthService';
// import { SignInResponse } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  // const [user, setUser] = useState<SignInResponse | null>(null);
  const navigation = useNavigation<any>();

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
        }
        await AsyncStorage.setItem('user_photo', profile?.photo || '');

        // setUser(userInfo);
        navigation.replace('CustomerScreen');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hisab: {
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  kitab: {
    color: '#FC991A',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 100,
  },
  logoBox: {
    alignItems: 'center',
    marginTop: 100,
  },
  subText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#FC991A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: width * 0.7,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',

    fontSize: 16,
  },
});
