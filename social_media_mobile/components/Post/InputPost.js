import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, Alert, ScrollView, Dimensions, TouchableWithoutFeedback} from 'react-native'; 
import { Button } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage/src';
import { authApi, endpoints } from '../../configs/APIs';
import Mime  from 'mime'; 
import { useHeaderHeight } from '@react-navigation/elements';
import Modal from "react-native-modal";
import SuccessModal from '../Modal/SuccessModal';
import { calRatio, formatUrl, resizeImage } from '../../dao';

const InputPost = ({route, navigation}) => { 
  const {handleLoadPost, user, post} = route.params
  // console.log(handleLoadPost, user, post) 
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = React.useState(false);  
  const [isModalVisible, setIsModalVisible] = React.useState(false); 

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]); 
    }
  };  

  useEffect(() => {
    if (post) {
      setContent(post.content)
      Image.getSize(post.image, (width, height) => {
        setImage({
          uri: formatUrl(post.image),
          width,
          height
        })
      }) 
      setTags(post.tags)
      
    } 
  }, [post])
   

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

  const handleUpdatePost = async () => {
    const access_token = await AsyncStorage.getItem('token')  
    console.log('update')
    setLoading(true); 
    
    try {
      let form = new FormData()
      console.log(image)
      form.append('tag', tagInput) 
      form.append('content', content)
      if (image.fileName) {
        form.append('image', {
            uri: image.uri,
            name: image.fileName,
            type: Mime.getType(image.uri)
        }) 
      }
      
      console.info(post)

      const res = await authApi(access_token).patch(endpoints['post_by_id'](post.id), form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log(res.data) 
     
      if (res.status == '200') {
        setTimeout(() => {
          console.log('Update post successful')  
          setIsModalVisible(true)
      }, 100)
        
      }   
    } catch (err) {
      console.info(err)
    } finally {
      
      setLoading(false)
    }
  }

  const handleAddPost = async () => {
    const access_token = await AsyncStorage.getItem('token')  
    setLoading(true);
    try {
      let form = new FormData()

      form.append('tag', tagInput) 
      form.append('content', content)
      form.append('image', {
          uri: image.uri,
          name: image.fileName,
          type: Mime.getType(image.uri)
      }) 
      console.info(form)

      const res = await authApi(access_token).post(endpoints['add_post'], form, {
        headers: {
          "Content-Type": 'multipart/form-data'
        }
      })
      console.log(res.data) 
     
      if (res.status == '201') {
        setTimeout(() => {
          console.log('Add post successful')
          setTagInput('')
          setImage(null)
          setContent('')
          handleLoadPost()  
          setIsModalVisible(true)
      }, 100)
        
      }   
    } catch (err) {
      console.info(err)
    } finally {
      
      setLoading(false)
    }
    
  };

  const handleConfirmModal = () => {
    setIsModalVisible(true)
    if (post) {
      navigation.goBack()
    } else {
      setIsModalVisible(false)
    } 
  }

  const handleNavigate = () => {
    navigation.navigate('Profile')
  }

  const deleteImage = () => {
    setImage(null)
  }

  const headerHeight = (useHeaderHeight());
  const screenHeight = Dimensions.get('window').height;    
  const screenWidth = Dimensions.get('window').width;


  return (
    <ScrollView>
      <View className={(`flex p-4 bg-white rounded-lg shadow-lg`)} style={{height: (screenHeight - headerHeight)}}>
        <View className={('flex-row items-center mb-2 py-2')}>
            <Image source={{ uri: user?.avatar }} className={('w-10 h-10 rounded-full mr-4')} />
            <Text className={('font-bold text-black text-lg')}>{`${user.first_name} ${user.last_name}`}</Text>
        </View>

        <View className={'flex-1'}>
          <TextInput
            className={('p-2 mb-2 rounded-lg')}
            placeholder="What's on your mind?"
            multiline
            value={content}
            onChangeText={setContent}
          />
          {image && (
            <>
              <Image
              source={{ uri: image?.uri }}
              style={{
                  ...resizeImage(image.width, image.height, screenWidth / 2.5, screenHeight / 2.5)
              }}
            />

              <TouchableOpacity className={('bg-red-500 p-2 rounded-lg mb-2')}
              onPress={deleteImage}
            >
              <Text className={('text-white text-center')}>Delete Image</Text>
            </TouchableOpacity>
            </>
            
          )}
        </View>

        
        <View>
          <TouchableOpacity className={('bg-blue-500 p-2 rounded-lg mb-2')}
            onPress={picker}
          >
            <Text className={('text-white text-center')}>Choose Image</Text>
          </TouchableOpacity>
          
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
          <Button
            loading={loading}
            className={('bg-blue-500 p-2 rounded-lg mt-4')}
            onPress={post ? handleUpdatePost : handleAddPost}
          >
            <Text className={('text-white text-center')}>Post</Text>
          </Button>
        </View> 
        <SuccessModal handleCancel={!post && handleNavigate} handleConfirm={handleConfirmModal} setIsModalVisible={setIsModalVisible} confirmMessage={post ? 'Về trang chủ' : 'Tiếp tục đăng bài'} cancelMessage={post ? '' :'Về trang timeline'} successMessage={!post ? "Đăng bài thành công" : "Sửa bài thành công"} isModalVisible={isModalVisible}/>
      </View>

      
    </ScrollView>
    
    
  );
};

export default InputPost;
