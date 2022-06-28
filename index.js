/**
 * @format
 */

import {AppRegistry, NativeModules} from 'react-native';
const {CallModule} = NativeModules;
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

console.log('NativeModules : ', JSON.stringify(NativeModules));
messaging().setBackgroundMessageHandler(async message => {
  CallModule.showIncomingCall('Yash Patil');
  console.log('NativeModules : ', JSON.stringify(CallModule));
  console.log('setBackgroundMessageHandler : notification : ', message);
});
AppRegistry.registerComponent(appName, () => App);
