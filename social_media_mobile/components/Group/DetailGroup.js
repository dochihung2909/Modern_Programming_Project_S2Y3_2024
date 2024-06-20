import { View, Text, TouchableOpacity } from 'react-native'
import React, { useLayoutEffect } from 'react' 
import { useAuth } from '../../configs/Contexts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi, endpoints } from '../../configs/APIs'

const DetailGroup = ({navigation, route}) => {
    const { group } = route.params
    const {user} = useAuth()

    useLayoutEffect(() => {
        navigation.setOptions({
            title: group.name || 'Nhóm',
        });
    }, [navigation]);

    const handleCreateGroupChat = async () => {
        const access_token = await AsyncStorage.getItem('token')
        try {
            const res = await authApi(access_token).post(endpoints['create_group_chat'](group.id))
            console.log(res.data) 
            if (res.status == 201) {
                navigation.navigate('Room', {id: res.data.room.id})
            } else if (res.status == 200) {
                navigation.navigate('Room', {id: res.data.id})
            }
        } catch(err) {
            console.error(err)
        }
    }

  return (
    <View>
        <View className={'w-full mt-8 '}>
            <TouchableOpacity onPress={handleCreateGroupChat} className={'mx-4 bg-blue-500 rounded-lg p-4'}>
                <Text className={'text-base text-white text-center'}>Phòng chat</Text>    
            </TouchableOpacity> 
        </View> 
        
        {user.role == 0 && 
            <View className={'w-full mt-8 '}>
                <TouchableOpacity className={'mx-4 bg-blue-500 rounded-lg p-4'}>
                    <Text className={'text-base text-white text-center'}>Gửi thông báo</Text>    
                </TouchableOpacity> 
            </View> 
        } 
    </View>
  )
}

export default DetailGroup