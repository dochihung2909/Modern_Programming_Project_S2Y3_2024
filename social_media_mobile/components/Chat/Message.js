import { View, Text, Image, Dimensions, StyleSheet} from 'react-native'
import React, {useContext, useEffect, useState, createRef} from 'react'
import { MyDispatchContext, MyUserContext } from '../../configs/Contexts';    
 

const Message = ({ message }) => {
    const user = useContext(MyUserContext); 
     
    // console.log(message)

    const isSentByCurrentUser = message.user_id === user.id; 
      

    return (
        <View className={`flex-row my-2 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {!isSentByCurrentUser && (
                <Image
                    source={{ uri: message?.avatar || 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' }}
                    className="w-10 h-10 rounded-full mr-2"
                />
            )}
            <View className={`p-2 rounded-lg ${isSentByCurrentUser ? 'bg-blue-500' : 'bg-gray-200'}`}>
                {message.isImage ? 
                
                (<> 
                    <Image style={{
                        width: Math.round(message.content?.width / 5),
                        height: Math.round(message.content?.height / 5)
                    }} source={{uri: message.content?.uri}} /> 
                </>)
                : <Text className={`${isSentByCurrentUser ? 'text-white' : 'text-black'}`}>{message.content}</Text>}
            </View>
            {isSentByCurrentUser && (
                <Image
                source={{ uri: message?.senderAvatar || 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' }}
                className="w-10 h-10 rounded-full ml-2"
                />
            )}
        </View>
    )
} 
 

export default Message