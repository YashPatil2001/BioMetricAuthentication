/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{ useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  ToastAndroid
} from 'react-native';
import TouchID from 'react-native-touch-id';
import Login from './app/Screens/login';
import CallScreen from './app/Screens/callScreen';

const App = () => {


  // const optionalConfigObject = {
  //   title: 'Authentication Required', // Android
  //   imageColor: '#e00606', // Android
  //   imageErrorColor: '#ff0000', // Android
  //   sensorDescription: 'Touch sensor', // Android
  //   sensorErrorDescription: 'Failed', // Android
  //   cancelText: 'Cancel', // Android
  //   fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
  //   unifiedErrors: false, // use unified error messages (default false)
  //   passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
  // };

  // const handleAuth = () => {
  //   TouchID.isSupported(optionalConfigObject)
  //   .then(biometryType => {
  //     console.log('biometric type : ' , biometryType);
  //     // Success code
  //     if (biometryType === 'FaceID') {
  //         console.log('FaceID is supported.');
  //     } else {
  //         console.log('TouchID is supported.');
  //         TouchID.authenticate('',optionalConfigObject).then( success => {
  //            console.log('success : ',success);
  //            ToastAndroid.show('authenticated successfully',ToastAndroid.SHORT);
  //         });
  //     }
  //   })
  //   .catch(error => {
  //     // Failure code
  //     console.log('error : ',error);
  //   });
  // }

  // useEffect(() => {
  //   handleAuth();
  // })
  


  return (
    // <SafeAreaView style={styles.container}>
    //      <Text>React native bimatric</Text>
    // </SafeAreaView>
    // <Login />
    <CallScreen />
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
});

export default App;
