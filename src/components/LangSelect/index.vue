<template>
  <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
    <div class="lang-selector">
      <svg-icon class-name="international-icon" icon-class="language" />
      <span class="lang-text">{{ language === 'zh' ? '中文' : 'English' }}</span>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item :disabled="language==='zh'" command="zh">
        中文
      </el-dropdown-item>
      <el-dropdown-item :disabled="language==='en'" command="en">
        English
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  computed: {
    language() {
      return this.$store.getters.language
    }
  },
  methods: {
    handleSetLanguage(lang) {
      this.$store.dispatch('app/setLanguage', lang)
      // 触发父组件事件，让父组件处理语言切换
      this.$emit('language-change', lang)

      const message = lang === 'zh' ? '切换语言成功' : 'Switch Language Success'
      this.$message({
        message: message,
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.international {
  cursor: pointer;
  font-size: 14px;
  color: #5a5e66;
  display: inline-flex;
  align-items: center;
  padding: 8px 6px;
  border-radius: 4px;
  transition: background-color 0.3s;
  height: 100%;
  line-height: 1;
}

.international:hover {
  background-color: rgba(0, 0, 0, .025);
}

.lang-selector {
  display: flex;
  align-items: center;
}

.international-icon {
  font-size: 16px;
  margin-right: 6px;
}

.lang-text {
  font-size: 14px;
}
</style>

