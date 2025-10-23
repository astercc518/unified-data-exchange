<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>修改密码</span>
      </div>

      <el-form
        ref="passwordForm"
        :model="passwordForm"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px; margin: 40px auto;"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
          <div class="password-strength">
            <span>密码强度：</span>
            <el-tag :type="passwordStrengthType" size="small">
              {{ passwordStrengthText }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            确认修改
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="password-tips">
        <h4>密码强度要求：</h4>
        <ul>
          <li>弱密码：仅包含数字或字母，长度6位以上</li>
          <li>中等密码：包含数字和字母，长度8位以上</li>
          <li>强密码：包含数字、字母和特殊字符，长度10位以上</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ChangePassword',
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else {
        if (value.length < 6) {
          callback(new Error('密码长度不能少于6位'))
        }
        if (this.passwordForm.confirmPassword !== '') {
          this.$refs.passwordForm.validateField('confirmPassword')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  computed: {
    passwordStrength() {
      const pwd = this.passwordForm.newPassword
      if (!pwd) return 0

      let strength = 0
      if (pwd.length >= 6) strength++
      if (pwd.length >= 8) strength++
      if (pwd.length >= 10) strength++
      if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
      if (/\d/.test(pwd)) strength++
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++

      return strength
    },
    passwordStrengthText() {
      if (this.passwordStrength <= 2) return '弱'
      if (this.passwordStrength <= 4) return '中'
      return '强'
    },
    passwordStrengthType() {
      if (this.passwordStrength <= 2) return 'danger'
      if (this.passwordStrength <= 4) return 'warning'
      return 'success'
    }
  },
  methods: {
    async handleSubmit() {
      this.$refs.passwordForm.validate(async(valid) => {
        if (valid) {
          this.loading = true
          try {
            const userInfo = this.$store.getters.userInfo
            
            // 容错处理:检查用户信息是否存在
            if (!userInfo || !userInfo.id) {
              this.$message.error('未能获取用户信息，请重新登录')
              this.loading = false
              // 跳转到登录页
              this.$router.push('/login')
              return
            }
            
            await request({
              url: '/api/system/security/change-password',
              method: 'post',
              data: {
                adminId: userInfo.id,
                oldPassword: this.passwordForm.oldPassword,
                newPassword: this.passwordForm.newPassword
              }
            })

            this.$message.success('密码修改成功，请重新登录')
            this.loading = false

            // 延迟1秒后退出登录
            setTimeout(() => {
              this.$store.dispatch('user/logout')
              this.$router.push(`/login?redirect=${this.$route.fullPath}`)
            }, 1000)
          } catch (error) {
            this.loading = false
            this.$message.error(error.message || '密码修改失败')
          }
        }
      })
    },
    resetForm() {
      this.$refs.passwordForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.password-strength {
  margin-top: 8px;
  font-size: 13px;
  color: #606266;

  span {
    margin-right: 8px;
  }
}

.password-tips {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;

  h4 {
    margin-top: 0;
    color: #303133;
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
