import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import HomeScreen from '../screens/HomeScreen';
import CustomerScreen from '../screens/CustomerScreen';
import CustomerTransactionScreen from '../screens/CustomerTransactionScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BalanceSheetScreen from '../screens/BalanceSheetScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="WelcomeScreen">
          <Stack.Screen
            name="WelcomeScreen"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ title: 'Home' }}
          />
          <Stack.Screen
            name="CustomerScreen"
            component={CustomerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CustomerTransactionScreen"
            component={CustomerTransactionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BalanceSheetScreen"
            component={BalanceSheetScreen}
            options={{
              headerTransparent: true, // Header background transparent
              title: '', // Title hide kar diya
              headerTintColor: '#000', // Back icon ka color (change if needed)
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
