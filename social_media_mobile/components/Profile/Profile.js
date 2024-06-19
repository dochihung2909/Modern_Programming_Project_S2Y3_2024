import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native'
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
import { formatUrl } from '../../dao';


export default function Profile({route, navigation}) {  
 
  const { user, logout, update } = useAuth(); 
  console.log(user)
  let userId = user.id

  if (route.params?.userId) {
    userId = route.params?.userId
  } 
  console.log(userId) 

  // Get user data and dispatch whe logout 
  const [userInfo, setUserInfo] = useState(user)

  
  const [likedList, setLikedList] = useState([])

  // check mounted in screen
  const isFocused = useIsFocused(); 

  // Posts
  const [posts, setPosts] = useState([]) 
  const [nextPost, setNextPost] = useState('')

  // Load post by user id 
  const loadPosts = async () => {
    const access_token = await AsyncStorage.getItem('token')
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
    console.log(likedRes.data) 
    setLikedList(likedRes.data)
  }

  
  const checkLiked = (postId) => {
    let like_type = -1
    likedList.find(liked => {
      if (liked.id == postId) { 
        console.log(liked.id, postId)
        like_type = liked.like_type.id  
      }
    })
    return like_type
  } 

  // Load user info when click to another user
  const loadUserInfo = async () => { 
    if (userId != user.id) {
      const access_token = await AsyncStorage.getItem('token') 
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
    } 
  }

  const reloadUserInfo = async () => {  
    if (userId == user.id) {
      const access_token = await AsyncStorage.getItem('token')
      let res = await authApi(access_token).get(endpoints['current_user']);
      console.log(res.data)
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
    setTimeout(() => {
      setRefreshing(false);  
    }, 2000);
  }, []);

  // Custom header title
  useLayoutEffect(() => {
      navigation.setOptions({
          title: userInfo.username,
      });
  }, [navigation, userInfo]);
  
 
  const handleAddFriend = async () => {
    // Post request to add friend
  }

  const handleMessage = async (userId) => {
    const access_token = await AsyncStorage.getItem('token')
    console.log(userId) 
    let form = new FormData()
    // Add target user to chat
    form.append('target_user_id', userId)
    console.info(form)
    const res = await authApi(access_token).post(endpoints['chat_with_target_user'], form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    console.log(res.data)
    let roomInfo = res.data 
    if (res.status == '201') {
      const roomRes = await authApi(access_token).post(endpoints['chat_with_target_user'], form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
      })
      roomInfo = roomRes.data 
    }  
    console.log(roomInfo)
    
    let targetUser = roomInfo.users.find(u => u.id != user.id)
    console.log(targetUser)
    navigation.navigate('Room', { 
      targetUser: targetUser,
      id: roomInfo.room.id
    })
    // try {
    //   let roomForm = new FormData() 
    //   roomForm.append('title', userFullName)
    //   const roomRes = await authApi(access_token).post(endpoints['create_room'], roomForm, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   })
    //   if (roomRes.status == 201) {
    //     console.log('Add room success')
    //     // Add sender User
    //     let currentUser = new FormData()
    //     currentUser.append('user_id', user.id)
    //     const currentUserRes = await authApi(access_token).post(endpoints['add_user_to_room_by_id'](roomRes.data.id), currentUser, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data'
    //       }
    //     })
        
    //     console.log(currentUserRes.data.message)

    //     if (currentUserRes.status == 200) {
    //        // Add target User
    //       console.log('Add sender success')
    //       let targetUserForm = new FormData()
    //       targetUserForm.append('user_id', userInfo.id)
    //       const targetUserRes = await authApi(access_token).post(endpoints['add_user_to_room_by_id'](roomRes.data.id), targetUserForm, {
    //         headers: {
    //           'Content-Type': 'multipart/form-data'
    //         }
    //       })
    //       console.log(targetUserRes.data.message)

    //       if (targetUserRes.status == 200) {  
    //         console.log('Add target success')
    //         navigation.navigate('Room', {
    //           targetUser: userInfo,
    //           id: roomRes.data.id
    //         })
    //       } 
    //     } 
    //   }

    // } catch (err) {
    //   console.info(err)
    // }
    



    // Post to create room if no room between current_user and other
    // 
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

  

  return (
    <>
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
              source={{ uri: userInfo?.avatar }}
              className="w-40 h-40 rounded-full border-4 border-white"
            />
            <Text className="mt-4 text-xl font-bold">{`${userInfo?.first_name} ${userInfo?.last_name}`}</Text>
            <Text className="mt-2 text-sm font-semibold">{`${userInfo?.username}`}</Text>
            {/* <Text className="mt-2 text-l">{`${user?.role}`}</Text> */}
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
              <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} className={('my-2 bg-blue-500  w-[80%] items-center p-2 rounded-lg')}>
                <Text className={('text-white')}>Chỉnh sửa thông tin cá nhân</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('EditPassword')} className={('my-2 bg-blue-500  w-[80%] items-center p-2 rounded-lg')}>
                <Text className={('text-white')}>Sửa mật khẩu</Text>
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
    </>
    
  )
}