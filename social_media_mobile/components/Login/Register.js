import { KeyboardAvoidingView, ScrollView, Text, View, Image, Platform } from 'react-native'
import React, {useState} from 'react'
import { HelperText, TextInput, TouchableRipple, Button } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown'; 
import * as ImagePicker from 'expo-image-picker'; 

export default Register = () => { 
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
    const register = () => {
        console.log("Registering...");
    }

    const fields = [
        {
            "label": "Mã số sinh viên",
            "icon": "text",
            "name": "student_id"
        }, {
            "label": "Họ và tên",
            "icon": "account",
            "name": "username"
        }, {
            'label': "Email",
            'icon': 'email',
            'name': 'email'
        }]; 

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
                        <Image source={{uri: user.avatar.uri}}/> 
                    </View>
                }

                <Button icon="account" loading={loading} mode="contained" onPress={register}>ĐĂNG KÝ</Button>
            </ScrollView>
        </KeyboardAvoidingView>  
      </View>
    ) 
}