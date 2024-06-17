import { View, Text, Image } from 'react-native'
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react' 
import ReactionButton from '@luu-truong/react-native-reaction-button' 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../configs/APIs';
import { LikeTypeContext, useReactions } from '../../configs/Contexts';

const LikeButton = ({ isCurrentLiked, postId, endpoint, textStyle, imageStyle, icon}) => {  

    const [likeTypeId, setLikeTypeId] = React.useState(isCurrentLiked);
    const isFirstRender = useRef(true);

    const [isDislike, setIsDislike] = useState(-1)

    function onChange(index) { 
      setIsDislike(likeTypeId)
      setLikeTypeId(likeTypeId === index ? -1 : index);   
    }

    // handle like


    const handleLike = async () => {
      const access_token = await AsyncStorage.getItem('token')  
      try {
        let form = new FormData() 
        form.append('like_type_id', likeTypeId == -1 ? isDislike : likeTypeId)
        console.info(form)
        const res = await authApi(access_token).post(endpoint, form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
          })
          console.log(res.data) 
          if (res.status == 200) {
            console.log('Like success')
          }
      } catch (err) {
          console.info(err)
      } 
    }  
     
    useEffect(() => { 
      // console.log(isDislike, likeTypeId, isCurrentLiked)
      if (isFirstRender.current) {
        isFirstRender.current = false;
        console.log(isCurrentLiked, postId, likeTypeId)   
        return;
      }

      if (isDislike != -1 || likeTypeId != -1) {
        handleLike()    
      }  
    }, [likeTypeId, isDislike, isCurrentLiked])

    const reactions =  useReactions().reactions; 

  return (
    <View className={'flex-row items-center justify-center'}>
      {likeTypeId == -1 &&  icon && <Image className={'w-[20px] h-[20px] mr-[-10px]'} source={{uri: 'https://cdn-icons-png.flaticon.com/512/58/58746.png'}} /> }
      <ReactionButton imageProps={{style: imageStyle}} textProps={{style: textStyle}} reactions={reactions} defaultIndex={0} value={likeTypeId} onChange={onChange} /> 
    </View>   
  )
} 

export default LikeButton 