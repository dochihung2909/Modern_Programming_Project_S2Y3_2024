import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import React from 'react'
import Modal from "react-native-modal"; 
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const SuccessModal = ({confirmMessage, cancelMessage, handleConfirm, handleCancel, successMessage, isModalVisible, setIsModalVisible}) => {  
    
    const handleModal = () => {
        setIsModalVisible(false)
    }

  return (
    <Modal isVisible={isModalVisible}>
        <TouchableOpacity  
            className={'bg-gray h-[100vh] flex items-center justify-center'}
            activeOpacity={1} 
            onPressOut={handleModal}
        >
            <TouchableWithoutFeedback>
                <View className={'bg-white w-[90%] py-8 px-4 rounded-lg'}>
                    <Text className={'text-lg font-bold my-2 text-center'}>
                        {successMessage}
                    </Text>
                    <View className={'flex-row gap-2 items-center justify-center my-2'}>
                        <Button className={('bg-blue-500 flex-1 p-2 rounded-lg mt-4')} onPress={handleConfirm}>
                            <Text  Text className={('text-white text-center')}>{confirmMessage}</Text> 
                        </Button>
                        {cancelMessage && 
                            <Button className={('bg-green-500  flex-1 p-2 rounded-lg mt-4')} onPress={handleCancel || handleModal}>
                                <Text Text className={('text-white text-center')}>{cancelMessage}</Text> 
                            </Button>
                        }
                        
                    </View>
                    
                </View>
            </TouchableWithoutFeedback> 
        </TouchableOpacity>   
    </Modal> 
  )
}

export default SuccessModal