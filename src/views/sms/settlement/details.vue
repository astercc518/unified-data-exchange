<template>
  <div class="app-container">
    <!-- 结算概览 -->
    <el-card class="box-card" style="margin-bottom: 20px">
      <div slot="header" class="clearfix">
        <span>结算概览</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="goBack">
          返回列表
        </el-button>
      </div>
      <el-row v-if="settlement" :gutter="20">
        <el-col :span="6">
          <div class="info-item">
            <div class="label">结算日期</div>
            <div class="value">{{ settlement.settlement_date }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <div class="label">客户</div>
            <div class="value">{{ settlement.customer ? settlement.customer.customer_name : '-' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <div class="label">通道</div>
            <div class="value">{{ settlement.channel ? settlement.channel.channel_name : '-' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <div class="label">国家</div>
            <div class="value">{{ settlement.country }}</div>
          </div>
        </el-col>
      </el-row>
      <el-divider />
      <el-row v-if="settlement" :gutter="20">
        <el-col :span="6">
          <div class="info-item">
            <div class="label">发送总数</div>
            <div class="value">{{ settlement.total_count }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <div class="label">成功数量</div>
            <div class="value text-success">{{ settlement.success_count }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <div class="label">总收入</div>
            <div class="value text-success">${{ formatPrice(settlement.total_revenue) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="info-item">
            <div class="label">总利润</div>
            <div class="value" :class="settlement.total_profit >= 0 ? 'text-success' : 'text-danger'">
              ${{ formatPrice(settlement.total_profit) }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结算明细列表 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="记录ID" prop="record_id" align="center" width="100" />
      
      <el-table-column label="手机号码" prop="phone_number" width="150" />

      <el-table-column label="短信内容" min-width="250" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ row.sms_content }}
        </template>
      </el-table-column>

      <el-table-column label="成本价" width="100" align="right">
        <template slot-scope="{row}">
          ${{ formatPrice(row.cost_price) }}
        </template>
      </el-table-column>

      <el-table-column label="销售价" width="100" align="right">
        <template slot-scope="{row}">
          ${{ formatPrice(row.sale_price) }}
        </template>
      </el-table-column>

      <el-table-column label="利润" width="100" align="right">
        <template slot-scope="{row}">
          <span :style="{ color: row.profit >= 0 ? '#67C23A' : '#F56C6C' }">
            ${{ formatPrice(row.profit) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="发送时间" width="170" align="center">
        <template slot-scope="{row}">
          {{ row.sent_at }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getDetails"
    />
  </div>
</template>

<script>
import { getSettlementDetail, getSettlementDetails } from '@/api/smsSettlement'
import Pagination from '@/components/Pagination'

export default {
  name: 'SmsSettlementDetails',
  components: { Pagination },
  data() {
    return {
      settlement: null,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 50
      }
    }
  },
  created() {
    this.getSettlement()
    this.getDetails()
  },
  methods: {
    async getSettlement() {
      try {
        const { data } = await getSettlementDetail(this.$route.params.id)
        this.settlement = data.data
      } catch (error) {
        this.$message.error('获取结算详情失败')
      }
    },
    async getDetails() {
      this.listLoading = true
      try {
        const { data } = await getSettlementDetails(this.$route.params.id, this.listQuery)
        this.list = data.data.list
        this.total = data.data.total
      } catch (error) {
        this.$message.error('获取结算明细失败')
      } finally {
        this.listLoading = false
      }
    },
    formatPrice(price, decimals = 4) {
      return parseFloat(price || 0).toFixed(decimals)
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style lang="scss" scoped>
.info-item {
  margin-bottom: 15px;
  
  .label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 5px;
  }
  
  .value {
    font-size: 16px;
    font-weight: 500;
  }
}

.text-success {
  color: #67C23A;
}

.text-danger {
  color: #F56C6C;
}
</style>
