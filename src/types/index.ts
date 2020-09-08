export type Method =
  | 'get'
  | 'delete'
  | 'post'
  | 'put'
  | 'head'
  | 'path'
  | 'options'
  | 'GET'
  | 'DELETE'
  | 'POST'
  | 'PUT'
  | 'HEAD'
  | 'PATH'
  | 'OPTIONS'

export interface AxiosRequestConfig {
  url: string
  method?: Method
  data?: any
  params?: any
}
