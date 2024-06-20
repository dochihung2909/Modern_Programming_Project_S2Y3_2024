import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import APIs, { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../configs/Contexts';
import { useFocusEffect, useIsFocused } from '@react-navigation/native'; 
import { formatDate } from '../../dao';
import LoadingScreen from '../LoadingScreen';

export default function Notification({navigation}) {
  const { user } = useAuth()
  const [notis, setNotis] = useState([])
  const isFocused = useIsFocused(); 
  const [loading, setLoading] = useState(false)

  useEffect(() => { 
    (isFocused && user != null) && loadNotifis()  
  }, [isFocused])

  const loadNotifis = async () => {
    const access_token = await AsyncStorage.getItem('token') 
    setLoading(true)
    try {
      console.log('loading notification')
        const res = await authApi(access_token).get(endpoints['get_notifications']) 
        setNotis(res.data) 
    } catch(err) {
      console.error(err)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  } 
  
  useEffect(() => {
    loadNotifis()
  }, [])

  const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      loadNotifis()
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }, []); 

    useFocusEffect(
      React.useCallback(() => {
        loadNotifis();
      }, [])
    );

  return (
    <>
      {loading ? <LoadingScreen /> : 
        <ScrollView className={('p-4')} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {notis.map((notification) => (
          <TouchableOpacity onPress={() => navigation.navigate('DetailNotification', {'notification': notification})} key={notification.id} className={('p-4 bg-white rounded-lg shadow-md my-2')}>
            <Text className={('text-lg font-bold text-black mb-2')}>{notification.title}</Text>
            <Text>{formatDate(notification.created_date)}</Text> 
          </TouchableOpacity>
        ))}
      </ScrollView>
      }
    </>
    
  )
}