<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>安全管理</span>
      </div>

      <el-form
        ref="securityForm"
        :model="securityForm"
        label-width="140px"
        style="max-width: 800px; margin: 20px auto;"
      >
        <el-divider content-position="left">密码安全</el-divider>

        <el-form-item label="密码安全等级">
          <el-radio-group v-model="securityForm.passwordLevel">
            <el-radio label="low">低 (6位以上)</el-radio>
            <el-radio label="medium">中 (8位以上，包含数字和字母)</el-radio>
            <el-radio label="high">高 (10位以上，包含数字、字母和特殊字符)</el-radio>
          </el-radio-group>
          <div class="form-tip">
            设置用户密码的最低安全要求
          </div>
        </el-form-item>

        <el-divider content-position="left">登录限制</el-divider>

        <el-form-item label="IP限制">
          <el-switch
            v-model="securityForm.ipRestriction"
            active-text="启用"
            inactive-text="禁用"
          />
          <div class="form-tip">
            启用后只有白名单IP可以登录系统（默认不限制）
          </div>
        </el-form-item>

        <el-form-item v-if="securityForm.ipRestriction" label="允许的IP地址">
          <el-tag
            v-for="(ip, index) in securityForm.allowedIps"
            :key="index"
            closable
            style="margin-right: 10px; margin-bottom: 10px;"
            @close="removeIp(index)"
          >
            {{ ip }}
          </el-tag>
          <el-input
            v-if="ipInputVisible"
            ref="ipInput"
            v-model="ipInput"
            class="input-new-ip"
            size="small"
            placeholder="输入IP地址，如：192.168.1.1"
            @keyup.enter.native="addIp"
            @blur="addIp"
          />
          <el-button v-else class="button-new-ip" size="small" @click="showIpInput">
            + 添加IP
          </el-button>
          <div class="form-tip">
            支持IPv4地址，每行一个IP地址
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSave">
            保存配置
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="security-tips">
        <h4><i class="el-icon-warning" /> 安全提示</h4>
        <ul>
          <li>密码安全等级越高，用户密码的安全性越好，但可能影响用户体验</li>
          <li>启用IP限制后，只有白名单中的IP地址才能登录系统，请谨慎配置</li>
          <li>如果您不确定自己的IP地址，请勿启用IP限制，以免无法登录</li>
          <li>建议定期更新白名单，移除不再使用的IP地址</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'SystemSecurity',
  data() {
    return {
      securityForm: {
        passwordLevel: 'medium',
        ipRestriction: false,
        allowedIps: []
      },
      loading: false,
      ipInputVisible: false,
      ipInput: ''
    }
  },
  created() {
    this.loadSecurityConfig()
  },
  methods: {
    async loadSecurityConfig() {
      try {
        const response = await request({
          url: '/api/system/security/config',
          method: 'get'
        })

        if (response.success && response.data) {
          this.securityForm = {
            passwordLevel: response.data.passwordLevel || 'medium',
            ipRestriction: response.data.ipRestriction || false,
            allowedIps: response.data.allowedIps || []
          }
        }
      } catch (error) {
        this.$message.error('加载安全配置失败')
      }
    },
    async handleSave() {
      this.loading = true
      try {
        await request({
          url: '/api/system/security/config',
          method: 'put',
          data: this.securityForm
        })

        this.$message.success('安全配置保存成功')
        this.loading = false
      } catch (error) {
        this.loading = false
        this.$message.error('保存失败')
      }
    },
    handleReset() {
      this.loadSecurityConfig()
    },
    showIpInput() {
      this.ipInputVisible = true
      this.$nextTick(() => {
        this.$refs.ipInput.$refs.input.focus()
      })
    },
    addIp() {
      const ip = this.ipInput.trim()
      if (ip && this.validateIp(ip)) {
        if (!this.securityForm.allowedIps.includes(ip)) {
          this.securityForm.allowedIps.push(ip)
        } else {
          this.$message.warning('IP地址已存在')
        }
        this.ipInputVisible = false
        this.ipInput = ''
      } else if (ip) {
        this.$message.error('IP地址格式不正确')
      } else {
        this.ipInputVisible = false
      }
    },
    removeIp(index) {
      this.securityForm.allowedIps.splice(index, 1)
    },
    validateIp(ip) {
      const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      return ipRegex.test(ip)
    }
  }
}
</script>

<style lang="scss" scoped>
.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.input-new-ip {
  width: 200px;
  margin-right: 10px;
}

.button-new-ip {
  margin-bottom: 10px;
}

.security-tips {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;

  h4 {
    margin-top: 0;
    color: #f56c6c;

    i {
      margin-right: 8px;
    }
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin: 8px 0;
      color: #606266;
      line-height: 1.6;
    }
  }
}
</style>
