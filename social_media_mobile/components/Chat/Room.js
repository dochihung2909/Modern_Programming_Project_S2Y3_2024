import { View, Text, FlatList, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, {useState, useRef, useEffect, Image, useContext} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from './Input';
import Message from './Message'; 
import { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from '../../configs/Contexts';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import mime from 'mime';

const Room = ({id}) => { 
    const user = useContext(MyUserContext)  
      
    const isFocused = useIsFocused(); 
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([]);

      const loadMessage = async () => { 
        const access_token = await AsyncStorage.getItem('token')
        if (access_token) {
          try {
            const res = await authApi(access_token).get(endpoints['get_messages'](id)) 
            // console.log(res.data)
            setMessages(res.data)
          }  catch (ex) {
            console.info(ex)
          }
          
        }  
      } 

      useEffect(() => {
        loadMessage()
        // console.log('suc')
      }, [])

      const handlePushMessage = async (new_message) => {   
        const access_token = await AsyncStorage.getItem('token') 
        setLoading(true); 
        let form = new FormData()
        if (new_message.isImage) {
          form.append('content', {
              uri: new_message.content.uri,
              name: new_message.content.fileName,
              type: mime.getType(new_message.content.uri)
          }) 
        } else {
          form.append('content', new_message.content) 
        }
        try { 
          const res = await authApi(access_token).post(endpoints['add_messages'](id),  form, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          console.log(res.status)
          if (res.status == 201) {
            console.log('Create Message Successful')
          }
        } catch (ex) {
          console.log(ex)
        } finally {
          setLoading(false)
        }
        
      }


      const scrollViewRef = useRef();
    
      const handleSend = (newMessage, isImage = false, image = {}) => {   
        const newMessageObject = isImage == false ? { 
          user_id: user.id,
          content: newMessage,
        }: { 
          user_id: user.id, 
          isImage,
          content: image
        }; 
        handlePushMessage(newMessageObject)
        setMessages([...messages, newMessageObject]);
      };

      useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });   
      }, [messages]);

      const [refreshing, setRefreshing] = useState(false);

      const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className={('flex-1')}
              keyboardVerticalOffset={80}
            >
              <ScrollView
                ref={scrollViewRef}
                className={('flex-grow px-2 mb-4')}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                  loading={loading}
                /> 
              </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Room