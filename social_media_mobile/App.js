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
import {MyUserContext, MyDispatchContext, AuthenticatedUserContext, AuthenticatedUserProvider, ReactionProvider, useAuth, AuthProvider} from './configs/Contexts'
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
import LoadingScreen from './components/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from './configs/APIs';
import EditProfile from './components/Profile/EditProfile';
import EditPassword from './components/Profile/EditPassword';
import Setting from './components/Profile/Setting';
import EditCoverPhoto from './components/Profile/EditCoverPhoto';
import Group from './components/Group/Group';
import CreateGroupChat from './components/Group/CreateGroupChat';

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

 

const MyTab = () => {
  const { user } = useAuth();   
  
  return (
    <Tab.Navigator className='w-[10%]' 
      screenOptions={{ 
          tabBarShowLabel: false,
      }}>
      {user && 
        <>
          <Tab.Screen name="Home" component={Home} options={{ title: "Trang chủ", tabBarIcon: () => <Icon size={30} color="black" source="home-outline" />}} /> 
          <Tab.Screen name="Notification" component={Notification} options={{tabBarIcon: () => <Icon size={30} color="black" source="bell-outline" />}} /> 
          <Tab.Screen name="Group" component={Group} options={{tabBarIcon: () => <Icon size={30} color="black" source="group" />}} /> 
          <Tab.Screen name="Profile" component={Profile} options={{title: "Hồ sơ", tabBarIcon: () => <Icon size={30} color="black" source="account-outline" />}} />
          <Tab.Screen name="Chat" component={Chat} options={{tabBarIcon: () => <Icon size={30} color="black" source="chat-outline" />}} />   
        </> 
      } 
    </Tab.Navigator>
  )
}


const MyStack = () => {
  const { user } = useAuth()

  return (
    <Stack.Navigator defaultNavigationOptions={{headerTitleAlign: 'center'}}>
      {!user ? 
      <>
        <Stack.Screen name="Login" component={Login}  options={{headerShown: false}} ></Stack.Screen> 
        <Stack.Screen name="Register" component={Register} ></Stack.Screen>
      </> :
      <>
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
        <Stack.Screen name='EditProfile' component={EditProfile} options={{title: 'Sửa thông tin tài khoản', headerTitleAlign: 'center'}}/>   
        <Stack.Screen name='EditPassword' component={EditPassword} options={{title: 'Đổi mật khẩu', headerTitleAlign: 'center'}}/>   
        <Stack.Screen name='Setting' component={Setting} options={{title: 'Cài đặt', headerTitleAlign: 'center'}}/>   
        <Stack.Screen name='EditCoverPhoto' component={EditCoverPhoto} options={{title: 'Đổi ảnh bìa', headerTitleAlign: 'center'}}/>   
        <Stack.Screen name='CreateGroupChat' component={CreateGroupChat} options={{title: 'Tạo nhóm', headerTitleAlign: 'center'}}/>   
      </>
    }
      
    </Stack.Navigator>
  )
}

export default function App() {  
  const [isLoading, setIsLoading] = useState(true); 
  const [user, dispatch] = useReducer(MyUserReducer, null); 

  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token'); 
        if (savedToken) {
          let user = await authApi(savedToken).get(endpoints['current_user']);
          console.info(user.data); 
          dispatch({ type: 'login', payload: user.data });
        } else {
          dispatch({ type: 'logout' });
          console.log('logged out');
          await AsyncStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to check token', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return <LoadingScreen />; // Hoặc bất kỳ màn hình loading nào bạn muốn hiển thị
  }

  return (
      <ReactionProvider> 
        <AuthProvider>
          <MenuProvider> 
            <NavigationContainer>
                <MyStack></MyStack>  
            </NavigationContainer>
          </MenuProvider>
        </AuthProvider> 
      </ReactionProvider>  

    
  );
}
