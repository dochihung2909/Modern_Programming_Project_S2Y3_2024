import { View, Text, Image } from 'react-native'
import React from 'react'
import { Button, TextInput } from 'react-native-paper'

const InputComment = ({user, setNewComment, newComment, handleAddComment, loading}) => {
  return (
    <View className="flex-row items-center mt-4 border-t border-gray-200 pt-4">
      <Image className={'w-10 h-10 rounded-full mr-2'} source={{uri: user.avatar}} /> 
      <TextInput 
        className={('flex-1 bg-gray-100 p-2 rounded-lg border border-gray-300')} 
        onChangeText={setNewComment}
        value={newComment}
        placeholder="Viết bình luận..."
      > 
      </TextInput>
      <Button
        loading={loading}
        onPress={handleAddComment}
        className={('ml-2 bg-blue-500 p-1 rounded-lg')}
      >
        <Text className="text-white">Bình luận</Text>
      </Button>
    </View>
  )
}

export default InputComment