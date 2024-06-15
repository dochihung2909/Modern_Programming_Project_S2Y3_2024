import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,Image, FlatList } from 'react-native';
import { MyUserContext } from '../../configs/Contexts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';

const Comment = ({ postId }) => {
    const user = useContext(MyUserContext) 

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');  

    const loadComments = async () => {
        const access_token = await AsyncStorage.getItem('token')
        const res = await authApi(access_token).get(endpoints['comments']) 
        let comments = res.data
        comments = comments.filter(comment => comment.post_id == postId)
        console.log(comments)
        setComments(comments)
        
    }
    useEffect(() => {
        loadComments()
    }, []) 

      const handleAddComment = () => {
        if (newComment.trim()) {
          const newCommentData = {
            id: `${comments?.length + 1}`,
            user: user.username,
            text: newComment,
            postId: postId,
          };
          setComments([...comments, newCommentData]);
          setNewComment('');
        }
      }; 

  return (
    <View className="bg-white p-4 rounded-lg shadow-md mt-4">
        <View>
            {comments.map(comment => ( 
            <View key={comment.id} className="mb-2 flex">
                <View className={('flex-row items-center mb-4')}>
                    <Image source={{ uri: comment.user.avatar }} className={('w-10 h-10 rounded-full mr-4')} />
                    <Text className={('font-bold text-lg')}>{`${comment.user.first_name} ${comment.user.last_name}`}</Text>
                </View> 
                <Text>{comment.content}</Text>
            </View>
            ))}
        </View>  
      <View className="flex-row items-center mt-4 border-t border-gray-200 pt-4">
        <TextInput
          className={('flex-1 bg-gray-100 p-2 rounded-lg border border-gray-300')}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
        />
        <TouchableOpacity
          onPress={handleAddComment}
          className={('ml-2 bg-blue-500 p-2 rounded-lg')}
        >
          <Text className="text-white">Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Comment