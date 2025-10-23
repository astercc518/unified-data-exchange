<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <i class="el-icon-warning-outline" />
      </div>
      <h3 class="error-title">页面出现错误</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="reload">刷新页面</el-button>
        <el-button @click="goHome">返回首页</el-button>
        <el-button type="text" @click="showDetails = !showDetails">
          {{ showDetails ? '隐藏' : '显示' }}详情
        </el-button>
      </div>
      <div v-if="showDetails" class="error-details">
        <el-collapse>
          <el-collapse-item title="错误详情" name="1">
            <pre>{{ errorDetails }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ErrorBoundary',
  data() {
    return {
      hasError: false,
      errorMessage: '',
      errorDetails: '',
      showDetails: false
    }
  },
  errorCaptured(err, instance, info) {
    this.hasError = true
    this.errorMessage = err.message || '未知错误'
    this.errorDetails = `${err.stack}\n\nVue Info: ${info}`

    // 记录错误日志
    console.error('[ErrorBoundary] Caught error:', err)
    console.error('[ErrorBoundary] Component info:', info)

    // 可以在这里发送错误报告到服务器
    this.reportError(err, info)

    return false
  },
  methods: {
    reload() {
      window.location.reload()
    },
    goHome() {
      this.$router.push('/')
    },
    reportError(error, info) {
      // 模拟错误报告
      const errorReport = {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        componentInfo: info
      }

      // 在实际项目中，这里可以发送到错误监控服务
      console.log('[ErrorReport]', errorReport)
    },
    reset() {
      this.hasError = false
      this.errorMessage = ''
      this.errorDetails = ''
      this.showDetails = false
    }
  }
}
</script>

<style lang="scss" scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 20px;

  .error-content {
    text-align: center;
    max-width: 500px;

    .error-icon {
      font-size: 64px;
      color: #f56c6c;
      margin-bottom: 20px;
    }

    .error-title {
      font-size: 24px;
      color: #303133;
      margin-bottom: 12px;
    }

    .error-message {
      font-size: 14px;
      color: #606266;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .error-actions {
      margin-bottom: 20px;

      .el-button {
        margin: 0 4px;
      }
    }

    .error-details {
      text-align: left;
      margin-top: 20px;

      pre {
        background-color: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.4;
        overflow-x: auto;
        max-height: 300px;
      }
    }
  }
}
</style>
