import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import React from 'react'
import Modal from "react-native-modal"; 
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const SuccessModal = ({successMessage, isModalVisible, handleModal}) => {  
    const nav = useNavigation()

    const handleNavigate = () => {
        nav.navigate('Profile')
    }

  return (
    <Modal isVisible={isModalVisible}>
        <TouchableOpacity  
            className={'bg-gray  h-[100vh] flex items-center justify-center'}
            activeOpacity={1} 
            onPressOut={handleModal}
        >
            <TouchableWithoutFeedback>
                <View className={'bg-white p-8 rounded-lg'}>
                    <Text className={'text-lg font-bold my-2 text-center'}>
                        {successMessage}
                    </Text>
                    <View className={'flex-row gap-2 items-center justify-center my-2'}>
                        <Button className={('bg-blue-500 p-2 rounded-lg mt-4')} onPress={handleModal}>
                            <Text  Text className={('text-white text-center')}>Tiếp tục đăng bài</Text> 
                        </Button>
                        <Button className={('bg-green-500 p-2 rounded-lg mt-4')} onPress={handleNavigate}>
                            <Text Text className={('text-white text-center')}>Về trang timeline</Text> 
                        </Button>
                    </View>
                    
                </View>
            </TouchableWithoutFeedback> 
        </TouchableOpacity>   
    </Modal> 
  )
}

export default SuccessModal