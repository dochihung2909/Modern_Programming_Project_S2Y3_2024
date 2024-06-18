import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,Image, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MyUserContext, useAuth } from '../../configs/Contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';
import LikeButton from './LikeButton';
import { Button, Icon } from 'react-native-paper';
import DropdownMenu from './DropdownMenu';
import { formatDate } from '../../dao';
import AlertModal from '../Modal/AlertModal'; 
import InputComment from './InputComment';
import { useFocusEffect } from '@react-navigation/native';

const Comment = ({ postId, navigation }) => {
    const { user} = useAuth()  
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');  

    const [showDelModal, setShowDelModal] = useState(false)
    const [commentId, setCommentId] = useState('')

    const [loading, setLoading] = useState(false)
    const [isUserComment, setIsUserComment] = useState({
      isUser: 'false',
      user: null
    })

    useFocusEffect(
      React.useCallback(() => {
        loadComments();
      }, [])
    );

    const loadComments = async () => {
        const access_token = await AsyncStorage.getItem('token')
        const res = await authApi(access_token).get(endpoints['posts_comments'](postId))  
        console.log(res.data)
        setComments(res.data) 
        
    }
    useEffect(() => {
        loadComments()
    }, []) 

      const handleAddComment = async () => {
        if (newComment.trim()) {
          const access_token = await AsyncStorage.getItem('token')
          setLoading(true)
          try {
            let form = new FormData()
  
            form.append('content', newComment.trim())
            console.info(form)
            const res = await authApi(access_token).post(endpoints['add_comment'](postId), form, {
              headers: {
                "Content-Type": 'multipart/form-data'
              }
            })
            console.log(res.data)
            if (res.status === 201) {
              console.log("Add comment success")
              const newCommentData = {...res.data};
              setComments([...comments, newCommentData]);
              setNewComment('');
            }
          } catch (error) {
            console.info(error)
          } finally {
            setLoading(false)
          }    
        }
      }; 

      const inputRef = useRef()

      // const handleAddUserComment = (user) => { 
      //   setIsUserComment({
      //     isUser: true,
      //     user: user
      //   }) 
      //   inputRef.current.focus()
      // }

      const handleEditComment = async (comment, commentUser) => {
          console.log(comment)       
          navigation.navigate('UpdateInputComment', {
            comment: comment,
            commentUser: commentUser 
          })   
          loadComments()
      }

      const handleDeleteComment = async () => {
          const access_token = await AsyncStorage.getItem('token') 
          const res = await authApi(access_token).patch(endpoints['delete_comment'](commentId)) 
          console.log(res.data.status)
          loadComments()
      }

      const handleHideComment = async (commentId) => {
          console.log(commentId)
      } 


      const handleShowConfirmDelComment = (commentId) => {
        console.log(commentId)
        setCommentId(commentId)
        setShowDelModal(true)
      }

      // Navigate to Profile user screen when user click to another user
      const handleNavigateUser = (userId) => { 
        if (user.id != userId) {
            navigation.navigate('User_Profile', {
                userId: userId
            })
        } else {
            navigation.navigate('Profile')
        } 
      }
 

  return (
    <View className="bg-white p-4 rounded-lg shadow-md mt-4">
        <View>
            {comments.map(comment => ( 
              <View key={comment.id} className="mb-2 flex">
                  <View  className={('flex-row justify-between')}>
                    <TouchableOpacity onPress={() => handleNavigateUser(comment.user.id)} className={('flex-row items-center mb-4')}>
                        <Image source={{ uri: comment.user.avatar || 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' }} className={('w-10 h-10 rounded-full mr-4')} />
                        <Text className={('font-bold text-lg')}>{`${comment.user.first_name} ${comment.user.last_name} `}</Text>
                    </TouchableOpacity> 
                    {comment.user.id == user.id && 
                      <DropdownMenu
                          isComment
                          onEdit={() => handleEditComment(comment, comment.user)}
                          onDelete={() => handleShowConfirmDelComment(comment.id)}
                          onHide={() => handleHideComment(comment.id)}
                      ></DropdownMenu>
                    }
                    
                  </View>
                  
                  <Text>{comment.content}</Text>
                  <View className={`flex-row items-left`}>
                    <View className={('flex-row justify-center items-center')}> 
                      <Text className={('text-gray-500')}>{formatDate(comment.created_date)}</Text>
                    </View>
                    <View className={('flex-row justify-center items-center')}>
                          <LikeButton isCurrentLiked={-1} endpoint={endpoints['like_comment'](comment.id)} textStyle={styles.text}></LikeButton>
                    </View>
                    <TouchableOpacity onPress={() => {console.log('eidt comment')}} className={('flex-row justify-center items-center')}> 
                        <Text className={('text-gray-500')}>Bình luận</Text>
                    </TouchableOpacity>
                  </View>  
              </View>
            ))}
        </View>  
      <InputComment user={user} setNewComment={setNewComment} newComment={newComment} handleAddComment={handleAddComment} loading={loading} ></InputComment> 
      <AlertModal isModalVisible={showDelModal} setIsModalVisible={setShowDelModal} handleConfirm={handleDeleteComment} alertMessage={'Hành động này sẽ xoá vĩnh viễn bình luận của bạn. Bạn có muốn tiếp tục?'} confirmMessage={'Xoá'} cancelMessage={'Huỷ'}></AlertModal> 

    </View>
  )
}

export default Comment

const styles = StyleSheet.create({
  text: {
    color: 'rgb(107 114 128)', 
  }
})