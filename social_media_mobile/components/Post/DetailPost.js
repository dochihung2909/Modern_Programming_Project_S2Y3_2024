import { View, Text, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import Comment from './Comment'  
import LikeButton from './LikeButton'
import { Icon } from 'react-native-paper' 
import { authApi, endpoints } from '../../configs/APIs'
import PurePost from './PurePost'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const DetailPost = ({route, navigation}) => {
    const { post, onDelete, onHide, onEdit, styles, isCurrentLiked } = route.params

    const [newPost, setNewPost] = useState(post)
    const [refreshing, setRefreshing] = React.useState(false);

    const handleLoadPost = async () => {
      const access_token = await AsyncStorage.getItem('token')
      const res = await authApi(access_token).get(endpoints['post_by_id'](post.id))
      setNewPost(res.data) 
    }

    useEffect(() => {
      handleLoadPost()
    }, [])

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      handleLoadPost() 
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }, []);

  return (
        <View className={('bg-white rounded-lg shadow')}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
              <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}> 
                <PurePost isDetail isCurrentLiked={isCurrentLiked} navigation={navigation} post={newPost} alwaysShowComment />
              </ScrollView> 
            </KeyboardAvoidingView> 
        </View>
  )
}

export default DetailPost 