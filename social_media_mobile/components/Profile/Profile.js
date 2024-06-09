import { View, Text } from 'react-native'
import React, {useContext} from 'react'
import { Button } from 'react-native-paper'
import { MyDispatchContext, MyUserContext } from '../../configs/Contexts';

export default function Profile() {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext); 

  return (
    <View>
      <Button icon="logout" onPress={() => dispatch({"type": "logout"})}>Đăng xuất</Button>
    </View>
  )
}