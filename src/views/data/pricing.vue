<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span><i class="el-icon-s-grid" /> 定价模板管理</span>
        <el-button style="float: right" type="primary" size="small" @click="showCreateDialog">
          <i class="el-icon-plus" /> 创建模板
        </el-button>
      </div>

      <!-- 筛选条件 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板名称"
            prefix-icon="el-icon-search"
            clearable
            @input="fetchTemplates"
          />
        </el-col>
        <el-col :span="5">
          <el-select
            v-model="filterCountry"
            placeholder="筛选国家"
            clearable
            @change="fetchTemplates"
          >
            <el-option label="全部国家" value="" />
            <el-option
              v-for="country in countryList"
              :key="country.code"
              :label="country.name"
              :value="country.code"
            />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select
            v-model="filterValidity"
            placeholder="筛选时效性"
            clearable
            @change="fetchTemplates"
          >
            <el-option label="全部时效" value="" />
            <el-option label="3天内" value="3" />
            <el-option label="30天内" value="30" />
            <el-option label="30天以上" value="30+" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="filterStatus"
            placeholder="筛选状态"
            clearable
            @change="fetchTemplates"
          >
            <el-option label="全部状态" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-refresh" @click="fetchTemplates">
            刷新
          </el-button>
        </el-col>
      </el-row>

      <!-- 模板列表 -->
      <el-table
        v-loading="loading"
        :data="templateList"
        border
        style="width: 100%"
      >
        <el-table-column label="模板名称" prop="template_name" min-width="150" show-overflow-tooltip />
        <el-table-column label="国家" width="120" align="center">
          <template slot-scope="{row}">
            {{ row.country_name }}
          </template>
        </el-table-column>
        <el-table-column label="数据类型" prop="data_type" width="120" align="center">
          <template slot-scope="{row}">
            <el-tag v-if="row.data_type" size="small">{{ row.data_type }}</el-tag>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="数据来源" prop="data_source" width="120" align="center">
          <template slot-scope="{row}">
            <el-tag v-if="row.data_source" type="info" size="small">{{ row.data_source }}</el-tag>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="时效性" prop="validity" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag v-if="row.validity" :type="getValidityTagType(row.validity)" size="small">
              {{ getValidityText(row.validity) }}
            </el-tag>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="成本价(U/条)" prop="cost_price" width="120" align="center">
          <template slot-scope="{row}">
            <span class="price-text">{{ formatPrice(row.cost_price) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销售价(U/条)" prop="sell_price" width="120" align="center">
          <template slot-scope="{row}">
            <span class="price-text price-sell">{{ formatPrice(row.sell_price) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="利润率" width="100" align="center">
          <template slot-scope="{row}">
            <span :class="getProfitClass(calculateProfitRate(row.cost_price, row.sell_price))">
              {{ calculateProfitRate(row.cost_price, row.sell_price) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="{row}">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="默认" width="80" align="center">
          <template slot-scope="{row}">
            <el-tag v-if="row.is_default === 1" type="success" size="mini">默认</el-tag>
            <el-button v-else type="text" size="mini" @click="setDefaultTemplate(row)">
              设为默认
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150" align="center">
          <template slot-scope="{row}">
            {{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteTemplate(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 创建/编辑模板对话框 -->
    <el-dialog
      :title="dialogMode === 'create' ? '创建定价模板' : '编辑定价模板'"
      :visible.sync="dialogVisible"
      width="700px"
      @close="resetForm"
    >
      <el-form ref="templateForm" :model="templateForm" :rules="formRules" label-width="120px">
        <el-form-item label="模板名称" prop="template_name">
          <el-input v-model="templateForm.template_name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="国家" prop="country">
          <el-select
            v-model="templateForm.country"
            placeholder="请选择国家"
            filterable
            style="width: 100%"
            @change="handleCountryChange"
          >
            <el-option
              v-for="country in countryList"
              :key="country.code"
              :label="country.name"
              :value="country.code"
            >
              <span style="float: left">{{ country.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ country.dialCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据类型">
          <el-input v-model="templateForm.data_type" placeholder="例如：手机号、邮箱等（选填）" />
        </el-form-item>
        <el-form-item label="数据来源">
          <el-input v-model="templateForm.data_source" placeholder="例如：渠道A、渠道B等（选填）" />
        </el-form-item>
        <el-form-item label="时效性">
          <el-select v-model="templateForm.validity" placeholder="请选择时效性（选填）" clearable style="width: 100%">
            <el-option label="3天内" value="3" />
            <el-option label="30天内" value="30" />
            <el-option label="30天以上" value="30+" />
          </el-select>
        </el-form-item>
        <el-form-item label="成本价(U/条)" prop="cost_price">
          <el-input-number
            v-model="templateForm.cost_price"
            :precision="4"
            :step="0.001"
            :min="0"
            style="width: 100%"
            @change="handleFormPriceChange"
          />
        </el-form-item>
        <el-form-item label="销售价(U/条)" prop="sell_price">
          <el-input-number
            v-model="templateForm.sell_price"
            :precision="4"
            :step="0.001"
            :min="0"
            style="width: 100%"
            @change="handleFormPriceChange"
          />
        </el-form-item>
        <el-form-item label="利润率">
          <el-input :value="formProfitRate + '%'" disabled />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="templateForm.is_default" :active-value="1" :inactive-value="0" />
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            默认模板将在数据上传时自动应用
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="templateForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveTemplate">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import request from '@/utils/request'
import i18nMixin from '@/mixins/i18n'

export default {
  name: 'PricingTemplate',
  filters: {
    parseTime
  },
  mixins: [i18nMixin],
  data() {
    return {
      loading: false,
      saving: false,
      templateList: [],
      total: 0,
      page: 1,
      limit: 20,
      searchKeyword: '',
      filterCountry: '',
      filterValidity: '',
      filterStatus: '',
      dialogVisible: false,
      dialogMode: 'create', // create | edit
      templateForm: {
        id: null,
        template_name: '',
        country: '',
        country_name: '',
        data_type: '',
        data_source: '',
        validity: '',
        cost_price: 0,
        sell_price: 0,
        is_default: 0,
        status: 1
      },
      formRules: {
        template_name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        country: [
          { required: true, message: '请选择国家', trigger: 'change' }
        ],
        cost_price: [
          { required: true, message: '请输入成本价', trigger: 'blur' }
        ],
        sell_price: [
          { required: true, message: '请输入销售价', trigger: 'blur' }
        ]
      },
      // 国家列表
      countryList: [
        { code: 'CN', name: '中国', dialCode: '+86' },
        { code: 'IN', name: '印度', dialCode: '+91' },
        { code: 'ID', name: '印度尼西亚', dialCode: '+62' },
        { code: 'PK', name: '巴基斯坦', dialCode: '+92' },
        { code: 'BD', name: '孟加拉国', dialCode: '+880' },
        { code: 'JP', name: '日本', dialCode: '+81' },
        { code: 'PH', name: '菲律宾', dialCode: '+63' },
        { code: 'VN', name: '越南', dialCode: '+84' },
        { code: 'TH', name: '泰国', dialCode: '+66' },
        { code: 'MM', name: '缅甸', dialCode: '+95' },
        { code: 'KR', name: '韩国', dialCode: '+82' },
        { code: 'MY', name: '马来西亚', dialCode: '+60' },
        { code: 'SG', name: '新加坡', dialCode: '+65' },
        { code: 'US', name: '美国', dialCode: '+1' },
        { code: 'BR', name: '巴西', dialCode: '+55' },
        { code: 'MX', name: '墨西哥', dialCode: '+52' },
        { code: 'CO', name: '哥伦比亚', dialCode: '+57' },
        { code: 'AR', name: '阿根廷', dialCode: '+54' },
        { code: 'CA', name: '加拿大', dialCode: '+1' },
        { code: 'RU', name: '俄罗斯', dialCode: '+7' },
        { code: 'DE', name: '德国', dialCode: '+49' },
        { code: 'GB', name: '英国', dialCode: '+44' },
        { code: 'FR', name: '法国', dialCode: '+33' },
        { code: 'IT', name: '意大利', dialCode: '+39' },
        { code: 'ES', name: '西班牙', dialCode: '+34' },
        { code: 'NG', name: '尼日利亚', dialCode: '+234' },
        { code: 'EG', name: '埃及', dialCode: '+20' },
        { code: 'ZA', name: '南非', dialCode: '+27' },
        { code: 'AU', name: '澳大利亚', dialCode: '+61' },
        { code: 'NZ', name: '新西兰', dialCode: '+64' }
      ]
    }
  },
  computed: {
    formProfitRate() {
      return this.calculateProfitRate(this.templateForm.cost_price, this.templateForm.sell_price)
    }
  },
  created() {
    this.fetchTemplates()
  },
  methods: {
    // 获取模板列表
    async fetchTemplates() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          limit: this.limit
        }

        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }
        if (this.filterCountry) {
          params.country = this.filterCountry
        }
        if (this.filterValidity) {
          params.validity = this.filterValidity
        }
        if (this.filterStatus !== '') {
          params.status = this.filterStatus
        }

        const response = await request({
          url: '/api/pricing-templates',
          method: 'GET',
          params
        })

        if (response.success) {
          this.templateList = response.data
          this.total = response.total
        } else {
          this.$message.error(response.message || '获取模板列表失败')
        }
      } catch (error) {
        console.error('获取模板列表失败:', error)
        this.$message.error('获取模板列表失败：' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 显示创建对话框
    showCreateDialog() {
      this.dialogMode = 'create'
      this.resetForm()
      this.dialogVisible = true
    },

    // 显示编辑对话框
    showEditDialog(row) {
      this.dialogMode = 'edit'
      this.templateForm = {
        id: row.id,
        template_name: row.template_name,
        country: row.country,
        country_name: row.country_name,
        data_type: row.data_type || '',
        data_source: row.data_source || '',
        validity: row.validity || '',
        cost_price: parseFloat(row.cost_price),
        sell_price: parseFloat(row.sell_price),
        is_default: row.is_default,
        status: row.status
      }
      this.dialogVisible = true
    },

    // 保存模板
    async saveTemplate() {
      this.$refs.templateForm.validate(async(valid) => {
        if (!valid) {
          return false
        }

        this.saving = true
        try {
          const url = this.dialogMode === 'create'
            ? '/api/pricing-templates'
            : `/api/pricing-templates/${this.templateForm.id}`
          const method = this.dialogMode === 'create' ? 'POST' : 'PUT'

          const response = await request({
            url,
            method,
            data: this.templateForm
          })

          // 注意：axios响应拦截器已经解包了response.data，所以直接使用response
          if (response.success) {
            this.$message.success(response.message || '保存成功')
            this.dialogVisible = false
            this.fetchTemplates()
          } else {
            this.$message.error(response.message || '保存失败')
          }
        } catch (error) {
          console.error('保存模板失败:', error)
          this.$message.error('保存失败：' + error.message)
        } finally {
          this.saving = false
        }
      })
    },

    // 删除模板
    async deleteTemplate(row) {
      this.$confirm('确定要删除模板 "' + row.template_name + '" 吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const response = await request({
            url: `/api/pricing-templates/${row.id}`,
            method: 'DELETE'
          })

          if (response.success) {
            this.$message.success('删除成功')
            this.fetchTemplates()
          } else {
            this.$message.error(response.message || '删除失败')
          }
        } catch (error) {
          console.error('删除模板失败:', error)
          this.$message.error('删除失败：' + error.message)
        }
      }).catch(() => {})
    },

    // 设置默认模板
    async setDefaultTemplate(row) {
      try {
        const response = await request({
          url: `/api/pricing-templates/${row.id}/set-default`,
          method: 'POST'
        })

        if (response.success) {
          this.$message.success('设置成功')
          this.fetchTemplates()
        } else {
          this.$message.error(response.message || '设置失败')
        }
      } catch (error) {
        console.error('设置默认模板失败:', error)
        this.$message.error('设置失败：' + error.message)
      }
    },

    // 状态变更
    async handleStatusChange(row) {
      try {
        const response = await request({
          url: `/api/pricing-templates/${row.id}`,
          method: 'PUT',
          data: {
            status: row.status
          }
        })

        if (response.success) {
          this.$message.success('状态修改成功')
        } else {
          this.$message.error(response.message || '修改失败')
          // 恢复原状态
          row.status = row.status === 1 ? 0 : 1
        }
      } catch (error) {
        console.error('修改状态失败:', error)
        this.$message.error('修改失败：' + error.message)
        // 恢复原状态
        row.status = row.status === 1 ? 0 : 1
      }
    },

    // 国家选择变更
    handleCountryChange(countryCode) {
      const country = this.countryList.find(c => c.code === countryCode)
      if (country) {
        this.templateForm.country_name = country.name
      }
    },

    // 价格变更
    handleFormPriceChange() {
      // 自动计算利润率
    },

    // 重置表单
    resetForm() {
      this.templateForm = {
        id: null,
        template_name: '',
        country: '',
        country_name: '',
        data_type: '',
        data_source: '',
        validity: '',
        cost_price: 0,
        sell_price: 0,
        is_default: 0,
        status: 1
      }
      if (this.$refs.templateForm) {
        this.$refs.templateForm.clearValidate()
      }
    },

    // 分页
    handlePageChange(page) {
      this.page = page
      this.fetchTemplates()
    },

    handleSizeChange(size) {
      this.limit = size
      this.page = 1
      this.fetchTemplates()
    },

    // 工具函数
    calculateProfitRate(costPrice, sellPrice) {
      if (costPrice <= 0 || !sellPrice) return 0
      return ((sellPrice - costPrice) / costPrice * 100).toFixed(1)
    },

    formatPrice(price) {
      return parseFloat(price || 0).toFixed(4)
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
      return tagMap[validity] || 'info'
    },

    getProfitClass(profitRate) {
      if (profitRate >= 40) return 'profit-high'
      if (profitRate >= 25) return 'profit-medium'
      return 'profit-low'
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .price-text {
    font-weight: 600;
    color: #606266;
  }

  .price-sell {
    color: #67C23A;
  }

  .profit-high {
    color: #67C23A;
    font-weight: 600;
  }

  .profit-medium {
    color: #E6A23C;
    font-weight: 600;
  }

  .profit-low {
    color: #F56C6C;
    font-weight: 600;
  }
}
</style>
