import { View, Text } from 'react-native'
import React from 'react'
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { Icon } from 'react-native-paper';


const DropdownMenu = ({ onEdit, onDelete, onHide, isComment = false }) => {
    return ( 
        <Menu onSelect={value => alert(`Selected number: ${value}`)}>
            <MenuTrigger style={{padding: 4}}><Icon source='dots-horizontal' size={30}></Icon></MenuTrigger>
            <MenuOptions>  
                <MenuOption className={'py-3 px-4 hover:bg-gray-100'} value={1} onSelect={onEdit}>
                    <Text className={('text-gray-800')}>{isComment ? 'Sửa bình luận' : 'Sửa bài viết'}</Text>
                </MenuOption>
                <MenuOption className={'py-3 px-4 hover:bg-gray-100'} value={2} onSelect={onDelete}>
                    <Text className={('text-gray-800')}>{isComment ? 'Xoá bình luận' : 'Xoá bài viết'}</Text>
                </MenuOption>
                <MenuOption className={'py-3 px-4 hover:bg-gray-100'} value={3} onSelect={onHide}>
                    <Text className={('text-gray-800')}>{isComment ? 'Ẩn bình luận' : 'Ẩn bài viết'}</Text>
                </MenuOption>
            </MenuOptions>
        </Menu>
    );
  };


export default DropdownMenu