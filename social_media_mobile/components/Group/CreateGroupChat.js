import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';
import { formatUrl } from '../../dao';
import { useAuth } from '../../configs/Contexts';
import Separate from '../Separate/Separate';
import SuccessModal from '../Modal/SuccessModal';

const CreateGroupChat = ({navigation}) => {
    const {user} = useAuth()
    const [users, setUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('')
    const [err, setErr] = useState({
      isErr: false,
      errMessage: ''
    });
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleLoadAllUser = async () => {
        const access_token = await AsyncStorage.getItem('token')
        const res = await authApi(access_token).get(endpoints['all_users'])
        console.log(res.data)
        if (res.status == 200) {
            let users = res.data.filter(us => us.id !== user.id) 
            setUsers(users)
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

    const handleSubmit = async () => {  
      const access_token = await AsyncStorage.getItem('token')
      let form = new FormData()
      form.append('name', groupName)
      form.append('list_user_id', selectedUsers)
      const res = await authApi(access_token).post(endpoints['create_group'], form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log(res.data)
      if (res.status == 201) {
        console.log('Create success')
        navigation.goBack()
      }
    };

    const validateSubmit = () => { 
      if (!groupName.trim()) { 
        setErr({
          isErr: true,
          errMessage: 'Tên nhóm không được để chống'
        })
        setIsModalVisible(false)
      } else if (selectedUsers.length == 0) {
        setErr({
          isErr: true,
          errMessage: 'Phải chọn ít nhất một user vào nhóm'
        })
        setIsModalVisible(false) 
      } else {
        setErr({
          isErr: false,
          errMessage: ''
        })
        setIsModalVisible(true) 
      }
      
    }

  return (
    <View className={'bg-white'}>
      <ScrollView contentContainerStyle={`p-4`}>
        <View className={'my-4'}>
          <TextInput value={groupName} onChangeText={(t) => {
            setGroupName(t)
            setErr(false)
          }} placeholder='Tên nhóm' label={'Tên nhóm'} className=' bg-white'></TextInput>
          {err.isErr && <Text className={'mx-2 text-red-500 my-2 text-base'}>{err.errMessage}</Text>} 
        </View>
        
        <View className={'mb-[80px]'}>
          {users.map((user) => (
            <TouchableOpacity key={user.id} onPress={() => handleCheckboxChange(user.id)}> 
              <Separate /> 
              <View  className={`flex-row items-center mb-4 p-2`}>
                <Image source={{ uri: formatUrl(user?.avatar) || 'https://static.vecteezy.com/system/resources/previews/019/896/008/original/male-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png' }} className={`w-12 h-12 rounded-full mr-4`} />
                <View className={`flex-1`}>
                  <Text className={`text-lg font-bold`}>{`${user.first_name} ${user.last_name}`}</Text>
                  <Text className={`text-sm text-gray-500`}>{user.role_id}</Text>
                </View>
                <Checkbox 
                  status={selectedUsers.includes(user.id) ? 'checked' : 'unchecked'}  
                />
              </View> 
              <Separate />
            </TouchableOpacity>
          ))}
        </View>
        
      </ScrollView>
      <View className='absolute w-[70%] bottom-5 left-[15%]'>
        <TouchableOpacity className='  p-4 rounded-lg bg-blue-500 ' mode="contained" onPress={validateSubmit}>
          <Text className='text-white text-center text-base'>+ Tạo nhóm</Text>
        </TouchableOpacity> 
      </View>
      <SuccessModal isModalVisible={isModalVisible} confirmMessage={'Tạo'} successMessage={'Xác nhận tạo nhóm'} cancelMessage={'Huỷ'} handleConfirm={handleSubmit} handleCancel={() => navigation.goBack()}></SuccessModal>
    </View>
  )
}

export default CreateGroupChat 