// /**
//  * @format
//  */

// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';

// AppRegistry.registerComponent(appName, () => App);
/**
 * @format
 */

// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';

// import React from 'react';
// import { Provider } from 'react-redux';
// import { store } from './src/redux/store'; // make sure this path is correct

// const ReduxApp = () => (
//   <Provider store={store}>
//     <App />
//   </Provider>
// );

// AppRegistry.registerComponent(appName, () => ReduxApp);
// index.js or index.tsx
import { AppRegistry } from 'react-native';
import ReduxApp from './App'; // make sure this is the correct file name and path
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => ReduxApp);
