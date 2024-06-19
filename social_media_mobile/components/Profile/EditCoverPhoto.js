import { View, Text, Image, Alert, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../configs/Contexts'

import * as ImagePicker from 'expo-image-picker';
import { adjustImageTo16x9 } from '../../dao';
import { Button } from 'react-native-paper';
import SuccessModal from '../Modal/SuccessModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';
import Mime from 'mime';

const EditCoverPhoto = ({route, navigation}) => {
    const { user, update } = useAuth()  
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    const [coverPhoto, setCoverPhoto] = useState({
        uri: user.cover_photo,
        name: '',
    })
    console.log(user,coverPhoto)


    const imageSize = adjustImageTo16x9(Dimensions.get('window').width) 

    const picker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('RentalMobile', 'Permissions Denied!');
        } else {
            let selectedImages = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1
            });

            if (!selectedImages.canceled) {   
                setCoverPhoto({
                    uri: selectedImages.assets[0].uri,
                    name: selectedImages.assets[0].fileName
                });
            }
        }
    };

    const handleUpdateCoverPhoto = async () => {
        const access_token = await AsyncStorage.getItem('token')
        setIsModalVisible(false)
        setLoading(true)  
        try {
            let form = new FormData()
            if (coverPhoto.name != '') {
                console.log('Có lưu')
                form.append('cover_photo', {
                    uri: coverPhoto.uri,
                    name: coverPhoto.name,
                    type: Mime.getType(coverPhoto.uri)
                })
    
                console.log(form)
                
                const res = await authApi(access_token).patch(endpoints['current_user'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    } 
                })
                console.log(res.data)
                if (res.status == 200) {
                    console.log('Update Success') 
                    update(res.data)
                }
            } 
            navigation.navigate('Profile')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        } 
        
    }

    const validateCoverPhoto = () => {
        if (false) {
            
        } else {
            setIsModalVisible(true)
        }
    }

  return (
    <View className={'w-screen h-100%'}>
        {coverPhoto && <Image source={{uri: coverPhoto.uri }} style={{width: imageSize.width, height: imageSize.height}}/> }
        <View className='mx-4'>
            <TouchableOpacity className='w-full rounded p-2 mt-4 bg-blue-500' onPress={picker}>
                <Text className='text-white text-base text-center'>
                    Chọn ảnh bìa
                </Text>
            </TouchableOpacity>  
        </View>

        <View className='mx-4'>
            <Button loading={loading} className='w-full rounded p-4 mt-8 bg-green-500' onPress={validateCoverPhoto}>
                <Text className='text-white text-base text-center'>
                    Lưu thay đổi
                </Text>
            </Button>  
        </View>

        <SuccessModal successMessage={'Lưu ảnh bìa'} handleConfirm={handleUpdateCoverPhoto} handleCancel={() => setIsModalVisible(false)} confirmMessage={'Lưu'} cancelMessage={'Huỷ'} isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} ></SuccessModal>
    </View>
  )
}

export default EditCoverPhoto