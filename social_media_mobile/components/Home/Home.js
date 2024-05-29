import { View, Text, Image, ScrollView } from 'react-native'
import React from 'react' 
import Post from '../Post/Post'

export default function Home() {
  return (
    <ScrollView>
      <Text className="text-black">Hello</Text>
      <Post></Post> 
    </ScrollView>
  )
}