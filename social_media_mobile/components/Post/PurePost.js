import { View, Text, Image, StyleSheet, TouchableOpacity, useWindowDimensions, Dimensions, Alert } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import DropdownMenu from './DropdownMenu'
import LikeButton from './LikeButton';
import { Icon } from 'react-native-paper';
import Comment from './Comment';
import Separate from '../Separate/Separate';
import { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MyUserContext, useAuth } from '../../configs/Contexts';
import RenderHtml from 'react-native-render-html';
import {calculateNewImageHeight, resizeImage} from '../../dao/index'
import AlertModal from '../Modal/AlertModal';

const PurePost = ({isDetail, isCurrentLiked, loadPosts, post, alwaysShowComment = false, navigation}) => { 
    // console.log(isCurrentLiked, post.id) 
    const [showComments, setShowComments] = useState(false); 
    const [containerWidth, setContainerWidth] = useState(0); 
    const [imageHeight, setImageHeight] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false); 
    const [isDelete, setIsDelete] = useState(false); 
    const { user } = useAuth()
    
    const { width } = useWindowDimensions();

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    // Edit post
    const handleEditPost = async (postId) => {
        navigation.navigate('InputPost', {
            post: post,
            user: user
        })
    };
    
    //   Delete post
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
            loadPosts()
        }
    }; 

    const onContainerLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(Math.round(width));  

        if (width > 0) {
            Image.getSize(post.image, (imgWidth, imgHeight) => { 
                setImageHeight(calculateNewImageHeight(imgWidth, imgHeight, width));
            });
        }
    };   
     
    
    const handleBlockComment = async (post) => {
        console.log(post.block_comment)
        const access_token = await AsyncStorage.getItem('token')
        if (!post.block_comment) {
            let form = new FormData() 

            form.append('block_comment', true)
            const res = await authApi(access_token).patch(endpoints['post_by_id'](post.id), form, {
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            })
            console.log(res.data)
            if (res.status == 200) {
                console.log('Blocked success')   
                loadPosts()
            }
        } else {
            let form = new FormData() 

            form.append('block_comment', false)
            const res = await authApi(access_token).patch(endpoints['post_by_id'](post.id), form, {
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            })
            console.log(res.data)
            if (res.status == 200) {
                console.log('Blocked success')   
                loadPosts()
            }
        }
        
        

    };  

    const handleNavigateUser = (userId) => { 
        // console.log(userId)
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
            <View onLayout={onContainerLayout}  className={'flex-row justify-between'}> 
                <TouchableOpacity  className={('flex-row items-center mb-4')} onPress={() => handleNavigateUser(post?.user.id)}>
                    <Image source={{ uri: post.user?.avatar }} className={('w-10 h-10 rounded-full mr-4')} />
                    <Text className={('font-bold text-lg')}>{`${post?.user.first_name} ${post.user.last_name}`}</Text> 
                </TouchableOpacity>
                {post?.user.id == user.id &&
                    <DropdownMenu
                        isCloseCmt={post.block_comment}
                        isOwner={post?.user.id == user.id}
                        onEdit={() => handleEditPost(post?.id)}
                        onDelete={() => {
                            setIsModalVisible(true)
                            setIsDelete(true)
                        }}
                        onHide={() => setIsModalVisible(true)}
                    ></DropdownMenu>
                }
                
            </View>
                {/* <Text className={('text-base flex flex-wrap w-screen mb-4')}> 
                    <RenderHtml 
                        contentWidth={width}
                        source={{ html: post?.content }}
                    />
                </Text> */}
            <View className={'flex flex-wrap mb-4'}>
                <RenderHtml 
                    contentWidth={width}
                    source={{ html: post?.content }}
                />
            </View>
                
            {post.image && (
                <Image source={{ uri: post.image }} className={('rounded-lg mb-4')} style={
                    {
                        width: '100%',
                        height: isDetail ? imageHeight : Math.min(imageHeight, Math.round(Dimensions.get('window').height / 2))
                    }
                }/>
            )}
            <View className={('flex-row justify-around border-t border-gray-200 pt-2')}>
                <View className={('flex-row flex-1 justify-center items-center')}>    
                <LikeButton isCurrentLiked={isCurrentLiked} postId={post.id} endpoint={endpoints['like_post'](post?.id)} imageStyle={styles.image} textStyle={styles.text} icon={true}></LikeButton>
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
            {((showComments || alwaysShowComment)) && <Comment navigation={navigation} post={post} postOwner={post.user.id} />}
            <AlertModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} alertMessage={isDelete ? 'Hành động này sẽ xoá vĩnh viễn bài viết này. Bạn có tiếp tục chứ?' : !post.block_comment ? 'Hành động này sẽ khoá bình luận bài viết này. Bạn có tiếp tục chứ?' : 'Xác nhận mở bình luận'} confirmMessage={isDelete ? 'Xoá' : !post.block_comment ? 'Khoá' : 'Mở'} cancelMessage={'Huỷ'} handleConfirm={isDelete ? (() => handleDeletePost(post.id)) : (() => handleBlockComment(post))} ></AlertModal>
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

