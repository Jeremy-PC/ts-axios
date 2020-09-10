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
  headers?: any
  responseType?: XMLHttpRequestResponseType
}

export interface AxiosResponse {
  data: any
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

export interface AxiosPromise extends Promise<AxiosResponse> {

}
