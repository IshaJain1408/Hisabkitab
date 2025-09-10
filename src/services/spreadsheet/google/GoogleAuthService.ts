
import {GoogleSignin, SignInResponse} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  scopes: ['profile', 'email','https://www.googleapis.com/auth/spreadsheets'],
});
console.log(GOOGLE_WEB_CLIENT_ID,"GOOGLE_WEB_CLIENT_ID")

export class GoogleAuthService {
  static async signIn(): Promise<SignInResponse> {
    await GoogleSignin.hasPlayServices();
    return await GoogleSignin.signIn();
  }
  
  static async getAccessToken(): Promise<string | null> {
  const tokens = await GoogleSignin.getTokens();
  return tokens.accessToken;
}


  static async signOut(): Promise<void> {
    await GoogleSignin.signOut();
  }

  static async isSignedIn(): Promise<boolean> {
    const user = await GoogleSignin.getCurrentUser();
    return user !== null;
  }

  static async getCurrentUser() {
    return await GoogleSignin.getCurrentUser();
  }
}
