import { login, getInfo, logout } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  id: '',
  type: '',
  name: '',
  loginAccount: '',
  avatar: '',
  introduction: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_TYPE: (state, type) => {
    state.type = type
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_LOGIN_ACCOUNT: (state, loginAccount) => {
    state.loginAccount = loginAccount
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      console.log('🔄 开始登录验证，使用数据库模式...')

      // 直接使用后端数据库登录API
      login({ username: username.trim(), password: password })
        .then(response => {
          const { data } = response

          if (data && data.token) {
            commit('SET_TOKEN', data.token)
            setToken(data.token)
            console.log('✅ 数据库登录成功')
            resolve()
          } else {
            reject(new Error('登录响应数据异常'))
          }
        })
        .catch(error => {
          console.error('❌ 数据库登录失败:', error.message)

          // 检查是否是网络超时错误
          if (error.message && error.message.includes('timeout')) {
            reject(new Error('登录请求超时，请检查网络连接或后端服务是否正常运行'))
          } else if (error.message && error.message.includes('Network Error')) {
            reject(new Error('网络错误，无法连接到后端服务'))
          } else {
            reject(new Error('用户名或密码错误'))
          }
        })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      console.log('🔄 从数据库获取用户信息...')

      // 直接从后端数据库获取用户信息
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { roles, id, type, name, loginAccount, avatar, introduction } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_ID', id)
        commit('SET_TYPE', type)
        commit('SET_NAME', name)
        commit('SET_LOGIN_ACCOUNT', loginAccount || name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)

        console.log('✅ 数据库用户信息加载成功')
        resolve(data)
      }).catch(err => {
        console.error('❌ 获取用户信息失败:', err)
        reject(err)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      console.log('🔄 执行数据库登出操作...')

      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        dispatch('tagsView/delAllViews', null, { root: true })

        console.log('✅ 数据库登出成功')
        resolve()
      }).catch(err => {
        // 即使后端登出失败，也要清理本地状态
        console.warn('登出失败:', err.message || err)
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        dispatch('tagsView/delAllViews', null, { root: true })
        resolve()
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
