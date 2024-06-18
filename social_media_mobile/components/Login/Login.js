import { KeyboardAvoidingView, ScrollView, Text , View, Image, Platform, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { useState, useEffect, useContext } from 'react'
import { HelperText, TextInput, TouchableRipple, Button, Provider } from 'react-native-paper'  
import DropDown from "react-native-paper-dropdown";   
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext, useAuth } from '../../configs/Contexts';
import APIs, { endpoints, authApi } from '../../configs/APIs'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => { 
    const [type, setType] = useState(1) 
    const [user, setUser] = useState({}) 
    const [showDropdown, setShowDropdown]  = useState(false);
    const [err, setErr] = React.useState(false);
    const [loading, setLoading] = React.useState(false); 
    const nav = useNavigation();
    const { login } = useAuth();

    const client_id = process.env.CLIENT_ID 
    const client_secret = process.env.CLIENT_SECRET

    

    const typeList = [ 
        {
            'label': 'Cựu sinh viên',
            'value': 1
        },
        {
            'label': 'Giảng viên',
            'value': 2
        },
        {
            'label': 'Quản trị viên',
            'value': 3
        } 
    ]

    const fields = [
    {
        "label": "Tên đăng nhập",
        "icon": "account",
        "name": "username"
    }, {
        "label": "Mật khẩu",
        "icon": "eye",
        "name": "password",  
        "secureTextEntry": true
    }];  

    const handleLogin = async () => {
        updateSate('type', type) 
        setLoading(true);
        try { 
            const res = await APIs.post(endpoints['login'],
                new URLSearchParams({
                    'grant_type': 'password',
                    'client_id': client_id,
                    'client_secret': client_secret,
                    ...user
                }), 
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                }
            );  
            if (res.status == 200) {
                console.info(user) 
                await AsyncStorage.setItem("token", res.data.access_token);
                console.info(res.data.access_token); 
                
                setTimeout(async () => {
                    let user = await authApi(res.data.access_token).get(endpoints['current_user']);
                    console.info(user.data);

                    await login(user.data)
                    console.log('navigate')
                    nav.navigate('MyTab');
                }, 100);
                setErr(false)
            }  
            
            
        } catch (ex) {
            console.error(ex);
            setErr(true)
        } finally {
            setLoading(false);
        }   
    }
 

    const updateSate = (field, value) => { 
        setErr(false)
        setUser(current => {
            return {...current, [field]: value}
        });
    }

    // useEffect(() => {
    //     console.log(type)
    // }, [type])


    useEffect(() => {
        const fetchToken =  async () => {
            const access_token = (await AsyncStorage.getItem('token'))
            
            if (access_token) {
                let user = await authApi(access_token).get(endpoints['current_user']);
                console.info(user.data);
                await login(user.data)
                console.log('navigate')
                nav.navigate('MyTab');
            } else {
                return
            } 
        }
        fetchToken()
    }, [])


    return (
    <>   
      <View className="mx-4 mt-[10%]"> 
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
            <ScrollView>
                <Text className='text-blue-500 text-center text-xl font-bold mb-4'>ĐĂNG NHẬP</Text> 
                
                <View className='z-10'>
                    <Provider>            
                        <DropDown            
                            label='Loại đăng nhập'
                            mode='outlined'
                            value={type}
                            setValue={setType}
                            list={typeList}
                            visible={showDropdown}
                            showDropDown={() => setShowDropdown(true)}
                            onDismiss={() => setShowDropdown(false)}
                            dropDownStyle={{
                                width:'100%', 
                                top: '10%',  
                                left: '0'
                            }}
                        />                
                    </Provider> 
                </View>

                {fields.map(c => 
                <TextInput className="my-[5px]" secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateSate(c.name, t)} key={c.name} label={c.label} right={<TextInput.Icon icon={c.icon} />} />)}

                <HelperText type="error" visible={err}>
                    Sai tên đăng nhập hoặc mật khẩu
                </HelperText> 

                <Button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800' icon="account" loading={loading} mode="contained" onPress={handleLogin}>ĐĂNG NHẬP</Button>
                <View className={'flex-row items-center'}>
                     <Text className={'pr-2 text-base'}>Đăng ký tài khoản cựu sinh viên?</Text>
                     <TouchableOpacity className={'text-base font-light text-gray-500 dark:text-gray-400'}  onPress={() => nav.navigate('Register')}>
                        <Text className='underline font-medium text-blue-600'>
                            Đăng ký
                        </Text>
                    </TouchableOpacity> 
                </View> 
            </ScrollView>
        </KeyboardAvoidingView>  
      </View>
    </>
    ) 
}

export default Login