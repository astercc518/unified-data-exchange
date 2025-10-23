<script>
import { t } from '@/lang'
import store from '@/store'

export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon, title } = context.props
    const vnodes = []

    if (icon) {
      if (icon.includes('el-icon')) {
        vnodes.push(<i class={[icon, 'sub-el-icon']} />)
      } else {
        vnodes.push(<svg-icon icon-class={icon}/>)
      }
    }

    if (title) {
      // 获取当前语言
      const currentLang = store.getters.language || 'zh'
      // 如果是国际化key（包含点号），则翻译；否则直接显示
      const displayTitle = title.includes('.') ? t(title, currentLang) : title
      vnodes.push(<span slot='title'>{displayTitle}</span>)
    }
    return vnodes
  }
}
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}
</style>
