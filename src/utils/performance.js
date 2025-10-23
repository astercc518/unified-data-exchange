/**
 * 性能优化工具类
 */

/**
 * 路由懒加载优化
 * @param {string} component 组件路径
 * @param {string} name 组件名称
 * @returns {Function} 懒加载函数
 */
export function lazyLoad(component, name) {
  return () => {
    return new Promise((resolve) => {
      const start = Date.now()
      import(`@/views/${component}`)
        .then((module) => {
          const loadTime = Date.now() - start
          if (process.env.NODE_ENV === 'development' && loadTime > 1000) {
            console.warn(`组件 ${name} 加载时间过长: ${loadTime}ms`)
          }
          resolve(module)
        })
        .catch((error) => {
          console.error(`组件 ${name} 加载失败:`, error)
          // 返回错误页面或空组件
          resolve(() => import('@/views/error-page/404'))
        })
    })
  }
}

/**
 * 组件预加载
 * @param {Array} components 需要预加载的组件路径数组
 */
export function preloadComponents(components) {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境延迟预加载，避免影响初始加载
    setTimeout(() => {
      components.forEach(component => {
        import(`@/views/${component}`).catch(() => {
          // 忽略预加载失败
        })
      })
    }, 2000)
  }
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间限制
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 图片懒加载
 * @param {HTMLElement} img 图片元素
 * @param {string} src 图片源地址
 */
export function lazyLoadImage(img, src) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target
        image.src = src
        image.classList.remove('lazy')
        observer.unobserve(image)
      }
    })
  })
  observer.observe(img)
}
