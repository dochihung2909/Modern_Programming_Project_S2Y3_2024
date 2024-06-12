import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import React, {useState} from 'react'
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

const Input = ({ onSend, onPress }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        console.log('Pressed')
      if (message.trim()) {
        onSend(message);
        setMessage(''); 
      }
    }; 

      const picker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
            Alert.alert("iCourseApp", "Permissions Denied!");
        else {
            let res = await ImagePicker.launchImageLibraryAsync();
            if (!res.canceled) {
                const selectedImage = res.assets[0]; 
                // Ví dụ: Gửi URL của ảnh đã chọn
                onSend('', true, selectedImage); 
            }
        }
    }

    return (
        <View className="flex-row items-center p-2 bg-white border-t border-gray-200">
            <TouchableOpacity onPress={picker} className="p-2">
                <Icon name="camera" size={24} color="gray" />
            </TouchableOpacity>
            <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message" 
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                onFocus={onPress}
            />
            <TouchableOpacity onPress={handleSend} className="ml-2 p-2 bg-blue-500 rounded-lg">
                <Text className="text-white">Send</Text>
            </TouchableOpacity>
        </View>
 
    )
}

export default Input