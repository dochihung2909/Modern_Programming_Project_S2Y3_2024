import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,Image, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MyUserContext } from '../../configs/Contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';
import LikeButton from './LikeButton';
import { Button, Icon } from 'react-native-paper';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

const Comment = ({ postId }) => {
    const user = useContext(MyUserContext)  
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');  

    const [loading, setLoading] = useState(false)
    const [isUserComment, setIsUserComment] = useState({
      isUser: 'false',
      user: null
    })

    const formatDate = (dateString) => {
      const date = parseISO(dateString);
      const now = new Date();
    
      // Nếu bài viết trong vòng 24 giờ
      if (now - date < 24 * 60 * 60 * 1000) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
    
      // Nếu bài viết lâu hơn 24 giờ
      return format(date, 'PPPpp'); // Sử dụng 'PPPpp' để định dạng ngày giờ đầy đủ (tùy chỉnh lại theo nhu cầu)
    };

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
 

  return (
    <View className="bg-white p-4 rounded-lg shadow-md mt-4">
        <View>
            {comments.map(comment => ( 
              <View key={comment.id} className="mb-2 flex">
                  <View className={('flex-row items-center mb-4')}>
                      <Image source={{ uri: comment.user.avatar || 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' }} className={('w-10 h-10 rounded-full mr-4')} />
                      <Text className={('font-bold text-lg')}>{`${comment.user.first_name} ${comment.user.last_name} `}</Text>
                  </View> 
                  <Text>{comment.content}</Text>
                  <View className={`flex-row items-left`}>
                    <View className={('flex-row justify-center items-center')}> 
                      <Text className={('text-gray-500')}>{formatDate(comment.created_date)}</Text>
                    </View>
                    <View className={('flex-row justify-center items-center')}>
                          <LikeButton textStyle={styles.text}></LikeButton>
                    </View>
                    <TouchableOpacity onPress={''} className={('flex-row justify-center items-center')}> 
                        <Text className={('text-gray-500')}>Comment</Text>
                    </TouchableOpacity>
                  </View>  
              </View>
            ))}
        </View>  
      <View className="flex-row items-center mt-4 border-t border-gray-200 pt-4">
        <TextInput
          ref={inputRef}
          className={('flex-1 bg-gray-100 p-2 rounded-lg border border-gray-300')} 
          onChangeText={setNewComment}
          value={newComment}
          placeholder="Write a comment..."
        > 
        </TextInput>
        <Button
          loading={loading}
          onPress={handleAddComment}
          className={('ml-2 bg-blue-500 p-2 rounded-lg')}
        >
          <Text className="text-white">Post</Text>
        </Button>
      </View>
    </View>
  )
}

export default Comment

const styles = StyleSheet.create({
  text: {
    color: 'rgb(107 114 128)', 
  }
})