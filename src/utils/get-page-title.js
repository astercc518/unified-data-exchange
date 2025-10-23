import defaultSettings from '@/settings'
import { t } from '@/lang'
import store from '@/store'

const title = defaultSettings.title || 'Vue Element Admin'

export default function getPageTitle(pageTitle) {
  const currentLang = store.getters.language || 'zh'

  if (pageTitle) {
    // 如果是国际化key，则翻译
    const translatedTitle = pageTitle.includes('.') ? t(pageTitle, currentLang) : pageTitle
    return `${translatedTitle} - ${title}`
  }
  return `${title}`
}
