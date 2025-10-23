/**
 * 全局加载状态管理
 */
export const LoadingManager = {
  loadingStacks: new Map(),

  /**
   * 显示加载状态
   * @param {string} key 加载键
   * @param {string} message 加载消息
   */
  show(key, message = '加载中...') {
    this.loadingStacks.set(key, {
      message,
      startTime: Date.now()
    })
    this.updateGlobalLoading()
  },

  /**
   * 隐藏加载状态
   * @param {string} key 加载键
   */
  hide(key) {
    const loadingInfo = this.loadingStacks.get(key)
    if (loadingInfo) {
      const duration = Date.now() - loadingInfo.startTime
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Loading] ${key} completed in ${duration}ms`)
      }
      this.loadingStacks.delete(key)
    }
    this.updateGlobalLoading()
  },

  /**
   * 更新全局加载状态
   */
  updateGlobalLoading() {
    const hasLoading = this.loadingStacks.size > 0
    // 可以在这里更新全局加载指示器
    if (hasLoading) {
      document.body.classList.add('global-loading')
    } else {
      document.body.classList.remove('global-loading')
    }
  }
}

/**
 * 错误处理管理器
 */
export const ErrorManager = {
  /**
   * 处理API错误
   * @param {Error} error 错误对象
   * @param {Object} context 上下文信息
   */
  handleApiError(error, context = {}) {
    console.error('[API Error]', error, context)

    // 根据错误类型显示不同的提示
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          this.showError('登录已过期，请重新登录')
          // 可以在这里跳转到登录页
          break
        case 403:
          this.showError('权限不足，无法执行此操作')
          break
        case 404:
          this.showError('请求的资源不存在')
          break
        case 500:
          this.showError('服务器内部错误，请稍后重试')
          break
        default:
          this.showError(data.message || '网络请求失败')
      }
    } else if (error.request) {
      this.showError('网络连接失败，请检查网络设置')
    } else {
      this.showError('请求配置错误')
    }
  },

  /**
   * 显示错误提示
   * @param {string} message 错误消息
   */
  showError(message) {
    // 这里可以集成 Element UI 的 Message 组件
    if (window.Vue && window.Vue.prototype.$message) {
      window.Vue.prototype.$message.error(message)
    } else {
      console.error('[Error]', message)
    }
  }
}

/**
 * 本地存储管理器
 */
/**
 * 数据验证器
 */
export const Validator = {
  /**
   * 验证邮箱格式
   * @param {string} email 邮箱地址
   * @returns {boolean} 是否有效
   */
  isEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(email)
  },

  /**
   * 验证手机号格式
   * @param {string} phone 手机号
   * @returns {boolean} 是否有效
   */
  isPhone(phone) {
    const pattern = /^1[3-9]\d{9}$/
    return pattern.test(phone)
  },

  /**
   * 验证密码强度
   * @param {string} password 密码
   * @returns {Object} 验证结果
   */
  validatePassword(password) {
    const result = {
      valid: false,
      strength: 'weak',
      messages: []
    }

    if (password.length < 6) {
      result.messages.push('密码长度至少6位')
    }

    if (password.length >= 8) {
      result.strength = 'medium'
    }

    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      result.strength = 'strong'
    }

    result.valid = password.length >= 6

    return result
  }
}

/**
 * 文件处理工具
 */
export const FileUtils = {
  /**
   * 格式化文件大小
   * @param {number} bytes 字节数
   * @returns {string} 格式化的文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 验证文件类型
   * @param {File} file 文件对象
   * @param {Array} allowedTypes 允许的文件类型
   * @returns {boolean} 是否有效
   */
  validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type)
  },

  /**
   * 读取文件内容
   * @param {File} file 文件对象
   * @returns {Promise<string>} 文件内容
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }
}
