import axios from 'axios';
import NetInfo from "@react-native-community/netinfo";
import { ToastAndroid } from 'react-native';

const BASE_URL = 'http://192.168.0.121:3000/services/';



export const postService = ( endPoint, body, successCallback,failureCallBack ) => {
    console.log('here;.....');
        axios.post( BASE_URL + endPoint, body)
             .then( response => successCallback(response.data))
             .catch( error =>  failureCallBack(error));
}



