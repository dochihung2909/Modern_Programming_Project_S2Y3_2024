import { View, Text } from 'react-native'
import React from 'react'

const Separate = ({color = 'bg-slate-300', height = 1, style}) => { 

  return (
    <>
        <View className={`bg-slate-300 h-[4px] w-full ${style}` }>
        </View>
    </>
  )
}

export default Separate