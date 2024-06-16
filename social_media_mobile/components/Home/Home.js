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

  const loadPosts = async () => {
    const access_token = await AsyncStorage.getItem('token')
    let res = await authApi(access_token).get(endpoints['posts']);   
    let ps = res.data.results   
    while(res.data.next != null) {
      res = await authApi(access_token).get(res.data.next)  
      ps = [...ps, ...res.data.results]
    }  
    setPosts(ps)   

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

  return (
    <ScrollView className={'bg-white'} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      
      <InputPostNavigate user={user} handleNavigateInputPost={handleNavigateInputPost}></InputPostNavigate>

      {posts.slice(0).reverse().map(post => <Post navigation={navigation} key={post.id} post={post}></Post>)} 
    </ScrollView>
  )
}