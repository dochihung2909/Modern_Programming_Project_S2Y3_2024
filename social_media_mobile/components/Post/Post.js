import { Linking, Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native' 
import React, {useEffect, useState} from 'react'  
import PurePost from './PurePost';




export default Post = ({refreshing, post, navigation}) => {   
      const goToDetail = () => { 
        navigation.navigate('DetailPost', {
            post: post,
        })
      }

    return (
        <TouchableOpacity onPress={() => goToDetail()}>
            <PurePost refreshing={refreshing} navigation={navigation} post={post} />
        </TouchableOpacity>
    )
}
