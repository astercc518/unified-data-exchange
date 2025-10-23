// 路由国际化工具
import { t } from '@/lang'

// 递归翻译路由标题
function translateRouteTitle(routes, lang) {
  return routes.map(route => {
    const translatedRoute = { ...route }

    if (route.meta && route.meta.title) {
      // 如果title包含点号，说明是国际化key
      if (route.meta.title.includes('.')) {
        translatedRoute.meta = {
          ...route.meta,
          title: t(route.meta.title, lang)
        }
      }
    }

    if (route.children && route.children.length > 0) {
      translatedRoute.children = translateRouteTitle(route.children, lang)
    }

    return translatedRoute
  })
}

export { translateRouteTitle }
