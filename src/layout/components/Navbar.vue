<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <!-- 语言选择器 -->
      <lang-select class="right-menu-item hover-effect" />

      <!-- 用户下拉菜单 -->
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <span class="user-name">{{ name }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item>
              <i class="el-icon-s-home" /> {{ $t('navbar.userDashboard') }}
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="showAccountDialog">
            <i class="el-icon-user" /> {{ $t('navbar.accountInfo') }}
          </el-dropdown-item>
          <el-dropdown-item @click.native="showPasswordDialog">
            <i class="el-icon-lock" /> {{ $t('navbar.changePassword') }}
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <i class="el-icon-switch-button" /> {{ $t('navbar.userLogout') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 账号信息对话框 -->
    <el-dialog
      :title="$t('navbar.accountInfo')"
      :visible.sync="accountDialogVisible"
      width="500px"
    >
      <el-form :model="accountForm" label-width="100px">
        <el-form-item :label="$t('user.name')">
          <el-input v-model="accountForm.name" disabled />
        </el-form-item>
        <el-form-item :label="$t('user.loginAccount')">
          <el-input v-model="accountForm.loginAccount" disabled />
        </el-form-item>
        <el-form-item :label="$t('user.email')">
          <el-input v-model="accountForm.email" placeholder="请联系管理员修改" disabled />
        </el-form-item>
        <el-form-item :label="$t('user.phone')">
          <el-input v-model="accountForm.phone" placeholder="请联系管理员修改" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="accountDialogVisible = false">{{ $t('common.close') }}</el-button>
      </div>
    </el-dialog>

    <!-- 密码修改对话框 -->
    <el-dialog
      :title="$t('navbar.changePassword')"
      :visible.sync="passwordDialogVisible"
      width="500px"
    >
      <el-form
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item :label="$t('user.oldPassword')" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            autocomplete="off"
            show-password
            :placeholder="$t('user.pleaseEnterOldPassword')"
          />
        </el-form-item>
        <el-form-item :label="$t('user.newPassword')" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            autocomplete="off"
            show-password
            :placeholder="$t('user.pleaseEnterNewPassword')"
          />
        </el-form-item>
        <el-form-item :label="$t('user.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            autocomplete="off"
            show-password
            :placeholder="$t('user.pleaseConfirmPassword')"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="changePassword">{{ $t('common.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import LangSelect from '@/components/LangSelect'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    LangSelect
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ])
  },
  data() {
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    
    return {
      accountDialogVisible: false,
      passwordDialogVisible: false,
      accountForm: {
        name: '',
        loginAccount: '',
        email: '',
        phone: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'name',
      'loginAccount',
      'id',
      'type'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    // 显示账号信息对话框
    showAccountDialog() {
      this.accountForm.name = this.name
      this.accountForm.loginAccount = this.loginAccount
      // TODO: 如果有email和phone字段，从store获取
      this.accountDialogVisible = true
    },
    // 显示密码修改对话框
    showPasswordDialog() {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      this.passwordDialogVisible = true
      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.passwordForm) {
          this.$refs.passwordForm.clearValidate()
        }
      })
    },
    // 修改密码
    async changePassword() {
      this.$refs.passwordForm.validate(async(valid) => {
        if (valid) {
          try {
            const response = await this.$axios({
              url: `/api/auth/change-password`,
              method: 'POST',
              data: {
                oldPassword: this.passwordForm.oldPassword,
                newPassword: this.passwordForm.newPassword
              }
            })

            if (response.data.success) {
              this.$message.success('密码修改成功，请重新登录')
              this.passwordDialogVisible = false
              
              // 延迟1秒后退出登录
              setTimeout(async() => {
                await this.$store.dispatch('user/logout')
                this.$router.push(`/login?redirect=${this.$route.fullPath}`)
              }, 1000)
            } else {
              this.$message.error(response.data.message || '密码修改失败')
            }
          } catch (error) {
            this.$message.error(error.response?.data?.message || '密码修改失败')
          }
        }
      })
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 12px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: middle;
      line-height: 50px;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 20px;
      margin-left: 8px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        display: flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .user-name {
          margin-left: 10px;
          font-size: 14px;
          color: #5a5e66;
          cursor: pointer;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          margin-left: 8px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
