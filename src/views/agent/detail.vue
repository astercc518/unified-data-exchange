<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('agent.detail') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <div v-if="agent">
        <el-row :gutter="20">
          <el-col :span="8" :xs="24">
            <div class="agent-profile-card">
              <div class="agent-info">
                <h3>{{ agent.agentName }}</h3>
                <p class="agent-code">{{ $t('agent.agentCode') }}: {{ agent.agentCode }}</p>
                <p class="agent-level">
                  <el-tag :type="getLevelTagType(agent.level)">
                    {{ getLevelText(agent.level) }}
                  </el-tag>
                </p>
              </div>

              <div class="agent-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleEdit"
                >
                  {{ $t('common.edit') }}
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="handleRecharge"
                >
                  {{ $t('agent.recharge') }}
                </el-button>
              </div>
            </div>
          </el-col>

          <el-col :span="16" :xs="24">
            <el-tabs v-model="activeTab" type="border-card">
              <el-tab-pane :label="$t('user.basicInfo')" name="basic">
                <el-descriptions :column="2" border>
                  <el-descriptions-item :label="$t('agent.agentName')">
                    {{ agent.agentName }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('agent.agentCode')">
                    {{ agent.agentCode }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('agent.level')">
                    {{ getLevelText(agent.level) }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('agent.commission')">
                    {{ agent.commission }}%
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('agent.parentAgent')">
                    {{ agent.parentAgentName || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('agent.region')">
                    {{ agent.region || '-' }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <el-tab-pane :label="$t('user.contactInfo')" name="contact">
                <el-descriptions :column="2" border>
                  <el-descriptions-item :label="$t('user.email')">
                    {{ agent.email }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('user.phone')">
                    {{ agent.phone || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('user.realName')">
                    {{ agent.realName || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('user.address')" :span="2">
                    {{ agent.address || '-' }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <el-tab-pane label="业绩统计" name="performance">
                <el-descriptions :column="2" border>
                  <el-descriptions-item :label="$t('agent.bindUsers')">
                    {{ agent.bindUsers || 0 }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('agent.totalCommission')">
                    ¥{{ agent.totalCommission || '0.00' }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('agent.monthlyCommission')">
                    ¥{{ agent.monthlyCommission || '0.00' }}
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('user.createTime')">
                    {{ agent.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'AgentDetail',
  filters: {
    parseTime
  },
  mixins: [i18nMixin],
  data() {
    return {
      activeTab: 'basic',
      agent: null
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.fetchData(id)
  },
  methods: {
    fetchData(id) {
      // 模拟获取代理数据
      this.agent = {
        id: id,
        agentCode: 'AGENT001',
        agentName: '一级代理商A',
        level: 1,
        parentAgentName: null,
        commission: 15.5,
        bindUsers: 25,
        totalCommission: '15600.50',
        monthlyCommission: '2800.30',
        region: '北京市',
        email: 'agent001@example.com',
        phone: '13800138001',
        realName: '张代理',
        address: '北京市朝阳区代理大厦',
        createTime: new Date('2023-01-01')
      }
    },
    handleEdit() {
      this.$router.push(`/agent/edit/${this.agent.id}`)
    },
    handleRecharge() {
      this.$router.push(`/agent/recharge/${this.agent.id}`)
    },
    goBack() {
      this.$router.go(-1)
    },
    getLevelTagType(level) {
      const levelMap = {
        1: 'danger',
        2: 'warning',
        3: 'success'
      }
      return levelMap[level]
    },
    getLevelText(level) {
      const levelMap = {
        1: this.$t('agent.level1'),
        2: this.$t('agent.level2'),
        3: this.$t('agent.level3')
      }
      return levelMap[level]
    }
  }
}
</script>

<style lang="scss" scoped>
.agent-profile-card {
  text-align: center;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;

  .agent-info {
    margin-bottom: 30px;

    h3 {
      margin: 10px 0;
      color: #303133;
    }

    .agent-code, .agent-level {
      margin: 8px 0;
    }
  }

  .agent-actions {
    .el-button {
      margin: 5px;
    }
  }
}
</style>
