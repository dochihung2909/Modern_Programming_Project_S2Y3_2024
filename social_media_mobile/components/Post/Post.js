import { Linking, Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native' 
import React, {useEffect, useState} from 'react'  
import PurePost from './PurePost';




export default Post = ({loadPosts, isCurrentLiked, refreshing, post, navigation}) => {   
      const goToDetail = () => { 
        navigation.navigate('DetailPost', {
            post: post,
            isCurrentLiked: isCurrentLiked,
        })
      }

    return (
        <TouchableOpacity onPress={() => goToDetail()}>
            <PurePost loadPosts={loadPosts} isCurrentLiked={isCurrentLiked} refreshing={refreshing} navigation={navigation} post={post} />
        </TouchableOpacity>
    )
}
