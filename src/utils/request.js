import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // 在开发环境下使用 /dev-api，由 vue.config.js 代理转发到 http://localhost:3000
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 120000 // request timeout - 增加到120秒(2分钟)，支持大数据量生成（如30W+数据）
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // 添加Token到请求头 - 使用Authorization Bearer标准格式
      // 后端API需要的是Authorization: Bearer TOKEN
      config.headers['Authorization'] = `Bearer ${getToken()}`
      // 保留X-Token以兼容现有逻辑
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // 对于 health 和 stats 等特殊API，直接返回数据
    if (res.status === 'ok' || res.success === true) {
      return res
    }

    // 兼容多种成功响应格式
    // code: 20000 (旧格式) 或 code: 200 (新格式) 或 success: true
    if (res.code === 20000 || res.code === 200 || res.success === true) {
      return res
    }

    // if the custom code is not 20000, it is judged as an error.
    Message({
      message: res.message || 'Error',
      type: 'error',
      duration: 5 * 1000
    })

    // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
    if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      // to re-login
      MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        confirmButtonText: 'Re-Login',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
    }
    return Promise.reject(new Error(res.message || 'Error'))
  },
  error => {
    console.log('请求错误:', error) // for debug

    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      Message({
        message: '身份验证失败，请重新登录',
        type: 'error',
        duration: 3 * 1000
      })

      // 清除Token并跳转到登录页
      store.dispatch('user/resetToken').then(() => {
        location.reload()
      })

      return Promise.reject(new Error('身份验证失败'))
    }

    // 处理403权限不足错误
    if (error.response && error.response.status === 403) {
      const errorMsg = error.response.data?.message || '权限不足，无法访问该资源'
      Message({
        message: errorMsg,
        type: 'error',
        duration: 5 * 1000
      })

      return Promise.reject(new Error(errorMsg))
    }

    // 处理404错误
    if (error.response && error.response.status === 404) {
      const errorMsg = error.response.data?.message || '请求的资源不存在'
      Message({
        message: errorMsg,
        type: 'error',
        duration: 3 * 1000
      })

      return Promise.reject(new Error(errorMsg))
    }

    // 其他错误
    const errorMsg = error.response?.data?.message || error.message || '请求失败'
    Message({
      message: errorMsg,
      type: 'error',
      duration: 5 * 1000
    })

    return Promise.reject(error)
  }
)

export default service
