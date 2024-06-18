import { View, Text, FlatList, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import React, {useState, useRef, useEffect, useLayoutEffect, useContext, useCallback} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from './Input';
import Message from './Message'; 
import { authApi, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext, useAuth } from '../../configs/Contexts';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import mime from 'mime';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot, 
  where,
  deleteDoc, doc
} from 'firebase/firestore';
import { auth, database } from '../../configs/firebase'; 
import { GiftedChat, Message as GiftMessage  } from 'react-native-gifted-chat'; 

const Room = ({ route, navigation }) => { 
    const {id, targetUser } = route.params
    const { user} = useAuth()   
    const isFocused = useIsFocused();  
    console.log(user.avatar)
    const [messages, setMessages] = useState([]);

      // const loadMessage = async () => { 
      //   const access_token = await AsyncStorage.getItem('token')
      //   if (access_token) {
      //     try {
      //       const res = await authApi(access_token).get(endpoints['get_messages'](id)) 
      //       // console.log(res.data)
      //       setMessages(res.data)
      //     }  catch (ex) {
      //       console.info(ex)
      //     }
          
      //   }  
      // } 

      // useEffect(() => {
      //   loadMessage() 
      // }, [])

      // const handlePushMessage = async (new_message) => {   
      //   const access_token = await AsyncStorage.getItem('token') 
      //   setLoading(true); 
      //   let form = new FormData()
      //   if (new_message.isImage) {
      //     form.append('content', {
      //         uri: new_message.content.uri,
      //         name: new_message.content.fileName,
      //         type: mime.getType(new_message.content.uri)
      //     }) 
      //   } else {
      //     form.append('content', new_message.content) 
      //   }
      //   try { 
      //     const res = await authApi(access_token).post(endpoints['add_messages'](id),  form, {
      //       headers: {
      //         'Content-Type': 'multipart/form-data'
      //       }
      //     })
      //     console.log(res.status)
      //     if (res.status == 201) {
      //       console.log('Create Message Successful')
      //     }
      //   } catch (ex) {
      //     console.log(ex)
      //   } finally {
      //     setLoading(false)
      //   }
        
      // }


      const scrollViewRef = useRef(); 

      const handleSend = useCallback((messages) => {   
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, messages)
        ); 

        const { _id, text, user, createdAt} = messages[0]
        console.log(messages)
        addDoc(collection(database, 'chats'), {   
          _id,
          text,  
          user,
          createdAt, 
          room_id: id
        })
      }, []);

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


      useLayoutEffect(() => {
        // const collectionRef = collection(database, 'chats') 
        const collectionRef = collection(database, 'chats')  
        const q = query(collectionRef, where('room_id', '==', id), orderBy('createdAt', 'desc'))  

        const unsubscribe = onSnapshot(q, snapshot => {
            console.log('snapshot')
            setMessages(
              snapshot.docs.map(doc => { 
                return {   
                  _id: doc.data()._id,
                  text: doc.data().text,
                  createdAt: doc.data().createdAt?.toDate(),
                  user: doc.data().user,
                  room_id: doc.data().room_id
                }
              })
            )
        })
        return unsubscribe
      }, []) 

      const deleteMessage = async (messageId) => {  
        console.log(messageId)
        const docRef = doc(database, 'chats', messageId);
        const res = doc(database, 'chats', where('_id', '==', messageId));
        // console.log(res)
        deleteDoc(res)
          .then(() => {
            Alert.alert('Message deleted successfully');
          })
          .catch((error) => {
            Alert.alert('Error deleting message:', error.message);
          });
      };

      const handleLongPress = (currentMessage) => {
        Alert.alert(
          'Choose an action',
          'What do you want to do?',
          [
            {
              text: 'Delete',
              onPress: () => deleteMessage(currentMessage._id),
              style: 'destructive',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
      };

      const renderMessage = (props) => {
        const { currentMessage } = props;
        return (
          <View className={'flex'}>
            <TouchableOpacity onLongPress={() => handleLongPress(currentMessage)}>
              <GiftMessage {...props} /> 
            </TouchableOpacity> 
          </View>
        );
      };

    return (
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={true}
        onSend={messages => handleSend(messages)}
        user={{
          _id: user.id,
          avatar: user.avatar, 
        }} 
        renderMessage={renderMessage}
      /> 
    )
}

export default Room