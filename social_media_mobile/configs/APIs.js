import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/'

export const endpoints = {
    'register': '/users/',
    'login': '/oauth/token/',
    'current_user': '/users/current_user'
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