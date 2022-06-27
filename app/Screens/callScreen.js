import React,{ useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  Alert
} from 'react-native';

import RtcEngine from 'react-native-agora';
import messaging from '@react-native-firebase/messaging';
import { CallKeep } from '../utils/callKeep';
import { DeviceEventEmitter } from 'react-native'


const CallScreen = () => {
    
    const [ appId, setAppId ] = useState('6174b02b2b4f458886cb2ff254009d31')
    const [ token, setToken ] = useState('0066174b02b2b4f458886cb2ff254009d31IABXtr2y/aztaa8mZpFwFI8m/iPqebik5xVc5PBc7KsDTM0xl5AAAAAAEABGROOeya62YgEAAQDKrrZi')
    const [ channelName, setChannelName ] = useState('Test')
    const [ openMicrophone, setOpenMicrophone ] = useState(true)
    const [ enableSpeakerphone, setEnableSpeakerphone ] = useState(true)
    const [ joinSucceed, setJoinSucceed ] = useState(false)
    const [ peerIds, setPeerIds ] = useState([])
    // const [ engine, setEngine ] = useState();
    var engine;
    const requestCameraAndAudioPermission = async () =>{
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ])
            if (
                granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
            ) {
                console.log('You can use the mic')
            } else {
                console.log('Permission denied')
            }
        } catch (err) {
            console.warn(err)
        }
    }


    const requestUserPermission = async () => {
      const token = await messaging().getToken()
      console.log('token : ', token)
      const authStatus = await messaging().requestPermission();
      const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
     if (enabled) {
      console.log('Authorization status:', authStatus);
      
     }
    }

    const setupCloudMessaging  = () => {
          requestUserPermission();
    }

    const setupRTC = async ( rtc ) => {
      //  setEngine((pRtc) => {
      //        console.log('prtc : ',pRtc);
      //        console.log('rtc : ',rtc);
      //        return rtc;
      //  })
      // setEngine(rtc);
      engine = rtc;
       console.log('rtc : ',rtc)
       console.log('engine : ',engine)

       // Enable the audio module.
       await rtc.enableAudio()
       // Listen for the UserJoined callback.
        // This callback occurs when the remote user successfully joins the channel.
        rtc.addListener('UserJoined', (uid, elapsed) => {
          console.log('UserJoined', uid, elapsed)
          ToastAndroid.show(`user with ${uid} joined`,ToastAndroid.SHORT);
          if (peerIds.indexOf(uid) === -1) {
              setPeerIds( prevPeerIds => {
                  return [ ...prevPeerIds, uid];
              })
          }
      })

       // Listen for the UserOffline callback.
    // This callback occurs when the remote user leaves the channel or drops offline.
    rtc.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason)
          // Remove peer ID from state array
          ToastAndroid.show(`user with ${uid} leaved`,ToastAndroid.SHORT);
          setPeerIds(peerIds.filter(id => id !== uid))
          // peerIds: peerIds.filter(id => id !== uid)
    })

    // Listen for the JoinChannelSuccess callback.
    // This callback occurs when the local user successfully joins the channel.
   rtc.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
    ToastAndroid.show('joined',ToastAndroid.SHORT);
     console.log('JoinChannelSuccess', channel, uid, elapsed)
     setJoinSucceed(true)
   })

   return rtc;
    }
    const init = async () => {
       const rtc = await RtcEngine.create('6174b02b2b4f458886cb2ff254009d31')
                 .then( rtc => setupRTC(rtc))
                 .catch( err => console.log('enging err: ',err))
    }

    if (Platform.OS === 'android') {
        // Request required permissions from Android
        requestCameraAndAudioPermission().then(() => {
            console.log('requested!')
        })
    }

 const  joinChannel = async () => {
  console.log('join engine : ', engine);
  ToastAndroid.show('join engine : ' +  engine,ToastAndroid.SHORT);
       engine?.joinChannel(
        '0066174b02b2b4f458886cb2ff254009d31IABGLWdN5aDlYCWXcdiNOITRurDZb0TZ6b24H+4Edj0lwc0xl5AAAAAAEACDxJolmRa4YgEAAQCbFrhi', 
        'maxdigi', 
        null, 
        0)
        .catch( err => console.log('err ',err))
    }

    // Turn the microphone on or off.
 const  switchMicrophone = () => {
        engine?.enableLocalAudio(!openMicrophone).then(() => {
           setOpenMicrophone(!openMicrophone)
        }).catch((err) => {
        console.warn('enableLocalAudio', err)
       })
    }

    // Switch the audio playback device.
const  switchSpeakerphone = () => {
       engine?.setEnableSpeakerphone(!enableSpeakerphone).then(() => {
            setEnableSpeakerphone(!enableSpeakerphone)
      }).catch((err) => {
        console.warn('setEnableSpeakerphone', err)
      })
    }

 const leaveChannel = async () => {
        await engine?.leaveChannel().catch( err => console.log('JoinChannelSuccess : ',err))
        setPeerIds([])
        setJoinSucceed(false);
    }

    useEffect(() => {
        // setupCloudMessaging()
        init();
        setupCloudMessaging()
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log(
            'onNotificationOpenedApp : Notification :',
           JSON.stringify(remoteMessage),
          );
        });

        // Check whether an initial notification is available
     messaging().getInitialNotification(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'getInitialNotification : Notification',
          JSON.stringify(remoteMessage),
        );
        // setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
      }
      // setLoading(false);
    });   

    messaging().onMessage( remoteMessage => {
      console.log(`Foreground : message : ${JSON.stringify(remoteMessage.data)}`)
      let data = remoteMessage.data;
      // setToken(data.token)
      // setChannelName(data.channelName)
      // let callKeep = new CallKeep();
      // callKeep.startCall('Yash');
     
      // engine?.joinChannel(data.token, data.channelName, null, 0)
            //  .then( joinData => console.log('join Info: ',joinData,data.token,data.channelName))
            //  .catch( err => console.log('err ',err))      

    })

        DeviceEventEmitter.addListener('accept', () => {
          //Do something!
           ToastAndroid.show('CAll Accepted',ToastAndroid.SHORT);
           console.log('accepted call')
           joinChannel();
        })
           DeviceEventEmitter.addListener('reject', () => {
          //Do something!
          ToastAndroid.show('CAll Rejected',ToastAndroid.SHORT);
          console.log('accepted rejected')
        })

    },[])

    return (
        <View style={styles.container}>
              <View style={styles.top}>
                <TextInput
                  style={styles.input}
                  onChangeText={ text => setChannelName(text)}
                  placeholder={'Channel Name'}
                  value={channelName}
                />
                <Button
                  onPress={joinSucceed ? leaveChannel : joinChannel}
                  title={`${joinSucceed ? 'Leave' : 'Join'} channel`}
                />
              </View>
              <View style={styles.float}>
                <Button
                  onPress={ switchMicrophone }
                  title={`Microphone ${openMicrophone ? 'on' : 'off'}`}
                />
                <Button
                  onPress={switchSpeakerphone }
                  title={enableSpeakerphone ? 'Speakerphone' : 'Earpiece'}
                />
              </View>
            </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      float: {
        position: 'absolute',
        right: 0,
        bottom: 0,
      },
      top: {
        width: '100%',
      },
      input: {
        borderColor: 'gray',
        borderWidth: 1,
      },

})

export default CallScreen;