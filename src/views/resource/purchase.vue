<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('resource.purchase') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </el-button>
      </div>

      <div v-if="dataInfo">
        <!-- 数据信息展示 -->
        <el-row :gutter="20" style="margin-bottom: 30px;">
          <el-col :span="16">
            <el-card class="data-info-card">
              <div slot="header">数据信息</div>
              <el-form label-width="120px">
                <el-form-item label="数据ID">
                  {{ dataInfo.id }}
                </el-form-item>
                <el-form-item label="国家">
                  {{ dataInfo.country }}
                </el-form-item>
                <el-form-item label="数据类型">
                  {{ dataInfo.dataType || '未知类型' }}
                </el-form-item>
                <el-form-item label="时效性">
                  <el-tag :type="getValidityTagType(dataInfo.validity)">
                    {{ getValidityText(dataInfo.validity) }}
                  </el-tag>
                </el-form-item>
                <el-form-item label="数据来源">
                  {{ dataInfo.source }}
                </el-form-item>
                <el-form-item label="可购买数量">
                  {{ formatNumber(dataInfo.availableQuantity) }}
                </el-form-item>
                <el-form-item label="单价">
                  <span class="price-highlight">{{ actualPrice }} U/条</span>
                </el-form-item>
                <el-form-item label="运营商分布">
                  <div class="operator-distribution">
                    <el-tag
                      v-for="operator in dataInfo.operators"
                      :key="operator.name"
                      class="operator-tag"
                    >
                      {{ operator.name }}: {{ formatNumber(operator.count) }}
                    </el-tag>
                  </div>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="balance-info-card">
              <div slot="header">账户信息</div>
              <div class="balance-info">
                <div class="balance-item">
                  <span class="balance-label">当前余额:</span>
                  <span class="balance-value">{{ userBalance }} U</span>
                </div>
                <div class="balance-item">
                  <span class="balance-label">预估费用:</span>
                  <span class="estimated-cost">{{ estimatedCost }} U</span>
                </div>
                <div class="balance-item">
                  <span class="balance-label">余额充足:</span>
                  <el-tag :type="balanceStatus.type">
                    {{ balanceStatus.text }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 购买表单 -->
        <el-form
          ref="purchaseForm"
          :model="purchaseForm"
          :rules="rules"
          label-width="120px"
          class="purchase-form"
        >
          <el-divider content-position="left">购买设置</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('resource.selectQuantity')" prop="quantity">
                <el-input-number
                  v-model="purchaseForm.quantity"
                  :min="1"
                  :max="dataInfo.availableQuantity"
                  style="width: 100%"
                  controls-position="right"
                  :placeholder="$t('resource.quantityRequired')"
                  @change="calculateCost"
                />
                <div class="quantity-tips">
                  最大可购买: {{ formatNumber(dataInfo.availableQuantity) }} 条
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('resource.deliveryEmail')" prop="email">
                <el-input
                  v-model="purchaseForm.email"
                  :placeholder="$t('resource.emailRequired')"
                />
                <div class="email-tips">
                  {{ $t('resource.autoDelivery') }}
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item :label="$t('resource.selectOperator')" prop="operators">
            <el-checkbox-group v-model="purchaseForm.operators" @change="handleOperatorChange">
              <el-checkbox
                v-for="operator in dataInfo.operators"
                :key="operator.name"
                :label="operator.name"
                class="operator-checkbox"
              >
                <div class="operator-option">
                  <span class="operator-name">{{ operator.name }}</span>
                  <span class="operator-count">({{ formatNumber(operator.count) }}条)</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
            <div class="operator-tips">
              * 可选择多个运营商，系统将按比例分配数据
            </div>
          </el-form-item>

          <!-- 运营商数量分配 -->
          <el-form-item v-if="purchaseForm.operators.length > 0" label="数量分配">
            <div v-for="operator in selectedOperators" :key="operator.name" class="operator-allocation">
              <span class="allocation-label">{{ operator.name }}:</span>
              <el-input-number
                v-model="operator.allocated"
                :min="0"
                :max="operator.maxCount"
                size="small"
                style="width: 120px"
                @change="handleAllocationChange"
              />
              <span class="allocation-info">/ {{ formatNumber(operator.maxCount) }} 条</span>
            </div>
            <div class="allocation-summary">
              已分配总数: {{ formatNumber(totalAllocated) }} / {{ formatNumber(purchaseForm.quantity) }}
            </div>
          </el-form-item>

          <el-form-item label="购买备注" prop="remark">
            <el-input
              v-model="purchaseForm.remark"
              type="textarea"
              :rows="3"
              placeholder="可填写购买备注信息（选填）"
            />
          </el-form-item>

          <!-- 费用明细 -->
          <el-form-item label="费用明细">
            <div class="cost-summary">
              <div class="cost-item">
                <span>购买数量:</span>
                <span>{{ formatNumber(purchaseForm.quantity || 0) }} 条</span>
              </div>
              <div class="cost-item">
                <span>单价:</span>
                <span>{{ actualPrice }} U/条</span>
              </div>
              <div class="cost-item total">
                <span>{{ $t('resource.totalPrice') }}:</span>
                <span class="total-price">{{ estimatedCost }} U</span>
              </div>
            </div>
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              :loading="purchaseLoading"
              :disabled="!canPurchase"
              @click="submitPurchase"
            >
              {{ $t('resource.confirmPurchase') }}
            </el-button>
            <el-button @click="resetForm">
              {{ $t('common.reset') }}
            </el-button>
            <el-button @click="goBack">
              {{ $t('common.cancel') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import i18nMixin from '@/mixins/i18n'
import request from '@/utils/request'

export default {
  name: 'ResourcePurchase',
  mixins: [i18nMixin],
  data() {
    return {
      dataInfo: null,
      userBalance: 0,
      customerSalePriceRate: 1, // 客户销售价比例
      purchaseForm: {
        quantity: 1000,
        email: '',
        operators: [],
        remark: ''
      },
      selectedOperators: [],
      rules: {
        quantity: [
          { required: true, message: this.$t('resource.quantityRequired'), trigger: 'blur' },
          { type: 'number', min: 1, message: '购买数量必须大于0', trigger: 'blur' }
        ],
        email: [
          { required: true, message: this.$t('resource.emailRequired'), trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        operators: [
          { required: true, message: this.$t('resource.operatorRequired'), trigger: 'change' }
        ]
      },
      purchaseLoading: false
    }
  },
  computed: {
    // 计算根据销售价比例后的实际价格
    actualPrice() {
      if (!this.dataInfo) return '0.00'
      const finalPrice = this.dataInfo.sellPrice * this.customerSalePriceRate
      return finalPrice.toFixed(4)
    },
    estimatedCost() {
      if (!this.purchaseForm.quantity) return '0.00'
      return (parseFloat(this.actualPrice) * this.purchaseForm.quantity).toFixed(2)
    },
    balanceStatus() {
      const cost = parseFloat(this.estimatedCost)
      if (this.userBalance >= cost) {
        return { type: 'success', text: '是' }
      } else {
        return { type: 'danger', text: '否' }
      }
    },
    canPurchase() {
      return this.userBalance >= parseFloat(this.estimatedCost) &&
             this.purchaseForm.quantity > 0 &&
             this.purchaseForm.operators.length > 0 &&
             this.totalAllocated === this.purchaseForm.quantity
    },
    totalAllocated() {
      return this.selectedOperators.reduce((sum, op) => sum + (op.allocated || 0), 0)
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.loadCustomerInfo()
    this.loadUserEmail()
    this.fetchDataInfo(id)
  },
  methods: {
    // 加载客户信息（包括销售价比例和账户余额）
    async loadCustomerInfo() {
      console.log('📊 开始加载客户信息...')

      try {
        // 从数据库API获取客户信息
        await this.loadCustomerInfoFromAPI()
      } catch (error) {
        console.error('❌ 从API加载客户信息失败:', error)
        this.$message.error('加载客户信息失败，请刷新页面重试')
      }
    },

    // 从数据库API加载客户信息
    async loadCustomerInfoFromAPI() {
      console.log('💾 从数据库API加载客户信息...')

      try {
        // 获取当前用户信息
        const userInfo = this.$store.getters.userInfo
        console.log('👤 Store中的用户信息:', userInfo)

        if (!userInfo) {
          console.warn('⚠️ Store中没有用户信息，尝试重新获取...')
          // 尝试重新获取用户信息
          await this.$store.dispatch('user/getInfo')
          const retryUserInfo = this.$store.getters.userInfo
          if (!retryUserInfo) {
            throw new Error('无法获取用户信息，请重新登录')
          }
          console.log('✅ 重新获取成功:', retryUserInfo)
        }

        const currentUserInfo = this.$store.getters.userInfo
        const userType = currentUserInfo.type || currentUserInfo.userType || 'customer'
        
        console.log('👤 用户类型:', userType)

        if (userType !== 'customer') {
          console.warn('⚠️ 当前用户不是客户类型，类型为:', userType)
          // 非客户用户也允许查看购买页面，但余额设为0
          this.userBalance = 0
          this.customerSalePriceRate = 1
          return
        }

        const userId = currentUserInfo.id
        console.log('👤 当前客户ID:', userId)

        // 调用后端API获取客户详细信息
        const response = await request({
          method: 'GET',
          url: `/api/users/${userId}`
        })

        if (response.success && response.data) {
          const customerData = response.data

          // 加载销售价比例
          this.customerSalePriceRate = customerData.salePriceRate || 1

          // 加载账户余额
          this.userBalance = parseFloat(customerData.accountBalance || 0)

          console.log('✅ 客户信息加载成功:', {
            客户ID: userId,
            销售价比例: this.customerSalePriceRate,
            账户余额: this.userBalance
          })
        } else {
          throw new Error('API返回数据格式错误')
        }
      } catch (error) {
        console.error('❌ 从API加载客户信息失败:', error)
        throw error
      }
    },
    // 加载用户邮箱
    async loadUserEmail() {
      console.log('📧 从数据库API加载用户邮箱...')

      try {
        // 获取当前用户信息
        const userInfo = this.$store.getters.userInfo
        if (!userInfo) {
          console.warn('⚠️ 用户信息不存在，无法加载邮箱')
          return
        }

        const userType = userInfo.type || userInfo.userType || 'customer'
        if (userType !== 'customer') {
          console.warn('⚠️ 当前用户不是客户类型，无需加载邮箱')
          return
        }

        const userId = userInfo.id

        // 调用后端API获取客户详细信息
        const response = await request({
          method: 'GET',
          url: `/api/users/${userId}`
        })

        if (response.success && response.data && response.data.email) {
          this.purchaseForm.email = response.data.email
          console.log('✅ 用户邮箱加载成功:', this.purchaseForm.email)
        }
      } catch (e) {
        console.error('❌ 加载用户邮箱失败:', e)
        // 邮箱加载失败不影响页面显示，只记录日志
      }
    },
    async fetchDataInfo(id) {
      console.log('🔍 正在获取数据信息, ID:', id)

      try {
        // 从数据库API获取数据
        await this.fetchDataFromAPI(id)
      } catch (error) {
        console.error('❌ 获取数据信息失败:', error)
        this.$message.error('获取数据信息失败，请返回重新选择')
        this.$router.go(-1)
      }
    },

    // 从数据库API获取数据信息
    async fetchDataFromAPI(id) {
      console.log('💾 从数据库API获取数据信息...')

      try {
        const response = await request({
          method: 'GET',
          url: '/api/data-library/published',
          params: {
            page: 1,
            limit: 1000  // 获取足够多的数据
          }
        })

        if (response.success && response.data) {
          const dataList = response.data
          console.log('📄 API返回数据:', dataList.length, '条')

          // 查找目标数据
          const targetData = dataList.find(item => String(item.id) === String(id))

          if (!targetData) {
            throw new Error(`数据ID ${id} 不存在于数据库中`)
          }

          console.log('✅ 找到目标数据:', targetData)

          // 设置数据信息（数据库格式转换）
          this.dataInfo = {
            id: targetData.id,
            country: targetData.country_name || targetData.country || '未知国家',
            countryCode: targetData.country || '',
            dataType: targetData.data_type || '未知类型',
            validity: targetData.validity || '3',
            source: targetData.source || '未知来源',
            availableQuantity: targetData.available_quantity || 0,
            sellPrice: parseFloat(targetData.sell_price) || 0.05,
            costPrice: parseFloat(targetData.cost_price) || 0.03,
            operators: (typeof targetData.operators === 'string' ? JSON.parse(targetData.operators) : (targetData.operators || [])).map(op => ({
              name: op.name,
              count: op.quantity || op.count || 0
            })),
            remark: targetData.remark || '',
            uploadTime: targetData.upload_time,
            status: targetData.status || 'available'
          }

          console.log('🎯 数据信息设置完成:', {
            id: this.dataInfo.id,
            country: this.dataInfo.country,
            dataType: this.dataInfo.dataType,
            quantity: this.dataInfo.availableQuantity,
            price: this.dataInfo.sellPrice,
            operators: this.dataInfo.operators.length
          })

          // 设置默认购买数量（不超过可用数量）
          const defaultQuantity = Math.min(1000, this.dataInfo.availableQuantity)
          this.purchaseForm.quantity = defaultQuantity

          // 检查运营商数据
          if (this.dataInfo.operators && this.dataInfo.operators.length > 0) {
            console.log('📅 可用运营商:', this.dataInfo.operators.map(op => op.name))
          } else {
            console.log('⚠️ 没有运营商数据，将使用默认运营商')
            this.dataInfo.operators = [{
              name: '默认运营商',
              count: this.dataInfo.availableQuantity
            }]
          }
        } else {
          throw new Error('API返回数据格式错误')
        }
      } catch (error) {
        console.error('❌ 从API获取数据失败:', error)
        throw error
      }
    },

    // 从localStorage获取数据信息（备用方案）
    calculateCost() {
      // 成本计算已在computed中处理
    },
    handleOperatorChange(selected) {
      this.selectedOperators = this.dataInfo.operators
        .filter(op => selected.includes(op.name))
        .map(op => ({
          name: op.name,
          maxCount: Math.min(op.count, this.purchaseForm.quantity),
          allocated: 0
        }))

      // 自动平均分配
      this.autoAllocate()
    },
    autoAllocate() {
      if (this.selectedOperators.length === 0) return

      const avgAllocation = Math.floor(this.purchaseForm.quantity / this.selectedOperators.length)
      let remaining = this.purchaseForm.quantity

      this.selectedOperators.forEach((op, index) => {
        if (index === this.selectedOperators.length - 1) {
          op.allocated = remaining
        } else {
          const allocation = Math.min(avgAllocation, op.maxCount)
          op.allocated = allocation
          remaining -= allocation
        }
      })
    },
    handleAllocationChange() {
      // 分配变更处理
    },
    submitPurchase() {
      this.$refs.purchaseForm.validate((valid) => {
        if (valid) {
          if (this.totalAllocated !== this.purchaseForm.quantity) {
            this.$message.error('运营商数量分配总数必须等于购买数量')
            return
          }

          this.$confirm(
            `确认购买 ${this.formatNumber(this.purchaseForm.quantity)} 条数据，费用 ${this.estimatedCost} U？`,
            this.$t('common.warning'),
            {
              confirmButtonText: this.$t('common.confirm'),
              cancelButtonText: this.$t('common.cancel'),
              type: 'warning'
            }
          ).then(async () => {
            this.purchaseLoading = true

            try {
              // 调用后端API创建购买订单（包含所有操作）
              await this.createPurchaseOrderAPI()

              this.$message.success(this.$t('resource.purchaseSuccess'))
              this.purchaseLoading = false
              
              // 跳转到订单列表
              this.$router.push('/order/list')
            } catch (error) {
              console.error('❌ 购买失败:', error)
              this.$message.error('购买失败：' + (error.message || '未知错误'))
              this.purchaseLoading = false
            }
          }).catch(() => {})
        }
      })
    },

    // 调用API创建购买订单（包含所有操作）
    async createPurchaseOrderAPI() {
      console.log('📝 开始调用API创建购买订单...')

      try {
        // 获取当前用户信息
        const userInfo = this.$store.getters.userInfo
        if (!userInfo || !userInfo.id) {
          throw new Error('用户信息不存在')
        }

        // 准备订单数据
        const orderData = {
          customerId: userInfo.id,
          customerName: userInfo.customerName || userInfo.username,
          dataId: this.dataInfo.id,
          country: this.dataInfo.country,
          dataType: this.dataInfo.dataType,
          validity: this.dataInfo.validity,
          source: this.dataInfo.source,
          quantity: this.purchaseForm.quantity,
          unitPrice: parseFloat(this.actualPrice),
          totalAmount: parseFloat(this.estimatedCost),
          deliveryEmail: this.purchaseForm.email,
          operators: this.selectedOperators.map(op => ({
            name: op.name,
            count: op.allocated
          })),
          remark: this.purchaseForm.remark || ''
        }

        console.log('📦 订单数据:', orderData)

        // 调用后端API创建订单
        const response = await request({
          method: 'POST',
          url: '/api/orders/purchase',
          data: orderData
        })

        if (response.success && response.data) {
          console.log('✅ 订单创建成功:', {
            订单号: response.data.orderNo,
            订单ID: response.data.id,
            总金额: response.data.totalAmount + ' U'
          })

          // 更新当前显示的余额（如果后端返回了新余额）
          if (response.data.newBalance !== undefined) {
            this.userBalance = parseFloat(response.data.newBalance)
            console.log('✅ 余额已更新:', this.userBalance, 'U')
          }
        } else {
          throw new Error(response.message || 'API返回数据格式错误')
        }
      } catch (error) {
        console.error('❌ 创建订单API调用失败:', error)
        throw error
      }
    },

    resetForm() {
      this.$refs.purchaseForm.resetFields()
      this.selectedOperators = []
    },
    goBack() {
      this.$router.go(-1)
    },
    formatNumber(num) {
      return num.toLocaleString()
    },
    getValidityText(validity) {
      const validityMap = {
        '3': '3天内',
        '30': '30天内',
        '30+': '30天以上'
      }
      return validityMap[validity] || validity
    },
    getValidityTagType(validity) {
      const tagMap = {
        '3': 'danger',
        '30': 'warning',
        '30+': 'success'
      }
      return tagMap[validity]
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-form {
  max-width: 800px;
  margin: 0 auto;
}

.data-info-card, .balance-info-card {
  height: 100%;
}

.operator-distribution {
  .operator-tag {
    margin-right: 10px;
    margin-bottom: 5px;
  }
}

.balance-info {
  .balance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .balance-label {
      font-weight: bold;
      color: #606266;
    }

    .balance-value {
      color: #67c23a;
      font-weight: bold;
      font-size: 16px;
    }

    .estimated-cost {
      color: #f56c6c;
      font-weight: bold;
      font-size: 16px;
    }
  }
}

.price-highlight {
  color: #f56c6c;
  font-weight: bold;
}

.quantity-tips, .email-tips, .operator-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.operator-checkbox {
  display: block;
  margin-bottom: 10px;

  .operator-option {
    .operator-name {
      font-weight: bold;
    }

    .operator-count {
      color: #909399;
      margin-left: 5px;
    }
  }
}

.operator-allocation {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .allocation-label {
    width: 120px;
    font-weight: bold;
  }

  .allocation-info {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
  }
}

.allocation-summary {
  font-weight: bold;
  color: #409eff;
  margin-top: 10px;
}

.cost-summary {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;

  .cost-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    &.total {
      border-top: 1px solid #ddd;
      padding-top: 10px;
      font-weight: bold;

      .total-price {
        color: #f56c6c;
        font-size: 18px;
      }
    }
  }
}
</style>
