import { Linking, Text, View, Image } from 'react-native'
import { Button, Paragraph } from 'react-native-paper'
import React from 'react' 

export default Post = ({post}) => {
    return (
        <>
            <View className="bg-white shadow rounded-md  -mx-2 lg:mx-0">
     
            <View className="flex justify-between items-center px-4 py-3">
                <View className="flex flex-1 items-center space-x-4"> 
                    <Text className="block font-semibold "><Text href="/profile/{{post.user}}">USER</Text></Text>
                </View>
            <View> 
                <View className="bg-white w-56 shadow-md mx-auto p-2 mt-12 rounded-md text-gray-500 hidden text-base border border-gray-100  " uk-drop="mode: hover;pos: top-right">
            
                    {/* <ul className="space-y-1">  
                        <li> 
                            <a href="#" className="flex items-center px-3 py-2 text-red-500 hover:bg-red-100 hover:text-red-500 rounded-md ">
                                <i className="uil-trash-alt mr-1"></i>  Delete Post
                            </a> 
                        </li>
                    </ul>  */}
                </View>
            </View>
            </View>
            <View className='flex-auto h-[50vh]'>
                <Image
                    className='w-[100%] h-[100%]'
                    source={{
                    uri: 'https://reactnative.dev/img/tiny_logo.png',
                    }}
                />

            </View>

                
            {/* <View>
                <Paragraph dataDetectorType={} href="{{post.image.url}}">  
                </Paragraph>
            </View> */}
             
            <View className="py-3 px-4 space-y-3">  
                <View className="flex space-x-4 lg:font-bold">
                    <View href="/like-post?post_id={{post.id}}" className="flex items-center space-x-2">
                        <View className="p-2 rounded-full text-black">
                            {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="25" height="25" className="">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg> */}
                            {/* {% if post.no_of_likes == 0 %}
                            <p>No likes</p>
                            {% elif post.no_of_likes == 1 %}
                            <p>Liked by {{post.no_of_likes}} person</p>
                            {% else %}
                            <p>Liked by {{post.no_of_likes}} people</p>
                            {% endif %} */}
                        </View>
                        
                    </View> 
                    <View href="{{post.image.url}}" className="flex items-center space-x-2 flex-1 justify-end" download>
                        {/* <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="25" height="25" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16"><g fill="currentColor"><path d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6c-.314.418-.5.937-.5 1.5v6h-2a.5.5 0 0 0-.354.854l2.5 2.5a.5.5 0 0 0 .708 0l2.5-2.5A.5.5 0 0 0 10.5 7.5h-2v-6z"/></g></svg> */}
                        
                    </View>
                </View>  
                <Text>
                    <Text href="/profile/{{post.user}}"><Text className='font-semibold'>a</Text></Text>a
                </Text>  
            </View>

        </View>
        </>
    )
}
 