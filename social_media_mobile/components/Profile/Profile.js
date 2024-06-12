import { View, Text, Image, ScrollView } from 'react-native'
import React, {useContext} from 'react'
import { Button } from 'react-native-paper'
import { MyDispatchContext, MyUserContext } from '../../configs/Contexts';

export default function Profile() {
  // const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext); 

  const user = {
    name: 'John Doe',
    avatar: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=338&ext=jpg&ga=GA1.1.1788614524.1718150400&semt=ais_user',
    bio: 'This is a bio.',
    email: 'john.doe@example.com',
    phone: '+1234567890',
  };

  return (
    <>
      <ScrollView className="bg-white">
          <View className="flex items-center mt-4">
            <Image
              source={{ uri: user.avatar }}
              className="w-40 h-40 rounded-full border-4 border-white"
            />
            <Text className="ml-4 mt-4 text-xl font-bold">{user.name}</Text>
          </View>
          
          <View className="bg-white p-4 mt-4">
            <Text className="text-lg font-semibold">About</Text>
            <Text className="mt-2">{user.bio}</Text>
            <Text className="mt-4 text-lg font-semibold">Contact Information</Text>
            <Text className="mt-2">Email: {user.email}</Text>
            <Text className="mt-2">Phone: {user.phone}</Text>
          </View>

          <View>
            <Button icon="logout" onPress={() => dispatch({"type": "logout"})}>Đăng xuất</Button>
          </View>
      </ScrollView> 
    </>
    
  )
}