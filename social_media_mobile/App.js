import React, {useState, useEffect, useContext, useReducer} from 'react';
import { Text, View, Button } from 'react-native'; 
import Login from './components/Login/Login'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Register from './components/Login/Register';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './components/Home/Home';
import { ActivityIndicator, Icon } from 'react-native-paper';
import Notification from './components/Notification/Notification';
import Profile from './components/Profile/Profile'; 
import {MyUserContext, MyDispatchContext, AuthenticatedUserContext, AuthenticatedUserProvider, ReactionProvider} from './configs/Contexts'
import {MyUserReducer} from './configs/Reducers'
import Room from './components/Chat/Room';
import Chat from './components/Chat/Chat'; 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './configs/firebase'; 
import { MenuProvider } from 'react-native-popup-menu';
import InputPost from './components/Post/InputPost'; 
import DetailPost from './components/Post/DetailPost';
import UpdateInputComment from './components/Post/UpdateInputComment';  
import RoomHeaderCustom from './components/Chat/RoomHeaderCustom';

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

 

const MyTab = () => {
  const user = useContext(MyUserContext);   
  
  return (
    <Tab.Navigator className='w-[10%]' 
      screenOptions={{ 
          tabBarShowLabel: false,
      }}>
      {user && 
        <>
          <Tab.Screen name="Home" component={Home} options={{ title: "Trang chủ", tabBarIcon: () => <Icon size={30} color="black" source="home-outline" />}} /> 
          <Tab.Screen name="Notification" component={Notification} options={{tabBarIcon: () => <Icon size={30} color="black" source="bell-outline" />}} /> 
          <Tab.Screen name="Profile" component={Profile} options={{title: "Hồ sơ", tabBarIcon: () => <Icon size={30} color="black" source="account-outline" />}} />
          <Tab.Screen name="Chat" component={Chat} options={{tabBarIcon: () => <Icon size={30} color="black" source="chat-outline" />}} />   
        </> 
      } 
    </Tab.Navigator>
  )
}


const MyStack = () => {
  return (
    <Stack.Navigator defaultNavigationOptions={{headerTitleAlign: 'center'}}>
      <Stack.Screen name="Login" component={Login} options={{title: 'Đăng nhập', headerTitleAlign: 'center'}} ></Stack.Screen> 
      <Stack.Screen name="Register" component={Register} ></Stack.Screen>
      <Stack.Screen
        name="MyTab"
        component={MyTab} 
        options={{ headerShown: false }}
      />  
      <Stack.Screen name='Room' component={Room} options={{
        // header: ({ options, navigation, route }) => <RoomHeaderCustom route={route} navigation={navigation}/> ,
        title: 'Nhắn tin',
        headerTitleAlign: 'center'
      }} />   
      <Stack.Screen name='User_Profile' component={Profile} />  
      <Stack.Screen name='InputPost' component={InputPost} options={{title: 'Tạo bài viết', headerTitleAlign: 'center'}}/>   
      <Stack.Screen name='DetailPost' component={DetailPost} options={{title: 'Bài viết', headerTitleAlign: 'center'}}/>  
      <Stack.Screen name='UpdateInputComment' component={UpdateInputComment} options={{title: 'Sửa bình luận', headerTitleAlign: 'center'}}/>   
    </Stack.Navigator>
  )
}

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  console.log(user)
  return (
    <MenuProvider> 
        <NavigationContainer>
          <MyUserContext.Provider value={user}>
            <MyDispatchContext.Provider value={dispatch}>
              <ReactionProvider> 
                <MyStack></MyStack>  
              </ReactionProvider> 
            </MyDispatchContext.Provider>
          </MyUserContext.Provider>
        </NavigationContainer>
      </MenuProvider>

    
  );
}
