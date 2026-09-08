import axios from 'axios'
import ApiError from '../utlis/appiError.js'

const endPoints = {
    LOGIN: {
        url: '/auth/login',
        auth: false
    },
    REGISTER: {
        url: '/auth/register',
        auth: false
    },
    REFRESH: {
        url: '/auth/refresh',
        auth: false
    },
    PayOrder: {
        url: '/payment/create-order',
        auth: true
    },
    CapturePayment: {
        url: '/payment/capture',
        auth: true
    }
}

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})

const getToken = () => {
    return localStorage.getItem('accesstoken')
}

const unauthorize = () => {
    localStorage.removeItem('accesstoken')
    localStorage.removeItem('refreshtoken')
    window.location.href = '/login'
}

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshtoken')
    if (!refreshToken) {
        throw new Error('Refresh token not found')
    }

    const res = await api.post(endPoints.REFRESH.url, { refreshToken })
    localStorage.setItem('accesstoken', res.data.data.accessToken)
    if (res.data.data.refreshToken) {
        localStorage.setItem('refreshtoken', res.data.data.refreshToken)
    }
    return res.data.data.accessToken
}

const getHeader = (auth) => {
    const headers = {}
    if (auth) {
        headers.Authorization = `Bearer ${getToken()}`
    }
    return headers
}


const handleError = (error) => {
    if (!error.response) {
        throw new ApiError("Unable to connect to server. Please try again.")
    }
    const { status, data } = error.response;


    if (Array.isArray(data.errors) && data.errors.length) {
        throw new ApiError(
            data.message || "validation error",
            data.errors,
            status
        )
    }
    throw new ApiError(
        data.message || "Soemthign went wrong",
        [],
        status
    )

}

const post = async (url, data = {}, auth = false) => {
    try {
        const res = await api.post(url, data, {
            headers: getHeader(auth)
        })
        return res.data
    } catch (error) {
        if (error.response?.status === 401 && auth && url !== endPoints.REFRESH.url) {
            try {
                await refreshAccessToken()
                const res = await api.post(url, data, {
                    headers: getHeader(true)
                })
                return res.data
            } catch (refreshError) {
                unauthorize()
                throw refreshError
            }
        }
        handleError(error)
    }
}

const Login = (data) => {
    return post(endPoints.LOGIN.url, data, endPoints.LOGIN.auth)
}
const Register = (data) => {
    return post(endPoints.REGISTER.url, data, endPoints.REGISTER.auth)
}

const MakePayemnt = (data) => {
    return post(endPoints.PayOrder.url, data, endPoints.PayOrder.auth)
}
const capturePayment = (data) => {
    return post(endPoints.CapturePayment.url, data, endPoints.CapturePayment.auth)
}
export default {
    Login,
    Register,
    MakePayemnt,
    capturePayment
}