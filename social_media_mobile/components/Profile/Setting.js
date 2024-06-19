import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const Setting = ({navigation}) => {
  return (
    <View className='flex w-full items-center justify-center mt-8'>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} className={('my-2 bg-blue-500  w-[80%] items-center p-4 rounded-lg')}>
            <Text className={('text-white text-base')}>Chỉnh sửa thông tin cá nhân</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('EditCoverPhoto')} className={('my-2 bg-green-500  w-[80%] items-center p-4 rounded-lg')}>
            <Text className={('text-white text-base')}>Đổi ảnh bìa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('EditPassword')} className={('my-2 bg-orange-500  w-[80%] items-center p-4 rounded-lg')}>
            <Text className={('text-white text-base')}>Sửa mật khẩu</Text>
        </TouchableOpacity>
    </View>
  )
}

export default Setting