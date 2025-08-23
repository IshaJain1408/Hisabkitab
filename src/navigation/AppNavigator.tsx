import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '../types/Types';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BalanceSheetScreen from '../screens/BalanceSheetScreen';
import TransactionScreen from '../screens/TransactionScreen';

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
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TransactionScreen"
            component={TransactionScreen}
            options={{
              headerShown: true,
              headerBackVisible: true,
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="BalanceSheetScreen"
            component={BalanceSheetScreen}
            options={{
              headerTransparent: true,
              title: '',
              headerTintColor: '#000',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
