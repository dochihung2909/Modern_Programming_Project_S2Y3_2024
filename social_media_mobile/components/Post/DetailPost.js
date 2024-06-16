import { View, Text, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React from 'react'
import Comment from './Comment'
import DropdownMenu from './DropdownMenu'
import LikeButton from './LikeButton'
import { Icon } from 'react-native-paper' 

const DetailPost = ({route}) => {
    const { post, onDelete, onHide, onEdit, styles } = route.params


  return (
        <View className={('bg-white p-4 rounded-lg shadow')}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
            <ScrollView>

            <View className={'flex-row justify-between'}> 
                <View className={('flex-row items-center mb-4')}>
                    <Image source={{ uri: post.image }} className={('w-10 h-10 rounded-full mr-4')} />
                    <Text className={('font-bold text-lg')}>{post.user}</Text>
                </View>
                <DropdownMenu
                    onEdit={() => onEdit(post.id)}
                    onDelete={() => onDelete(post.id)}
                    onHide={() => onHide(post.id)}
                ></DropdownMenu>
            </View>
            <Text className={('text-base mb-4')}>{post.content}</Text>
            {post.image && (
                <Image source={{ uri: post.image }} className={('w-full h-48 rounded-lg mb-4')} />
            )}
            <View className={('flex-row justify-around border-t border-gray-200 pt-2')}>
                <View className={('flex-row flex-1 justify-center items-center')}>      
                    <LikeButton imageStyle={styles.image} textStyle={styles.text} icon={true}></LikeButton>
                </View>
                <TouchableOpacity className={('flex-1 flex-row justify-center items-center')}>
                    <Icon source='comment-outline' size={20} color="#000" /> 
                    <Text className={('ml-2 text-base')}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity className={('flex-1 flex-row justify-center items-center')}>
                    <Icon source='share-outline' size={20} color="#000" /> 
                    <Text className={('ml-2 text-base ')}>Share</Text>
                </TouchableOpacity>
            </View>
            <Comment postId={post.id} />
            </ScrollView> 
            </KeyboardAvoidingView> 
        </View>
  )
}

export default DetailPost 