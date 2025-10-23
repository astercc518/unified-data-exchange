import Cookies from 'js-cookie'

// Element UI 语言包
let enLang, zhLang
try {
  enLang = require('element-ui/lib/locale/lang/en').default
  zhLang = require('element-ui/lib/locale/lang/zh-CN').default
} catch (e) {
  console.warn('Element UI locale not found')
}

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium',
  language: Cookies.get('language') || 'zh'
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language
    Cookies.set('language', language)
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language)

    // 动态切换 Element UI 语言
    if (typeof window !== 'undefined') {
      const Vue = require('vue').default
      const Element = require('element-ui').default

      const localeMap = {
        'en': enLang,
        'zh': zhLang
      }

      const locale = localeMap[language] || zhLang

      // 重新配置 Element UI
      Vue.use(Element, {
        size: Cookies.get('size') || 'medium',
        locale: locale
      })
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
