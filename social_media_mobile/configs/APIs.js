import axios from 'axios'

const BASE_URL = 'https://hungts.pythonanywhere.com/'

export const endpoints = {
    'register': '/users/',
    'login': '/o/token/',
    'current_user': '/users/current-user/',
    'posts': '/posts/',
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