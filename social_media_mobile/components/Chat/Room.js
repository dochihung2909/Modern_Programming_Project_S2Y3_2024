import { View, Text, FlatList, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native'
import React, {useState, useRef, useEffect, Image} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from './Input';
import Message from './Message'; 

const Room = () => { 
    const [messages, setMessages] = useState([
        {
          id: '1',
          senderId: 'user1',
          senderAvatar: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=338&ext=jpg&ga=GA1.1.1788614524.1718150400&semt=ais_user',
          text: 'Hello!',
        },
        {
          id: '2',
          senderId: 'currentUserId',
          senderAvatar: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=338&ext=jpg&ga=GA1.1.1788614524.1718150400&semt=ais_user',
          text: 'Hi there!',
        },
      ]);

      const scrollViewRef = useRef();
    
      const handleSend = (newMessage, isImage = false, image = {}) => {   
        const newMessageObject = isImage == false ? {
          id: (messages.length + 1).toString(),
          senderId: 'currentUserId',
          senderAvatar: 'https://example.com/currentUser.jpg',
          text: newMessage,
        }: {
          id: (messages.length + 1).toString(),
          senderId: 'currentUserId',
          senderAvatar: 'https://example.com/currentUser.jpg', 
          isImage,
          image: image
        }; 
        setMessages([...messages, newMessageObject]);
      };

      useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, [messages]);

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className={('flex-1')}
              keyboardVerticalOffset={80}
            >
              <ScrollView
                ref={scrollViewRef}
                className={('flex-grow p-2')}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map((message) => (
                  <Message key={message.id} message={message} /> 
                ))}
              </ScrollView>
              <View className="flex-row items-center p-2 bg-white border-t border-gray-200">
                <Input 
                  placeholder="Type a message"
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  onSend={handleSend}  
                  onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                /> 
              </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Room