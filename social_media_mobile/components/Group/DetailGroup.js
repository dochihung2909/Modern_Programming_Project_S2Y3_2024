import { View, Text, TouchableOpacity } from 'react-native'
import React, { useLayoutEffect } from 'react' 

const DetailGroup = ({navigation, route}) => {
    const { group } = route.params

    useLayoutEffect(() => {
        navigation.setOptions({
            title: group.name || 'Nhóm',
        });
    }, [navigation]);

  return (
    <View>
        <View className={'w-full mt-8 '}>
            <TouchableOpacity className={'mx-4 bg-blue-500 rounded-lg p-4'}>
                <Text className={'text-base text-white text-center'}>Phòng chat</Text>    
            </TouchableOpacity> 
        </View> 
        
        
        <View className={'w-full mt-8 '}>
            <TouchableOpacity className={'mx-4 bg-blue-500 rounded-lg p-4'}>
                <Text className={'text-base text-white text-center'}>Gửi thông báo</Text>    
            </TouchableOpacity> 
        </View>
    </View>
  )
}

export default DetailGroup