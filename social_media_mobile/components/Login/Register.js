import { KeyboardAvoidingView, ScrollView, Text, View, Image, Platform } from 'react-native'
import React, {useState, useEffect} from 'react'
import { HelperText, TextInput, TouchableRipple, Button } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown'; 
import * as ImagePicker from 'expo-image-picker'; 
import mime from 'mime';
import APIs, { endpoints } from '../../configs/APIs';

export default Register = ({navigation}) => { 
    const [user, setUser] = useState({})   
    const [err, setErr] = React.useState(false);
    const [loading, setLoading] = React.useState(false);


    const picker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
            Alert.alert("iCourseApp", "Permissions Denied!");
        else {
            let res = await ImagePicker.launchImageLibraryAsync();
            if (!res.canceled) {
                updateSate("avatar", res.assets[0]);
            }
        }
    }

    const updateSate = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        });
    }

    // Post api to server for admin to commit register and send username and password thought email for student
    const register = async () => {
        if (user['password'] !== user['confirm'])
            setErr(true);
        else {
            setErr(false);

            let form = new FormData();
            for (let key in user)
                if (key !== 'confirm')
                    if (key === 'avatar') {  
                        form.append(key, {
                            uri: user.avatar.uri,
                            name: user.avatar.fileName,
                            type: mime.getType(user.avatar.uri)
                        });
                    } else
                        form.append(key, user[key]);
            
            console.info(form);
            setLoading(true);
            try {
                let res = await APIs.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.info(res)
                if (res.status === 201)
                    navigation.navigate("Login");
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }
    const fields = [
        {
            "label": "Mã số sinh viên",
            "icon": "text",
            "name": "student_id"
        }, {
            "label": "Họ",
            "icon": "account",
            "name": "first_name"
        }, {
            "label": "Tên",
            "icon": "account",
            "name": "last_name"
        }, {
            "label": "Email",
            "icon": "mail",
            "name": "email"
        },
        {
            "label": "Tên đăng nhập",
            "icon": "account",
            "name": "username"
        }, {
            'label': "Mật khẩu",
            'icon': 'eye',
            'name': 'password',
            'secureTextEntry': true
        }, {
            'label': "Nhập lại mật khẩu",
            'icon': 'eye',
            'name': 'confirm',
            'secureTextEntry': true
        }]; 

    useEffect(() => {
        // console.log(user)
    }, [user])

    return (
      <View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
            <ScrollView>
                <Text className='flex-1 text-center'>ĐĂNG KÝ</Text>  

                {fields.map(c => <TextInput secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateSate(c.name, t)} key={c.name} label={c.label} right={<TextInput.Icon icon={c.icon} />} />)}

                <HelperText type="error" visible={err}>
                    Mật khẩu không khớp!
                </HelperText> 

                <TouchableRipple onPress={picker}>
                    <Text>Chọn ảnh đại diện...</Text>
                </TouchableRipple>

                {user.avatar && 
                    <View style={
                        {
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: 10
                        }}>
                    </View>
                }
                <Image className='flex w-[80px] h-[80px]' source={{uri: user?.avatar?.uri}}/> 


                <Button icon="account" loading={loading} mode="contained" onPress={register}>ĐĂNG KÝ</Button>
            </ScrollView>
        </KeyboardAvoidingView>  
      </View>
    ) 
}