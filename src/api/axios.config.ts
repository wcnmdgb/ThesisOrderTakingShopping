import Axios, { AxiosResponse } from 'axios'

import useUserStore from '@/store/modules/user'

import router from '@/router'
export const CONTENT_TYPE = 'Content-Type'
export const baseURL = import.meta.env.VITE_BASEURL as string

export const FORM_URLENCODED = 'application/x-www-form-urlencoded; charset=UTF-8'

export const APPLICATION_JSON = 'application/json; charset=UTF-8'

export const TEXT_PLAIN = 'text/plain; charset=UTF-8'

console.log('beseURl' + baseURL)
const service = Axios.create({
  baseURL,
  timeout: 10 * 60 * 1000,
  withCredentials: false, // 跨域请求时发送cookie
})

service.interceptors.request.use(
  (config) => {
    if (config.url !== `/user/login`) {
      config.headers['Authorization'] = useUserStore().token
    }
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200) {
      return response
    } else {
      throw new Error(response.status.toString())
    }
  },
  (error) => {
    if (error.response.status === 401) {
      alert('登陆失效需要重新登陆')
      router.replace({
        path: '/login',
      })
      throw Promise.reject({ code: 401, msg: '用户信息异常' })
    } else {
      if (import.meta.env.MODE === 'development') {
        console.log(error)
      }
      return Promise.reject({ code: 500, msg: '服务器异常，请稍后重试…' })
    }
  }
)

export default service
