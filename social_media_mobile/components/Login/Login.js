import { KeyboardAvoidingView, ScrollView, Text , View, Image, Platform, Pressable } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react'
import { HelperText, TextInput , TouchableRipple, Button, Provider } from 'react-native-paper'  
import DropDown from "react-native-paper-dropdown";  
import { StatusBar } from 'expo-status-bar';

const Login = ({navigation}) => { 
    const [type, setType] = useState(1) 
    const [user, setUser] = useState({}) 
    const [showDropdown, setShowDropdown]  = useState(false);
    const [err, setErr] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

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

    const login = () => {
        console.log("login")
    }

    const updateSate = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        });
    }

    useEffect(() => {
        console.log(type)
    }, [type])


    useEffect(() => {
        console.log(user)
    }, [user])


    return (
    <>   
      <View className="m-[5px]"> 
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
            <ScrollView>
                <Text className='text-blue-50'>ĐĂNG NHẬP</Text> 
                
                <View className='z-[1]'>
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

                {fields.map(c => <TextInput className="my-[5px]" secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateSate(c.name, t)} key={c.name} label={c.label} right={<TextInput.Icon icon={c.icon} />} />)}

                <HelperText type="error" visible={err}>
                    Mật khẩu không khớp!
                </HelperText> 

                <Button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800' icon="account" loading={loading} mode="contained" onPress={login}>ĐĂNG NHẬP</Button>
            </ScrollView>
        </KeyboardAvoidingView> 
            
      </View>
    </>
    ) 
}

export default Login