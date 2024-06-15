import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useContext
} from 'react';
import { TouchableOpacity, Text, FlatList, View, RefreshControl, ScrollView } from 'react-native'; 
import { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { MyUserContext } from '../../configs/Contexts';
 

const Chat = ({navigation}) => {     
  const [rooms, setRooms] = useState([]) 
  const user = useContext(MyUserContext)
  
  const isFocused = useIsFocused();  
  

  const loadRooms = async () => {
    const access_token = await AsyncStorage.getItem('token')
    const res = await authApi(access_token).get(endpoints['room_id'](1));   
    console.log()
    setRooms(() => {
      if (res.data.length) {
        return res.data
      } else {
        return [res.data]
      }
    })  
  }

  useEffect(() => { 
    (isFocused && user != null) && loadRooms() 
    console.log(rooms) 
  }, [isFocused])

  useEffect(() => {
    (user == null) && setRooms([])
    console.log(rooms) 
  }, [user])
 

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []); 

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {rooms.map(room => (
        <TouchableOpacity key={room.id} onPress={() => navigation.navigate('Room', {id: room.id})} className={('bg-blue-500 w-[100%] my-2 items-center p-2 rounded-lg')}>
          <Text className={('text-white text-lg')}>{room.title}</Text>
          <Text className={('text-white text-sm')}>{room.room_type}</Text>
        </TouchableOpacity>
      ))} 
    </ScrollView>
  )
}

export default Chat