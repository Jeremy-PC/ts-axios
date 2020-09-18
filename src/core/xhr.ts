import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error';
import { isURLSameOrigin } from '../helpers/url';
import { isFormData } from '../helpers/util'
import cookie from '../helpers/cookie';

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
      const {
        data = null,
        url,
        method = 'get',
        headers,
        responseType,
        timeout,
        cancelToken,
        withCredentials,
        xsrfCookieName,
        xsrfHeaderName,
        onDownloadProgress,
        onUploadProgress,
        auth,
        validateStatus
      } = config
      // 创建http请求对象
      const request = new XMLHttpRequest()
      configureRequest()
      addEvents()
      processHeaders()
      processCancel()
      // 打开网络数据发送请求
      request.open(method.toUpperCase(), url!, true)
      // 发起请求
      request.send(data)

      // 发送请求的数据处理
      function configureRequest(): void {
        if (responseType) {
          request.responseType = responseType
        }
        if (timeout) {
          request.timeout = timeout
        }
        if (withCredentials) {
          request.withCredentials = withCredentials
        }
      }
      // 发送请求的事件处理
      function addEvents(): void {
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
        if (onDownloadProgress) {
          request.onprogress = onDownloadProgress
        }
        if (onUploadProgress) {
          request.upload.onprogress = onUploadProgress
        }
      }
      // 发送请求的头部处理
      function processHeaders(): void {
        if (isFormData(data)) {
          delete headers['Content-Type']
        }
        if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
          const xsrfValue = cookie.read(xsrfCookieName)
          if (xsrfValue && xsrfHeaderName) {
            headers[xsrfHeaderName] = xsrfValue
          }
        }
        if (auth) {
          headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
        }
        Object.keys(headers).forEach((name) => {
          if (data === null && name.toUpperCase() === 'content-type') {
            delete headers[name]
          } else {
            request.setRequestHeader(name, headers[name])
          }
        })
      }
      // 发送请求的取消处理
      function processCancel(): void {
        if (cancelToken) {
          cancelToken.promise.then((reason) => {
            request.abort()
            reject(reason)
          })
        }
      }
      // 响应请求的数据处理
      function handleResponse(response: AxiosResponse): void {
        if (!validateStatus || validateStatus(response.status)) {
          resolve(response)
        } else {
          reject(createError(`Request failed with status code ${response.status}`, config, null, request, response))
        }
      }
  })
}