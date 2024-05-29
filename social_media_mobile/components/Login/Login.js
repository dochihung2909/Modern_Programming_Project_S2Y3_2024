import { KeyboardAvoidingView, ScrollView, Text, View, Image, Platform } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react'
import { HelperText, TextInput, TouchableRipple, Button, Provider } from 'react-native-paper'  
import DropDown from "react-native-paper-dropdown"; 

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

    useEffect(() => {
        console.log(type)
    }, [type])

    return (
      <View className="flex-1 w-[10px] items-center justify-center bg-black"> 
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
            <ScrollView>
                <Text>ĐĂNG NHẬP</Text> 
                
                <View className='z-index-[1]'>
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

                {fields.map(c => <TextInput secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateSate(c.name, t)} key={c.name} label={c.label} right={<TextInput.Icon icon={c.icon} />} />)}

                <HelperText type="error" visible={err}>
                    Mật khẩu không khớp!
                </HelperText> 

                <Button icon="account" loading={loading} mode="contained" onPress={login}>ĐĂNG NHẬP</Button>
            </ScrollView>
        </KeyboardAvoidingView> 
            
      </View>
    ) 
}

export default Login