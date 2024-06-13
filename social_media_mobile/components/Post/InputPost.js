import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList } from 'react-native'; 
import * as ImagePicker from 'expo-image-picker';

const InputPost = () => { 
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
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
                // onSend('', true, selectedImage); 
                setImage(selectedImage)
            }
        }
    }

  const handlePost = () => {
    // Logic để post bài
    const postData = {
      content,
      image,
      tags_id: tags,
    };
    console.log('Post Data:', postData);
  };

  return (
    <View className={('p-4 bg-white rounded-lg shadow-lg')}>
      <TextInput
        className={('border border-gray-300 p-2 mb-2 rounded-lg')}
        placeholder="What's on your mind?"
        multiline
        value={content}
        onChangeText={setContent}
      />
      <TouchableOpacity
        className={('bg-blue-500 p-2 rounded-lg mb-2')}
        onPress={picker}
      >
        <Text className={('text-white text-center')}>Choose Image</Text>
      </TouchableOpacity>
      {image && (
        <Image
          source={{ uri: image.uri }}
          style={{
                width: Math.round(image?.width / 5),
                height: Math.round(image?.height / 5)
            }}
        />
      )}
      <View className={('flex-row items-center mb-2')}>
        <TextInput
          className={('border border-gray-300 p-2 rounded-lg flex-1')}
          placeholder="Add a tag"
          value={tagInput}
          onChangeText={setTagInput}
        />
        <TouchableOpacity
          className={('bg-green-500 p-2 rounded-lg ml-2')}
          onPress={handleAddTag}
        >
          <Text className={('text-white')}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tags}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        renderItem={({ item }) => (
          <View className={('bg-gray-200 p-2 rounded-lg mr-2')}>
            <Text>{item}</Text>
          </View>
        )}
      />
      <TouchableOpacity
        className={('bg-blue-500 p-2 rounded-lg mt-4')}
        onPress={handlePost}
      >
        <Text className={('text-white text-center')}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InputPost;
