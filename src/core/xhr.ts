import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error';

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
      const { data = null, url, method = 'get', headers, responseType, timeout } = config
      // 创建http请求对象
      const request = new XMLHttpRequest()
      // 处理发送的数据
      if (responseType) {
        request.responseType = responseType
      }
      if (timeout) {
        request.timeout = timeout
      }

      Object.keys(headers).forEach((name) => {
        if (data === null && name.toUpperCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
      // 打开网络数据发送请求
      request.open(method.toUpperCase(), url!, true)
      // 发送数据成功，并成功获取响应数据
      request.onreadystatechange = function handleLoad() {
        if (request.readyState !== 4) {
          return
        }
        if (request.status === 0) {
          return
        }
        const responseHeaders = parseHeaders(request.getAllResponseHeaders())
        const responseData = responseType !== 'text' ? request.response : request.responseText
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }
        handleResponse(response)
      }
      // 发送数据异常
      request.onerror = function handleError() {
        reject(createError('Network Error', config, null, request))
      }
      // 发送超时
      request.ontimeout = function handleTimeout() {
        reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
      }
      // 发起请求
      request.send(data)
      // 处理响应数据
      function handleResponse(response: AxiosResponse): void {
        if (response.status >= 200 && response.status < 300) {
          resolve(response)
        } else {
          reject(createError(`Request failed with status code ${response.status}`, config, null, request, response))
        }
      }
  })
}