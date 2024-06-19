import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi, endpoints } from '../../configs/APIs'
import { Checkbox } from 'react-native-paper'

const Group = ({navigation}) => { 
  return ( 
    <View className='mx-4 mt-8'>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGroupChat')} className='w-full p-2 rounded-lg bg-blue-500'>
          <Text className='text-base text-center text-white'>+ Tạo nhóm</Text>
        </TouchableOpacity>
    </View> 
  )
}

export default Group