import { View, Text, useWindowDimensions,ScrollView, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import RenderHTML from 'react-native-render-html'
import { formatDate } from '../../dao' 

const DetailNotification = ({navigation, route}) => {
    const { notification } = route.params

    const { width} = useWindowDimensions() 

  return (
    <View className={'bg-white h-screen'}>
        <ScrollView>
            <Text className={'font-bold text-lg text-center my-4'}>{notification.title}</Text> 
            <View className={'flex flex-wrap mb-4'}>
                <RenderHTML 
                    contentWidth={width}
                    source={{ html: notification.content }}
                />
            </View>
            <Text>{formatDate(notification.created_date)}</Text> 
        </ScrollView>
    </View>
  )
}

export default DetailNotification