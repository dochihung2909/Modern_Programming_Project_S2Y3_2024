import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Icon } from 'react-native-paper';

const RoomHeaderCustom = ({route, navigation}) => {
    const { targetUser } = route.params;

    const onBackPress = () => {
        navigation.goBack()
    }

  return (
    <View className="flex-row items-center mt-8 bg-white py-2 px-4 border-b border-gray-200">
      <TouchableOpacity onPress={onBackPress} className="mr-4">
        <Icon size={40} source='arrow-left' />
      </TouchableOpacity>
      <Image source={{ uri: targetUser?.avatar }} className="w-10 h-10 rounded-full mr-2" />
      <Text className="text-lg font-semibold">{`${targetUser.first_name} ${targetUser.last_name}`}</Text>
    </View>
  )
}

export default RoomHeaderCustom