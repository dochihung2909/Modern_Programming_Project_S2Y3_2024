import { View, Text, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React from 'react'
import Comment from './Comment'
import DropdownMenu from './DropdownMenu'
import LikeButton from './LikeButton'
import { Icon } from 'react-native-paper' 
import { endpoints } from '../../configs/APIs'
import PurePost from './PurePost'

const DetailPost = ({route, navigation}) => {
    const { post, onDelete, onHide, onEdit, styles } = route.params


  return (
        <View className={('bg-white rounded-lg shadow')}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
            <ScrollView>

            <PurePost navigation={navigation} post={post} alwaysShowComment />
            </ScrollView> 
            </KeyboardAvoidingView> 
        </View>
  )
}

export default DetailPost 