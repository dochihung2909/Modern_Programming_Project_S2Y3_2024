import { Linking, Text, View, Image, TouchableOpacity } from 'react-native'
import { Button, Icon, Paragraph } from 'react-native-paper'
import React from 'react' 

export default Post = ({post}) => {

    return (
        <>
            <View className={('bg-white mb-4 p-4 rounded-lg shadow')}>
                <View className={('flex-row items-center mb-4')}>
                    <Image source={{ uri: post.image }} className={('w-10 h-10 rounded-full mr-4')} />
                    <Text className={('font-bold text-lg')}>{post.username}</Text>
                </View>
                <Text className={('text-base mb-4')}>{post.content}</Text>
                {post.image && (
                    <Image source={{ uri: post.image }} className={('w-full h-48 rounded-lg mb-4')} />
                )}
                <View className={('flex-row justify-around border-t border-gray-200 pt-2')}>
                    <TouchableOpacity className={('flex-row items-center')}>
                    <Icon name="thumbs-up" size={20} color="#000" />
                    <Text className={('ml-2 text-base')}>Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className={('flex-row items-center')}>
                    <Icon name="comment" size={20} color="#000" />
                    <Text className={('ml-2 text-base')}>Comment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className={('flex-row items-center')}>
                    <Icon name="share" size={20} color="#000" />
                    <Text className={('ml-2 text-base')}>Share</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}
 