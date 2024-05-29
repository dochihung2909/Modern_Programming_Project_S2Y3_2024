import { Text, View, Button } from 'react-native'
import React from 'react'

const Post = ({navigation}) => {
    return (
        <View>
            <Text>Post</Text>
            <Button
                title="Go to Home"
                onPress={() => navigation.navigate('Home')}
            />
        </View>
    )
}
 