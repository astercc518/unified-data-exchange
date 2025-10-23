<template>
  <div class="app-container">
    <div v-loading="loading">
      <el-card>
        <div slot="header" class="clearfix">
          <span>{{ $t('user.detail') }}</span>
          <div style="float: right;">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit"
            >
              {{ $t('common.edit') }}
            </el-button>
            <el-button
              size="small"
              @click="goBack"
            >
              {{ $t('common.back') }}
            </el-button>
          </div>
        </div>

        <div v-if="user">
          <el-row :gutter="20">
            <!-- 左侧用户信息卡片 -->
            <el-col :span="8" :xs="24">
              <div class="user-profile-card">
                <div class="user-avatar">
                  <el-avatar
                    :size="120"
                    :src="user.avatar"
                    icon="el-icon-user-solid"
                  />
                </div>
                <div class="user-info">
                  <h3>{{ user.realName || user.username }}</h3>
                  <p class="user-role">
                    <el-tag :type="user.role === 'admin' ? 'danger' : 'success'">
                      {{ user.role }}
                    </el-tag>
                  </p>
                  <p class="user-status">
                    <el-tag :type="user.status | statusFilter">
                      {{ user.status === 1 ? $t('user.active') : $t('user.inactive') }}
                    </el-tag>
                  </p>
                </div>

                <div class="user-actions">
                  <el-button
                    type="warning"
                    size="small"
                    @click="resetPassword"
                  >
                    {{ $t('user.resetPassword') }}
                  </el-button>
                  <el-button
                    :type="user.status === 1 ? 'warning' : 'success'"
                    size="small"
                    @click="changeStatus"
                  >
                    {{ user.status === 1 ? $t('user.inactive') : $t('user.active') }}
                  </el-button>
                </div>
              </div>
            </el-col>

            <!-- 右侧详细信息 -->
            <el-col :span="16" :xs="24">
              <el-tabs v-model="activeTab" type="border-card">
                <!-- 基本信息标签页 -->
                <el-tab-pane :label="$t('user.basicInfo')" name="basic">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item :label="$t('user.username')">
                      {{ user.username }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.realName')">
                      {{ user.realName || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.gender')">
                      <span v-if="user.gender === 'male'">{{ $t('user.male') }}</span>
                      <span v-else-if="user.gender === 'female'">{{ $t('user.female') }}</span>
                      <span v-else>{{ $t('user.unknown') }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.birthday')">
                      {{ user.birthday || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.department')">
                      {{ user.department || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.position')">
                      {{ user.position || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.address')" :span="2">
                      {{ user.address || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.remark')" :span="2">
                      {{ user.remark || '-' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 联系信息标签页 -->
                <el-tab-pane :label="$t('user.contactInfo')" name="contact">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item :label="$t('user.email')">
                      <el-link :href="`mailto:${user.email}`" type="primary">
                        {{ user.email }}
                      </el-link>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.phone')">
                      <el-link v-if="user.phone" :href="`tel:${user.phone}`" type="primary">
                        {{ user.phone }}
                      </el-link>
                      <span v-else>-</span>
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 系统信息标签页 -->
                <el-tab-pane :label="$t('user.systemInfo')" name="system">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item :label="$t('user.createTime')">
                      {{ user.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.lastLogin')">
                      {{ user.lastLogin | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.role')">
                      <el-tag :type="user.role === 'admin' ? 'danger' : 'success'">
                        {{ user.role }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('user.status')">
                      <el-tag :type="user.status | statusFilter">
                        {{ user.status === 1 ? $t('user.active') : $t('user.inactive') }}
                      </el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>

                <!-- 活动记录标签页 -->
                <el-tab-pane label="活动记录" name="activity">
                  <el-timeline>
                    <el-timeline-item
                      v-for="(activity, index) in activities"
                      :key="index"
                      :timestamp="activity.timestamp"
                      :type="activity.type"
                    >
                      {{ activity.content }}
                    </el-timeline-item>
                  </el-timeline>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'UserDetail',
  filters: {
    parseTime,
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'info'
      }
      return statusMap[status]
    }
  },
  mixins: [i18nMixin],
  data() {
    return {
      loading: false,
      activeTab: 'basic',
      user: null,
      activities: []
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.fetchData(id)
  },
  methods: {
    fetchData(id) {
      this.loading = true

      // 模拟获取用户数据
      setTimeout(() => {
        const userData = {
          1: {
            id: 1,
            username: 'admin',
            realName: '系统管理员',
            email: 'admin@example.com',
            phone: '13800138000',
            role: 'admin',
            status: 1,
            gender: 'male',
            birthday: '1990-01-01',
            department: 'IT部门',
            position: '系统管理员',
            address: '北京市朝阳区科技园区',
            avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
            remark: '系统管理员账号，拥有最高权限',
            createTime: new Date('2023-01-01'),
            lastLogin: new Date()
          },
          2: {
            id: 2,
            username: 'editor',
            realName: '编辑用户',
            email: 'editor@example.com',
            phone: '13800138001',
            role: 'editor',
            status: 1,
            gender: 'female',
            birthday: '1992-05-15',
            department: '内容部门',
            position: '内容编辑',
            address: '上海市浦东新区陆家嘴',
            avatar: 'https://wpimg.wallstcn.com/57ed425a-c71e-4201-9428-68760c0537c4.jpg',
            remark: '负责内容编辑和审核工作',
            createTime: new Date('2023-02-01'),
            lastLogin: new Date()
          },
          3: {
            id: 3,
            username: 'guest',
            realName: '访客用户',
            email: 'guest@example.com',
            phone: '13800138002',
            role: 'guest',
            status: 0,
            gender: 'unknown',
            birthday: '',
            department: '',
            position: '',
            address: '',
            avatar: null,
            remark: '访客账号，仅拥有查看权限',
            createTime: new Date('2023-03-01'),
            lastLogin: new Date('2023-03-15')
          }
        }

        this.user = userData[id]

        // 模拟活动记录
        this.activities = [
          {
            content: '用户登录系统',
            timestamp: '2023-12-10 09:30:00',
            type: 'success'
          },
          {
            content: '修改个人资料',
            timestamp: '2023-12-09 14:20:00',
            type: 'primary'
          },
          {
            content: '更改密码',
            timestamp: '2023-12-08 16:45:00',
            type: 'warning'
          },
          {
            content: '用户注册',
            timestamp: '2023-01-01 10:00:00',
            type: 'info'
          }
        ]

        this.loading = false
      }, 1000)
    },
    handleEdit() {
      this.$router.push(`/user/customer/edit/${this.user.id}`)
    },
    resetPassword() {
      this.$confirm('确认重置该用户的密码？', this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('user.passwordReset')
        })
      }).catch(() => {})
    },
    changeStatus() {
      const newStatus = this.user.status === 1 ? 0 : 1
      const action = newStatus === 1 ? this.$t('user.active') : this.$t('user.inactive')

      this.$confirm(`确认${action}该用户？`, this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.user.status = newStatus
        this.$message({
          type: 'success',
          message: this.$t('user.statusChanged')
        })
      }).catch(() => {})
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-profile-card {
  text-align: center;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;

  .user-avatar {
    margin-bottom: 20px;
  }

  .user-info {
    margin-bottom: 30px;

    h3 {
      margin: 10px 0;
      color: #303133;
    }

    .user-role, .user-status {
      margin: 8px 0;
    }
  }

  .user-actions {
    .el-button {
      margin: 5px;
    }
  }
}

.el-descriptions {
  margin-top: 20px;
}

.el-timeline {
  margin-top: 20px;
}
</style>
