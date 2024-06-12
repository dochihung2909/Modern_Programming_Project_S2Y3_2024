import { View, Text, Image, Dimensions, StyleSheet} from 'react-native'
import React, {useContext, useEffect, useState, createRef} from 'react'
import { MyDispatchContext, MyUserContext } from '../../configs/Contexts';    
 

const Message = ({ message }) => {
    const user = useContext(MyUserContext); 
     

    const isSentByCurrentUser = message.senderId === 'currentUserId'; // Giả định người dùng hiện tại có id là 'currentUserId'
    
    console.log(message.image?.width, message.image?.height)
   
 

    return (
        <View className={`flex-row my-2 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {!isSentByCurrentUser && (
                <Image
                    source={{ uri: message.senderAvatar }}
                    className="w-10 h-10 rounded-full mr-2"
                />
            )}
            <View className={`p-2 rounded-lg ${isSentByCurrentUser ? 'bg-blue-500' : 'bg-gray-200'}`}>
                {message.isImage ? 
                
                (<> 
                    <Image style={{
                        width: Math.round(message.image?.width / 5),
                        height: Math.round(message.image?.width / 5)
                    }} source={{uri: message.image?.uri}} /> 
                </>)
                : <Text className={`${isSentByCurrentUser ? 'text-white' : 'text-black'}`}>{message.text}</Text>}
            </View>
            {isSentByCurrentUser && (
                <Image
                source={{ uri: message.senderAvatar }}
                className="w-10 h-10 rounded-full ml-2"
                />
            )}
        </View>
    )
} 
 

export default Message