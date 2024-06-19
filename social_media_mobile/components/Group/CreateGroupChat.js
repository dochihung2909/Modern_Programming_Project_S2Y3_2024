import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';
import { formatUrl } from '../../dao';

const CreateGroupChat = () => {
    const [users, setUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleLoadAllUser = async () => {
        const access_token = await AsyncStorage.getItem('token')
        const res = await authApi(access_token).get(endpoints['all_users'])

        console.log(res.data)
        if (res.status == 200) {
            setUsers(res.data)
        }
    }

    useEffect(() => {
      handleLoadAllUser()
    }, [])

    const handleCheckboxChange = (userId) => { 
        setSelectedUsers((prevSelected) =>
          prevSelected.includes(userId)
            ? prevSelected.filter((id) => id !== userId)
            : [...prevSelected, userId]
        );
      };

    useEffect(() => {
      console.log(selectedUsers)
    },[selectedUsers])

    const handleSubmit = () => {
        console.log('Selected users for the group:', selectedUsers);
        // Handle group creation logic here
    };

  return (
    <>
      <ScrollView contentContainerStyle={`p-4`}>
        <Text className={`text-2xl font-bold my-4 text-center`}>Chọn người dùng</Text>
        <View className={'mb-[80px]'}>
          {users.map((user) => (
            <View key={user.username} className={`flex-row items-center mb-4 p-2 border-b`}>
              <Image source={{ uri: formatUrl(user?.avatar) || 'https://static.vecteezy.com/system/resources/previews/019/896/008/original/male-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png' }} className={`w-12 h-12 rounded-full mr-4`} />
              <View className={`flex-1`}>
                <Text className={`text-lg font-bold`}>{`${user.first_name} ${user.last_name}`}</Text>
                <Text className={`text-sm text-gray-500`}>{user.role_id}</Text>
              </View>
              <Checkbox 
                status={selectedUsers.includes(user.username) ? 'checked' : 'unchecked'} 
                onPress={() => handleCheckboxChange(user.username)}
              />
            </View>
          ))}
        </View>
        
      </ScrollView>
      <View className='absolute w-[70%] bottom-5 left-[15%]'>
        <TouchableOpacity className='  p-4 rounded-lg bg-blue-500 ' mode="contained" onPress={handleSubmit}>
          <Text className='text-white text-center text-base'>+ Tạo nhóm</Text>
        </TouchableOpacity> 
      </View>
    </>
  )
}

export default CreateGroupChat 