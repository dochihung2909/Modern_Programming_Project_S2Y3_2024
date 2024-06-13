import { View, Text } from 'react-native'
import React from 'react'

const Separate = ({color = 'bg-slate-300', height = 1}) => {
  return (
    <>
        <View className={`${color} h-[${height}px] w-full`}>
        </View>
    </>
  )
}

export default Separate