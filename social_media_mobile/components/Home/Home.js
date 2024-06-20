import { View, Text, Image, ScrollView, RefreshControl } from 'react-native'
import React, {useState, useContext, useEffect} from 'react' 
import Post from '../Post/Post'
import { MyUserContext, useAuth } from '../../configs/Contexts';
import APIs, {endpoints, authApi} from '../../configs/APIs'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import InputPostNavigate from '../Post/InputPostNavigate';
import LoadingScreen from '../LoadingScreen';

export default function Home({navigation}) {
  const { user} = useAuth();   
  const isFocused = useIsFocused(); 
  const [posts, setPosts] = useState([]) 
  const [loading, setLoading] = useState(false)
  const [loadScreen, setLoadScreen] = useState(false)
  const [nextPost, setNextPost] = useState('')
  const [likedList, setLikedList] = useState([])

  const loadPosts = async () => {
    const access_token = await AsyncStorage.getItem('token')
    setLoadScreen(true)
    try {
      let res = await authApi(access_token).get(endpoints['posts']);   
      let ps = res.data.results  
      setNextPost(res.data.next)
      setPosts(ps)    
  
      let likedRes = await authApi(access_token).get(endpoints['posts_user_liked_by_id'](user.id))
      // console.log(likedRes.data) 
      setLikedList(likedRes.data)
    } catch (err) {
      console.error(err)
      setLoadScreen(false) 
    } finally {
      setLoadScreen(false)
    }
    
  }     

  const checkLiked = (postId) => {
    let like_type = -1
    likedList.find(liked => {
      if (liked.id == postId) { 
        like_type = liked.like_type.id  
      }
    })
    return like_type
  } 

  useEffect(() => { 
    (isFocused && user != null) && loadPosts()  
  }, [isFocused])

  useEffect(() => {
    (user == null) && setPosts([])
  }, [user])

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadPosts() 
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleNavigateInputPost = () => {
      navigation.navigate('InputPost', {
        handleLoadPost: loadPosts,
        user: user
    }) 
  }

  useFocusEffect(
    React.useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadMorePost = async () => {
    const access_token = await AsyncStorage.getItem('token')
    try {
      let res = await authApi(access_token).get(nextPost);   
      let ps = res.data.results   
      setNextPost(res.data.next)
      setPosts([...posts, ...ps])   
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    } 
    
  }

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  return (
    <>
      {loadScreen ? <LoadingScreen></LoadingScreen> : 
        <ScrollView 
          onScroll={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
              console.log('End screent', nextPost)
              if (nextPost && !loading) { 
                setLoading(true) 
                loadMorePost();
              }
            }
          }} 
          className={'bg-white'} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          
          <InputPostNavigate user={user} handleNavigateInputPost={handleNavigateInputPost}></InputPostNavigate> 
          {posts.map(post => <Post loadPosts={loadPosts} isCurrentLiked={checkLiked(post.id)} refreshing={refreshing} navigation={navigation} key={post.id} post={post}></Post>)} 
        </ScrollView>
      }
    </>
    
  )
}