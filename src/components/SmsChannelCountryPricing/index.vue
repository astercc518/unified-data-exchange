<template>
  <el-dialog
    :title="`通道国家定价配置 - ${channelName}`"
    :visible.sync="dialogVisible"
    width="1200px"
    top="8vh"
    custom-class="country-pricing-dialog"
    @close="handleClose"
  >
    <div class="country-pricing-container">
      <!-- 操作栏 -->
      <div class="toolbar">
        <el-button type="primary" size="medium" icon="el-icon-plus" @click="handleAdd">
          添加国家
        </el-button>
        <el-button
          type="danger"
          size="medium"
          icon="el-icon-delete"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除{{ selectedIds.length > 0 ? `(${selectedIds.length})` : '' }}
        </el-button>
        <el-button
          type="success"
          size="medium"
          icon="el-icon-check"
          :disabled="selectedIds.length === 0"
          @click="handleBatchStatus(1)"
        >
          批量启用{{ selectedIds.length > 0 ? `(${selectedIds.length})` : '' }}
        </el-button>
        <el-button
          type="warning"
          size="medium"
          icon="el-icon-close"
          :disabled="selectedIds.length === 0"
          @click="handleBatchStatus(0)"
        >
          批量禁用{{ selectedIds.length > 0 ? `(${selectedIds.length})` : '' }}
        </el-button>
        <div v-if="countryList.length > 0" class="toolbar-info">
          共 <span class="text-primary">{{ countryList.length }}</span> 个国家配置
        </div>
      </div>

      <!-- 国家列表 -->
      <el-table
        v-loading="loading"
        :data="countryList"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column label="国家" min-width="130" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ getCountryDisplayName(row.country) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="国家代码" prop="country_code" width="90" align="center" />
        <el-table-column label="成本价/条($)" width="115" align="right">
          <template slot-scope="{row}">
            <span :class="{ 'editable-cell': editingId !== row.id }" @click="handleEdit(row)">
              ${{ formatPrice(row.cost_price) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="销售价/条($)" width="115" align="right">
          <template slot-scope="{row}">
            <span :class="{ 'editable-cell': editingId !== row.id }" @click="handleEdit(row)">
              ${{ formatPrice(row.sale_price) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="利润率" width="85" align="center">
          <template slot-scope="{row}">
            <span :style="{ color: getProfitColor(row.cost_price, row.sale_price) }">
              {{ calculateMargin(row.cost_price, row.sale_price) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最大字符" prop="max_chars" width="85" align="center" />
        <el-table-column label="状态" width="70" align="center">
          <template slot-scope="{row}">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="155" align="center">
          <template slot-scope="{row}">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140" fixed="right">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="mini" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑国家定价对话框 -->
    <el-dialog
      :title="formMode === 'add' ? '添加国家' : '编辑国家定价'"
      :visible.sync="formDialogVisible"
      width="500px"
      append-to-body
    >
      <el-form
        ref="dataForm"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="国家" prop="country">
          <el-select
            v-model="formData.country"
            filterable
            placeholder="请选择国家"
            style="width: 100%"
            :disabled="formMode === 'edit'"
            @change="handleCountryChange"
          >
            <el-option
              v-for="item in availableCountries"
              :key="item.name"
              :label="`${item.nameCn} (${item.name}) +${item.code}`"
              :value="item.name"
            >
              <span style="float: left">{{ item.nameCn }} ({{ item.name }})</span>
              <span style="float: right; color: #8492a6; font-size: 13px">+{{ item.code }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="国家代码" prop="country_code">
          <el-input v-model="formData.country_code" placeholder="自动填充" readonly />
        </el-form-item>

        <el-form-item label="成本价/条($)" prop="cost_price">
          <el-input-number
            v-model="formData.cost_price"
            :precision="4"
            :min="0"
            :max="10"
            :step="0.0001"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="销售价/条($)" prop="sale_price">
          <el-input-number
            v-model="formData.sale_price"
            :precision="4"
            :min="0"
            :max="10"
            :step="0.0001"
            style="width: 100%"
          />
          <div v-if="formData.cost_price && formData.sale_price" style="margin-top: 5px; font-size: 12px">
            <span :style="{ color: formData.sale_price > formData.cost_price ? '#67C23A' : '#F56C6C' }">
              利润率: {{ calculateMargin(formData.cost_price, formData.sale_price) }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="最大字符数" prop="max_chars">
          <el-input-number
            v-model="formData.max_chars"
            :min="70"
            :max="1000"
            :step="10"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {
  getChannelCountries,
  addChannelCountry,
  updateChannelCountry,
  deleteChannelCountry,
  batchUpdateCountryStatus
} from '@/api/smsSettlement'
import countries from '@/utils/countries'

export default {
  name: 'ChannelCountryPricing',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    channelId: {
      type: Number,
      required: true
    },
    channelName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      countryList: [],
      allCountries: countries,
      selectedIds: [],
      editingId: null,
      formDialogVisible: false,
      formMode: 'add',
      formData: {
        country: '',
        country_code: '',
        cost_price: 0.01,
        sale_price: 0.015,
        max_chars: 160,
        status: 1
      },
      formRules: {
        country: [{ required: true, message: '请选择国家', trigger: 'change' }],
        country_code: [{ required: true, message: '请输入国家代码', trigger: 'blur' }],
        cost_price: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
        sale_price: [{ required: true, message: '请输入销售价', trigger: 'blur' }],
        max_chars: [{ required: true, message: '请输入最大字符数', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    availableCountries() {
      if (this.formMode === 'add') {
        // 安全检查：确保countryList是数组
        if (!Array.isArray(this.countryList)) {
          return this.allCountries
        }
        const existingCountries = this.countryList.map(c => c.country)
        return this.allCountries.filter(c => !existingCountries.includes(c.name))
      }
      return this.allCountries
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.loadCountries()
        }
      },
      immediate: false // 不需要立即执行，因为我们在 mounted 中处理首次打开
    },
    // 监听 channelId 变化，确保切换通道时重新加载
    channelId: {
      handler(val) {
        if (val && this.visible) {
          this.loadCountries()
        }
      },
      immediate: false
    }
  },
  mounted() {
    // 组件挂载时，如果对话框已经是打开状态，立即加载数据
    // 这解决了第一次打开时 watch 不触发的问题
    if (this.visible && this.channelId) {
      console.log('🚀 组件首次挂载，立即加载数据')
      this.loadCountries()
    }
  },
  methods: {
    async loadCountries() {
      this.loading = true
      try {
        const response = await getChannelCountries(this.channelId, {})
        console.log('=== API完整响应 ===', response)
        console.log('response.code:', response.code)
        console.log('response.data:', response.data)
        console.log('response.data 是否为数组:', Array.isArray(response.data))
        
        // 后端返回格式：{ code: 200, message: '...', data: [...] }
        // 响应拦截器返回的是 response.data，所以这里的 response 就是 { code, message, data }
        // 因此国家列表在 response.data 中
        const countries = response.data
        
        // 确保总是赋值为数组
        if (Array.isArray(countries)) {
          this.countryList = countries
          console.log('✅ countryList赋值成功，数量:', countries.length)
        } else {
          console.warn('⚠️ 返回的data不是数组:', countries)
          this.countryList = []
        }
        
        console.log('最终 countryList:', this.countryList)
      } catch (error) {
        console.error('❌ 加载国家列表错误:', error)
        // 即使加载失败，也要设置为空数组，防止undefined错误
        this.countryList = []
        this.$message.error('加载国家列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSelectionChange(selection) {
      this.selectedIds = selection.map(item => item.id)
    },
    handleAdd() {
      this.formMode = 'add'
      this.formData = {
        country: '',
        country_code: '',
        cost_price: 0.01,
        sale_price: 0.015,
        max_chars: 160,
        status: 1
      }
      this.formDialogVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate()
      })
    },
    handleEdit(row) {
      this.formMode = 'edit'
      this.editingId = row.id
      this.formData = {
        id: row.id,
        country: row.country,
        country_code: row.country_code,
        cost_price: parseFloat(row.cost_price),
        sale_price: parseFloat(row.sale_price),
        max_chars: row.max_chars,
        status: row.status
      }
      this.formDialogVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate()
      })
    },
    handleCountryChange(countryName) {
      const country = this.allCountries.find(c => c.name === countryName)
      if (country) {
        this.formData.country_code = country.code
      }
    },
    async handleSubmit() {
      this.$refs.dataForm.validate(async valid => {
        if (!valid) return

        try {
          if (this.formMode === 'add') {
            await addChannelCountry(this.channelId, this.formData)
            this.$message.success('添加成功')
          } else {
            await updateChannelCountry(this.channelId, this.formData.id, this.formData)
            this.$message.success('更新成功')
          }
          this.formDialogVisible = false
          
          // 重新加载列表，如果失败也不影响用户体验
          try {
            await this.loadCountries()
          } catch (loadError) {
            console.error('重新加载列表失败:', loadError)
            // 静默失败，不显示错误，用户可以手动关闭对话框再打开
          }
        } catch (error) {
          this.$message.error(error.response?.data?.message || '操作失败')
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确认删除 ${row.country} 的定价配置吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteChannelCountry(this.channelId, row.id)
          this.$message.success('删除成功')
          this.loadCountries()
        } catch (error) {
          this.$message.error(error.response?.data?.message || '删除失败')
        }
      })
    },
    async handleBatchDelete() {
      this.$confirm(`确认删除选中的 ${this.selectedIds.length} 个配置吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          for (const id of this.selectedIds) {
            await deleteChannelCountry(this.channelId, id)
          }
          this.$message.success('批量删除成功')
          this.loadCountries()
        } catch (error) {
          this.$message.error('批量删除失败')
        }
      })
    },
    async handleStatusChange(row) {
      try {
        await updateChannelCountry(this.channelId, row.id, { status: row.status })
        this.$message.success('状态更新成功')
      } catch (error) {
        this.$message.error('状态更新失败')
        row.status = row.status === 1 ? 0 : 1 // 恢复原状态
      }
    },
    async handleBatchStatus(status) {
      try {
        await batchUpdateCountryStatus(this.channelId, {
          ids: this.selectedIds,
          status
        })
        this.$message.success('批量更新状态成功')
        this.loadCountries()
      } catch (error) {
        this.$message.error('批量更新状态失败')
      }
    },
    formatPrice(price) {
      return parseFloat(price || 0).toFixed(4)
    },
    calculateMargin(costPrice, salePrice) {
      const cost = parseFloat(costPrice || 0)
      const sale = parseFloat(salePrice || 0)
      if (sale === 0) return '0%'
      const margin = ((sale - cost) / sale * 100).toFixed(2)
      return margin + '%'
    },
    getProfitColor(costPrice, salePrice) {
      const cost = parseFloat(costPrice || 0)
      const sale = parseFloat(salePrice || 0)
      if (sale > cost) return '#67C23A' // 绿色 - 有利润
      if (sale === cost) return '#E6A23C' // 橙色 - 无利润
      return '#F56C6C' // 红色 - 亏损
    },
    formatDateTime(datetime) {
      if (!datetime) return '-'
      const date = new Date(datetime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    getCountryDisplayName(countryEnglishName) {
      // 根据英文名称查找中文名称
      if (!countryEnglishName) return '-'
      const country = this.allCountries.find(c => c.name === countryEnglishName)
      if (country) {
        // 显示格式：中文名 (英文名)
        return `${country.nameCn} (${country.name})`
      }
      // 如果找不到，直接返回英文名
      return countryEnglishName
    },
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
// 对话框大小调整
::v-deep .country-pricing-dialog {
  .el-dialog__header {
    padding: 20px 24px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .el-dialog__body {
    padding: 20px 24px;
    max-height: calc(85vh - 120px);
    overflow-y: auto;
  }
  
  // 小屏幕适配
  @media screen and (max-width: 1400px) {
    width: 95% !important;
  }
  
  @media screen and (max-width: 768px) {
    width: 98% !important;
    margin-top: 5vh !important;
    
    .el-dialog__body {
      padding: 15px;
      max-height: calc(90vh - 100px);
    }
  }
}

.country-pricing-container {
  .toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    
    .toolbar-info {
      margin-left: auto;
      font-size: 14px;
      color: #606266;
      
      .text-primary {
        color: #409EFF;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
  
  .editable-cell {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.3s;
    display: inline-block;
    
    &:hover {
      color: #409EFF;
      background-color: #ecf5ff;
    }
  }
  
  // 表格优化
  ::v-deep .el-table {
    font-size: 13px;
    
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }
    
    .el-table__body tr:hover > td {
      background-color: #f5f7fa;
    }
    
    .cell {
      padding: 8px 10px;
    }
  }
  
  // 按钮优化
  ::v-deep .el-button--mini {
    padding: 7px 12px;
    font-size: 12px;
  }
  
  ::v-deep .el-button--medium {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>
