import axios from 'axios'

const BASE_URL = 'https://hungts.pythonanywhere.com/'

export const endpoints = {
    'register': '/register_alumni/',
    'login': '/login/',
    'get_token': '/o/token/',
    'current_user': '/users/current-user/',
    'posts': '/posts/',
    'users_id': (id) => `/users/${id}/`,
    'get_messages': (id) => `/rooms/${id}/messages/`,
    'add_messages': (id) => `/rooms/${id}/messages/`,
    'rooms': '/rooms/', 
    'room_id': (id) => `/rooms/${id}/`,
    'comments': '/comments/',
    'posts_comments': (id) => `/posts/${id}/comments/`,
    'current_user_posts': '/posts/current-user/',
    'add_post': '/posts/add_post/',
    'add_comment': (id) => `/posts/${id}/comments/`,
    'user_rooms': '/users/current-user/rooms/',
    'delete_post': (id) => `/posts/${id}/delete/`,
    'like_post': (id) => `/posts/${id}/like/`,
    'delete_comment': (id) => `comments/${id}/delete/`,
    'update_comment': (id) => `/comments/${id}/`,
    'get_like_type': '/like_types/',
    'create_room': '/rooms/add_room/',
    'add_user_to_room_by_id': (id) => `/rooms/${id}/add_user/`,
    'like_comment': (id) => `/comments/${id}/like/`,
    'post_likes': (id) => `/posts/${id}/likes/`,
    'post_by_id': (id) => `/posts/${id}/`,
    'posts_user_liked_by_id': (id) => `/users/${id}/posts_liked/`,
    'chat_with_target_user': `/users/current-user/add_room/`,
    'all_users': `/users/`,
    'change_password': '/users/current-user/change_password/',
    'create_group': '/group/add_group/',
    'get_groups': '/group/'
}

export const authApi = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});