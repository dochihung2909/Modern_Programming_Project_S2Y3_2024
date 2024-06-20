import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl, Linking, Dimensions } from 'react-native'
import React, {useContext, useState, useEffect, useCallback, useLayoutEffect} from 'react'
import { Button, TextInput } from 'react-native-paper'
import { MyDispatchContext, MyUserContext, useAuth } from '../../configs/Contexts';
import InputPost from '../Post/InputPost';
import APIs, { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Separate from '../Separate/Separate';
import { useFocusEffect, useIsFocused } from '@react-navigation/native'; 
import Post from '../Post/Post';
import InputPostNavigate from '../Post/InputPostNavigate';
import { adjustImageTo16x9, formatUrl } from '../../dao';
import Setting from './Setting';
import LoadingScreen from '../LoadingScreen';


export default function Profile({route, navigation}) {  
 
  const { user, logout, update } = useAuth(); 
  // console.log(user)
  // console.log(user)
  let userId = user.id

  if (route.params?.userId) {
    userId = route.params?.userId
  }  

  // Get user data and dispatch whe logout 
  const [userInfo, setUserInfo] = useState(user) 
  
  const [likedList, setLikedList] = useState([])

  // check mounted in screen
  const isFocused = useIsFocused(); 

  // Posts
  const [posts, setPosts] = useState([]) 
  const [nextPost, setNextPost] = useState('')
  const [loading, setLoading] = useState(false)

  // Load post by user id 
  const loadPosts = async () => {
    const access_token = await AsyncStorage.getItem('token')
    setLoading(true)
    try {
      if (userId !== user.id) {
        let res = await authApi(access_token).get(endpoints['posts']);     
        let ps = res.data.results 
        setNextPost(res.data.next)
        ps = ps.filter(p => p.user.id == userId)    
        setPosts(ps) 
      } else {
        const posts = await authApi(access_token).get(endpoints['current_user_posts']);    
        setPosts(posts.data)   
      } 
      
      let likedRes = await authApi(access_token).get(endpoints['posts_user_liked_by_id'](user.id))
      // console.log(likedRes.data) 
      setLikedList(likedRes.data) 
    } catch (err) {
      console.error(err)
      setLoading(false)
    } finally{
      setLoading(false)
    }
  }

  const role_types = ['Quản trị viên', 'Cựu sinh viên', 'Giảng viên']

  
  const checkLiked = (postId) => {
    let like_type = -1
    likedList.find(liked => {
      if (liked.id == postId) { 
        // console.log(liked.id, postId)
        like_type = liked.like_type.id  
      }
    })
    return like_type
  } 

  // Load user info when click to another user
  const loadUserInfo = async () => { 
    if (userId != user.id) {
      const access_token = await AsyncStorage.getItem('token') 
      setLoading(true)
      try {
        let res = await authApi(access_token).get(endpoints['users_id'](userId));
        let userData = res.data 
        userData.avatar = formatUrl(userData.avatar)
        userData = {
          id: userId,
          ...userData
        }
        if (res.status == 200) {
          console.log('get user success')
        }      
        setUserInfo(userData)  
      } catch(err) {
        console.error(err)
        setLoading(false)
      } finally {
        setLoading(false)
      }
    } 
  }

  const reloadUserInfo = async () => {  
    if (userId == user.id) {
      const access_token = await AsyncStorage.getItem('token')
      let res = await authApi(access_token).get(endpoints['current_user']);
      // console.log(res.data)
      update(res.data)
      setUserInfo(res.data)
    } 
  }

  // Load userinfo and loadpost when user click to another user or click to profile tab
  useEffect(() => { 
    if (isFocused && user != null) { 
      loadUserInfo()
      // console.log(userInfo)
      setTimeout(() => {
        loadPosts() 
      }, 100)
    }
  }, [isFocused])  

  // If user logout set null
  useEffect(() => {
    (user == null) && setPosts([]) 
  }, [user])

  // Refreshing when scroll up
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true); 
    loadPosts()
    loadUserInfo()
    setTimeout(() => {
      setRefreshing(false);  
    }, 2000);
  }, []);

  // Custom header title
  useLayoutEffect(() => {
      navigation.setOptions({
          title: `${userInfo.first_name} ${userInfo.last_name}`,
      });
  }, [navigation, userInfo]);
  
 
  const handleAddFriend = async () => {
    // Post request to add friend
  }

  const handleMessage = async (userId) => {
    const access_token = await AsyncStorage.getItem('token')
    // console.log(userId) 
    let form = new FormData()
    // Add target user to chat
    form.append('target_user_id', userId)
    console.info(form)
    const res = await authApi(access_token).post(endpoints['chat_with_target_user'], form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    // console.log(res.data)
    let roomInfo = res.data 
    if (res.status == '201') {
      const roomRes = await authApi(access_token).post(endpoints['chat_with_target_user'], form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
      })
      roomInfo = roomRes.data 
    }  
    // console.log(roomInfo)
    
    let targetUser = roomInfo.users.find(u => u.id != user.id)
    // console.log(targetUser)
    navigation.navigate('Room', { 
      targetUser: targetUser,
      id: roomInfo.room.id
    })  
  } 

  const handleInputPostNavigate = () => {
    navigation.navigate('InputPost', {
        handleLoadPost: loadPosts,
        user: user
    })
  } 

  useFocusEffect(
    React.useCallback(() => {
      loadPosts();
      reloadUserInfo()
    }, [])
  );

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const loadMorePost = async () => {
    const access_token = await AsyncStorage.getItem('token')
    if (userId !== user.id) {
      let res = await authApi(access_token).get(nextPost);     
      let ps = res.data.results 
      setNextPost(res.data.next)
      ps = ps.filter(p => p.user.id == userId)   
      setPosts([...posts, ...ps])  
    }   
  }

  const handlePress = () => {
    Linking.openURL(`mailto:${userInfo.email}`);
  };

  
  const imageSize = adjustImageTo16x9(Dimensions.get('window').width)
  

  return (
    <>
      {loading ? <LoadingScreen></LoadingScreen> :
      <ScrollView 
        onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            console.log('End screent')
            if (nextPost) { 
              loadMorePost();
            }
          }
        }} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} className="bg-white">
          <View className="flex items-center mt-4">
            <Image
              source={{ uri: userInfo?.cover_photo || 'https://blackscreen.space/images/pro/black-screen_39.png' }}
              style={{
                width: imageSize.width,
                height: imageSize.height
              }}
            />
            <Image
              source={{ uri: userInfo?.avatar }}
              className="w-20 h-20 rounded-full border-4 border-white"
            />
            <Text className="mt-4 text-xl font-bold">{`${userInfo?.first_name} ${userInfo?.last_name}`}</Text>
            <Text className="mt-2 text-sm font-semibold">{role_types[userInfo.role]}</Text> 
          </View>

          

          <View className={('flex-row justify-center gap-2 mt-2 mb-4')}>
            {userId != user.id ? 
            <>
              <TouchableOpacity onPress={handleAddFriend} className={('bg-blue-500 w-[40%] items-center p-2 rounded-lg')}>
                <Text className={('text-white')}>{`Thêm bạn bè`}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMessage(userId)} className={('bg-green-500  w-[40%] items-center p-2 rounded-lg')}>
                <Text className={('text-white')}>Nhắn tin</Text>
              </TouchableOpacity>
            </> 
            :
            <View className={'flex items-center w-full'}>
              <TouchableOpacity className={('my-2 bg-blue-500  w-[80%] items-center p-2 rounded-lg')} onPress={() => navigation.navigate('Setting')}> 
                <Text className='text-base text-white'>Cài đặt</Text>
              </TouchableOpacity> 
              <View className={'my-2 w-[80%] '}>
                <Button mode="contained" className={'text-white bg-blue-700 font-medium rounded-lg text-sm px-5 me-2 mb-2'} icon="logout" onPress={() => {
                  logout()
                  // navigation.navigate('Login')
                }}>Đăng xuất</Button>
              </View>
            </View>
            
            }
          </View>

          <Separate />    
          
          <View className="bg-white p-4 my-2"> 
            <Text className="mb-2 text-lg font-semibold">Thông tin liên hệ</Text>
            <Text>
              Email: <Text onPress={handlePress} className="text-blue-500 underline">{userInfo?.email}</Text>  
            </Text>
          </View>  
 
          {
            userId == user.id && <InputPostNavigate user={user} handleNavigateInputPost={handleInputPostNavigate}></InputPostNavigate> 
          }

         
          <View>
            {posts.map(post => (<Post loadPosts={loadPosts} isCurrentLiked={checkLiked(post.id)} refreshing={refreshing} navigation={navigation} key={post.id} post={post}></Post>))}
          </View>  
      </ScrollView> 
      }
    </>
    
  )
}