import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, {useContext, useState, useEffect, useCallback} from 'react'
import { Button, TextInput } from 'react-native-paper'
import { MyDispatchContext, MyUserContext } from '../../configs/Contexts';
import InputPost from '../Post/InputPost';
import APIs, { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Separate from '../Separate/Separate';
import { useIsFocused } from '@react-navigation/native'; 
import Post from '../Post/Post';
import InputPostNavigate from '../Post/InputPostNavigate';


export default function Profile({id, navigation}) {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);  

  const isFocused = useIsFocused(); 
  const [posts, setPosts] = useState([]) 

  const loadPosts = async () => {
    const access_token = await AsyncStorage.getItem('token')
    const posts = await authApi(access_token).get(endpoints['current_user_posts']);   
    setPosts(posts.data)  
    console.log(posts.data)
  }

  useEffect(() => { 
    (isFocused && user != null) && loadPosts()  
  }, [isFocused])

  useEffect(() => {
    (user == null) && setPosts([]) 
  }, [user])

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  
 
  const handleAddFriend = async () => {
    // Post request to add friend
  }

  const handleMessage = async () => {

    // Post to create room if no room between current_user and other
    // 
  } 

  const handleInputPostNavigate = () => {
    navigation.navigate('InputPost', {
        handleLoadPost: loadPosts,
        user: user
    })
  }

  

  return (
    <>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} className="bg-white">
          <View className="flex items-center mt-4">
            <Image
              source={{ uri: user?.avatar || 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' }}
              className="w-40 h-40 rounded-full border-4 border-white"
            />
            <Text className="mt-4 text-xl font-bold">{`${user?.first_name} ${user?.last_name}`}</Text>
            <Text className="mt-2 text-sm font-semibold">{`${user?.username}`}</Text>
            {/* <Text className="mt-2 text-l">{`${user?.role}`}</Text> */}
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
 
          <InputPostNavigate user={user} handleNavigateInputPost={handleInputPostNavigate}></InputPostNavigate>
 

          <View>
            {posts.slice(0).reverse().map(post => (<Post navigation={navigation} key={post.id} post={post}></Post>))}
          </View>
          

          <Separate /> 

          <View>
            <Button icon="logout" onPress={() => {
              dispatch({"type": "logout"})
              navigation.navigate('Login')
            }}>Đăng xuất</Button>
          </View>
      </ScrollView> 
    </>
    
  )
}