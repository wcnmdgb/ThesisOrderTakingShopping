import axios, { AxiosResponse } from 'axios'
import request from './axios.config'
import { baseAddress } from '@/api/url'

export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  count: number | 0
  code: string
  msg: string
  data: T
  pageSize: number | 20
  pageNo: number | 1
}

function http<T = any>({ url, data, method, headers, beforeRequest, afterRequest }: HttpOption) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    if (String(res.data.code) === '000') {
      return res.data
    } else {
      return res.data
    }
    // throw new Error(res.msg || '请求失败，未知异常')
  }
  const failHandler = (error: Response<Error>) => {
    afterRequest && afterRequest()
    // window.$message.success('Cause you walked hand in hand With another man in my place')
    throw new Error(error.msg.toString() || '请求失败，未知异常')
  }

  beforeRequest && beforeRequest()
  method = method || 'GET'
  const params = Object.assign(typeof data === 'function' ? data() : data || {}, {})
  console.log(method)
  return method === 'GET'
    ? request.get(url, { params }).then(successHandler, failHandler)
    : method === 'POST'
    ? request.post(url, params, { headers: headers }).then(successHandler, failHandler)
    : method === 'PUT'
    ? request.put(url, params, { headers: headers }).then(successHandler, failHandler)
    : request.delete(url, { params }).then(successHandler, failHandler)
}

export function get<T = any>({
  url,
  data,
  method = 'GET',
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    beforeRequest,
    afterRequest,
  })
}

export function post<T = any>({
  url,
  data,
  method = 'POST',
  headers,
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    beforeRequest,
    afterRequest,
  })
}
export function deleteT<T = any>({
  url,
  data,
  method = 'DELETE',
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    beforeRequest,
    afterRequest,
  })
}
export function put<T = any>({
  url,
  data,
  method = 'PUT',
  headers,
  beforeRequest,
  afterRequest,
}: HttpOption): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    beforeRequest,
    afterRequest,
  })
}
function install(app: any): void {
  app.config.globalProperties.$http = http

  app.config.globalProperties.$get = get

  app.config.globalProperties.$post = post
  app.config.globalProperties.$i = baseAddress
}

export default {
  install,
  get,
  post,
  put,
  deleteT,
}

declare module '@vue/runtime-core' {
  // 为 `this.$` 提供类型声明
  interface ComponentCustomProperties {
    $get: (options: HttpOption) => Promise<Response>
    $post: (options: HttpOption) => Promise<Response>
  }
}
