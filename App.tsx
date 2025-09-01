import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './src/redux/Store';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorPopup } from './src/components/popup/ErrorPopup';
import { SuccessPopup } from './src/components/popup/SuccessPopup';

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
        <ErrorPopup />
        <SuccessPopup />
      </PersistGate>
    </Provider>
  );
};

export default ReduxApp;
