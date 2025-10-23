<template>
  <div class="top-agents-card">
    <div class="agents-list">
      <div
        v-for="(agent, index) in topAgents"
        :key="agent.id"
        class="agent-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="rank">
          <span v-if="index < 3" class="medal" :class="`medal-${index + 1}`">
            {{ index + 1 }}
          </span>
          <span v-else class="rank-number">{{ index + 1 }}</span>
        </div>

        <div class="agent-info">
          <div class="agent-name">{{ agent.name }}</div>
          <div class="agent-code">{{ agent.code }}</div>
        </div>

        <div class="agent-stats">
          <div class="sales-amount">¥{{ agent.salesAmount.toLocaleString() }}</div>
          <div class="commission">{{ $t('dashboard.commission') }}: ¥{{ agent.commission.toLocaleString() }}</div>
        </div>

        <div class="growth-rate" :class="{ 'positive': agent.growthRate > 0, 'negative': agent.growthRate < 0 }">
          <i :class="agent.growthRate > 0 ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          {{ Math.abs(agent.growthRate) }}%
        </div>
      </div>
    </div>

    <div class="view-more">
      <el-button type="text" size="small" @click="goToAgentList">
        {{ $t('dashboard.viewDetails') }}
        <i class="el-icon-arrow-right" />
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopAgentsCard',
  data() {
    return {
      topAgents: [
        {
          id: 1,
          name: '张代理',
          code: 'AG001',
          salesAmount: 285630,
          commission: 28563,
          growthRate: 15.6
        },
        {
          id: 2,
          name: '李代理',
          code: 'AG002',
          salesAmount: 235480,
          commission: 23548,
          growthRate: 12.3
        },
        {
          id: 3,
          name: '王代理',
          code: 'AG003',
          salesAmount: 198750,
          commission: 19875,
          growthRate: 8.9
        },
        {
          id: 4,
          name: '刘代理',
          code: 'AG004',
          salesAmount: 165420,
          commission: 16542,
          growthRate: 5.2
        },
        {
          id: 5,
          name: '陈代理',
          code: 'AG005',
          salesAmount: 142350,
          commission: 14235,
          growthRate: -2.1
        }
      ]
    }
  },
  methods: {
    goToAgentList() {
      this.$router.push('/agent/list')
    }
  }
}
</script>

<style lang="scss" scoped>
.top-agents-card {
  .agents-list {
    .agent-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #EBEEF5;
      transition: all 0.2s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #F5F7FA;
        border-radius: 4px;
      }

      &.top-three {
        .agent-name {
          font-weight: 600;
        }
      }

      .rank {
        width: 32px;
        text-align: center;
        margin-right: 12px;

        .medal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #fff;
          font-size: 12px;
          font-weight: bold;

          &.medal-1 {
            background: linear-gradient(135deg, #FFD700, #FFA500);
          }

          &.medal-2 {
            background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
          }

          &.medal-3 {
            background: linear-gradient(135deg, #CD7F32, #A0522D);
          }
        }

        .rank-number {
          font-size: 14px;
          color: #909399;
          font-weight: 600;
        }
      }

      .agent-info {
        flex: 1;
        min-width: 0;

        .agent-name {
          font-size: 14px;
          color: #303133;
          margin-bottom: 2px;
        }

        .agent-code {
          font-size: 12px;
          color: #909399;
        }
      }

      .agent-stats {
        text-align: right;
        margin-right: 12px;

        .sales-amount {
          font-size: 14px;
          color: #303133;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .commission {
          font-size: 12px;
          color: #909399;
        }
      }

      .growth-rate {
        display: flex;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        min-width: 60px;
        justify-content: flex-end;

        &.positive {
          color: #67C23A;
        }

        &.negative {
          color: #F56C6C;
        }

        i {
          margin-right: 2px;
        }
      }
    }
  }

  .view-more {
    margin-top: 16px;
    text-align: center;
    padding-top: 12px;
    border-top: 1px solid #EBEEF5;
  }
}
</style>
