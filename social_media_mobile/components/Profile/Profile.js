import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, {useContext, useState, useEffect, useCallback} from 'react'
import { Button } from 'react-native-paper'
import { MyDispatchContext, MyUserContext } from '../../configs/Contexts';
import InputPost from '../Post/InputPost';
import APIs, { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Separate from '../Separate/Separate';
import { useIsFocused } from '@react-navigation/native';


export default function Profile({id}) {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext); 
  const [uInfo, setUInfo] = useState({})

  const isFocused = useIsFocused(); 
  const [posts, setPosts] = useState([]) 
  const loadPosts = async () => {
    const posts = await authApi(user?.access_token).get(endpoints['posts']);   
    setPosts(posts.data)  
  }

  useEffect(() => { 
    (isFocused && user != null) && loadPosts() 
    console.log(posts) 
  }, [isFocused])

  useEffect(() => {
    (user == null) && setPosts([])
    console.log(posts) 
  }, [user])

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
 
  const getUserInfo = async () => {
    const accessToken = await AsyncStorage.getItem("token");  
    if (id) {
      const res = await authApi(accessToken).get(endpoints['users_id'](id)) 
      setUInfo(res.data)  
    } else {
      setUInfo(user)
    } 
  }

  useEffect(() => {
    getUserInfo()  
  }, [])

  const handleAddFriend = async () => {
    // Post request to add friend
  }

  const handleMessage = async () => {

    // Post to create room if no room between current_user and other
    // 
  }

  

  return (
    <>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} className="bg-white">
          <View className="flex items-center mt-4">
            <Image
              source={{ uri: uInfo?.avatar || 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' }}
              className="w-40 h-40 rounded-full border-4 border-white"
            />
            <Text className="mt-4 text-xl font-bold">{`${uInfo?.first_name} ${uInfo?.last_name}`}</Text>
            <Text className="mt-2 text-sm font-semibold">{`${uInfo?.username}`}</Text>
            <Text className="mt-2 text-l">{`${uInfo?.role}`}</Text>
          </View>

          <View className={('flex-row justify-center gap-2 mt-2')}>
            {id ? 
            <>
              <TouchableOpacity onPress={handleAddFriend} className={('bg-blue-500 w-[40%] items-center p-2 rounded-lg')}>
                <Text className={('text-white')}>{`Thêm bạn bè`}</Text>
              </TouchableOpacity>
              <TouchableOpacity className={('bg-green-500  w-[40%] items-center p-2 rounded-lg')}>
                <Text className={('text-white')}>Nhắn tin</Text>
              </TouchableOpacity>
            </> 
            :
            <TouchableOpacity className={('bg-blue-500  w-[80%] items-center p-2 rounded-lg')}>
              <Text className={('text-white')}>Chỉnh sửa thông tin cá nhân</Text>
            </TouchableOpacity>
            }
          </View>
          
          <View className="bg-white p-4 mt-4">
            <Text className="text-lg font-semibold">About</Text>
            <Text className="mt-2">{user?.bio}</Text>
            <Text className="mt-4 text-lg font-semibold">Contact Information</Text>
            <Text className="mt-2">Email: {user?.email}</Text>
            <Text className="mt-2">Phone: {user?.phone}</Text>
          </View> 

          <Separate />
          
          <View>
            <InputPost></InputPost>
          </View> 

          <Separate />

          

          <View>
            <Button icon="logout" onPress={() => dispatch({"type": "logout"})}>Đăng xuất</Button>
          </View>
      </ScrollView> 
    </>
    
  )
}