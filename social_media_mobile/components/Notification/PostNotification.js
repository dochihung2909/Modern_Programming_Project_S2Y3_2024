import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { WebView } from 'react-native-webview';
import APIs from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function PostNotification() {  

  return (
    <WebView source={{ uri: 'https://hungts.pythonanywhere.com/admin/notification/' }} style={{ flex: 1 }} /> 
  )
}