const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  language: state => state.app.language,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  loginAccount: state => state.user.loginAccount,
  id: state => state.user.id,
  type: state => state.user.type,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  addRoutes: state => state.permission.addRoutes,
  errorLogs: state => state.errorLog.logs,
  // 用户完整信息对象
  userInfo: state => ({
    id: state.user.id,
    type: state.user.type,
    name: state.user.name,
    loginAccount: state.user.loginAccount,
    avatar: state.user.avatar,
    introduction: state.user.introduction,
    roles: state.user.roles
  })
}
export default getters
