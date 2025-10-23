// 国际化混入
import { t } from '@/lang'

export default {
  computed: {
    currentLanguage() {
      return this.$store.getters.language || 'zh'
    }
  },
  methods: {
    // 翻译方法
    $t(key) {
      return t(key, this.currentLanguage)
    }
  }
}
