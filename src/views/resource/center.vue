<template>
  <div class="app-container">
    <!-- 用户余额卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8">
        <el-card class="balance-card">
          <div class="balance-content">
            <div class="balance-number">{{ userBalance }}</div>
            <div class="balance-label">
              <template v-if="isAdmin">所有客户账户余额总额 (U)</template>
              <template v-else-if="isAgent">本代理下客户账户余额总额 (U)</template>
              <template v-else>账户余额 (U)</template>
            </div>
          </div>
          <i class="el-icon-wallet balance-icon" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="balance-card">
          <div class="balance-content">
            <div class="balance-number">{{ formatNumber(totalPurchased) }}</div>
            <div class="balance-label">
              <template v-if="isAdmin">所有客户已购买数据总量</template>
              <template v-else-if="isAgent">本代理下客户已购买数据总量</template>
              <template v-else>已购买数据</template>
            </div>
          </div>
          <i class="el-icon-data-line balance-icon" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="balance-card">
          <div class="balance-content">
            <div class="balance-number">{{ totalSpent }}</div>
            <div class="balance-label">
              <template v-if="isAdmin">所有客户累计消费总额 (U)</template>
              <template v-else-if="isAgent">本代理下客户累计消费总额 (U)</template>
              <template v-else>累计消费 (U)</template>
            </div>
          </div>
          <i class="el-icon-money balance-icon" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card style="margin-bottom: 20px;">
      <div class="filter-container">
        <el-select
          v-model="listQuery.country"
          :placeholder="$t('data.selectCountry')"
          filterable
          remote
          reserve-keyword
          :remote-method="searchCountries"
          :loading="countryLoading"
          clearable
          style="width: 250px"
          class="filter-item"
          @focus="initCountryOptions"
        >
          <el-option-group
            v-if="showPopularCountries"
            label="热门国家"
          >
            <el-option
              v-for="country in popularCountries"
              :key="country.code"
              :label="`${country.name} (${country.nameEn}) [${country.code}]`"
              :value="country.code"
            >
              <span style="float: left">{{ country.name }} ({{ country.nameEn }})</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ country.code }}</span>
            </el-option>
          </el-option-group>
          <el-option
            v-for="country in filteredCountries"
            :key="country.code"
            :label="`${country.name} (${country.nameEn}) [${country.code}]`"
            :value="country.code"
          >
            <span style="float: left">{{ country.name }} ({{ country.nameEn }})</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ country.code }}</span>
          </el-option>
        </el-select>

        <el-select
          v-model="listQuery.validity"
          :placeholder="$t('data.selectValidity')"
          clearable
          style="width: 120px"
          class="filter-item"
        >
          <el-option :label="$t('data.validityDay3')" value="3" />
          <el-option :label="$t('data.validityDay30')" value="30" />
          <el-option :label="$t('data.validityOver30')" value="30+" />
        </el-select>

        <el-input
          v-model="listQuery.source"
          :placeholder="$t('data.source')"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          {{ $t('common.search') }}
        </el-button>
        <el-button
          v-waves
          class="filter-item"
          icon="el-icon-refresh"
          @click="refreshData"
        >
          刷新数据
        </el-button>
        <el-button
          v-waves
          class="filter-item"
          type="warning"
          icon="el-icon-download"
          @click="forceDataReload"
        >
          强制重新加载数据
        </el-button>
      </div>
    </el-card>

    <!-- 可购买数据列表 -->
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('resource.available') }}</span>
      </div>

      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column
          label="ID"
          prop="id"
          align="center"
          width="80"
        />
        <el-table-column
          :label="$t('data.country')"
          prop="country"
          width="120"
        />
        <el-table-column
          label="数据类型"
          prop="dataType"
          width="100"
        />
        <el-table-column
          :label="$t('data.validity')"
          prop="validityDisplay"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            <div class="validity-info">
              <el-tag :type="getValidityTagType(row.validityDisplay)">
                {{ row.validityDisplay || getValidityText(row.validity) }}
              </el-tag>
              <div v-if="row.daysSincePublish !== undefined" class="time-info">
                {{ formatTimeDifference(row.publishTime) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('data.source')"
          prop="source"
          min-width="150"
        />
        <el-table-column
          :label="$t('data.quantity')"
          prop="availableQuantity"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            {{ formatNumber(row.availableQuantity) }}
          </template>
        </el-table-column>
        <el-table-column
          label="运营商分布"
          min-width="200"
        >
          <template slot-scope="{row}">
            <div class="operator-distribution">
              <div v-for="operator in row.operators" :key="operator.name" class="operator-item">
                <span class="operator-name">{{ operator.name }}:</span>
                <span class="operator-count">{{ formatNumber(operator.count) }}</span>
                <span class="operator-percent">({{ (operator.count / row.availableQuantity * 100).toFixed(1) }}%)</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('data.sellPrice')"
          prop="currentSellPrice"
          width="140"
          align="center"
        >
          <template slot-scope="{row}">
            <div class="price-info">
              <span class="current-price">{{ formatPrice(row.currentSellPrice || row.sellPrice) }} U/条</span>
              <div v-if="row.originalSellPrice && row.currentSellPrice !== row.originalSellPrice" class="original-price">
                <span class="original-price-text">原价: {{ formatPrice(row.originalSellPrice) }} U/条</span>
                <span class="discount-text">({{ row.discountInfo }})</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="数据状态"
          width="100"
          align="center"
        >
          <template>
            <el-tag type="success">
              可购买
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.operation')"
          align="center"
          width="200"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{row}">
            <!-- 购买按钮 - 仅客户可见 -->
            <el-button
              v-if="isCustomer"
              type="primary"
              size="mini"
              :disabled="userBalance <= 0"
              @click="handlePurchase(row)"
            >
              购买
            </el-button>
            <!-- 查看按钮 - 代理只能查看 -->
            <el-button
              v-if="isAgent"
              type="info"
              size="mini"
              disabled
            >
              仅可查看
            </el-button>
            <!-- 收藏按钮 - 仅客户可见 -->
            <el-button
              v-if="isCustomer"
              :type="row.isFavorited ? 'warning' : 'info'"
              size="mini"
              :icon="row.isFavorited ? 'el-icon-star-on' : 'el-icon-star-off'"
              @click="handleFavorite(row)"
            >
              {{ row.isFavorited ? '取消' : '收藏' }}
            </el-button>
            <!-- 删除按钮 - 仅管理员可见 -->
            <el-button
              v-if="isAdmin"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              class="delete-btn"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'
import request from '@/utils/request'
import {
  filterCountries,
  getCountryByCode,
  getPopularCountries
} from '@/data/countries'
import {
  updateDataListPricing,
  calculateCurrentPrice,
  getValidityTagType,
  formatPrice,
  formatTimeDifference
} from '@/utils/dynamicPricing'

export default {
  name: 'ResourceCenter',
  components: { Pagination },
  directives: { waves },
  mixins: [i18nMixin],
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        country: undefined,
        validity: undefined,
        source: undefined
      },
      userBalance: 0,
      totalPurchased: 0,
      totalSpent: 0,
      customerSalePriceRate: 1, // 客户销售价比例
      customerId: null, // 当前客户ID
      favoriteIds: new Set(), // 已收藏的数据ID集合
      // 国家相关数据
      countryLoading: false,
      filteredCountries: [],
      popularCountries: [],
      showPopularCountries: true,
      countrySearchKeyword: ''
    }
  },
  computed: {
    // 检查当前用户是否为管理员
    isAdmin() {
      return this.$store.getters.roles && this.$store.getters.roles.includes('admin')
    },
    // 检查当前用户是否为客户
    isCustomer() {
      return this.$store.getters.roles && this.$store.getters.roles.includes('customer')
    },
    // 检查当前用户是否为代理
    isAgent() {
      return this.$store.getters.roles && this.$store.getters.roles.includes('agent')
    }
  },
  created() {
    this.getList()
    this.loadCustomerInfo()
    this.loadAccountStats()
    this.initCountryData()
  },
  activated() {
    // 当组件被激活时（从其他页面返回），重新加载账户统计信息和数据列表
    console.log('🔄 资源中心页面被激活，重新加载数据...')
    this.loadAccountStats()
    this.getList() // 重新加载数据列表，确保显示最新的可用数量
  },
  methods: {
    getList() {
      this.listLoading = true
      console.log('🔄 资源中心开始加载数据...')

      // 优先从数据库API获取已发布的数据
      this.getPublishedDataFromAPI()
    },

    // 从数据库API获取已发布的数据
    async getPublishedDataFromAPI() {
      try {
        console.log('💾 从数据库API获取已发布数据...')

        // 构建查询参数
        const params = {
          page: this.listQuery.page,
          limit: this.listQuery.limit
        }

        if (this.listQuery.country) {
          params.country = this.listQuery.country
        }
        if (this.listQuery.validity) {
          params.validity = this.listQuery.validity
        }
        if (this.listQuery.source) {
          params.source = this.listQuery.source
        }

        // 调用后端API获取已发布数据
        const response = await request({
          method: 'GET',
          url: '/api/data-library/published',
          params: params
        })

        console.log('🔍 API响应结构:', { success: response.success, hasData: !!response.data })

        if (response.success && response.data && response.data.length > 0) {
          console.log('✅ 数据库API返回数据:', response.data.length, '条')

          // 转换数据库格式为前端格式
          const dataList = response.data.map(item => ({
            id: item.id,
            country: item.country_name || item.country,
            countryCode: item.country,
            dataType: item.data_type,
            validity: item.validity,
            validityDisplay: item.validity_name,
            source: item.source || '未知',
            availableQuantity: item.available_quantity,
            totalQuantity: item.total_quantity,
            sellPrice: parseFloat(item.sell_price) || 0,
            costPrice: parseFloat(item.cost_price) || 0,
            // 转换运营商数据：将quantity字段映射为count字段
            operators: (typeof item.operators === 'string' ? JSON.parse(item.operators) : (item.operators || [])).map(op => ({
              name: op.name,
              count: op.quantity || op.count || 0, // 兼容quantity和count两种格式
              marketShare: op.marketShare,
              segments: op.segments
            })),
            uploadTime: item.upload_time,
            publishTime: item.publish_time,
            status: item.status,
            remark: item.remark
          }))

          console.log('🔍 转换后的数据:', dataList.length, '条')
          if (dataList.length > 0) {
            console.log('🔍 第一条数据示例:', {
              country: dataList[0].country,
              dataType: dataList[0].dataType,
              availableQuantity: dataList[0].availableQuantity,
              operators: dataList[0].operators
            })
          }

          // 应用筛选条件（过滤已售罄数据等）
          console.log('🔍 应用筛选条件...')
          const filteredDataList = this.applyFilters(dataList)
          console.log('✅ 筛选完成，剩余:', filteredDataList.length, '条')

          // 应用动态定价逻辑
          console.log('💰 应用动态定价逻辑...')
          let pricedDataList = []
          try {
            pricedDataList = updateDataListPricing(filteredDataList)
            console.log('✅ 动态定价应用成功')
          } catch (pricingError) {
            console.error('❌ 动态定价失败，使用原始数据:', pricingError)
            pricedDataList = filteredDataList.map(item => ({
              ...item,
              currentSellPrice: item.sellPrice || 0,
              originalSellPrice: item.sellPrice || 0
            }))
          }

          // 应用客户价格折扣
          pricedDataList.forEach(item => {
            if (item.currentSellPrice) {
              item.currentSellPrice = item.currentSellPrice * this.customerSalePriceRate
            } else {
              item.currentSellPrice = item.sellPrice * this.customerSalePriceRate
            }
          })

          this.list = pricedDataList
          this.total = response.total || pricedDataList.length

          console.log('✅ 数据加载完成，最终显示:', this.list.length, '条')
        } else {
          console.log('⚠️ 数据库API返回空数据，降级到localStorage')
          this.getListFromLocalStorage()
          return
        }
      } catch (error) {
        console.error('❌ 数据库API调用失败:', error.message)
        console.log('🔄 降级到localStorage模式...')
        this.getListFromLocalStorage()
        return
      } finally {
        this.listLoading = false
      }
    },

    // 从localStorage获取数据（备用方案）
    getListFromLocalStorage() {
      console.log('📱 使用localStorage模式加载数据...')
      try {
        console.log('🔍 检查localStorage中的dataList...')
        const savedDataList = localStorage.getItem('dataList')
        let dataList = []

        if (savedDataList) {
          dataList = JSON.parse(savedDataList)
          console.log('📄 从localStorage加载数据:', dataList.length, '条')
        } else {
          dataList = this.getDefaultData()
          console.log('🛠️ 未找到localStorage数据，使用默认数据:', dataList.length, '条')
        }

        // 应用动态定价逻辑
        dataList = updateDataListPricing(dataList)

        // 应用筛选条件
        const filteredList = this.applyFilters(dataList)

        // 应用客户价格折扣
        filteredList.forEach(item => {
          if (item.currentSellPrice) {
            item.currentSellPrice = item.currentSellPrice * this.customerSalePriceRate
          } else {
            item.currentSellPrice = item.sellPrice * this.customerSalePriceRate
          }
        })

        this.list = filteredList
        this.total = filteredList.length

        console.log('✅ localStorage数据加载完成:', this.list.length, '条')
      } catch (error) {
        console.error('❌ localStorage加载数据失败:', error)
        this.list = this.getDefaultData()
        this.total = this.list.length
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    refreshData() {
      console.log('🔄 手动刷新数据...')
      this.$message({
        type: 'info',
        message: '正在刷新数据...',
        duration: 1000
      })
      this.tableKey = this.tableKey + 1 // 强制重新渲染表格
      this.getList()
    },
    forceDataReload() {
      console.log('💪 强制重新加载数据...')

      // 检查localStorage状态
      const dataListStr = localStorage.getItem('dataList')
      if (!dataListStr) {
        this.$message({
          type: 'warning',
          message: '检测到localStorage中没有数据，尝试恢复默认数据...',
          duration: 3000
        })

        // 创建测试数据
        const testData = [{
          id: Date.now(),
          country: '孟加拉国',
          countryCode: 'BD',
          dataType: '手机号码',
          validity: '3',
          source: '系统恢复',
          availableQuantity: 50000,
          sellPrice: 0.05,
          costPrice: 0.03,
          remark: '这是系统自动恢复的测试数据',
          uploadTime: Date.now(),
          status: 'available',
          operators: [{ name: 'Grameenphone', count: 25000 }, { name: 'Banglalink', count: 25000 }]
        }]

        localStorage.setItem('dataList', JSON.stringify(testData))
        console.log('✅ 已创建测试数据')
      }

      // 清除缓存并重新加载
      this.list = []
      this.total = 0
      this.tableKey = Date.now() // 使用时间戳强制重新渲染

      this.$message({
        type: 'success',
        message: '正在强制重新加载数据...',
        duration: 2000
      })

      setTimeout(() => {
        this.getList()
      }, 500)
    },
    handlePurchase(row) {
      if (this.userBalance <= 0) {
        this.$message.error(this.$t('resource.insufficientBalance'))
        return
      }
      this.$router.push(`/resource/purchase/${row.id}`)
    },

    // 删除数据（仅管理员）
    handleDelete(row) {
      // 验证管理员权限
      if (!this.isAdmin) {
        this.$message.error('您没有权限执行此操作')
        return
      }

      // 根据项目规范：危险操作增加确认删除步骤
      const deleteContent = `
        <div style="text-align: left; padding: 10px;">
          <p style="color: #f56c6c; font-weight: bold; margin-bottom: 15px;">
            <i class="el-icon-warning" style="margin-right: 5px;"></i>
            您正在执行高危操作！
          </p>
          <p style="margin-bottom: 10px;">将永久从资源中心删除以下数据：</p>
          <div style="background: #fef0f0; padding: 12px; border-radius: 4px; border-left: 4px solid #f56c6c; margin: 10px 0;">
            <p><strong>国家：</strong> ${row.country}</p>
            <p><strong>数据类型：</strong> ${row.dataType}</p>
            <p><strong>数据来源：</strong> ${row.source || '未知'}</p>
            <p><strong>时效性：</strong> ${this.getValidityText(row.validity)}</p>
            <p><strong>数量：</strong> <span style="color: #f56c6c; font-weight: bold;">${this.formatNumber(row.availableQuantity)}</span> 条</p>
            <p><strong>价值：</strong> 约 <span style="color: #f56c6c; font-weight: bold;">${(row.availableQuantity * (row.currentSellPrice || row.sellPrice)).toFixed(2)}</span> U</p>
          </div>
          <p style="color: #909399; font-size: 13px; margin-top: 10px;">
            <i class="el-icon-info" style="margin-right: 3px;"></i>
            此操作不可撤销，请谨慎操作！
          </p>
          <p style="color: #e6a23c; font-size: 13px; margin-top: 5px;">
            <i class="el-icon-warning-outline" style="margin-right: 3px;"></i>
            删除后此数据将从资源中心中移除，不再对客户可见
          </p>
        </div>
      `

      this.$confirm(deleteContent, '删除确认', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error', // 使用error类型显示红色警告
        dangerouslyUseHTMLString: true, // 允许HTML内容
        customClass: 'dangerous-operation-confirm', // 自定义样式类
        closeOnClickModal: false, // 禁止点击遮罩层关闭
        closeOnPressEscape: false, // 禁止ESC关闭
        showClose: false // 隐藏关闭按钮
      }).then(() => {
        // 执行删除操作
        this.deleteResourceData(row.id, row)
      }).catch(() => {
        // 用户取消删除
        this.$message({
          type: 'info',
          message: '已取消删除操作'
        })
      })
    },

    // 执行资源中心数据删除
    deleteResourceData(id, rowData) {
      console.log('🗑️ 开始从资源中心删除数据（数据库模式）:', { id, rowData })

      try {
        // 检查是否启用数据库模式
        const useDatabaseMode = process.env.VUE_APP_USE_DATABASE === 'true'

        if (useDatabaseMode) {
          // 数据库模式：调用后端API删除数据
          this.deleteFromDatabase(id, rowData)
        } else {
          // localStorage模式：从本地存储删除
          this.deleteFromLocalStorage(id, rowData)
        }
      } catch (error) {
        console.error('❌ 删除资源数据失败:', error)
        this.$message({
          type: 'error',
          message: '删除失败：' + (error.message || '未知错误'),
          duration: 5000
        })
      }
    },

    // 从数据库删除数据
    async deleteFromDatabase(id, rowData) {
      try {
        console.log('💾 使用数据库API删除数据...')

        // 调用后端删除API
        const response = await request({
          method: 'DELETE',
          url: `/api/data-library/delete/${id}`
        })

        if (response.data.code === 200 || response.data.success) {
          console.log('✅ 数据库删除成功')

          // 记录删除操作日志
          await this.logDeleteOperation(id, rowData, 'database')

          this.$message({
            type: 'success',
            message: `已成功从数据库删除数据：${rowData.country} - ${rowData.dataType}`,
            duration: 3000
          })

          // 刷新页面数据
          this.getList()
        } else {
          throw new Error(response.data.message || '删除失败')
        }
      } catch (error) {
        console.error('❌ 数据库删除失败:', error)

        // 如果是网络错误，回退到localStorage模式
        if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
          console.log('🔄 网络错误，回退到localStorage模式')
          this.deleteFromLocalStorage(id, rowData)
          return
        }

        // 记录错误日志
        await this.logDeleteOperation(id, rowData, 'database_error', error.message)

        this.$message({
          type: 'error',
          message: '数据库删除失败：' + (error.message || '未知错误'),
          duration: 5000
        })
      }
    },

    // 从localStorage删除数据（备用方案）
    deleteFromLocalStorage(id, rowData) {
      console.log('📱 使用localStorage删除数据...')

      try {
        let deletedFromResource = false

        // 从资源中心中删除（dataList）
        const savedDataList = localStorage.getItem('dataList')
        if (savedDataList) {
          const dataList = JSON.parse(savedDataList)
          const originalLength = dataList.length

          // 使用多重匹配规则确保精确删除
          const filteredDataList = dataList.filter(item => {
            // 首先尝试使用ID匹配
            if (item.id === id) {
              console.log('🎯 通过ID匹配找到要删除的数据:', item.id)
              return false
            }

            // 多字段组合匹配
            const isMatch = (
              item.country === rowData.country &&
              item.dataType === rowData.dataType &&
              item.validity === rowData.validity &&
              item.availableQuantity === rowData.availableQuantity &&
              (item.source === rowData.source || (!item.source && !rowData.source))
            )

            if (isMatch) {
              console.log('🎯 通过多字段匹配找到要删除的数据')
              return false
            }

            return true
          })

          const deletedCount = originalLength - filteredDataList.length

          if (deletedCount > 0) {
            localStorage.setItem('dataList', JSON.stringify(filteredDataList))
            deletedFromResource = true
            console.log('✅ 已从localStorage删除数据，删除数量:', deletedCount)
          } else {
            console.log('⚠️  在localStorage中未找到匹配的数据记录')
          }
        }

        // 记录删除操作日志
        this.logDeleteOperation(id, rowData, 'localStorage')

        // 显示结果消息
        if (deletedFromResource) {
          this.$message({
            type: 'success',
            message: `已从本地存储删除数据：${rowData.country} - ${rowData.dataType}`,
            duration: 3000
          })
        } else {
          this.$message({
            type: 'warning',
            message: '删除操作完成，但未找到匹配的数据记录',
            duration: 3000
          })
        }

        // 刷新页面数据
        this.getList()
      } catch (error) {
        console.error('❌ localStorage删除失败:', error)
        this.$message({
          type: 'error',
          message: '本地删除失败：' + (error.message || '未知错误'),
          duration: 5000
        })
      }
    },

    // 记录删除操作日志
    async logDeleteOperation(id, rowData, mode, errorMsg = null) {
      const deleteLog = {
        timestamp: Date.now(),
        action: errorMsg ? 'DELETE_ERROR' : 'DELETE_RESOURCE',
        target: 'RESOURCE_CENTER',
        mode: mode, // 'database', 'localStorage', 'database_error'
        data: {
          id: id,
          country: rowData.country,
          dataType: rowData.dataType,
          quantity: rowData.availableQuantity,
          value: (rowData.availableQuantity * (rowData.currentSellPrice || rowData.sellPrice)).toFixed(2) + ' U'
        },
        operator: this.$store.getters.name || 'admin',
        error: errorMsg
      }

      // 尝试保存到数据库或localStorage
      try {
        if (process.env.VUE_APP_USE_DATABASE === 'true' && !errorMsg) {
          // 保存到数据库（如果不是数据库错误）
          await request({
            method: 'POST',
            url: '/api/logs/operation',
            data: deleteLog
          })
        } else {
          // 保存到localStorage
          const savedLogs = localStorage.getItem('operationLogs')
          const logs = savedLogs ? JSON.parse(savedLogs) : []
          logs.unshift(deleteLog)

          // 只保留最近100条日志
          if (logs.length > 100) {
            logs.splice(100)
          }

          localStorage.setItem('operationLogs', JSON.stringify(logs))
        }
      } catch (logError) {
        console.error('❌ 记录操作日志失败:', logError)
      }
    },
    // 加载客户信息
    async loadCustomerInfo() {
      try {
        // 从 Vuex 获取用户信息
        const userInfo = await this.$store.dispatch('user/getInfo')

        if (userInfo && userInfo.type === 'customer') {
          this.customerId = userInfo.id

          // 加载销售价比例
          const response = await request({
            url: `/api/users/${userInfo.id}`,
            method: 'GET'
          })

          if (response.data) {
            this.customerSalePriceRate = response.data.salePriceRate || 1
            this.userBalance = parseFloat(response.data.accountBalance || 0)
          }

          // 加载收藏列表
          await this.loadFavorites()
        }
      } catch (error) {
        console.error('加载客户信息失败:', error)
      }
    },

    // 加载收藏列表
    async loadFavorites() {
      if (!this.customerId) return

      try {
        const response = await request({
          url: `/api/favorites/customer/${this.customerId}`,
          method: 'GET',
          params: { page: 1, limit: 1000 }
        })

        if (response.success && response.data) {
          this.favoriteIds = new Set(response.data.map(fav => fav.dataId))

          // 更新列表中的收藏状态
          this.list.forEach(item => {
            this.$set(item, 'isFavorited', this.favoriteIds.has(item.id))
          })
        }
      } catch (error) {
        console.error('加载收藏列表失败:', error)
      }
    },

    // 处理收藏/取消收藏
    async handleFavorite(row) {
      if (!this.customerId) {
        this.$message.error('请先登录')
        return
      }

      try {
        if (row.isFavorited) {
          // 取消收藏
          await request({
            url: `/api/favorites/by-data/${this.customerId}/${row.id}`,
            method: 'DELETE'
          })

          this.favoriteIds.delete(row.id)
          this.$set(row, 'isFavorited', false)
          this.$message.success('取消收藏成功')
        } else {
          // 添加收藏
          await request({
            url: '/api/favorites',
            method: 'POST',
            data: {
              customer_id: this.customerId,
              data_id: row.id
            }
          })

          this.favoriteIds.add(row.id)
          this.$set(row, 'isFavorited', true)
          this.$message.success('收藏成功')
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
        const msg = error.response?.data?.message || error.message || '操作失败'
        this.$message.error(msg)
      }
    },

    // 加载账户统计信息（根据角色显示不同数据）
    async loadAccountStats() {
      console.log('📊 开始加载账户统计信息...')

      try {
        // 获取当前用户信息
        const userInfo = this.$store.getters.userInfo
        if (!userInfo) {
          console.log('⚠️ 未找到当前用户信息')
          return
        }

        const userType = userInfo.type || 'customer'
        const userId = userInfo.id

        console.log(`👤 当前用户: ${userType} (ID: ${userId})`)

        // 调用后端API获取统计数据
        const response = await request({
          method: 'GET',
          url: `/api/stats/resource-center/${userType}/${userId}`
        })

        if (response.success && response.data) {
          this.userBalance = parseFloat(response.data.totalBalance || 0)
          this.totalPurchased = parseInt(response.data.totalPurchased || 0)
          this.totalSpent = parseFloat(response.data.totalSpent || 0)

          console.log('✅ 统计数据加载成功:')
          console.log(`  - 账户余额: ${this.userBalance} U`)
          console.log(`  - 已购买数据: ${this.totalPurchased.toLocaleString()} 条`)
          console.log(`  - 累计消费: ${this.totalSpent} U`)
        } else {
          console.warn('🔄 API返回失败，使用localStorage备用方案')
          this.loadAccountStatsFromLocalStorage()
        }
      } catch (error) {
        console.error('❌ 加载统计数据失败:', error)
        console.log('🔄 使用localStorage备用方案')
        this.loadAccountStatsFromLocalStorage()
      }
    },

    // 从localStorage加载统计数据（备用方案）
    loadAccountStatsFromLocalStorage() {
      console.log('📱 使用localStorage加载统计数据...')

      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        console.log('⚠️ 未找到当前用户信息')
        return
      }

      try {
        const userData = JSON.parse(currentUser)
        const userType = userData.type

        const savedUsers = localStorage.getItem('userList')
        const savedOrders = localStorage.getItem('orderList')

        if (userType === 'admin') {
          // 管理员：显示所有客户的总额
          if (savedUsers) {
            const users = JSON.parse(savedUsers)
            const allCustomers = users.filter(u => u.type === 'customer')

            this.userBalance = allCustomers.reduce((sum, customer) =>
              sum + parseFloat(customer.accountBalance || 0), 0
            )
          }

          if (savedOrders) {
            const orders = JSON.parse(savedOrders)
            this.totalPurchased = orders.reduce((sum, order) =>
              sum + parseInt(order.quantity || 0), 0
            )
            this.totalSpent = orders.reduce((sum, order) =>
              sum + parseFloat(order.totalAmount || 0), 0
            ).toFixed(2)
          }
        } else if (userType === 'agent') {
          // 代理：显示本代理下所有客户的总额
          if (savedUsers) {
            const users = JSON.parse(savedUsers)
            const agentCustomers = users.filter(u =>
              u.type === 'customer' && u.agentId === userData.id
            )

            this.userBalance = agentCustomers.reduce((sum, customer) =>
              sum + parseFloat(customer.accountBalance || 0), 0
            )

            const customerIds = agentCustomers.map(c => c.id)

            if (savedOrders && customerIds.length > 0) {
              const orders = JSON.parse(savedOrders)
              const agentOrders = orders.filter(order =>
                customerIds.includes(order.customerId)
              )

              this.totalPurchased = agentOrders.reduce((sum, order) =>
                sum + parseInt(order.quantity || 0), 0
              )
              this.totalSpent = agentOrders.reduce((sum, order) =>
                sum + parseFloat(order.totalAmount || 0), 0
              ).toFixed(2)
            }
          }
        } else if (userType === 'customer') {
          // 客户：显示本客户的信息
          if (savedUsers) {
            const users = JSON.parse(savedUsers)
            const customer = users.find(u => u.id === userData.id)
            if (customer) {
              this.userBalance = parseFloat(customer.accountBalance || 0)
            }
          }

          if (savedOrders) {
            const orders = JSON.parse(savedOrders)
            const customerOrders = orders.filter(order =>
              order.customerId === userData.id
            )

            this.totalPurchased = customerOrders.reduce((sum, order) =>
              sum + parseInt(order.quantity || 0), 0
            )
            this.totalSpent = customerOrders.reduce((sum, order) =>
              sum + parseFloat(order.totalAmount || 0), 0
            ).toFixed(2)
          }
        }

        console.log('✅ localStorage统计数据加载成功')
        console.log(`  - 账户余额: ${this.userBalance} U`)
        console.log(`  - 已购买数据: ${this.totalPurchased.toLocaleString()} 条`)
        console.log(`  - 累计消费: ${this.totalSpent} U`)
      } catch (error) {
        console.error('❌ localStorage加载统计数据失败:', error)
      }
    },
    // 计算销售价比例后的价格
    calculateDiscountedPrice(originalPrice) {
      if (!this.customerSalePriceRate || this.customerSalePriceRate <= 0) {
        return originalPrice
      }
      const finalPrice = originalPrice * this.customerSalePriceRate
      return finalPrice.toFixed(4)
    },

    // 获取默认数据（如果 localStorage 中没有数据）
    getDefaultData() {
      return [
        {
          id: 1,
          country: '孟加拉国',
          countryCode: 'BD',
          validity: '3',
          source: 'Grameenphone官方',
          dataType: '手机号码',
          availableQuantity: 500000,
          operators: [
            { name: 'Grameenphone', count: 150000 },
            { name: 'Robi', count: 150000 },
            { name: 'Banglalink', count: 100000 },
            { name: 'Teletalk', count: 100000 }
          ],
          sellPrice: 0.05,
          status: 'available'
        },
        {
          id: 2,
          country: '孟加拉国',
          countryCode: 'BD',
          validity: '30',
          source: '第三方采集',
          dataType: '用户资料',
          availableQuantity: 800000,
          operators: [
            { name: 'Grameenphone', count: 200000 },
            { name: 'Robi', count: 200000 },
            { name: 'Banglalink', count: 200000 },
            { name: 'Teletalk', count: 200000 }
          ],
          sellPrice: 0.04,
          status: 'available'
        },
        {
          id: 3,
          country: '印度',
          countryCode: 'IN',
          validity: '30+',
          source: '合作伙伴',
          dataType: '电话号码',
          availableQuantity: 1200000,
          operators: [
            { name: 'Airtel', count: 400000 },
            { name: 'Jio', count: 400000 },
            { name: 'Vi', count: 300000 },
            { name: 'BSNL', count: 100000 }
          ],
          sellPrice: 0.03,
          status: 'available'
        }
      ]
    },

    // 应用筛选条件
    applyFilters(dataList) {
      let filteredList = [...dataList]

      // 过滤掉已售罄的数据（availableQuantity <= 0 或 status === 'sold_out'）
      filteredList = filteredList.filter(item => {
        return item.availableQuantity > 0 && item.status !== 'sold_out'
      })

      // 国家筛选
      if (this.listQuery.country) {
        filteredList = filteredList.filter(item => {
          return item.countryCode === this.listQuery.country ||
                 (item.country && item.country.includes(this.listQuery.country))
        })
      }

      // 时效筛选
      if (this.listQuery.validity) {
        filteredList = filteredList.filter(item => item.validity === this.listQuery.validity)
      }

      // 数据来源筛选
      if (this.listQuery.source) {
        filteredList = filteredList.filter(item =>
          item.source && item.source.toLowerCase().includes(this.listQuery.source.toLowerCase())
        )
      }

      return filteredList
    },

    // 国家相关方法
    initCountryData() {
      // 初始化热门国家
      this.popularCountries = getPopularCountries()
      // 初始化分组国家（仅在未搜索时显示）
      this.filteredCountries = []
    },

    initCountryOptions() {
      // 焦点时初始化国家选项
      if (!this.countrySearchKeyword) {
        this.showPopularCountries = true
        this.filteredCountries = []
      }
    },

    searchCountries(keyword) {
      this.countrySearchKeyword = keyword
      this.countryLoading = true

      // 模拟异步搜索
      setTimeout(() => {
        if (keyword) {
          this.showPopularCountries = false
          this.filteredCountries = filterCountries(keyword)
        } else {
          this.showPopularCountries = true
          this.filteredCountries = []
        }
        this.countryLoading = false
      }, 300)
    },

    getCountryText(countryCode) {
      const country = getCountryByCode(countryCode)
      return country ? country.name : countryCode
    },

    // 辅助方法：获取时效性文本
    getValidityText(validity) {
      switch (validity) {
        case '3':
          return '3天内'
        case '30':
          return '30天内'
        case '30+':
          return '30天以上'
        default:
          return validity || '未知'
      }
    },

    // 辅助方法：格式化数字
    formatNumber(num) {
      return num ? num.toLocaleString() : '0'
    },

    // 辅助方法：获取时效性标签类型
    getValidityTagType(validity) {
      return getValidityTagType(validity)
    },

    // 辅助方法：格式化价格
    formatPrice(price) {
      return formatPrice(price)
    },

    // 辅助方法：格式化时间差
    formatTimeDifference(publishTime) {
      return formatTimeDifference(publishTime)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
  }
}

