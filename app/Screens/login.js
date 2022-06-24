import React,{ useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  TextInput,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { postService } from '../utils/webServices';
import RtcEngine from 'react-native-agora';

const Login = () => {
  
    const [ phone, setPhone ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ loggingIn, setLoggingIn ] = useState(false)
    const [ offlineStatus, setOfflineStatus ] = useState(false);

    const phoneHandler = val => setPhone(val)
    const passwordHandler = val => setPassword(val)

    useEffect(() => {
        NetInfo.addEventListener( state => {
            // const offline = !(state.isConnected);
            setOfflineStatus(!state.isConnected);
        })
    })

    const LoginHandler = () => {

        if(phone < 10){
            ToastAndroid.show('Invalid phone number',ToastAndroid.SHORT);
            return;
        }
        if(password < 6){
            ToastAndroid.show('Invalid password',ToastAndroid.SHORT);
            return;
        }
         console.log(`phone : ${phone}
                     password : ${password}`);
         setLoggingIn(true);
         let requestBody = {
            "userMobileNumber" : phone,
            "userPassword" : password
         }
         if(offlineStatus){
            ToastAndroid.show('Check your internet connection',ToastAndroid.SHORT)
            setLoggingIn(false)
         } else {
            postService('user/userLogin', requestBody, response => {
                setLoggingIn(false)
                console.log(`
                   token : ${response.data.token}
                   refresh token : ${response.data.refreshToken}
                `)
             },
              failure => {
                    setLoggingIn(false)
                   ToastAndroid.show('Invalid phone or password',ToastAndroid.SHORT);
               })
         }
        

    }
    return (
        <SafeAreaView style={{
            alignItems: 'center'
        }}>
           <View style={{
                width: 350,
                margin: 20,
                marginTop: 90,
                alignItems: 'center',
                backgroundColor: '#ffff',
                borderRadius: 8,
                shadowColor: '#000000',
                shadowOpacity: 0.9,
                shadowRadius: 20,
                elevation: 10,
                padding: 15
                
           }}>
               <Text style={{
                    fontSize: 30,
                    color: 'green',
                    fontWeight: 'bold' }} >
                      User Login
                </Text>

                <View style={{
                    flexDirection: 'row',
                    marginTop: 50,
                    alignItems: 'center',
                }}>
                   <Text style={{
                        color:'black',
                         fontSize: 15}}>
                             Phone Number: 
                   </Text> 
                   <TextInput 
                       style={{
                          borderBottomColor: 'green',
                          borderBottomWidth: 1,
                          width: 200,
                          marginStart: 10,
                          fontSize:18
                       }}
                       onChangeText={phoneHandler}
                       keyboardType='phone-pad'
                       maxLength={10}
                    />
                </View>
                <View style={{
                    flexDirection: 'row',
                    marginTop: 5,
                    alignItems: 'center',
                }}>
                   <Text style={{
                        color:'black',
                         fontSize: 15}}>
                             Password: 
                   </Text> 
                   <TextInput 
                       style={{
                          borderBottomColor: 'green',
                          borderBottomWidth: 1,
                          width:200,
                          marginStart: 40,
                          fontSize: 18,}}
                          secureTextEntry
                        onChangeText={passwordHandler}
                    />
                </View>
                <TouchableOpacity
                    style={{
                        backgroundColor: 'green',
                        padding: 10,
                        borderRadius: 8,
                        width: 100,
                        alignItems: 'center',
                        marginTop: 60
                    }}
                    onPress={LoginHandler}
                >
                    { !loggingIn ? (
                        <Text style={{
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                           Login
                        </Text>
                    ) : (
                        <ActivityIndicator  color={'#ffffff'}/>
                    ) }
                     
                </TouchableOpacity>
           </View>
        </SafeAreaView>
    )
}

export default Login;