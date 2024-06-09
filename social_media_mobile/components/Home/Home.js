import { View, Text, Image, ScrollView, RefreshControl } from 'react-native'
import React, {useState, useContext, useEffect} from 'react' 
import Post from '../Post/Post'
import { MyUserContext } from '../../configs/Contexts';
import APIs, {endpoints, authApi} from '../../configs/APIs'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const user = useContext(MyUserContext);   
  const [posts, setPosts] = useState([]) 
  const loadPosts = async () => {
    const posts = await authApi(user?.access_token).get(endpoints['posts']);   
    setPosts(posts.data)  
  }

  useEffect(() => { 
    loadPosts() 
    console.log(posts)
  }, [])

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {posts.map(post => <Post post={post}></Post>)} 
    </ScrollView>
  )
}