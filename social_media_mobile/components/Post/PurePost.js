import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import DropdownMenu from './DropdownMenu'
import LikeButton from './LikeButton';
import { Icon } from 'react-native-paper';
import Comment from './Comment';
import Separate from '../Separate/Separate';
import { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MyUserContext } from '../../configs/Contexts';

const PurePost = ({refreshing, post, alwaysShowComment = false, navigation}) => { 
    const [showComments, setShowComments] = useState(false);
    const [isCurrentLiked, setIsCurrentLiked] = useState(-1)
    const [loading, setLoading] = useState(true);
    
    const user = useContext(MyUserContext)
    

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const handleEditPost = async (postId) => {
        console.log(`Edit post with ID: ${postId}`);
      };
    
    const handleDeletePost = async (postId) => {
    console.log(`Delete post with ID: ${postId}`);
        const access_token = await AsyncStorage.getItem('token')
        let form = new FormData() 

        form.append('active', false)
        const res = await authApi(access_token).patch(endpoints['delete_post'](postId), form, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
        console.log(res.data)
        if (res.status == 200) {
            console.log('Delete success')
        }
    };

    // Check current user liked this post or not
    const checkIsCurrentLike = async() => { 
        const access_token = await AsyncStorage.getItem('token') 
        const res = await authApi(access_token).get(endpoints['post_likes'](post.id))
        let likes = res.data
        for (l of likes) {
            if (l.user.username == user.username) {
                setIsCurrentLiked(l.like_type) 
                break;
            } 
        } 
    }

    useEffect(() => {
        checkIsCurrentLike()
    }, [])  

    useEffect(() => {
        checkIsCurrentLike() 
        setLoading(refreshing) 
    }, [refreshing])
     
    
    const handleHidePost = (postId) => {
        console.log(`Hide post with ID: ${postId}`);
    };  

    const handleNavigateUser = (userId) => { 
        console.log(userId)
        if (user.id != userId) {
            navigation.navigate('User_Profile', {
                userId: userId
            })
        } else {
            navigation.navigate('Profile')
        } 
    } 
return (
    <>
        <View className={('bg-white p-4 rounded-lg shadow')}>
            <View className={'flex-row justify-between'}> 
                <TouchableOpacity  className={('flex-row items-center mb-4')} onPress={() => handleNavigateUser(post?.user.id)}>
                    <Image source={{ uri: post.user?.avatar }} className={('w-10 h-10 rounded-full mr-4')} />
                    <Text className={('font-bold text-lg')}>{`${post?.user.first_name} ${post.user.last_name}`}</Text> 
                </TouchableOpacity>
                {post?.user.id == user.id &&
                    <DropdownMenu
                        onEdit={() => handleEditPost(post?.id)}
                        onDelete={() => handleDeletePost(post?.id)}
                        onHide={() => handleHidePost(post?.id)}
                    ></DropdownMenu>
                }
                
            </View>
            <Text className={('text-base mb-4')}>{post?.content}</Text>
            {post?.image && (
                <Image source={{ uri: post?.image }} className={('w-full h-48 rounded-lg mb-4')} />
            )}
            <View className={('flex-row justify-around border-t border-gray-200 pt-2')}>
                <View className={('flex-row flex-1 justify-center items-center')}>     
                {(!loading) && 
                    <LikeButton postId={post.id} isCurrentLiked={isCurrentLiked} endpoint={endpoints['like_post'](post?.id)} imageStyle={styles.image} textStyle={styles.text} icon={true}></LikeButton>
                }
                </View>
                <TouchableOpacity onPress={toggleComments} className={('flex-1 flex-row justify-center items-center')}>
                    <Icon source='comment-outline' size={20} color="#000" /> 
                    <Text className={('ml-2 text-base')}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity className={('flex-1 flex-row justify-center items-center')}>
                    <Icon source='share-outline' size={20} color="#000" /> 
                    <Text className={('ml-2 text-base ')}>Share</Text>
                </TouchableOpacity>
            </View>
            {(showComments || alwaysShowComment) && <Comment navigation={navigation} postId={post?.id} />}
        </View>
        <Separate />
    </>
    ) 
  
}


const styles = StyleSheet.create({ 
    text: {                           // global variable $textColor
      fontSize: 16,
    //   borderWidth: 2,
    //   borderColor: 'blue',                    // relative REM unit
    }, 
    image: {
        width: 50
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
        flexDirection: "column",
      },
  });
 

export default PurePost

