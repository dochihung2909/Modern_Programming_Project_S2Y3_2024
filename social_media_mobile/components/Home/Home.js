import { View, Text, Image, ScrollView, RefreshControl } from 'react-native'
import React, {useState, useContext, useEffect} from 'react' 
import Post from '../Post/Post'
import { MyUserContext } from '../../configs/Contexts';
import APIs, {endpoints, authApi} from '../../configs/APIs'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

export default function Home() {
  const user = useContext(MyUserContext);   
  const isFocused = useIsFocused(); 
  const [posts, setPosts] = useState([]) 
  const loadPosts = async () => {
    const access_token = await AsyncStorage.getItem('token')
    const posts = await authApi(access_token).get(endpoints['posts']);   
    setPosts(posts.data)  
  }

  console.log(user)

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

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {posts.map(post => <Post key={post.id} post={post}></Post>)} 
    </ScrollView>
  )
}