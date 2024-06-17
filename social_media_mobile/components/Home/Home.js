import { View, Text, Image, ScrollView, RefreshControl } from 'react-native'
import React, {useState, useContext, useEffect} from 'react' 
import Post from '../Post/Post'
import { MyUserContext } from '../../configs/Contexts';
import APIs, {endpoints, authApi} from '../../configs/APIs'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import InputPostNavigate from '../Post/InputPostNavigate';

export default function Home({navigation}) {
  const user = useContext(MyUserContext);   
  const isFocused = useIsFocused(); 
  const [posts, setPosts] = useState([]) 
  const [nextPost, setNextPost] = useState('')

  const loadPosts = async () => {
    const access_token = await AsyncStorage.getItem('token')
    let res = await authApi(access_token).get(endpoints['posts']);   
    let ps = res.data.results  
    setNextPost(res.data.next)
    setPosts(ps)   
    // while(res.data.next != null) {
    //   res = await authApi(access_token).get(res.data.next)  
    //   ps = [...ps, ...res.data.results]
    //   // setPosts(ps)   
    // }  
    // setPosts(ps)    
  }    

  useEffect(() => { 
    console.log(posts)
  }, [posts])

  useEffect(() => { 
    (isFocused && user != null) && loadPosts()  
  }, [isFocused])

  useEffect(() => {
    (user == null) && setPosts([])
  }, [user])

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
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

  const loadMorePost = async () => {
    const access_token = await AsyncStorage.getItem('token')
    let res = await authApi(access_token).get(nextPost);   
    let ps = res.data.results   
    setNextPost(res.data.next)
    setPosts([...posts, ...ps])   
  }

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  return (
    <ScrollView 
      onScroll={({nativeEvent}) => {
        if (isCloseToBottom(nativeEvent)) {
          console.log('End screent', nextPost)
          if (nextPost) { 
            loadMorePost();
          }
        }
      }} 
      className={'bg-white'} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
      <InputPostNavigate user={user} handleNavigateInputPost={handleNavigateInputPost}></InputPostNavigate> 
      {posts.slice(0).reverse().map(post => <Post refreshing={refreshing} navigation={navigation} key={post.id} post={post}></Post>)} 
    </ScrollView>
  )
}