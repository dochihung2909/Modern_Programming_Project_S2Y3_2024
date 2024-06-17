import { View, Text } from 'react-native'
import React, { useState } from 'react'
import InputComment from './InputComment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi, endpoints } from '../../configs/APIs'

const UpdateInputComment = ({route, navigation}) => {
    const { comment, commentUser } = route.params

    const [cmt, setCmt] = useState(comment.content) 
    const [loading, setLoading] = useState(false)

    const handleUpdateComment = async () => {
        const access_token = await AsyncStorage.getItem('token')
        let form = new FormData()
        form.append('content', cmt)

        setLoading(true)
        try {
            const res = await authApi(access_token).patch(endpoints['update_comment'](comment.id), form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            console.log(res.data)
            if (res.status == 200) {
                console.log('Update successful')
            }

            setTimeout(() => {
                navigation.goBack()
            }, 100)
        } catch(err) {
            console.info(err)
        } finally {
            setLoading(false)
        } 
    }

  return (
    <InputComment user={commentUser} newComment={cmt} setNewComment={setCmt} handleAddComment={handleUpdateComment} loading={loading}></InputComment>
  )
}

export default UpdateInputComment