.balance-card {
  position: relative;
  overflow: hidden;

  .balance-content {
    .balance-number {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 5px;
    }

    .balance-label {
      font-size: 14px;
      color: #606266;
    }
  }

  .balance-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 40px;
    color: #ddd;
  }
}

.operator-distribution {
  .operator-item {
    margin-bottom: 5px;

    .operator-name {
      font-weight: bold;
      margin-right: 5px;
    }

    .operator-count {
      color: #409eff;
      margin-right: 5px;
    }

    .operator-percent {
      color: #909399;
      font-size: 12px;
    }
  }
}

.price-highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 14px;
}

.price-info {
  .current-price {
    color: #f56c6c;
    font-weight: bold;
    font-size: 14px;
  }

  .original-price {
    margin-top: 3px;
    font-size: 11px;
    color: #909399;

    .original-price-text {
      text-decoration: line-through;
      margin-right: 5px;
    }

    .discount-text {
      color: #67c23a;
      font-style: italic;
    }
  }
}

.validity-info {
  .time-info {
    margin-top: 3px;
    font-size: 11px;
    color: #909399;
  }
}

.original-price {
  margin-top: 2px;

  .original-price-text {
    color: #909399;
    font-size: 11px;
    text-decoration: line-through;
  }
}

// 国家选择器样式优化
::v-deep .el-select-dropdown {
  .el-select-group__title {
    font-weight: bold;
    color: #409eff;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-option {
    height: auto;
    line-height: 1.5;
    padding: 8px 20px;

    &:hover {
      background-color: #f5f7fa;
    }

    .el-option__text {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

// 热门国家分组样式
::v-deep .el-select-group:first-child {
  .el-select-group__title {
    color: #f56c6c;
    background-color: #fef0f0;
  }
}

// 删除按钮样式（根据项目规范：危险操作使用红色标识）
.delete-btn {
  color: #f56c6c !important;
  border-color: #f56c6c !important;
  background-color: #fef0f0 !important;

  &:hover {
    background-color: #f56c6c !important;
    border-color: #f56c6c !important;
    color: #fff !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  // 闪烁动画提示危险性
  animation: danger-pulse 2s infinite;
}

@keyframes danger-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(245, 108, 108, 0.1);
  }
}

// 危险操作确认对话框样式
::v-deep .dangerous-operation-confirm {
  .el-message-box__header {
    background-color: #fef0f0;
    border-bottom: 1px solid #f56c6c;

    .el-message-box__title {
      color: #f56c6c;
      font-weight: bold;
    }
  }

  .el-message-box__btns {
    .el-button--primary {
      background-color: #f56c6c;
      border-color: #f56c6c;

      &:hover {
        background-color: #f78989;
        border-color: #f78989;
      }
    }
  }
}
</style>
