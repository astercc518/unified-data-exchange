import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
// import enLang from 'element-ui/lib/locale/lang/en' // 使用中文时无需引入英文语言包
import enLang from 'element-ui/lib/locale/lang/en'
import zhLang from 'element-ui/lib/locale/lang/zh-CN'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

// 引入国际化混入
import i18nMixin from '@/mixins/i18n'

// 性能优化
import { preloadComponents } from '@/utils/performance'

// 全局注册国际化混入
Vue.mixin(i18nMixin)

// 开发环境性能优化
if (process.env.NODE_ENV === 'development') {
  // 禁用生产提示
  Vue.config.productionTip = false

  // 开发环境下关闭性能追踪，减少开销
  Vue.config.performance = false

  // 移除预加载，避免首次加载过慢
  // preloadComponents(['dashboard/index', 'user/list', 'agent/list'])
}

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// 动态设置 Element UI 语言
function getElementLocale(lang) {
  const localeMap = {
    'en': enLang,
    'zh': zhLang
  }
  return localeMap[lang] || zhLang
}

// 初始化语言
const currentLang = Cookies.get('language') || 'zh'

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  locale: getElementLocale(currentLang)
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
