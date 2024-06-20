import { View, Text, KeyboardAvoidingView, ScrollView, TouchableOpacity, Platform } from 'react-native'
import React, { useState } from 'react'
import { HelperText, TextInput } from 'react-native-paper'
import SuccessModal from '../Modal/SuccessModal' 
import { validatePassword } from '../../dao'
import { useAuth } from '../../configs/Contexts'
import APIs, { authApi, endpoints } from '../../configs/APIs'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth } from '../../configs/firebase'
import LoadingScreen from '../LoadingScreen'

const EditPassword = ({navigation}) => { 
    const { user, updatePassword } = useAuth() 
    const client_id = process.env.CLIENT_ID 
    const client_secret = process.env.CLIENT_SECRET 
    const [loading, setLoading] = useState(false)
    const [userPass, setUserPass] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [err, setErr] = useState({
        isErr: false,
        errMessage: '',
        type: -1
    }) 

    const [isShowPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    })

    const handleUpdatePassword = async () => { 
        if (!err.isErr) {
          const access_token = await AsyncStorage.getItem('token')  
          setLoading(true)
          try{
            let form = new FormData() 
            
            form.append('current_password', userPass.oldPassword)
            form.append('new_password', userPass.newPassword)
            console.log(form)
            const res = await authApi(access_token).patch(endpoints['change_password'], form, {
              headers: {
                'Content-Type': 'multipart/form-data'
              } 
            }) 
            console.log(res.data)
            console.log('updated password')   
            if (res.status == 200) {
              console.log('updating')
              const tokenRes = await APIs.post(endpoints['get_token'],
                  new URLSearchParams({
                      'grant_type': 'password',
                      'client_id': client_id,
                      'client_secret': client_secret,
                      'username': user.username,
                      'password': userPass.newPassword
                  }), 
                  {
                      headers: {
                          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                      }
                  }
              ) 
              console.log(tokenRes.data)
              const new_access_token = tokenRes.data.access_token
              if (tokenRes.status == 200) {
                  const userRes = await authApi(new_access_token).get(endpoints['current_user'])
                  console.log(userRes.data)  
                  if (userRes.status == 200) {
                      updatePassword(userRes.data, new_access_token) 
                      console.log('update success') 
                      setLoading(false)
                      navigation.goBack()
                  }
              } 
            }

          } catch (error) { 
            console.error(error, ) 
            setIsModalVisible(false)
            setLoading(false) 
            if (error.response.data.error == 'Wrong password') {
              setErr({
                isErr: true,
                errMessage: 'Mật khẩu cũ sai',
                type: 0
              }) 
            } else {
              setErr({
                isErr: true,
                errMessage: 'Mật khẩu mới không được trùng mật khẩu cũ',
                type: 3
              }) 
            }
          } 
          }   
    } 

    const handleValidate = async () => { 
      if (!validatePassword(userPass.newPassword)) {  
        setErr({
            isErr: true,
            errMessage: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ số, một chữ cái viết hoa và một chữ cái thường',
            type: 1
        })   
      } else if (userPass.newPassword !== userPass.confirmPassword)  {
          
              setErr({
                  isErr: true,
                  errMessage: 'Xác nhân mật khẩu sai',
                  type: 2
              })    
      } else if (!err.isErr) {
          setIsModalVisible(true) 
      } 
    }

    const updateSate = (field, value) => {  
        setErr({
            isErr: false,
            errMessage: '',
            type: -1
        })
        setUserPass(current => {
            return {...current, [field]: value}
        });
    }
  if (loading) {
    return (
      <LoadingScreen></LoadingScreen>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> 
      <ScrollView>
        <View className={('flex-1 p-4 bg-white')}>
          <Text className={('text-lg font-bold mb-4')}>Sửa mật khẩu</Text>

          <View className={('mb-4')}>
            <TextInput
              className={(` border-b-2 no-underline ${(err.isErr && err.type==0) && 'border-red-500'} bg-white `)}
              value={userPass.oldPassword} 
              underlineColor="transparent" 
              underlineColorAndroid={'transparent'}
              onChangeText={(t) => updateSate('oldPassword',t)}
              placeholder="Mật khẩu cũ"
              secureTextEntry={!isShowPassword.oldPassword}
              right={<TextInput.Icon onPress={() => setShowPassword({...isShowPassword, oldPassword:!isShowPassword.oldPassword})} icon='eye-outline' />}
            />
            {(err.isErr && err.type==0) && 
                <Text className={('text-red-500 text-sm mb-2')}>{err.errMessage}</Text> 
            }

          </View>

          <View className={('mb-4')}>
            {/* <Text className={('text-sm mb-2')}>Mật khẩu mới</Text> */}
            <TextInput
              className={(`${(err.isErr && err.type==1) && 'border-red-500'} border-b-2`)}
              value={userPass.newPassword} 
              underlineColor="transparent"
              onChangeText={(t) => updateSate('newPassword',t)}
              placeholder="Mật khẩu mới"  
              secureTextEntry={!isShowPassword.newPassword}
              right={<TextInput.Icon onPress={() => setShowPassword({...isShowPassword, newPassword:!isShowPassword.newPassword})} icon='eye-outline' />}
            />
            
            {(err.isErr && (err.type==1 || err.type==3)) && 
                <Text className={('text-red-500 text-sm mb-2')}>{err.errMessage}</Text> 
            }
          </View> 
          
          <View className={('mb-4')}>
            {/* <Text className={('text-sm mb-2')}>Xác nhận mật khẩu</Text> */}
            <TextInput
              className={(`${(err.isErr && err.type==2) && 'border-red-500'} border-b-2`)}
              value={userPass.confirmPassword} 
              underlineColor="transparent"
              underlineColorAndroid={'transparent'}
              onChangeText={(t) => updateSate('confirmPassword',t)}
              placeholder="Xác nhận mật khẩu" 
              secureTextEntry={!isShowPassword.confirmPassword}
              right={<TextInput.Icon onPress={() => setShowPassword({...isShowPassword, confirmPassword:!isShowPassword.confirmPassword})} icon='eye-outline' />}
            />
            
            {(err.isErr && err.type==2) && 
                <Text className={('text-red-500 text-sm mb-2')}>{err.errMessage}</Text> 
            }
          </View>  

          <TouchableOpacity onPress={handleValidate} className={('bg-blue-500 p-4 rounded')}>
            <Text className={('text-center text-white font-bold')}>Đổi mật khẩu</Text>
          </TouchableOpacity> 
          <SuccessModal handleConfirm={handleUpdatePassword} handleCancel={() => setIsModalVisible(false)} isModalVisible={isModalVisible} successMessage={'Xác nhận đổi mật khẩu mới?'} confirmMessage={'Lưu'} cancelMessage={'Huỷ'}></SuccessModal>
        </View> 
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default EditPassword