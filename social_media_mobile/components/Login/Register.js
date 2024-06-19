import { KeyboardAvoidingView, ScrollView, Text, View, Image, Platform } from 'react-native'
import React, {useState, useEffect} from 'react'
import { HelperText, TextInput, TouchableRipple, Button } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown'; 
import * as ImagePicker from 'expo-image-picker'; 
import mime from 'mime';
import APIs, { endpoints } from '../../configs/APIs';
import { validateEmail, validatePassword } from '../../dao';
import SuccessModal from '../Modal/SuccessModal';

export default Register = ({navigation}) => { 
    const [user, setUser] = useState({})   
    const [errs, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [isShowPassword, setShowPassword] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
 

    const picker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('RentalMobile', 'Permissions Denied!');
        } else {
            let selectedImages = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1
            });

            if (!selectedImages.canceled) {   
                updateSate("avatar", selectedImages.assets[0]);
            }
        }
    };

    const updateSate = (field, value) => {
        setErrors({})
        setUser(current => {
            return {...current, [field]: value}
        });
    }

    // Post api to server for admin to commit register and send username and password thought email for student
    const register = async () => {
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
                setIsModalVisible(true)
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }
    const fields = [
        {
            "label": "Mã số sinh viên",
            "icon": "text",
            "name": "code"
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

    const validateStudentId = (studentId) => {
        const regex = /^\d{10}$/;
        return regex.test(studentId);
    }
    
    const validateName = (name) => {
        const regex = /^[A-Z][a-zA-Z]*$/;
        return regex.test(name);
    }
     
    
    const validateUsername = (username) => {
        const regex = /^[a-zA-Z0-9_]{3,16}$/;
        return regex.test(username);
    }

    const validateForm = () => {
        let validationErrors = {};

        if (!validateStudentId(user.code)) {
            validationErrors.code = 'Mã số sinh viên gồm 10 số.';
        }
        // if (!validateName(user.first_name)) {
        //     validationErrors.first_name = 'Họ không hợp lệ.';
        // }
        // if (!validateName(user.last_name)) {
        //     validationErrors.last_name = 'Tên không hợp lệ.';
        // }
        if (!validateEmail(user.email)) {
            validationErrors.email = 'Email không hợp lệ.';
        }
        // if (!validateUsername(user.username)) {
        //     validationErrors.username = 'Tên đăng nhập không hợp lệ.';
        // }
        if (!validatePassword(user.password)) {
            validationErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ số, một chữ cái viết hoa và một chữ cái thường';
        }
        if (user.password !== user.confirm) {
            validationErrors.confirm = 'Mật khẩu không khớp.';
        }

        if (!user.avatar) {
            validationErrors.avatar = 'Ảnh đại diện không được chống';
        }

        setErrors(validationErrors);
        console.log(validationErrors)

        if (Object.keys(validationErrors).length === 0) {
            // Handle form submission
            console.log('register')
            register()
        }
    }

    return (
      <View className=" bg-white">
        <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
            <ScrollView>
                <View className={'pt-8 mx-4'}>
                    <Text className='text-blue-500 text-center text-xl font-bold mb-4'>ĐĂNG KÝ</Text>  

                    {fields.map(c => 
                    <View key={c.name}>
                        <TextInput className={'bg-white'} secureTextEntry={c.secureTextEntry && !isShowPassword} value={user[c.name]} onChangeText={t => updateSate(c.name, t)} label={c.label} 
                        right={<TextInput.Icon onPress={() => setShowPassword(!isShowPassword)} icon={c.icon} />} />
                        {errs[c.name] && <Text className={`text-red-500`}>{errs[c.name]}</Text>} 
                    </View>   
                    )}
 

                    <View className='my-4 flex-row w-full items-center justify-between'>
                        <TouchableRipple className={'border bg-green-500 p-4 rounded mt-4'} onPress={picker}>
                            <Text className={'text-white'}>Chọn ảnh đại diện...</Text>
                        </TouchableRipple>

                        {user.avatar && 
                            <Image className='flex rounded-full w-40 h-40' source={{uri: user?.avatar?.uri}}/>  
                        }
                    </View> 
                    {errs['avatar'] && <Text className={`text-red-500`}>{errs['avatar']}</Text>} 

                    <Button className='text-white bg-blue-700  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'  icon="account" loading={loading} mode="contained" onPress={validateForm}>ĐĂNG KÝ</Button> 
                </View>
                <SuccessModal isModalVisible={isModalVisible} setIsModalVisible={()=> {}} successMessage={'Đăng ký thành công'} handleConfirm={() => navigation.navigate("Login")} confirmMessage={'Về trang đăng nhập'}></SuccessModal>
            </ScrollView>
        </KeyboardAvoidingView>  
      </View>
    ) 
}