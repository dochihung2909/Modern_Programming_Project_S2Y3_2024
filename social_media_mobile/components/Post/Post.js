import { Linking, Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Button, Icon, Paragraph } from 'react-native-paper'
import React, {useState} from 'react' 
import Comment from './Comment'; 
import LikeButton from './LikeButton';
import Separate from '../Separate/Separate';
import DropdownMenu from './DropdownMenu';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../configs/APIs';




export default Post = ({post, navigation}) => { 
    const [showComments, setShowComments] = useState(false);  

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const handleEditPost = async (postId) => {
        console.log(`Edit post with ID: ${postId}`);
      };
    
    const handleDeletePost = async (postId) => {
    console.log(`Delete post with ID: ${postId}`);
        const access_token = await AsyncStorage.getItem('token')
        let form = new FormData() 

        form.append('active', false)
        const res = await authApi(access_token).patch(endpoints['delete_post'](postId), form, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
        console.log(res.data)
        if (res.status == 200) {
            console.log('Delete success')
        }
    };
    
    const handleHidePost = (postId) => {
        console.log(`Hide post with ID: ${postId}`);
    };  

      const goToDetail = () => { 
        navigation.navigate('DetailPost', {
            post: post, 
            onDelete: handleDeletePost,
            onEdit: handleEditPost,
            onHide: handleHidePost,
            styles: styles
        })
      }

    return (
        <TouchableOpacity onPress={() => goToDetail(post)}>
            <View className={('bg-white p-4 rounded-lg shadow')}>
                <View className={'flex-row justify-between'}> 
                    <View className={('flex-row items-center mb-4')}>
                        <Image source={{ uri: post.image }} className={('w-10 h-10 rounded-full mr-4')} />
                        <Text className={('font-bold text-lg')}>{post.user}</Text>
                    </View>
                    <DropdownMenu
                        onEdit={() => handleEditPost(post.id)}
                        onDelete={() => handleDeletePost(post.id)}
                        onHide={() => handleHidePost(post.id)}
                    ></DropdownMenu>
                </View>
                <Text className={('text-base mb-4')}>{post.content}</Text>
                {post.image && (
                    <Image source={{ uri: post.image }} className={('w-full h-48 rounded-lg mb-4')} />
                )}
                <View className={('flex-row justify-around border-t border-gray-200 pt-2')}>
                    <View className={('flex-row flex-1 justify-center items-center')}>     
                         
                        <LikeButton imageStyle={styles.image} textStyle={styles.text} icon={true}></LikeButton>
                    </View>
                    <TouchableOpacity onPress={toggleComments} className={('flex-1 flex-row justify-center items-center')}>
                        <Icon source='comment-outline' size={20} color="#000" /> 
                        <Text className={('ml-2 text-base')}>Comment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className={('flex-1 flex-row justify-center items-center')}>
                        <Icon source='share-outline' size={20} color="#000" /> 
                        <Text className={('ml-2 text-base ')}>Share</Text>
                    </TouchableOpacity>
                </View>
                {showComments && <Comment postId={post.id} />}
            </View>
            <Separate /> 
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({ 
    text: {                           // global variable $textColor
      fontSize: 16,
    //   borderWidth: 2,
    //   borderColor: 'blue',                    // relative REM unit
    }, 
    image: {
        width: 50
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
        flexDirection: "column",
      },
  });
 