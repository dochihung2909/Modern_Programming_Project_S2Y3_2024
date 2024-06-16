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
import {MyUserContext, MyDispatchContext, AuthenticatedUserContext, AuthenticatedUserProvider} from './configs/Contexts'
import {MyUserReducer} from './configs/Reducers'
import Room from './components/Chat/Room';
import Chat from './components/Chat/Chat'; 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './configs/firebase'; 
import { MenuProvider } from 'react-native-popup-menu';
import InputPost from './components/Post/InputPost'; 
import DetailPost from './components/Post/DetailPost';
 

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

 

const MyTab = () => {
  const user = useContext(MyUserContext);   
  
  return (
    <Tab.Navigator className='w-[10%]'>
      {user && 
        <>
          <Tab.Screen name="Home" component={Home} options={{ title: "Trang chủ", tabBarIcon: () => <Icon size={30} color="black" source="home" />}} /> 
          <Tab.Screen name="Notification" component={Notification} options={{tabBarIcon: () => <Icon size={30} color="black" source="bell-outline" />}} /> 
          <Tab.Screen name="Profile" component={Profile} options={{tabBarIcon: () => <Icon size={30} color="black" source="account" />}} />
          <Tab.Screen name="Chat" component={Chat} options={{tabBarIcon: () => <Icon size={30} color="black" source="chat-outline" />}} />   
        </> 
      } 
    </Tab.Navigator>
  )
}


const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} options={{title: 'Đăng nhập'}} ></Stack.Screen> 
      <Stack.Screen name="Register" component={Register} ></Stack.Screen>
      <Stack.Screen
        name="MyTab"
        component={MyTab} 
        options={{ headerShown: false }}
      />  
      <Stack.Screen name='Room' component={Room} />   
      <Stack.Screen name='User Profile' component={Profile} />  
      <Stack.Screen name='InputPost' component={InputPost} options={{title: 'Tạo bài viết'}}/>   
      <Stack.Screen name='DetailPost' component={DetailPost} options={{title: 'Bài viết'}}/>  
    </Stack.Navigator>
  )
}

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  console.log(user?.access_token)
  return (
    <MenuProvider> 
        <NavigationContainer>
          <MyUserContext.Provider value={user}>
            <MyDispatchContext.Provider value={dispatch}> 
                <MyStack></MyStack>  
            </MyDispatchContext.Provider>
          </MyUserContext.Provider>
        </NavigationContainer>
      </MenuProvider>

    
  );
}
