import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi, endpoints } from '../../configs/APIs'
import { Checkbox } from 'react-native-paper'
import Separate from '../Separate/Separate'
import { useFocusEffect } from '@react-navigation/native'

const Group = ({navigation}) => { 
  const [groups, setGroups] = useState()

  const loadGroup = async () => {
    const access_token = await AsyncStorage.getItem('token')
    const res = await authApi(access_token).get(endpoints['get_groups'])

    console.log(res.data) 
    if (res.status == 200) {
      setGroups(res.data)
    }
  }

  useEffect(() => {
    loadGroup()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadGroup();
    }, [])
  );


  return ( 
    <>
      {groups?.map(group => (
        <TouchableOpacity onPress={() => {navigation.navigate('DetailGroup', {group:group})}} className={'w-full mt-4 mb-[50px]'}>
          <View key={group.id} className={'p-4 bg-blue-500'} >
            <Text className={'text-base text-center text-white'}>
                {group.name}
            </Text> 
          </View> 
          <Separate></Separate> 
        </TouchableOpacity>
      ))} 
      <View className='absolute w-[70%] bottom-5 left-[15%]'>
          <TouchableOpacity className='  p-4 rounded-lg bg-blue-500 ' mode="contained" onPress={() => navigation.navigate('CreateGroupChat')}>
            <Text className='text-white text-center text-base'>+ Tạo nhóm</Text>
          </TouchableOpacity> 
      </View>
    </>
  )
}

export default Group