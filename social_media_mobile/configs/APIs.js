import axios from 'axios'

const BASE_URL = 'https://hungts.pythonanywhere.com/'

export const endpoints = {
    'register': '/users/',
    'login': '/o/token/',
    'current_user': '/users/current-user/',
    'posts': '/posts/',
    'users_id': (id) => `/users/?id=${id}`,
    'get_messages': (id) => `/rooms/${id}/messages/`,
    'add_messages': (id) => `/rooms/${id}/messages/`,
    'rooms': '/rooms/', 
    'room_id': (id) => `/rooms/${id}`,
    'comments': '/comments/',
    'posts_comments': (id) => `/posts/${id}/comments/`,
    'current_user_posts': '/posts/current-user/',
    'add_post': '/posts/add_post/',
    'add_comment': (id) => `/posts/${id}/comments/`,
    'user_rooms': '/users/current-user/rooms/',
    'delete_post': (id) => `/posts/${id}/`
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