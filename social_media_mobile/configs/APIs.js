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