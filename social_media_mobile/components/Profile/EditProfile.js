import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';   
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../configs/Contexts';
import SuccessModal from '../Modal/SuccessModal'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';
import Mime from 'mime';
import LoadingScreen from '../LoadingScreen';
import AlertModal from '../Modal/AlertModal';

const EditProfile = ({navigation}) => { 
  const { user } = useAuth()  
  const [usr, setUser] = useState(user)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const { update } = useAuth() 

  
  useEffect(() => {
    setUser(user)
  }, [])

  const updateSate = (field, value) => {  
    setUser(current => {
        return {...current, [field]: value}
    });
}

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted')
        Alert.alert("iCourseApp", "Permissions Denied!");
        else {
            let res = await ImagePicker.launchImageLibraryAsync();
            if (!res.canceled) {
                const selectedImage = res.assets[0]; 
                // Ví dụ: Gửi URL của ảnh đã chọn
                updateSate('avatar', selectedImage); 
            }
        }
    }

  const handleUpdateProfile = async () => {
    const access_token = await AsyncStorage.getItem('token') 
    setLoading(true)
    try { 
      let form = new FormData();
      for (let key in usr) { 
          if (usr[key] != user[key]) {
            if (key === 'avatar') {  
              form.append(key, {
                  uri: usr.avatar.uri,
                  name: usr.avatar.fileName,
                  type: Mime.getType(usr.avatar.uri)
              });
            } else
                form.append(key, usr[key]);
          }    
      } 
      if (form._parts) {
        console.log(form)
        const res = await authApi(access_token).patch(endpoints['current_user'], form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          } 
        })  
        console.log(res.data)
      }          
      console.log('Update success')
      setIsModalVisible(false) 
      navigation.goBack()
    } catch (err) {
      console.error(err) 
      setIsModalVisible(false)
      Alert.alert('Lỗi', 'Lưu thông tin thất bại', [
        {
          text: 'Huỷ',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        } 
      ]);
    } finally {
      setLoading(false)
    }
  } 
  
  if (loading) {
    return <LoadingScreen />; // Hoặc bất kỳ màn hình loading nào bạn muốn hiển thị
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
      <ScrollView>
        <View className={('flex-1 p-4 bg-white')}>
          <Text className={('text-lg font-bold mb-4')}>Edit Profile</Text>

          <View className={('mb-4')}>
            <Text className={('text-sm mb-2')}>Username</Text>
            <TextInput
              className={('border p-2 rounded')}
              value={usr.username}
              onChangeText={(t) => updateSate('username', t)}
              placeholder="Username"
            />
          </View>

          <View className={('mb-4')}>
            <Text className={('text-sm mb-2')}>First Name</Text>
            <TextInput
              className={('border p-2 rounded')}
              value={usr.first_name}
              onChangeText={(t) => updateSate('first_name', t)}
              placeholder="First Name"
            />
          </View>

          <View className={('mb-4')}>
            <Text className={('text-sm mb-2')}>Last Name</Text>
            <TextInput
              className={('border p-2 rounded')}
              value={usr.last_name}
              onChangeText={(t) => updateSate('last_name', t)}
              placeholder="Last Name"
            />
          </View>
          

          <View className={('mb-4')}>
            <Text className={('text-sm mb-2')}>Email</Text>
            <TextInput
              className={('border p-2 rounded')}
              value={usr.email}
              onChangeText={(t) => updateSate('email', t)}
              placeholder="Email"
            />
          </View>

          <View className={('mb-4')}>
            <Text className={('text-sm mb-2')}>Avatar</Text>
            {usr.avatar && <Image source={{ uri: usr.avatar.uri || usr.avatar }} className={('w-24 h-24 rounded-full mb-4')} />}
            <Button title="Select Avatar" onPress={picker} />
          </View>

          <TouchableOpacity onPress={() => setIsModalVisible(true)} className={('bg-blue-500 p-4 rounded')}>
            <Text className={('text-center text-white font-bold')}>Save Changes</Text>
          </TouchableOpacity> 
          <SuccessModal handleConfirm={handleUpdateProfile} handleCancel={() => setIsModalVisible(false)} isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} successMessage={'Lưu thông tin mới'} confirmMessage={'Lưu'} cancelMessage={'Huỷ'}></SuccessModal>
        </View> 
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
