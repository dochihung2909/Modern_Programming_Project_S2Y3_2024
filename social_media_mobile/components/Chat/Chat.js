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
import { MyUserContext, useAuth } from '../../configs/Contexts';
 

const Chat = ({navigation}) => {     
  const [rooms, setRooms] = useState([]) 
  const { user} = useAuth()
  
  const isFocused = useIsFocused();  
  

  const loadRooms = async () => {
    const access_token = await AsyncStorage.getItem('token')
    const res = await authApi(access_token).get(endpoints['user_rooms']);    
    setRooms(res.data)  
  }

  useEffect(() => {
    console.log(rooms)
  }, [rooms])

  useEffect(() => { 
    (isFocused && user != null) && loadRooms() 
  }, [isFocused])

  useEffect(() => {
    (user == null) && setRooms([])
  }, [user])
 

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadRooms()
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []); 

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}> 
      {rooms.length > 0 ? rooms?.map(room => (
        <TouchableOpacity key={room?.room.id} onPress={() => navigation.navigate('Room', {id: room?.room.id})} className={('bg-blue-500 w-[100%] my-2 items-center p-2 rounded-lg')}>
          <Text className={('text-white text-lg')}>{room?.room.title}</Text>
          <Text className={('text-white text-sm')}>{room?.room.room_type}</Text>
        </TouchableOpacity>
      ))
      : 
      <View className={'flex items-center mt-6 justify-center'}>
        <Text className={'text-lg text-blue-500'}>Không có phòng chat nào cả</Text> 
        {/* <TouchableOpacity>
          <Text className={''}>Tìm kiếm người trò chuyện</Text>
        </TouchableOpacity> */}
      </View>
    } 
    </ScrollView>
  )
}

export default Chat