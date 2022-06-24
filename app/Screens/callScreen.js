import React,{ useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ToastAndroid
} from 'react-native';

import RtcEngine from 'react-native-agora';
import messaging from '@react-native-firebase/messaging';


const CallScreen = () => {
    
    const [ appId, setAppId ] = useState('b480bf670482470a833e3e03a40ddf37')
    const [ token, setToken ] = useState('006b480bf670482470a833e3e03a40ddf37IADhfyBQA2WCbEg0nPMS4qp153qrS3cTAa5nKs1w49Kjxwx+f9gAAAAAEACJVdSDN/e1YgEAAQA297Vi')
    const [ channelName, setChannelName ] = useState('Test')
    const [ openMicrophone, setOpenMicrophone ] = useState(true)
    const [ enableSpeakerphone, setEnableSpeakerphone ] = useState(true)
    const [ joinSucceed, setJoinSucceed ] = useState(false)
    const [ peerIds, setPeerIds ] = useState([])
    const [ engine, setEngine ] = useState();


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
    const init = async () => {
       const rtc = await RtcEngine.create(appId).catch( err => console.log('enging err: ',err))
        setEngine(rtc)
        // Enable the audio module.
        await engine.enableAudio()
    
    
        // Listen for the UserJoined callback.
        // This callback occurs when the remote user successfully joins the channel.
        engine.addListener('UserJoined', (uid, elapsed) => {
            console.log('UserJoined', uid, elapsed)
            ToastAndroid.show(`user with ${uid} joined`,ToastAndroid.SHORT);
            if (peerIds.indexOf(uid) === -1) {
                setPeerIds( prevPeerIds => {
                    return [ ...prevPeerIds, uid];
                })
            }
        }).catch( err => console.log('UserJoined : ',err))

    // Listen for the UserOffline callback.
    // This callback occurs when the remote user leaves the channel or drops offline.
    engine.addListener('UserOffline', (uid, reason) => {
        console.log('UserOffline', uid, reason)
            // Remove peer ID from state array
            ToastAndroid.show(`user with ${uid} leaved`,ToastAndroid.SHORT);
            setPeerIds(peerIds.filter(id => id !== uid))
            // peerIds: peerIds.filter(id => id !== uid)
      }).catch( err => console.log('UserOffline : ',err))

     // Listen for the JoinChannelSuccess callback.
    // This callback occurs when the local user successfully joins the channel.
    engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
        console.log('JoinChannelSuccess', channel, uid, elapsed)
        setJoinSucceed(true)
    }).catch( err => console.log('JoinChannelSuccess : ',err))
    }

    if (Platform.OS === 'android') {
        // Request required permissions from Android
        requestCameraAndAudioPermission().then(() => {
            console.log('requested!')
        })
    }

 const  joinChannel = async () => {
       engine?.joinChannel(token, channelName, null, 0).then().catch( err => console.log('err ',err))
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
        setupCloudMessaging()
        init();
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log(
            'Notification :',
           JSON.stringify(remoteMessage),
          );
        });

        // Check whether an initial notification is available
     messaging().getInitialNotification(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification 1:',
          JSON.stringify(remoteMessage),
        );
        // setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
      }
      // setLoading(false);
    });   

    messaging().onMessage( remoteMessage => alert(`message : ${JSON.stringify(remoteMessage)}`))

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