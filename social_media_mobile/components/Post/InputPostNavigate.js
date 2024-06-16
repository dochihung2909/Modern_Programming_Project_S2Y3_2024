import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Separate from '../Separate/Separate'

const InputPostNavigate = ({user, handleNavigateInputPost}) => { 

  return (
    <>
        <Separate />
        <View className={'flex-row justify-center px-4 my-4 items-center'}>
            <Image className={'w-10 h-10 rounded-full mr-2'} source={{uri: user.avatar}} /> 
            <TouchableOpacity
                className={'flex-1'}
                onPress={handleNavigateInputPost}
            > 
                <Text
                className={('border-b-2 px-2 py-4 border-gray-300')} 
                >
                    Bạn đang nghĩ gì?
                </Text>
            </TouchableOpacity> 
        </View>
        <Separate />
    </>
     
  )
}

export default InputPostNavigate