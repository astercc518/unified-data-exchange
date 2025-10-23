<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('data.upload') }}</span>
      </div>

      <el-form
        ref="uploadForm"
        :model="uploadForm"
        :rules="rules"
        label-width="120px"
        class="upload-form"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">{{ $t('user.basicInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('data.country')" prop="country">
              <el-select
                v-model="uploadForm.country"
                :placeholder="$t('data.selectCountry')"
                filterable
                remote
                reserve-keyword
                :remote-method="searchCountries"
                :loading="countryLoading"
                clearable
                style="width: 100%"
                @focus="initCountryOptions"
                @change="handleCountryChange"
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
                <el-option-group
                  v-for="(countries, region) in groupedCountries"
                  :key="region"
                  :label="getRegionName(region)"
                >
                  <el-option
                    v-for="country in countries"
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
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="上传方式" prop="uploadMode">
              <el-radio-group v-model="uploadMode" @change="handleUploadModeChange">
                <el-radio label="manual">手动输入</el-radio>
                <el-radio label="template">按模板上传</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 按模板上传 -->
        <el-row v-if="uploadMode === 'template' && uploadForm.country" :gutter="20">
          <el-col :span="24">
            <el-alert
              v-if="loadingTemplates"
              title="正在加载定价模板..."
              type="info"
              :closable="false"
              show-icon
            />
            <el-alert
              v-else-if="availableTemplates.length === 0"
              type="warning"
              :closable="false"
              show-icon
            >
              <template slot="title">
                <span>该国家暂无定价模板</span>
                <el-button type="text" style="margin-left: 10px" @click="showCreateTemplateDialog">
                  <i class="el-icon-plus" /> 立即创建模板
                </el-button>
              </template>
            </el-alert>
            <div v-else>
              <el-form-item label="选择定价模板">
                <el-select
                  v-model="selectedTemplateId"
                  placeholder="请选择定价模板"
                  style="width: 100%"
                  @change="applyTemplate"
                >
                  <el-option
                    v-for="template in availableTemplates"
                    :key="template.id"
                    :label="getTemplateLabel(template)"
                    :value="template.id"
                  >
                    <div style="display: flex; justify-content: space-between; align-items: center">
                      <span>
                        <el-tag v-if="template.is_default === 1" type="success" size="mini" style="margin-right: 5px">默认</el-tag>
                        {{ template.template_name }}
                      </span>
                      <span style="color: #8492a6; font-size: 12px">
                        成本:{{ template.cost_price }} | 销售:{{ template.sell_price }}
                      </span>
                    </div>
                  </el-option>
                </el-select>
                <div style="margin-top: 8px">
                  <el-button type="text" size="small" @click="showCreateTemplateDialog">
                    <i class="el-icon-plus" /> 创建新模板
                  </el-button>
                </div>
              </el-form-item>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('data.dataType')" prop="dataType">
              <el-input
                v-model="uploadForm.dataType"
                :placeholder="$t('data.selectDataType')"
                :disabled="uploadMode === 'template' && !!selectedTemplateId"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('data.source')" prop="source">
              <el-input
                v-model="uploadForm.source"
                :placeholder="$t('data.enterSource')"
                :disabled="uploadMode === 'template' && !!selectedTemplateId"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('data.validity')" prop="validity">
              <el-select
                v-model="uploadForm.validity"
                :placeholder="$t('data.selectValidity')"
                :disabled="uploadMode === 'template' && !!selectedTemplateId"
                style="width: 100%"
              >
                <el-option
                  :label="$t('data.validityDay3')"
                  value="3"
                />
                <el-option
                  :label="$t('data.validityDay30')"
                  value="30"
                />
                <el-option
                  :label="$t('data.validityOver30')"
                  value="30+"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('data.costPrice')" prop="costPrice">
              <el-input-number
                v-model="uploadForm.costPrice"
                :min="0"
                :precision="4"
                style="width: 100%"
                controls-position="right"
                :placeholder="$t('data.enterCostPrice')"
                :disabled="uploadMode === 'template' && !!selectedTemplateId"
              />
              <span style="margin-left: 10px;">U/条</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('data.sellPrice')" prop="sellPrice">
              <el-input-number
                v-model="uploadForm.sellPrice"
                :min="0"
                :precision="4"
                style="width: 100%"
                controls-position="right"
                :placeholder="$t('data.enterSellPrice')"
                :disabled="uploadMode === 'template' && !!selectedTemplateId"
              />
              <span style="margin-left: 10px;">U/条</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('data.remark')" prop="remark">
              <el-input
                v-model="uploadForm.remark"
                type="textarea"
                :rows="3"
                :placeholder="$t('data.enterRemark')"
                :maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="利润率">
              <el-input
                :value="profitRate"
                disabled
                style="width: 100%"
              >
                <template slot="append">%</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 文件上传 -->
        <el-divider content-position="left">{{ $t('data.uploadFile') }}</el-divider>

        <el-form-item :label="$t('data.dataFormat')" prop="file">
          <el-upload
            ref="upload"
            class="upload-demo"
            drag
            action=""
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            :auto-upload="false"
            :limit="1"
            accept=".txt"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div slot="tip" class="el-upload__tip">
              {{ $t('data.txtFormat') }}，文件大小不超过100MB
            </div>
          </el-upload>
        </el-form-item>

        <!-- 文件预览信息 -->
        <el-form-item v-if="fileInfo.name" label="文件信息">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">文件名:</span>
                <span class="info-value">{{ fileInfo.name }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">文件大小:</span>
                <span class="info-value">{{ formatFileSize(fileInfo.size) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">预估行数:</span>
                <span class="info-value">{{ fileInfo.lines || '计算中...' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">上传时间:</span>
                <span class="info-value">{{ fileInfo.uploadTime }}</span>
              </div>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="uploadLoading"
            :disabled="!fileInfo.name"
            @click="submitUpload"
          >
            {{ $t('data.upload') }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 最近上传记录 -->
    <el-card style="margin-top: 20px;">
      <div slot="header" class="clearfix">
        <span>最近上传记录</span>
      </div>

      <el-table
        :data="recentUploads"
        border
        style="width: 100%"
      >
        <el-table-column
          label="文件名"
          prop="fileName"
          min-width="150"
        />
        <el-table-column
          label="国家"
          prop="country"
          width="120"
        />
        <el-table-column
          label="数据类型"
          prop="dataType"
          width="100"
        />
        <el-table-column
          label="时效"
          prop="validity"
          width="100"
        />
        <el-table-column
          label="数据来源"
          prop="source"
          width="120"
        />
        <el-table-column
          label="数量"
          prop="quantity"
          width="100"
        >
          <template slot-scope="{row}">
            {{ formatNumber(row.quantity) }}
          </template>
        </el-table-column>
        <el-table-column
          label="销售价(U)"
          prop="sellPrice"
          width="100"
        />
        <el-table-column
          label="成本价(U)"
          prop="costPrice"
          width="100"
        />
        <el-table-column
          label="备注"
          prop="remark"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          label="上传时间"
          prop="uploadTime"
          width="160"
        >
          <template slot-scope="{row}">
            {{ row.uploadTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          prop="status"
          width="100"
        >
          <template slot-scope="{row}">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建定价模板对话框 -->
    <el-dialog
      title="创建定价模板"
      :visible.sync="createTemplateDialogVisible"
      width="600px"
      @close="resetTemplateForm"
    >
      <el-form ref="templateForm" :model="templateForm" :rules="templateRules" label-width="120px">
        <el-form-item label="模板名称" prop="template_name">
          <el-input v-model="templateForm.template_name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="国家">
          <el-input :value="getSelectedCountryName()" disabled />
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
          />
        </el-form-item>
        <el-form-item label="销售价(U/条)" prop="sell_price">
          <el-input-number
            v-model="templateForm.sell_price"
            :precision="4"
            :step="0.001"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="利润率">
          <el-input :value="templateProfitRate + '%'" disabled />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="templateForm.is_default" :active-value="1" :inactive-value="0" />
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            默认模板将在数据上传时自动应用
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createTemplateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingTemplate" @click="saveTemplate">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import i18nMixin from '@/mixins/i18n'
import {
  filterCountries,
  getCountryByCode,
  getPopularCountries
} from '@/data/countries'
import { distributeQuantityByOperators } from '@/data/operators'
import request from '@/utils/request'

export default {
  name: 'DataUpload',
  filters: {
    parseTime
  },
  mixins: [i18nMixin],
  data() {
    return {
      uploadMode: 'template', // manual | template - 默认为按模板上传
      uploadForm: {
        country: '',
        dataType: '',
        validity: '',
        source: '',
        sellPrice: 0.05,
        costPrice: 0.02,
        remark: '',
        file: null
      },
      fileInfo: {
        name: '',
        size: 0,
        lines: 0,
        uploadTime: ''
      },
      rules: {
        country: [{ required: true, message: this.$t('data.selectCountry'), trigger: 'change' }],
        dataType: [{ required: true, message: this.$t('data.selectDataType'), trigger: 'blur' }],
        validity: [{ required: true, message: this.$t('data.selectValidity'), trigger: 'change' }],
        source: [{ required: true, message: this.$t('data.enterSource'), trigger: 'blur' }],
        sellPrice: [{ required: true, message: this.$t('data.enterSellPrice'), trigger: 'blur' }],
        costPrice: [{ required: true, message: this.$t('data.enterCostPrice'), trigger: 'blur' }]
      },
      uploadLoading: false,
      recentUploads: [],
      // 国家相关数据
      countryLoading: false,
      filteredCountries: [],
      popularCountries: [],
      groupedCountries: {},
      showPopularCountries: true,
      countrySearchKeyword: '',
      // 模板相关
      loadingTemplates: false,
      availableTemplates: [],
      selectedTemplateId: null,
      createTemplateDialogVisible: false,
      savingTemplate: false,
      templateForm: {
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
      templateRules: {
        template_name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        cost_price: [
          { required: true, message: '请输入成本价', trigger: 'blur' }
        ],
        sell_price: [
          { required: true, message: '请输入销售价', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    profitRate() {
      if (this.uploadForm.costPrice <= 0) return '0.00'
      const rate = ((this.uploadForm.sellPrice - this.uploadForm.costPrice) / this.uploadForm.costPrice * 100)
      return rate.toFixed(2)
    },
    templateProfitRate() {
      if (this.templateForm.cost_price <= 0) return '0.00'
      const rate = ((this.templateForm.sell_price - this.templateForm.cost_price) / this.templateForm.cost_price * 100)
      return rate.toFixed(2)
    }
  },
  created() {
    this.getRecentUploads()
    this.initCountryData()
  },
  methods: {
    handleFileChange(file) {
      this.fileInfo = {
        name: file.name,
        size: file.size,
        uploadTime: new Date().toLocaleString(),
        lines: 0
      }

      // 实际读取文件内容计算行数
      this.calculateFileLines(file.raw)

      this.uploadForm.file = file.raw
    },
    beforeUpload(file) {
      const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt')
      const isLt100M = file.size / 1024 / 1024 < 100

      if (!isTxt) {
        this.$message.error('只能上传 TXT 格式的文件!')
        return false
      }
      if (!isLt100M) {
        this.$message.error('上传文件大小不能超过 100MB!')
        return false
      }
      return false // 阻止自动上传
    },

    // 实际计算文件行数
    calculateFileLines(file) {
      if (file && file.size > 0) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const text = e.target.result
            // 计算实际行数（非空行）
            const lines = text.split('\n').filter(line => line.trim().length > 0)
            this.fileInfo.lines = lines.length

            console.log(`✅ 文件行数计算完成: ${lines.length} 行`)

            // 如果文件太大，只读取前面部分进行估算
            if (file.size > 10 * 1024 * 1024) { // 10MB以上的文件
              const sampleLines = lines.length
              const sampleSize = text.length
              const estimatedLines = Math.round((file.size / sampleSize) * sampleLines)
              this.fileInfo.lines = estimatedLines
              console.log(`ℹ️ 大文件估算行数: ${estimatedLines} 行`)
            }
          } catch (error) {
            console.error('读取文件失败:', error)
            // 如果读取失败，使用文件大小估算
            this.fileInfo.lines = Math.floor(file.size / 50) // 假设平均每行50字节
          }
        }

        reader.onerror = () => {
          console.error('文件读取错误')
          // 使用文件大小估算
          this.fileInfo.lines = Math.floor(file.size / 50)
        }

        // 对于大文件，只读取前1MB进行采样
        if (file.size > 10 * 1024 * 1024) {
          const blob = file.slice(0, 1024 * 1024) // 读取前1MB
          reader.readAsText(blob, 'utf-8')
        } else {
          reader.readAsText(file, 'utf-8')
        }
      } else {
        this.fileInfo.lines = 0
      }
    },
    async submitUpload() {
      this.$refs.uploadForm.validate(async(valid) => {
        if (valid && this.uploadForm.file) {
          this.uploadLoading = true

          try {
            // Step 1: 先上传文件到数据处理模块
            console.log('📤 Step 1: 上传文件到服务器...')
            const formData = new FormData()
            formData.append('file', this.uploadForm.file)

            const uploadResponse = await request({
              url: '/api/data-processing/upload',
              method: 'POST',
              data: formData,
              headers: { 'Content-Type': 'multipart/form-data' }
            })

            const fileId = uploadResponse.data.id
            const actualQuantity = uploadResponse.data.lineCount || this.fileInfo.lines
            console.log('✅ 文件上传成功, ID:', fileId, '实际行数:', actualQuantity)

            // Step 2: 获取国家的运营商配置
            console.log('📋 Step 2: 获取运营商配置...')
            const { getOperatorsByCountry } = require('@/data/operators')
            const operators = getOperatorsByCountry(this.uploadForm.country)

            if (!operators || operators.length === 0) {
              console.warn('⚠️ 该国家暂无运营商配置，使用默认值')
              // 没有运营商配置，直接保存数据
              await this.saveToDataListWithoutOperators(fileId, actualQuantity)
              this.$message.success(this.$t('data.uploadSuccess'))
              this.uploadLoading = false
              this.resetForm()
              return
            }

            // Step 3: 分析文件中的真实运营商分布
            console.log('🔍 Step 3: 分析文件运营商分布...', { fileId, countryCode: this.uploadForm.country, operators })
            const analysisResponse = await request({
              url: '/api/data-processing/analyze-operator-distribution',
              method: 'POST',
              data: {
                fileId: fileId,
                countryCode: this.uploadForm.country,
                operators: operators.map(op => ({
                  name: op.name,
                  numberSegments: op.numberSegments
                }))
              }
            })

            const distributionData = analysisResponse.data
            console.log('✅ 运营商分布分析完成:', distributionData)

            // Step 4: 转换运营商分布数据格式
            const operatorDistribution = distributionData.distribution.map(item => ({
              name: item.name,
              count: item.count,
              quantity: item.count,
              percentage: ((item.count / actualQuantity) * 100).toFixed(1)
            }))

            console.log('📊 运营商分布:', operatorDistribution)

            // Step 5: 保存数据到数据库
            const currentTime = new Date()
            const uploadRecord = {
              fileName: this.fileInfo.name,
              country: this.getSelectedCountryName(),
              countryCode: this.uploadForm.country,
              dataType: this.getDataTypeText(this.uploadForm.dataType),
              validity: this.getValidityText(this.uploadForm.validity),
              validityCode: this.uploadForm.validity,
              source: this.uploadForm.source,
              quantity: actualQuantity, // 使用实际行数
              sellPrice: this.uploadForm.sellPrice,
              costPrice: this.uploadForm.costPrice,
              remark: this.uploadForm.remark,
              uploadTime: currentTime,
              publishTime: null,
              publishStatus: 'pending',
              status: 'uploaded',
              operators: operatorDistribution, // 使用实际分析的运营商分布
              fileId: fileId // 关联上传的文件ID
            }

            // 保存数据到数据列表（待发布状态）
            await this.saveToDataList(uploadRecord)

            // 添加到最近上传记录
            this.recentUploads.unshift(uploadRecord)

            this.$message.success(this.$t('data.uploadSuccess') + ` (共 ${actualQuantity} 条数据)`)
            this.uploadLoading = false
            this.resetForm()
          } catch (error) {
            console.error('❌ 数据上传失败:', error)

            this.$message.error('数据上传失败：' + (error.message || '未知错误'))
            this.uploadLoading = false
          }
        } else {
          this.$message.error(this.$t('data.fileRequired'))
        }
      })
    },
    resetForm() {
      this.$refs.uploadForm.resetFields()
      this.$refs.upload.clearFiles()
      this.fileInfo = {
        name: '',
        size: 0,
        lines: 0,
        uploadTime: ''
      }
    },
    getRecentUploads() {
      // 模拟获取最近上传记录
      this.recentUploads = [
        {
          fileName: 'bangladesh_phones_20231201.txt',
          country: '孟加拉国',
          dataType: '手机号码',
          validity: '3天内',
          source: '移动运营商',
          quantity: 50000,
          sellPrice: 0.05,
          costPrice: 0.04,
          remark: '高质量手机号码数据，来源于官方渠道，数据准确性高',
          uploadTime: new Date('2023-12-01'),
          status: 'success'
        },
        {
          fileName: 'india_data_20231130.txt',
          country: '印度',
          dataType: '用户资料',
          validity: '30天内',
          source: '第三方采集',
          quantity: 80000,
          sellPrice: 0.04,
          costPrice: 0.03,
          remark: '包含用户姓名、年龄、地区等基本信息，适合精准营销',
          uploadTime: new Date('2023-11-30'),
          status: 'processing'
        },
        {
          fileName: 'thailand_mobile_20231129.txt',
          country: '泰国',
          dataType: '电话号码',
          validity: '30天以上',
          source: '官方数据',
          quantity: 65000,
          sellPrice: 0.06,
          costPrice: 0.045,
          remark: '可验证的有效电话号码，适合电话营销和短信推广',
          uploadTime: new Date('2023-11-29'),
          status: 'success'
        }
      ]
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    formatNumber(num) {
      return num.toLocaleString()
    },
    getCountryText(countryCode) {
      const country = getCountryByCode(countryCode)
      return country ? country.name : countryCode
    },
    getValidityText(validity) {
      const validityMap = {
        '3': '3天内',
        '30': '30天内',
        '30+': '30天以上'
      }
      return validityMap[validity] || validity
    },
    getStatusType(status) {
      const statusMap = {
        success: 'success',
        processing: 'warning',
        failed: 'danger'
      }
      return statusMap[status]
    },
    getStatusText(status) {
      const statusMap = {
        success: '成功',
        processing: '处理中',
        failed: '失败'
      }
      return statusMap[status]
    },

    // 国家相关方法
    initCountryData() {
      // 初始化热门国家
      this.popularCountries = getPopularCountries()
      // 初始化所有国家按地区分组
      this.groupedCountries = this.getCountriesByRegion()
      this.filteredCountries = []
      console.log('🌍 已加载国家数据:', {
        '热门国家': this.popularCountries.length,
        '分组国家': Object.keys(this.groupedCountries).length,
        '总国家数': this.getTotalCountriesCount()
      })
    },

    getTotalCountriesCount() {
      let total = 0
      Object.values(this.groupedCountries).forEach(countries => {
        total += countries.length
      })
      return total
    },

    getCountriesByRegion() {
      const regions = {}
      const { countryList } = require('@/data/countries')

      countryList.forEach(country => {
        if (!regions[country.region]) {
          regions[country.region] = []
        }
        regions[country.region].push(country)
      })

      return regions
    },

    initCountryOptions() {
      // 焦点时初始化国家选项 - 显示全部国家
      if (!this.countrySearchKeyword) {
        this.showPopularCountries = true
        this.groupedCountries = this.getCountriesByRegion()
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
          this.groupedCountries = {}
          this.filteredCountries = filterCountries(keyword)
        } else {
          this.showPopularCountries = true
          this.groupedCountries = {}
          this.filteredCountries = []
        }
        this.countryLoading = false
      }, 300)
    },

    getRegionName(region) {
      const regionMap = {
        'Asia': '亚洲',
        'Europe': '欧洲',
        'North America': '北美洲',
        'South America': '南美洲',
        'Africa': '非洲',
        'Oceania': '大洋洲'
      }
      return regionMap[region] || region
    },

    getSelectedCountryName() {
      if (!this.uploadForm.country) return ''
      const country = getCountryByCode(this.uploadForm.country)
      return country ? country.name : this.uploadForm.country
    },

    getDataTypeText(dataType) {
      // 直接返回数据类型，因为现在直接存储中文名称
      return dataType || '未知类型'
    },

    // 保存数据到数据列表（待发布状态）
    async saveToDataList(uploadRecord) {
      console.log('🔄 开始保存数据到数据列表:', uploadRecord)

      try {
        // 根据国家代码获取国家信息
        const countryInfo = this.getCountryInfoByCode(uploadRecord.countryCode)
        console.log('🌍 国家信息:', countryInfo)

        // 使用上传记录中已分析的运营商分布（而不是generateOperators生成的假数据）
        const operators = uploadRecord.operators || []

        // 准备数据库保存的数据
        const dataToSave = {
          country: uploadRecord.countryCode,
          countryCode: uploadRecord.countryCode,
          country_name: uploadRecord.country || countryInfo.name,
          dataType: uploadRecord.dataType,
          data_type: uploadRecord.dataType,
          validity: uploadRecord.validityCode || uploadRecord.validity,
          validityDisplay: uploadRecord.validity,
          validity_name: uploadRecord.validity,
          source: uploadRecord.source,
          availableQuantity: uploadRecord.quantity,
          available_quantity: uploadRecord.quantity,
          totalQuantity: uploadRecord.quantity,
          total_quantity: uploadRecord.quantity,
          operators: operators, // 使用实际分析的运营商分布
          sellPrice: uploadRecord.sellPrice,
          sell_price: uploadRecord.sellPrice,
          costPrice: uploadRecord.costPrice,
          cost_price: uploadRecord.costPrice,
          remark: uploadRecord.remark || '',
          uploadBy: this.$store.state.user.loginAccount || 'admin',
          upload_by: this.$store.state.user.loginAccount || 'admin',
          fileName: uploadRecord.fileName,
          fileId: uploadRecord.fileId // 关联上传的文件ID
        }

        console.log('📦 准备保存到数据库的数据:', dataToSave)

        // 直接保存到数据库
        try {
          const response = await request({
            url: '/api/data-library',
            method: 'POST',
            data: dataToSave
          })

          console.log('✅ 数据成功保存到数据库:', response.data)
          this.$message({
            type: 'success',
            message: `数据已保存到数据库 (${uploadRecord.country} - ${uploadRecord.dataType})，待发布状态`,
            duration: 3000
          })
        } catch (error) {
          console.error('❌ 数据库保存失败:', error)
          this.$message({
            type: 'error',
            message: '保存数据失败：' + (error.message || '未知错误'),
            duration: 5000
          })
          throw error
        }
      } catch (error) {
        console.error('❌ 保存数据失败:', error)
        this.$message({
          type: 'error',
          message: '保存数据失败，请重试',
          duration: 5000
        })
      }
    },

    // 根据国家代码获取国家信息
    getCountryInfoByCode(countryCode) {
      const country = getCountryByCode(countryCode)
      return country || { code: countryCode, name: '未知国家', region: 'Unknown' }
    },

    // 生成运营商分布（使用真实市场份额数据）
    generateOperators(totalQuantity, countryInfo) {
      const countryCode = countryInfo.code

      // 使用新的运营商数据库按市场份额分配
      const distribution = distributeQuantityByOperators(totalQuantity, countryCode)

      console.log(`ℹ️ ${countryInfo.name}运营商分布:`, distribution)

      return distribution
    },

    // 无运营商配置时直接保存数据
    async saveToDataListWithoutOperators(fileId, actualQuantity) {
      console.log('🔄 保存数据（无运营商配置）:', { fileId, actualQuantity })

      try {
        const countryInfo = this.getCountryInfoByCode(this.uploadForm.country)

        const dataToSave = {
          country: this.uploadForm.country,
          countryCode: this.uploadForm.country,
          country_name: this.getSelectedCountryName() || countryInfo.name,
          dataType: this.getDataTypeText(this.uploadForm.dataType),
          data_type: this.getDataTypeText(this.uploadForm.dataType),
          validity: this.uploadForm.validity,
          validityDisplay: this.getValidityText(this.uploadForm.validity),
          validity_name: this.getValidityText(this.uploadForm.validity),
          source: this.uploadForm.source,
          availableQuantity: actualQuantity,
          available_quantity: actualQuantity,
          totalQuantity: actualQuantity,
          total_quantity: actualQuantity,
          operators: [], // 空数组
          sellPrice: this.uploadForm.sellPrice,
          sell_price: this.uploadForm.sellPrice,
          costPrice: this.uploadForm.costPrice,
          cost_price: this.uploadForm.costPrice,
          remark: this.uploadForm.remark || '',
          uploadBy: this.$store.state.user.loginAccount || 'admin',
          upload_by: this.$store.state.user.loginAccount || 'admin',
          fileName: this.fileInfo.name,
          fileId: fileId
        }

        const response = await request({
          url: '/api/data-library',
          method: 'POST',
          data: dataToSave
        })

        console.log('✅ 数据成功保存到数据库（无运营商）:', response.data)
      } catch (error) {
        console.error('❌ 数据库保存失败:', error)
        throw error
      }
    },

    // 上传模式变更
    handleUploadModeChange(mode) {
      console.log('📋 上传模式变更:', mode)
      if (mode === 'template' && this.uploadForm.country) {
        this.loadTemplates()
      } else {
        this.availableTemplates = []
        this.selectedTemplateId = null
      }
    },

    // 国家变更
    async handleCountryChange(countryCode) {
      console.log('🌍 国家变更:', countryCode)

      // 清空模板相关数据
      this.availableTemplates = []
      this.selectedTemplateId = null

      if (this.uploadMode === 'template' && countryCode) {
        await this.loadTemplates()
      }
    },

    // 加载定价模板
    async loadTemplates() {
      if (!this.uploadForm.country) {
        return
      }

      this.loadingTemplates = true
      try {
        console.log('🔄 加载定价模板:', this.uploadForm.country)
        const response = await request({
          url: `/api/pricing-templates/by-country/${this.uploadForm.country}`,
          method: 'GET'
        })

        if (response.success) {
          this.availableTemplates = response.data || []
          console.log('✅ 加载到模板:', this.availableTemplates.length, '个')

          // 自动选择默认模板
          const defaultTemplate = this.availableTemplates.find(t => t.is_default === 1)
          if (defaultTemplate) {
            this.selectedTemplateId = defaultTemplate.id
            this.applyTemplate(defaultTemplate.id)
            this.$message.success(`已自动应用默认模板：${defaultTemplate.template_name}`)
          }
        } else {
          this.$message.warning('获取定价模板失败')
        }
      } catch (error) {
        console.error('❌ 加载模板失败:', error)
        this.$message.error('加载定价模板失败：' + error.message)
      } finally {
        this.loadingTemplates = false
      }
    },

    // 应用模板
    applyTemplate(templateId) {
      if (!templateId) return

      const template = this.availableTemplates.find(t => t.id === templateId)
      if (template) {
        console.log('📋 应用模板:', template)

        // 填充表单数据
        this.uploadForm.dataType = template.data_type || ''
        this.uploadForm.source = template.data_source || ''
        this.uploadForm.validity = template.validity || ''
        this.uploadForm.costPrice = parseFloat(template.cost_price)
        this.uploadForm.sellPrice = parseFloat(template.sell_price)

        this.$message.success(`✅ 已应用模板：${template.template_name}`)
      }
    },

    // 获取模板显示标签
    getTemplateLabel(template) {
      let label = template.template_name
      if (template.data_type) label += ` [${template.data_type}]`
      if (template.validity) {
        const validityText = this.getValidityText(template.validity)
        label += ` [${validityText}]`
      }
      return label
    },

    // 显示创建模板对话框
    showCreateTemplateDialog() {
      if (!this.uploadForm.country) {
        this.$message.warning('请先选择国家')
        return
      }

      // 使用当前国家和表单数据初始化模板表单
      const country = getCountryByCode(this.uploadForm.country)
      this.templateForm = {
        template_name: '',
        country: this.uploadForm.country,
        country_name: country ? country.name : '',
        data_type: this.uploadForm.dataType || '',
        data_source: this.uploadForm.source || '',
        validity: this.uploadForm.validity || '',
        cost_price: this.uploadForm.costPrice || 0,
        sell_price: this.uploadForm.sellPrice || 0,
        is_default: 0,
        status: 1
      }

      this.createTemplateDialogVisible = true
    },

    // 保存模板
    async saveTemplate() {
      this.$refs.templateForm.validate(async(valid) => {
        if (!valid) {
          return false
        }

        this.savingTemplate = true
        try {
          const response = await request({
            url: '/api/pricing-templates',
            method: 'POST',
            data: this.templateForm
          })

          if (response.success) {
            this.$message.success('模板创建成功')
            this.createTemplateDialogVisible = false

            // 重新加载模板列表
            await this.loadTemplates()

            // 自动选择新创建的模板
            const newTemplate = this.availableTemplates.find(
              t => t.template_name === this.templateForm.template_name
            )
            if (newTemplate) {
              this.selectedTemplateId = newTemplate.id
              this.applyTemplate(newTemplate.id)
            }
          } else {
            this.$message.error(response.message || '创建模板失败')
          }
        } catch (error) {
          console.error('❌ 创建模板失败:', error)
          this.$message.error('创建模板失败：' + error.message)
        } finally {
          this.savingTemplate = false
        }
      })
    },

    // 重置模板表单
    resetTemplateForm() {
      this.templateForm = {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-form {
  max-width: 800px;
  margin: 0 auto;
}

.upload-demo {
  width: 100%;
}

// 文件信息样式
.info-item {
  padding: 10px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #f5f7fa;

  .info-label {
    font-weight: bold;
    color: #606266;
    margin-right: 10px;
  }

  .info-value {
    color: #303133;
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
</style>
