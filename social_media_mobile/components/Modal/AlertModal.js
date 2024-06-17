import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import Modal from "react-native-modal"; 
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const AlertModal = ({isModalVisible, setIsModalVisible, alertMessage, confirmMessage, cancelMessage, handleConfirm}) => {
 
    const handleModal = () => {
        setIsModalVisible(false)
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
                        {alertMessage}
                    </Text>
                    <View className={'flex-row gap-2 items-center justify-center my-2'}>
                        <Button className={('bg-red-500 p-2 flex-1 rounded-lg mt-4')} onPress={() => {handleConfirm(), handleModal()}}>
                            <Text  Text className={('text-white text-center')}>{confirmMessage}</Text> 
                        </Button>
                        <Button className={('bg-blue-500 p-2 flex-1 rounded-lg mt-4')} onPress={handleModal}>
                            <Text Text className={('text-white text-center')}>{cancelMessage}</Text> 
                        </Button>
                    </View>
                    
                </View>
            </TouchableWithoutFeedback> 
        </TouchableOpacity>   
    </Modal> 
  )
}

export default AlertModal