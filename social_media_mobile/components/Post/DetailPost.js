import { View, Text, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React from 'react'
import Comment from './Comment'  
import LikeButton from './LikeButton'
import { Icon } from 'react-native-paper' 
import { endpoints } from '../../configs/APIs'
import PurePost from './PurePost'
import { useFocusEffect } from '@react-navigation/native'

const DetailPost = ({route, navigation}) => {
    const { post, onDelete, onHide, onEdit, styles, isCurrentLiked } = route.params
 

  return (
        <View className={('bg-white rounded-lg shadow')}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
              <ScrollView>

                <PurePost isDetail isCurrentLiked={isCurrentLiked} navigation={navigation} post={post} alwaysShowComment />
              </ScrollView> 
            </KeyboardAvoidingView> 
        </View>
  )
}

export default DetailPost 