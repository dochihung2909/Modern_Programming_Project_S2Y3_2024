import React from 'react';
import { Text, View, Button } from 'react-native'; 
import Login from './components/Login/Login'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Register from './components/Login/Register';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './components/Home/Home';
import { Icon } from 'react-native-paper';
import Notification from './components/Notification/Notification';
import Profile from './components/Profile/Profile';
import { StatusBar } from 'expo-status-bar';
 

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const MyTab = () => {
  return (
    <Tab.Navigator className='w-[10%]'>
      <Tab.Screen name="Home" component={Home} options={{ title: "Trang chủ", tabBarIcon: () => <Icon size={30} color="blue" source="home" />}} />
      <>
        <Tab.Screen name="Login" component={Login} options={{title: "Đăng nhập", tabBarIcon: () => <Icon size={30} color="blue" source="login" />}} />
        <Tab.Screen name="Register" component={Register} options={{title: "Đăng ký", tabBarIcon: () => <Icon size={30} color="blue" source="login" />}} />
      </>
      <Tab.Screen name="Notification" component={Notification} options={{tabBarIcon: () => <Icon size={30} color="blue" source="bell-outline" />}} />
      <Tab.Screen name="Profile" component={Profile} options={{tabBarIcon: () => <Icon size={30} color="blue" source="account" />}} />

      {/* <>
        <Tab.Screen name="Profile" component={Profile} options={{ title: user.username, tabBarIcon: () => <Icon size={30} color="blue" source="account" />}} />
      </> */} 
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
        <MyTab></MyTab> 
    </NavigationContainer> 
  );
}
