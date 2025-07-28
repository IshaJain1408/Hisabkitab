// import AppNavigator from './src/navigation/AppNavigator';

// function App() {
//   return <AppNavigator />;
// }

// export default App;
// App.tsx

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
};

export default ReduxApp;
