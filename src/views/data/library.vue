<template>
  <div class="app-container">
    <!-- 数据统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.total) }}</div>
            <div class="stat-label">总数据量</div>
          </div>
          <i class="el-icon-data-line stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.day3) }}</div>
            <div class="stat-label">3天内数据</div>
          </div>
          <i class="el-icon-time stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.day30) }}</div>
            <div class="stat-label">30天内数据</div>
          </div>
          <i class="el-icon-date stat-icon" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatNumber(statistics.over30) }}</div>
            <div class="stat-label">30天以上数据</div>
          </div>
          <i class="el-icon-folder stat-icon" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件和操作按钮 -->
    <el-card style="margin-bottom: 20px;">
      <div class="filter-container">
        <el-select
          v-model="listQuery.country"
          :placeholder="$t('data.selectCountry')"
          filterable
          clearable
          style="width: 200px"
          class="filter-item"
        >
          <el-option
            v-for="country in countryOptions"
            :key="country.value"
            :label="country.label"
            :value="country.value"
          />
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

        <el-select
          v-model="listQuery.dataType"
          placeholder="数据类型"
          clearable
          style="width: 150px"
          class="filter-item"
        >
          <el-option
            v-for="type in dataTypeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
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
          class="filter-item"
          type="primary"
          icon="el-icon-upload2"
          :disabled="!hasUnpublishedData"
          @click="handleAutoPublish"
        >
          自动发布 ({{ unpublishedCount }})
        </el-button>

        <el-button
          class="filter-item"
          type="success"
          icon="el-icon-check"
          :disabled="selectedRows.length === 0 || !hasSelectedUnpublished"
          @click="handleSelectedPublish"
        >
          发布已选 ({{ selectedUnpublishedCount }})
        </el-button>

        <el-button
          class="filter-item"
          type="warning"
          icon="el-icon-download"
          :disabled="selectedRows.length === 0 || !hasSelectedPublished"
          @click="handleSelectedUnpublish"
        >
          下线已选 ({{ selectedPublishedCount }})
        </el-button>

        <el-button
          class="filter-item"
          type="warning"
          icon="el-icon-refresh"
          @click="refreshData"
        >
          刷新数据
        </el-button>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card>
      <div slot="header" class="clearfix">
        <span>已上传数据列表 ({{ total }}条)</span>
      </div>

      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
          :selectable="isRowSelectable"
        />
        <el-table-column
          label="ID"
          prop="id"
          sortable="custom"
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
          prop="validity"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag :type="getValidityTagType(row.validity)">
              {{ getValidityText(row.validity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('data.source')"
          prop="source"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('data.quantity')"
          prop="availableQuantity"
          width="120"
          align="center"
          sortable="custom"
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
            <div v-for="operator in row.operators" :key="operator.name" class="operator-item">
              <span class="operator-name">{{ operator.name }}:</span>
              <span class="operator-count">{{ formatNumber(operator.quantity || operator.count) }}</span>
              <span class="operator-percent">({{ ((operator.quantity || operator.count) / row.availableQuantity * 100).toFixed(1) }}%)</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('data.costPrice')"
          prop="costPrice"
          width="100"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            {{ row.costPrice }} U
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('data.sellPrice')"
          prop="sellPrice"
          width="100"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            {{ row.sellPrice }} U
          </template>
        </el-table-column>
        <el-table-column
          label="利润率"
          width="80"
          align="center"
        >
          <template slot-scope="{row}">
            <span :class="getProfitClass(row)">
              {{ calculateProfitRate(row) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="上传时间"
          prop="uploadTime"
          width="150"
          align="center"
          sortable="custom"
        >
          <template slot-scope="{row}">
            {{ row.uploadTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column
          label="发布状态"
          prop="publishStatus"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag :type="getPublishStatusType(row.publishStatus)">
              {{ getPublishStatusText(row.publishStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          prop="status"
          width="100"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.operation')"
          align="center"
          width="350"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{row}">
            <el-button
              v-if="row.publishStatus === 'pending'"
              type="success"
              size="mini"
              icon="el-icon-upload"
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              v-if="row.publishStatus === 'published'"
              type="warning"
              size="mini"
              icon="el-icon-download"
              @click="handleUnpublish(row)"
            >
              下线
            </el-button>
            <el-button
              type="primary"
              size="mini"
              @click="handleDetail(row)"
            >
              {{ $t('common.detail') }}
            </el-button>
            <el-button
              type="info"
              size="mini"
              @click="handleEdit(row)"
            >
              {{ $t('common.edit') }}
            </el-button>
            <el-button
              type="success"
              size="mini"
              @click="handlePricing(row)"
            >
              定价
            </el-button>
            <el-button
              size="mini"
              type="danger"
              class="delete-button-highlight"
              @click="handleDelete(row)"
            >
              <i class="el-icon-delete delete-icon-highlight" />
              {{ $t('common.delete') }}
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

    <!-- 数据详情对话框 -->
    <el-dialog
      title="数据详情"
      :visible.sync="detailDialogVisible"
      width="700px"
    >
      <el-descriptions v-if="currentData" :column="2" border>
        <el-descriptions-item label="数据ID">
          {{ currentData.id }}
        </el-descriptions-item>
        <el-descriptions-item label="国家">
          {{ currentData.country }}
        </el-descriptions-item>
        <el-descriptions-item label="数据类型">
          {{ currentData.dataType }}
        </el-descriptions-item>
        <el-descriptions-item label="时效性">
          {{ getValidityText(currentData.validity) }}
        </el-descriptions-item>
        <el-descriptions-item label="数据来源">
          {{ currentData.source }}
        </el-descriptions-item>
        <el-descriptions-item label="总数量">
          {{ formatNumber(currentData.availableQuantity) }}
        </el-descriptions-item>
        <el-descriptions-item label="成本价">
          {{ currentData.costPrice }} U/条
        </el-descriptions-item>
        <el-descriptions-item label="销售价">
          {{ currentData.sellPrice }} U/条
        </el-descriptions-item>
        <el-descriptions-item label="利润率">
          {{ calculateProfitRate(currentData) }}%
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentData.status)">
            {{ getStatusText(currentData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="运营商分布" :span="2">
          <div v-for="operator in currentData.operators" :key="operator.name" class="operator-detail">
            <el-tag class="operator-tag">
              {{ operator.name }}: {{ formatNumber(operator.quantity || operator.count) }} ({{ ((operator.quantity || operator.count) / currentData.availableQuantity * 100).toFixed(1) }}%)
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentData.remark || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="上传时间" :span="2">
          {{ currentData.uploadTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 编辑数据对话框 -->
    <el-dialog
      :title="editForm.id ? '编辑数据' : '新增数据'"
      :visible.sync="editDialogVisible"
      width="900px"
      @close="resetEditForm"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="120px"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">{{ $t('user.basicInfo') }}</el-divider>

        <!-- 第一行：国家、数据类型、数据来源 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('data.country')" prop="country">
              <el-select
                v-model="editForm.countryCode"
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
            <el-form-item :label="$t('data.dataType')" prop="dataType">
              <el-input
                v-model="editForm.dataType"
                :placeholder="$t('data.selectDataType')"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('data.source')" prop="source">
              <el-input
                v-model="editForm.source"
                :placeholder="$t('data.enterSource')"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：时效性、成本价、销售价 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('data.validity')" prop="validity">
              <el-select
                v-model="editForm.validity"
                :placeholder="$t('data.selectValidity')"
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
                v-model="editForm.costPrice"
                :min="0"
                :precision="4"
                style="width: 100%"
                controls-position="right"
                :placeholder="$t('data.enterCostPrice')"
              />
              <span style="margin-left: 10px;">U/条</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('data.sellPrice')" prop="sellPrice">
              <el-input-number
                v-model="editForm.sellPrice"
                :min="0"
                :precision="4"
                style="width: 100%"
                controls-position="right"
                :placeholder="$t('data.enterSellPrice')"
              />
              <span style="margin-left: 10px;">U/条</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：备注 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('data.remark')" prop="remark">
              <el-input
                v-model="editForm.remark"
                type="textarea"
                :rows="3"
                :placeholder="$t('data.enterRemark')"
                :maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：利润率和数据数量 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="利润率">
              <el-input
                :value="editProfitRate"
                disabled
                style="width: 100%"
              >
                <template slot="append">%</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col v-if="editForm.id" :span="12">
            <el-form-item :label="$t('data.quantity')" prop="availableQuantity">
              <el-input-number
                v-model="editForm.availableQuantity"
                :min="1"
                :max="10000000"
                style="width: 100%"
                controls-position="right"
                placeholder="请输入数据数量"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 文件上传区域（仅新增时显示） -->
        <template v-if="!editForm.id">
          <el-divider content-position="left">数据文件上传</el-divider>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="上传文件" prop="file" :rules="[{ required: true, message: '请上传数据文件', trigger: 'change' }]">
                <el-upload
                  ref="upload"
                  class="upload-demo"
                  drag
                  action="#"
                  :on-change="handleFileChange"
                  :before-upload="beforeUpload"
                  :auto-upload="false"
                  :limit="1"
                  :file-list="fileList"
                  :on-remove="handleFileRemove"
                  accept=".txt"
                >
                  <i class="el-icon-upload" />
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                  </div>
                  <div slot="tip" class="el-upload__tip">
                    只支持 .txt 格式，文件大小不超过100MB
                  </div>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 文件信息显示 -->
          <el-row v-if="fileInfo.name" :gutter="20">
            <el-col :span="24">
              <el-form-item label="文件信息">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="文件名">{{ fileInfo.name }}</el-descriptions-item>
                  <el-descriptions-item label="文件大小">{{ formatFileSize(fileInfo.size) }}</el-descriptions-item>
                  <el-descriptions-item label="数据行数">{{ formatNumber(fileInfo.lines) }}</el-descriptions-item>
                  <el-descriptions-item label="上传时间">{{ fileInfo.uploadTime }}</el-descriptions-item>
                </el-descriptions>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 编辑模式下的额外字段 -->
        <template v-if="editForm.id">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('data.quantity')" prop="availableQuantity">
                <el-input-number
                  v-model="editForm.availableQuantity"
                  :min="1"
                  :max="10000000"
                  style="width: 100%"
                  controls-position="right"
                  placeholder="请输入数据数量"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select
                  v-model="editForm.status"
                  placeholder="请选择状态"
                  style="width: 100%"
                >
                  <el-option label="可用" value="available" />
                  <el-option label="停用" value="disabled" />
                  <el-option label="已售完" value="sold_out" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 利润率提示 -->
        <div v-if="editProfitRate" class="profit-alert">
          <el-alert
            :title="`利润率: ${editProfitRate}%`"
            :type="getProfitAlertType(editForm)"
            show-icon
            :closable="false"
          />
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 定价对话框 -->
    <el-dialog
      title="数据定价"
      :visible.sync="pricingDialogVisible"
      width="600px"
    >
      <el-form
        ref="pricingForm"
        :model="pricingForm"
        :rules="pricingRules"
        label-width="120px"
      >
        <el-form-item label="数据信息">
          <el-descriptions :column="2" size="small">
            <el-descriptions-item label="国家">{{ pricingForm.country }}</el-descriptions-item>
            <el-descriptions-item label="数据类型">{{ pricingForm.dataType }}</el-descriptions-item>
            <el-descriptions-item label="数量">{{ formatNumber(pricingForm.availableQuantity) }}</el-descriptions-item>
            <el-descriptions-item label="时效性">{{ getValidityText(pricingForm.validity) }}</el-descriptions-item>
          </el-descriptions>
        </el-form-item>

        <el-form-item label="推荐定价" class="recommended-pricing">
          <el-button
            type="success"
            size="small"
            @click="applyRecommendedPricing"
          >
            应用推荐定价
          </el-button>
          <div class="pricing-tips">
            <small>根据时效性自动计算推荐价格</small>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成本价" prop="costPrice">
              <el-input-number
                v-model="pricingForm.costPrice"
                :min="0"
                :precision="4"
                style="width: 100%"
                controls-position="right"
              />
              <span style="margin-left: 10px;">U/条</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售价" prop="sellPrice">
              <el-input-number
                v-model="pricingForm.sellPrice"
                :min="0"
                :precision="4"
                style="width: 100%"
                controls-position="right"
              />
              <span style="margin-left: 10px;">U/条</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="利润分析">
          <div class="profit-analysis">
            <p><strong>单条利润:</strong> {{ (pricingForm.sellPrice - pricingForm.costPrice).toFixed(4) }} U</p>
            <p><strong>利润率:</strong>
              <span :class="getProfitClass(pricingForm)">{{ calculateProfitRate(pricingForm) }}%</span>
            </p>
            <p><strong>总利润:</strong> {{ ((pricingForm.sellPrice - pricingForm.costPrice) * pricingForm.availableQuantity).toFixed(2) }} U</p>
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="pricingDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSavePricing">保存定价</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import request from '@/utils/request'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import i18nMixin from '@/mixins/i18n'
import { distributeQuantityByOperators } from '@/data/operators'
import {
  filterCountries,
  getCountryByCode,
  getPopularCountries
} from '@/data/countries'

export default {
  name: 'DataLibrary',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
  },
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
        dataType: undefined,
        source: undefined,
        sort: '+id'
      },
      statistics: {
        total: 0,
        day3: 0,
        day30: 0,
        over30: 0
      },
      unpublishedCount: 0,
      publishingLoading: false,
      detailDialogVisible: false,
      editDialogVisible: false,
      pricingDialogVisible: false,
      currentData: null,
      countryOptions: [],
      dataTypeOptions: [],
      editForm: {
        id: null,
        country: '',
        countryCode: '',
        dataType: '',
        validity: '',
        source: '',
        availableQuantity: 0,
        costPrice: 0,
        sellPrice: 0,
        remark: '',
        status: 'available',
        operators: [],
        file: null // 文件字段用于表单验证
      },
      // 国家相关数据（与上传页面一致）
      countryLoading: false,
      filteredCountries: [],
      popularCountries: [],
      groupedCountries: {},
      showPopularCountries: true,
      countrySearchKeyword: '',
      pricingForm: {
        id: null,
        country: '',
        dataType: '',
        validity: '',
        availableQuantity: 0,
        costPrice: 0,
        sellPrice: 0
      },
      editRules: {
        countryCode: [{ required: true, message: this.$t('data.selectCountry'), trigger: 'change' }],
        dataType: [{ required: true, message: this.$t('data.selectDataType'), trigger: 'blur' }],
        source: [{ required: true, message: this.$t('data.enterSource'), trigger: 'blur' }],
        validity: [{ required: true, message: this.$t('data.selectValidity'), trigger: 'change' }],
        costPrice: [{ required: true, message: this.$t('data.enterCostPrice'), trigger: 'blur' }],
        sellPrice: [{ required: true, message: this.$t('data.enterSellPrice'), trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      },
      pricingRules: {
        costPrice: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
        sellPrice: [{ required: true, message: '请输入销售价', trigger: 'blur' }]
      },
      // 文件上传相关
      fileList: [],
      fileInfo: {
        name: '',
        size: 0,
        lines: 0,
        uploadTime: ''
      },
      // 批量操作相关
      selectedRows: [], // 已选择的行
      batchOperationLoading: false // 批量操作加载状态
    }
  },
  computed: {
    hasUnpublishedData() {
      return this.unpublishedCount > 0
    },
    editProfitRate() {
      if (this.editForm.costPrice <= 0 || this.editForm.sellPrice <= 0) {
        return '0.00'
      }
      const profit = ((this.editForm.sellPrice - this.editForm.costPrice) / this.editForm.costPrice * 100)
      return profit.toFixed(2)
    },
    // 批量操作计算属性
    selectedUnpublishedCount() {
      return this.selectedRows.filter(row => row.publishStatus === 'pending').length
    },
    selectedPublishedCount() {
      return this.selectedRows.filter(row => row.publishStatus === 'published').length
    },
    hasSelectedUnpublished() {
      return this.selectedUnpublishedCount > 0
    },
    hasSelectedPublished() {
      return this.selectedPublishedCount > 0
    }
  },
  created() {
    this.getList()
    this.getStatistics()
    this.initOptions()
    this.initCountryData() // 初始化国家数据
  },
  methods: {
    // 获取数据列表
    async getList() {
      this.listLoading = true
      console.log('🔄 数据列表开始加载...')

      try {
        // 先从API获取数据库中的数据
        const response = await request({
          url: '/api/data-library',
          method: 'get',
          params: {
            page: this.listQuery.page,
            limit: 100, // 获取更多数据用于前端筛选
            country: this.listQuery.country,
            validity: this.listQuery.validity
          }
        })

        let dataList = []

        if (response && response.success && response.data) {
          // 转换数据库数据格式为前端格式
          dataList = response.data.map(item => ({
            id: item.id,
            fileName: item.file_name || '',
            country: item.country_name || item.country, // 优先使用中文名称
            countryCode: item.country, // 保存国家代码用于筛选
            dataType: item.data_type,
            validity: item.validity,
            validityDisplay: item.validity_name,
            source: item.source,
            availableQuantity: item.available_quantity,
            originalQuantity: item.total_quantity,
            operators: typeof item.operators === 'string' ? JSON.parse(item.operators) : item.operators,
            sellPrice: parseFloat(item.sell_price),
            costPrice: parseFloat(item.cost_price),
            remark: item.remark || '',
            uploadTime: item.upload_time,
            publishTime: item.publish_time,
            publishStatus: item.publish_status || 'pending',
            status: item.status || 'uploaded'
          }))
          console.log('📄 从API加载数据:', dataList.length, '条')
        }

        // 如果API没有数据，尝试从localStorage获取
        if (dataList.length === 0) {
          const savedDataListData = localStorage.getItem('dataListData')
          if (savedDataListData) {
            dataList = JSON.parse(savedDataListData)
            console.log('📄 从 localStorage 加载数据:', dataList.length, '条')
          }
        }

        // 统计未发布数据数量
        this.unpublishedCount = dataList.filter(item => item.publishStatus === 'pending').length
        console.log('📊 未发布数据数量:', this.unpublishedCount)

        // 应用筛选条件
        let filteredList = this.applyFilters(dataList)

        // 应用排序
        filteredList = this.applySorting(filteredList)

        // 前端分页
        const start = (this.listQuery.page - 1) * this.listQuery.limit
        const end = start + this.listQuery.limit

        this.list = filteredList.slice(start, end)
        this.total = filteredList.length
        this.listLoading = false

        console.log('✅ 数据加载完成，显示:', this.list.length, '条，总数:', this.total, '条')
      } catch (error) {
        console.error('❌ 从API加载数据失败:', error)

        // API失败时尝试从localStorage加载
        try {
          const savedDataListData = localStorage.getItem('dataListData')
          if (savedDataListData) {
            const dataList = JSON.parse(savedDataListData)
            console.log('📄 API失败，从 localStorage 加载数据:', dataList.length, '条')

            this.unpublishedCount = dataList.filter(item => item.publishStatus === 'pending').length
            let filteredList = this.applyFilters(dataList)
            filteredList = this.applySorting(filteredList)

            const start = (this.listQuery.page - 1) * this.listQuery.limit
            const end = start + this.listQuery.limit

            this.list = filteredList.slice(start, end)
            this.total = filteredList.length
          } else {
            this.list = []
            this.total = 0
          }
        } catch (localError) {
          console.error('❌ 从localStorage加载也失败:', localError)
          this.list = []
          this.total = 0
        }

        this.listLoading = false
      }
    },

    // 获取统计数据
    async getStatistics() {
      try {
        // 先尝试从API获取
        const response = await request({
          url: '/api/data-library',
          method: 'get',
          params: { page: 1, limit: 1000 }
        })

        let dataList = []
        if (response && response.success && response.data) {
          dataList = response.data.map(item => ({
            validity: item.validity,
            availableQuantity: item.available_quantity
          }))
        }

        // 如果API没有数据，尝试从localStorage获取
        if (dataList.length === 0) {
          const savedDataList = localStorage.getItem('dataListData')
          if (savedDataList) {
            dataList = JSON.parse(savedDataList)
          }
        }

        if (dataList.length === 0) {
          this.statistics = { total: 0, day3: 0, day30: 0, over30: 0 }
          return
        }

        let total = 0
        let day3 = 0
        let day30 = 0
        let over30 = 0

        dataList.forEach(item => {
          const quantity = item.availableQuantity || item.available_quantity || 0
          total += quantity

          switch (item.validity) {
            case '3':
              day3 += quantity
              break
            case '30':
              day30 += quantity
              break
            case '30+':
              over30 += quantity
              break
          }
        })

        this.statistics = { total, day3, day30, over30 }
        console.log('📊 统计数据更新:', this.statistics)
      } catch (error) {
        console.error('统计数据计算失败:', error)
        this.statistics = { total: 0, day3: 0, day30: 0, over30: 0 }
      }
    },

    // 初始化选项
    async initOptions() {
      try {
        // 先尝试从API获取
        const response = await request({
          url: '/api/data-library',
          method: 'get',
          params: { page: 1, limit: 1000 }
        })

        let dataList = []
        if (response && response.success && response.data) {
          dataList = response.data
        }

        // 如果API没有数据，尝试从localStorage获取
        if (dataList.length === 0) {
          const savedDataList = localStorage.getItem('dataListData')
          if (savedDataList) {
            dataList = JSON.parse(savedDataList)
          }
        }

        if (dataList.length === 0) return

        // 提取国家选项
        const countries = [...new Set(dataList.map(item => item.country))]
        this.countryOptions = countries.map(country => ({
          label: country,
          value: country
        }))

        // 提取数据类型选项
        const dataTypes = [...new Set(dataList.map(item => item.dataType || item.data_type).filter(Boolean))]
        this.dataTypeOptions = dataTypes.map(type => ({
          label: type,
          value: type
        }))
      } catch (error) {
        console.error('初始化选项失败:', error)
      }
    },

    // 应用筛选条件
    applyFilters(dataList) {
      let filteredList = [...dataList]

      // 国家筛选
      if (this.listQuery.country) {
        filteredList = filteredList.filter(item =>
          item.country && item.country.includes(this.listQuery.country)
        )
      }

      // 时效筛选
      if (this.listQuery.validity) {
        filteredList = filteredList.filter(item => item.validity === this.listQuery.validity)
      }

      // 数据类型筛选
      if (this.listQuery.dataType) {
        filteredList = filteredList.filter(item =>
          item.dataType && item.dataType.includes(this.listQuery.dataType)
        )
      }

      // 数据来源筛选
      if (this.listQuery.source) {
        filteredList = filteredList.filter(item =>
          item.source && item.source.toLowerCase().includes(this.listQuery.source.toLowerCase())
        )
      }

      return filteredList
    },

    // 应用排序
    applySorting(dataList) {
      const { sort } = this.listQuery
      if (!sort) return dataList

      const order = sort.charAt(0) === '+' ? 'asc' : 'desc'
      const field = sort.slice(1)

      return dataList.sort((a, b) => {
        let aVal = a[field]
        let bVal = b[field]

        // 处理日期类型
        if (field === 'uploadTime') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }

        if (order === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    },

    // 筛选操作
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // 刷新数据
    refreshData() {
      this.getList()
      this.getStatistics()
      this.initOptions()
      this.$message({
        type: 'success',
        message: '数据刷新成功',
        duration: 2000
      })
    },

    // 发布单条数据
    handlePublish(row) {
      this.$confirm(`确认发布这批数据吗？\n国家: ${row.country}\n数据类型: ${row.dataType}\n数量: ${this.formatNumber(row.availableQuantity)}`, '发布确认', {
        confirmButtonText: '确认发布',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.publishData([row.id])
      }).catch(() => {})
    },

    // 下线单条数据
    handleUnpublish(row) {
      this.$confirm(`确认下线这批数据吗？\n国家: ${row.country}\n数据类型: ${row.dataType}\n数量: ${this.formatNumber(row.availableQuantity)}`, '下线确认', {
        confirmButtonText: '确认下线',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.unpublishData([row.id])
      }).catch(() => {})
    },

    // 自动发布（自动选择所有待发布数据）
    async handleAutoPublish() {
      if (this.unpublishedCount === 0) {
        this.$message.warning('没有待发布的数据')
        return
      }

      try {
        // 优先从数据库API获取所有数据（符合数据源一致性原则）
        console.log('🔍 正在从数据库获取待发布数据...')
        const response = await request({
          url: '/api/data-library',
          method: 'get',
          params: {
            page: 1,
            limit: 1000, // 获取足够多的数据
            publish_status: 'pending' // 只获取待发布数据
          }
        })

        let pendingData = []

        if (response && response.success && response.data) {
          // 转换数据库数据为前端格式
          pendingData = response.data.map(item => ({
            id: item.id,
            country: item.country_name || item.country,
            countryCode: item.country,
            dataType: item.data_type,
            validity: item.validity,
            source: item.source,
            availableQuantity: item.available_quantity,
            sellPrice: parseFloat(item.sell_price),
            costPrice: parseFloat(item.cost_price),
            publishStatus: item.publish_status || 'pending'
          }))
          console.log('✅ 从数据库获取到', pendingData.length, '条待发布数据')
        }

        // 如果API没有数据，尝试从 localStorage 获取（降级方案）
        if (pendingData.length === 0) {
          console.log('⚠️  API未返回数据，尝试从 localStorage 获取...')
          const savedDataListData = localStorage.getItem('dataListData')
          if (savedDataListData) {
            const dataList = JSON.parse(savedDataListData)
            pendingData = dataList.filter(item => item.publishStatus === 'pending')
            console.log('💾 从 localStorage 获取到', pendingData.length, '条待发布数据')
          }
        }

        // 如果仍无数据，提示错误
        if (pendingData.length === 0) {
          this.$message.error('未找到待发布的数据，请先上传数据')
          return
        }

        // 计算自动发布的统计信息
        const totalQuantity = pendingData.reduce((sum, item) => sum + (item.availableQuantity || 0), 0)
        const totalValue = pendingData.reduce((sum, item) => sum + ((item.availableQuantity || 0) * (item.sellPrice || 0)), 0)
        const countries = [...new Set(pendingData.map(item => item.country))]
        const dataTypes = [...new Set(pendingData.map(item => item.dataType))]

        const confirmContent = `
          <div style="text-align: left; padding: 10px;">
            <p style="color: #409eff; font-weight: bold; margin-bottom: 15px;">
              <i class="el-icon-upload2" style="margin-right: 5px;"></i>
              自动发布确认
            </p>
            <p style="margin-bottom: 10px;">系统已自动选择所有待发布数据，将发布到资源中心：</p>
            <div style="background: #f0f9ff; padding: 12px; border-radius: 4px; border-left: 4px solid #409eff; margin: 10px 0;">
              <p><strong>数据条数：</strong> ${pendingData.length} 条</p>
              <p><strong>总数量：</strong> <span style="color: #409eff; font-weight: bold;">${this.formatNumber(totalQuantity)}</span> 条数据</p>
              <p><strong>预估价值：</strong> 约 <span style="color: #409eff; font-weight: bold;">${totalValue.toFixed(2)}</span> U</p>
              <p><strong>涉及国家：</strong> ${countries.join(', ')}</p>
              <p><strong>数据类型：</strong> ${dataTypes.join(', ')}</p>
            </div>
            <p style="color: #909399; font-size: 13px; margin-top: 10px;">
              <i class="el-icon-info" style="margin-right: 3px;"></i>
              发布后数据将在资源中心可见，客户可进行购买。
            </p>
          </div>
        `

        this.$confirm(confirmContent, '自动发布', {
          confirmButtonText: '确认发布',
          cancelButtonText: '取消',
          type: 'info',
          dangerouslyUseHTMLString: true,
          customClass: 'auto-publish-confirm'
        }).then(() => {
          // 获取所有待发布数据的ID
          const pendingIds = pendingData.map(item => item.id)
          this.publishData(pendingIds)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消自动发布操作'
          })
        })
      } catch (error) {
        console.error('❌ 获取待发布数据失败:', error)
        this.$message.error('获取待发布数据失败：' + (error.message || '未知错误'))
      }
    },

    // 执行发布操作（优先数据库，localStorage作为缓存）
    async publishData(ids) {
      if (!ids || ids.length === 0) {
        this.$message.warning('没有需要发布的数据')
        return
      }

      this.publishingLoading = true

      try {
        console.log('🚀 开始发布数据:', ids)

        // 1. 优先调用数据库API发布数据
        let publishedCount = 0
        try {
          const response = await request({
            url: '/api/data-library/batch/publish',
            method: 'post',
            data: { ids }
          })

          if (response && response.success) {
            publishedCount = response.count || ids.length
            console.log('✅ 数据库发布成功:', publishedCount, '条')
          } else {
            console.warn('⚠️  数据库发布失败:', response)
          }
        } catch (apiError) {
          console.error('❌ 数据库API调用失败:', apiError.message)
          // 继续执行 localStorage 更新（降级方案）
        }

        // 2. 更新 localStorage 缓存（保持缓存同步）
        const currentTime = Date.now()

        // 更新数据列表的发布状态
        const savedDataListData = localStorage.getItem('dataListData')
        if (savedDataListData) {
          const dataListData = JSON.parse(savedDataListData)
          const publishDataList = dataListData.filter(item => ids.includes(item.id))

          if (publishDataList.length === 0) {
            console.warn('⚠️  localStorage 中未找到待发布数据')
          } else {
            // 获取现有的资源中心数据
            const savedResourceData = localStorage.getItem('dataList')
            let resourceDataList = savedResourceData ? JSON.parse(savedResourceData) : []

            // 获取最大ID
            let maxId = resourceDataList.reduce((max, item) => Math.max(max, item.id || 0), 0)

            // 将待发布数据转换为资源中心数据格式
            const newResourceData = publishDataList.map(item => ({
              id: ++maxId,
              country: item.country,
              countryCode: item.countryCode,
              validity: item.validity,
              source: item.source,
              dataType: item.dataType,
              availableQuantity: item.availableQuantity,
              operators: item.operators,
              sellPrice: item.sellPrice,
              costPrice: item.costPrice,
              remark: item.remark || '',
              uploadTime: item.uploadTime,
              publishTime: currentTime,
              status: 'available'
            }))

            // 添加到资源中心
            resourceDataList = resourceDataList.concat(newResourceData)
            localStorage.setItem('dataList', JSON.stringify(resourceDataList))
            console.log('✅ 已更新资源中心缓存')
          }

          // 更新数据列表中的发布状态
          const updatedDataListData = dataListData.map(item => {
            if (ids.includes(item.id)) {
              return {
                ...item,
                publishStatus: 'published',
                publishTime: currentTime
              }
            }
            return item
          })

          localStorage.setItem('dataListData', JSON.stringify(updatedDataListData))
          console.log('✅ 已更新数据列表缓存')
        }

        // 3. 显示成功消息
        const successCount = publishedCount || ids.length

        // 使用 MessageBox 显示更详细的成功信息，并提供跳转链接
        this.$confirm(
          `<div style="text-align: left; padding: 10px;">
            <p style="color: #67c23a; font-weight: bold; margin-bottom: 15px;">
              <i class="el-icon-success" style="margin-right: 5px;"></i>
              成功发布 ${successCount} 条数据到资源中心！
            </p>
            <p style="margin-bottom: 10px; color: #606266;">
              <i class="el-icon-info" style="margin-right: 5px;"></i>
              数据已成功发布，客户现在可以在资源中心查看和购买。
            </p>
            <p style="margin-top: 15px; color: #909399; font-size: 13px;">
              <i class="el-icon-question" style="margin-right: 3px;"></i>
              是否立即跳转到资源中心查看？
            </p>
          </div>`,
          '发布成功',
          {
            confirmButtonText: '跳转到资源中心',
            cancelButtonText: '留在当前页面',
            type: 'success',
            dangerouslyUseHTMLString: true,
            closeOnClickModal: false
          }
        ).then(() => {
          // 用户点击“跳转到资源中心”
          console.log('🚀 跳转到资源中心...')
          this.$router.push('/resource/center')
        }).catch(() => {
          // 用户点击“留在当前页面”
          console.log('📋 用户选择留在当前页面')
        })

        console.log('✅ 数据发布完成:', successCount, '条')

        // 4. 刷新页面
        this.getList()
        this.getStatistics()
      } catch (error) {
        console.error('❌ 发布数据失败:', error)
        this.$message.error('发布数据失败：' + (error.message || '未知错误'))
      } finally {
        this.publishingLoading = false
      }
    },

    // 执行下线操作
    unpublishData(ids) {
      if (!ids || ids.length === 0) {
        this.$message.warning('没有需要下线的数据')
        return
      }

      try {
        console.log('🚑 开始下线数据:', ids)

        // 更新数据列表中的发布状态
        const savedDataListData = localStorage.getItem('dataListData')
        if (savedDataListData) {
          const dataListData = JSON.parse(savedDataListData)
          const updatedDataListData = dataListData.map(item => {
            if (ids.includes(item.id)) {
              return {
                ...item,
                publishStatus: 'unpublished'
              }
            }
            return item
          })

          localStorage.setItem('dataListData', JSON.stringify(updatedDataListData))
        }

        // 从资源中心移除对应的数据（根据数据匹配规则）
        const savedResourceData = localStorage.getItem('dataList')
        if (savedResourceData) {
          const resourceDataList = JSON.parse(savedResourceData)
          const dataListData = JSON.parse(localStorage.getItem('dataListData'))

          // 获取需要下线的数据信息
          const unpublishItems = dataListData.filter(item => ids.includes(item.id))

          // 从资源中心移除匹配的数据
          const filteredResourceData = resourceDataList.filter(resourceItem => {
            return !unpublishItems.some(unpublishItem =>
              resourceItem.country === unpublishItem.country &&
              resourceItem.dataType === unpublishItem.dataType &&
              resourceItem.validity === unpublishItem.validity &&
              resourceItem.availableQuantity === unpublishItem.availableQuantity
            )
          })

          localStorage.setItem('dataList', JSON.stringify(filteredResourceData))
        }

        this.$message({
          type: 'success',
          message: `成功下线 ${ids.length} 条数据`,
          duration: 3000
        })

        console.log('✅ 数据下线成功:', ids.length, '条')

        // 刷新页面
        this.getList()
      } catch (error) {
        console.error('❌ 下线数据失败:', error)
        this.$message.error('下线数据失败')
      }
    },

    // 查看详情
    handleDetail(row) {
      this.currentData = row
      this.detailDialogVisible = true
    },

    // 选择性批量发布（发布已选中的待发布数据）
    handleSelectedPublish() {
      if (this.selectedUnpublishedCount === 0) {
        this.$message.warning('请选择待发布的数据')
        return
      }

      const unpublishedRows = this.selectedRows.filter(row => row.publishStatus === 'pending')
      const totalQuantity = unpublishedRows.reduce((sum, item) => sum + (item.availableQuantity || 0), 0)
      const totalValue = unpublishedRows.reduce((sum, item) => sum + ((item.availableQuantity || 0) * (item.sellPrice || 0)), 0)

      const confirmContent = `
        <div style="text-align: left; padding: 10px;">
          <p style="color: #67c23a; font-weight: bold; margin-bottom: 15px;">
            <i class="el-icon-check" style="margin-right: 5px;"></i>
            发布已选数据
          </p>
          <p style="margin-bottom: 10px;">将发布以下已选择的待发布数据：</p>
          <div style="background: #f0f9ff; padding: 12px; border-radius: 4px; border-left: 4px solid #67c23a; margin: 10px 0;">
            <p><strong>选中数量：</strong> ${this.selectedUnpublishedCount} 条</p>
            <p><strong>数据量：</strong> <span style="color: #67c23a; font-weight: bold;">${this.formatNumber(totalQuantity)}</span> 条</p>
            <p><strong>预估价值：</strong> 约 <span style="color: #67c23a; font-weight: bold;">${totalValue.toFixed(2)}</span> U</p>
          </div>
          <div style="max-height: 150px; overflow-y: auto; background: #f9f9f9; padding: 8px; border-radius: 4px; margin: 10px 0;">
            ${unpublishedRows.map(row =>
    `<p style="margin: 2px 0; font-size: 12px;">• ${row.country} - ${row.dataType} (${this.formatNumber(row.availableQuantity)}条)</p>`
  ).join('')}
          </div>
        </div>
      `

      this.$confirm(confirmContent, '发布已选数据', {
        confirmButtonText: '确认发布',
        cancelButtonText: '取消',
        type: 'success',
        dangerouslyUseHTMLString: true
      }).then(() => {
        const selectedIds = unpublishedRows.map(row => row.id)
        this.publishData(selectedIds)
        this.clearSelection()
      }).catch(() => {})
    },

    // 选择性批量下线（下线已选中的已发布数据）
    handleSelectedUnpublish() {
      if (this.selectedPublishedCount === 0) {
        this.$message.warning('请选择已发布的数据')
        return
      }

      const publishedRows = this.selectedRows.filter(row => row.publishStatus === 'published')
      const totalQuantity = publishedRows.reduce((sum, item) => sum + (item.availableQuantity || 0), 0)
      const totalValue = publishedRows.reduce((sum, item) => sum + ((item.availableQuantity || 0) * (item.sellPrice || 0)), 0)

      const confirmContent = `
        <div style="text-align: left; padding: 10px;">
          <p style="color: #e6a23c; font-weight: bold; margin-bottom: 15px;">
            <i class="el-icon-download" style="margin-right: 5px;"></i>
            下线已选数据
          </p>
          <p style="margin-bottom: 10px;">将从资源中心下线以下数据：</p>
          <div style="background: #fdf6ec; padding: 12px; border-radius: 4px; border-left: 4px solid #e6a23c; margin: 10px 0;">
            <p><strong>选中数量：</strong> ${this.selectedPublishedCount} 条</p>
            <p><strong>数据量：</strong> <span style="color: #e6a23c; font-weight: bold;">${this.formatNumber(totalQuantity)}</span> 条</p>
            <p><strong>影响价值：</strong> 约 <span style="color: #e6a23c; font-weight: bold;">${totalValue.toFixed(2)}</span> U</p>
          </div>
          <div style="max-height: 150px; overflow-y: auto; background: #f9f9f9; padding: 8px; border-radius: 4px; margin: 10px 0;">
            ${publishedRows.map(row =>
    `<p style="margin: 2px 0; font-size: 12px;">• ${row.country} - ${row.dataType} (${this.formatNumber(row.availableQuantity)}条)</p>`
  ).join('')}
          </div>
          <p style="color: #909399; font-size: 13px; margin-top: 10px;">
            <i class="el-icon-warning" style="margin-right: 3px;"></i>
            下线后客户将无法购买这些数据。
          </p>
        </div>
      `

      this.$confirm(confirmContent, '下线已选数据', {
        confirmButtonText: '确认下线',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        const selectedIds = publishedRows.map(row => row.id)
        this.unpublishData(selectedIds)
        this.clearSelection()
      }).catch(() => {})
    },

    // 表格行选择相关方法
    handleSelectionChange(selection) {
      this.selectedRows = selection
      console.log('🔄 选中数据:', selection.length, '条')
    },

    // 清空选中
    clearSelection() {
      this.$refs.table && this.$refs.table.clearSelection()
      this.selectedRows = []
    },

    // 判断行是否可选择（所有行都可选择）
    isRowSelectable(row, index) {
      return true // 所有行都可以选择
    },

    // 新增数据
    handleCreate() {
      this.resetEditForm()
      this.editDialogVisible = true
    },

    // 编辑数据
    handleEdit(row) {
      this.editForm = { ...row }
      this.editDialogVisible = true
    },

    // 定价操作
    handlePricing(row) {
      this.pricingForm = {
        id: row.id,
        country: row.country,
        dataType: row.dataType,
        validity: row.validity,
        availableQuantity: row.availableQuantity,
        costPrice: row.costPrice,
        sellPrice: row.sellPrice
      }
      this.pricingDialogVisible = true
    },

    // 删除数据（高危操作）
    handleDelete(row) {
      // 根据项目规范：危险操作增加确认删除步骤
      const deleteContent = `
        <div style="text-align: left; padding: 10px;">
          <p style="color: #f56c6c; font-weight: bold; margin-bottom: 15px;">
            <i class="el-icon-warning" style="margin-right: 5px;"></i>
            您正在执行高危操作！
          </p>
          <p style="margin-bottom: 10px;">将永久删除以下数据：</p>
          <div style="background: #fef0f0; padding: 12px; border-radius: 4px; border-left: 4px solid #f56c6c; margin: 10px 0;">
            <p><strong>国家：</strong> ${row.country}</p>
            <p><strong>数据类型：</strong> ${row.dataType}</p>
            <p><strong>数据来源：</strong> ${row.source || '未知'}</p>
            <p><strong>时效性：</strong> ${this.getValidityText(row.validity)}</p>
            <p><strong>数量：</strong> <span style="color: #f56c6c; font-weight: bold;">${this.formatNumber(row.availableQuantity)}</span> 条</p>
            <p><strong>价值：</strong> 约 <span style="color: #f56c6c; font-weight: bold;">${(row.availableQuantity * row.sellPrice).toFixed(2)}</span> U</p>
          </div>
          <p style="color: #909399; font-size: 13px; margin-top: 10px;">
            <i class="el-icon-info" style="margin-right: 3px;"></i>
            此操作不可撤销，请谨慎操作！
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
        this.deleteData(row.id, row)
      }).catch(() => {
        // 用户取消删除
        this.$message({
          type: 'info',
          message: '已取消删除操作'
        })
      })
    },

    // 执行删除操作（优先数据库，localStorage作为降级）
    async deleteData(id, rowData) {
      console.log('🗑️ 开始删除数据:', { id, rowData })

      try {
        let deletedFromDatabase = false
        let deletedFromLibrary = false
        let deletedFromResource = false

        // 1. 优先从数据库删除（数据库优先模式）
        try {
          console.log('📡 调用数据库API删除数据，ID:', id)
          const response = await request({
            url: `/api/data-library/${id}`,
            method: 'delete'
          })

          if (response && response.success) {
            deletedFromDatabase = true
            console.log('✅ 数据库删除成功')
          } else {
            console.warn('⚠️  数据库删除失败:', response)
          }
        } catch (dbError) {
          console.error('❌ 数据库删除失败:', dbError.message)
          // 继续尝试从localStorage删除（降级方案）
        }

        // 2. 从数据列表中删除（dataListData）- localStorage缓存清理
        const savedDataListData = localStorage.getItem('dataListData')
        if (savedDataListData) {
          const dataListData = JSON.parse(savedDataListData)
          const originalLength = dataListData.length
          const filteredDataListData = dataListData.filter(item => item.id !== id)

          if (filteredDataListData.length < originalLength) {
            localStorage.setItem('dataListData', JSON.stringify(filteredDataListData))
            deletedFromLibrary = true
            console.log('✅ 已从数据列表缓存中删除数据 (dataListData)')
          } else {
            console.log('⚠️  在数据列表缓存中未找到匹配的数据记录')
          }
        } else {
          console.log('⚠️  dataListData 缓存不存在')
        }

        // 3. 从资源中心中删除（dataList）- localStorage缓存清理
        const savedDataList = localStorage.getItem('dataList')
        if (savedDataList) {
          const dataList = JSON.parse(savedDataList)
          const originalLength = dataList.length

          console.log('🔍 开始从资源中心缓存删除数据，原数据量:', originalLength)

          // 使用多重匹配规则确保精确删除
          const filteredDataList = dataList.filter(item => {
            // 首先尝试使用ID匹配
            if (item.id === id) {
              console.log('🎯 通过ID匹配找到要删除的数据:', item.id)
              return false
            }

            // 如果ID不匹配，使用多字段组合匹配
            const isMatch = (
              item.country === rowData.country &&
              item.dataType === rowData.dataType &&
              item.validity === rowData.validity &&
              item.availableQuantity === rowData.availableQuantity
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
            console.log('✅ 已从资源中心缓存删除数据 (dataList)，删除数量:', deletedCount)
          } else {
            console.log('⚠️  在资源中心缓存中未找到匹配的数据记录')
          }
        } else {
          console.log('⚠️  dataList 缓存不存在')
        }

        // 4. 记录删除日志
        const deleteLog = {
          timestamp: Date.now(),
          action: 'DELETE',
          target: 'DATA_RECORD',
          data: {
            id: id,
            country: rowData.country,
            dataType: rowData.dataType,
            quantity: rowData.availableQuantity,
            value: (rowData.availableQuantity * rowData.sellPrice).toFixed(2) + ' U'
          },
          operator: this.$store.getters.name || 'admin',
          fromDatabase: deletedFromDatabase
        }

        // 保存删除日志
        const savedLogs = localStorage.getItem('operationLogs')
        const logs = savedLogs ? JSON.parse(savedLogs) : []
        logs.unshift(deleteLog)

        // 只保留最近100条日志
        if (logs.length > 100) {
          logs.splice(100)
        }

        localStorage.setItem('operationLogs', JSON.stringify(logs))

        // 5. 同步状态验证和统计
        const syncStatus = {
          databaseDeleted: deletedFromDatabase,
          libraryDeleted: deletedFromLibrary,
          resourceDeleted: deletedFromResource,
          timestamp: Date.now()
        }

        // 保存同步状态
        const syncLogs = JSON.parse(localStorage.getItem('syncLogs') || '[]')
        syncLogs.unshift({
          action: 'DELETE',
          dataId: id,
          status: syncStatus,
          details: {
            country: rowData.country,
            dataType: rowData.dataType,
            quantity: rowData.availableQuantity
          }
        })

        // 只保留最近50条同步日志
        if (syncLogs.length > 50) {
          syncLogs.splice(50)
        }
        localStorage.setItem('syncLogs', JSON.stringify(syncLogs))

        // 6. 显示成功消息和同步状态
        let successMessage = `已成功删除数据：${rowData.country} - ${rowData.dataType}`
        let messageType = 'success'

        if (deletedFromDatabase) {
          successMessage += ' （已从数据库删除）'
          console.log('✅ 数据库删除成功')
        } else if (deletedFromLibrary || deletedFromResource) {
          successMessage += ' （仅从缓存删除，数据库删除失败）'
          messageType = 'warning'
          console.log('⚠️  仅缓存删除：数据库删除失败')
        } else {
          successMessage = '删除操作完成，但未在任何数据源中找到匹配记录'
          messageType = 'error'
          console.log('❌ 删除失败：未在任何数据源中找到记录')
        }

        this.$message({
          type: messageType,
          message: successMessage,
          duration: messageType === 'error' ? 5000 : 3000
        })

        // 7. 刷新页面数据和统计
        this.getList()
        this.getStatistics()
        this.initOptions()

        // 8. 触发资源中心数据更新事件（如果支持的话）
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
          window.eventBus.emit('resource-data-updated', {
            action: 'delete',
            data: rowData,
            syncStatus: syncStatus
          })
          console.log('📡 已发送资源中心数据更新事件')
        }

        console.log('✅ 数据删除完成，同步状态:', syncStatus)
      } catch (error) {
        console.error('❌ 删除数据失败:', error)

        // 记录错误日志
        const errorLog = {
          timestamp: Date.now(),
          action: 'DELETE_ERROR',
          target: 'DATA_RECORD',
          error: error.message || error.toString(),
          data: {
            id: id,
            country: rowData.country,
            dataType: rowData.dataType
          },
          operator: this.$store.getters.name || 'admin'
        }

        const savedLogs = localStorage.getItem('operationLogs')
        const logs = savedLogs ? JSON.parse(savedLogs) : []
        logs.unshift(errorLog)
        localStorage.setItem('operationLogs', JSON.stringify(logs))

        this.$message({
          type: 'error',
          message: '删除失败：' + (error.message || '未知错误'),
          duration: 5000
        })

        // 在错误情况下仍然尝试刷新数据
        try {
          this.getList()
          this.getStatistics()
        } catch (refreshError) {
          console.error('❌ 刷新数据失败:', refreshError)
        }
      }
    },

    // 检查数据同步状态
    checkSyncStatus() {
      try {
        const dataListData = JSON.parse(localStorage.getItem('dataListData') || '[]')
        const dataList = JSON.parse(localStorage.getItem('dataList') || '[]')
        const syncLogs = JSON.parse(localStorage.getItem('syncLogs') || '[]')

        console.log('🔍 数据同步状态检查:')
        console.log('- 数据列表 (dataListData):', dataListData.length, '条')
        console.log('- 资源中心 (dataList):', dataList.length, '条')
        console.log('- 同步日志:', syncLogs.length, '条')

        // 统计最近10条删除操作的同步状态
        const recentDeletes = syncLogs
          .filter(log => log.action === 'DELETE')
          .slice(0, 10)

        if (recentDeletes.length > 0) {
          console.log('📋 最近10条删除操作同步状态:')
          recentDeletes.forEach((log, index) => {
            const status = log.status
            const statusText = status.libraryDeleted && status.resourceDeleted
              ? '✅ 完全同步'
              : status.libraryDeleted
                ? '⚠️  仅数据列表'
                : status.resourceDeleted
                  ? '⚠️  仅资源中心'
                  : '❌ 同步失败'

            console.log(`${index + 1}. ${log.details.country} - ${log.details.dataType}: ${statusText}`)
          })
        }

        return {
          libraryCount: dataListData.length,
          resourceCount: dataList.length,
          syncLogsCount: syncLogs.length,
          recentDeletes: recentDeletes
        }
      } catch (error) {
        console.error('❌ 检查同步状态失败:', error)
        return null
      }
    },

    // 清理同步日志
    clearSyncLogs() {
      this.$confirm('确认清理所有同步日志吗？', '清理确认', {
        confirmButtonText: '确认清理',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('syncLogs')
        this.$message({
          type: 'success',
          message: '同步日志已清理'
        })
        console.log('🗑️ 同步日志已清理')
      }).catch(() => {})
    },

    // 保存编辑
    handleSave() {
      // 新增模式需要验证文件上传
      if (!this.editForm.id) {
        if (!this.fileInfo.name || this.fileInfo.lines === 0) {
          this.$message.error('请上传数据文件')
          return
        }
      }

      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.saveData()
        }
      })
    },

    // 执行保存操作
    async saveData() {
      try {
        if (this.editForm.id) {
          // 编辑模式：更新现有数据
          await this.updateDataRecord()
        } else {
          // 新增模式：创建带文件的数据记录
          await this.createDataWithFile()
        }

        this.$message({
          type: 'success',
          message: this.editForm.id ? '修改成功' : '新增成功'
        })

        this.editDialogVisible = false
        this.getList()
        this.getStatistics()
      } catch (error) {
        console.error('保存数据失败:', error)
        this.$message.error('保存失败: ' + (error.message || error))
      }
    },

    // 更新数据记录
    async updateDataRecord() {
      // 如果没有数据库API，回退到localStorage
      const savedDataListData = localStorage.getItem('dataListData')
      const dataListData = savedDataListData ? JSON.parse(savedDataListData) : []

      const index = dataListData.findIndex(item => item.id === this.editForm.id)
      if (index !== -1) {
        // 保留原有的运营商信息和上传时间
        const originalData = dataListData[index]
        dataListData[index] = {
          ...this.editForm,
          country: this.editForm.country || (getCountryByCode(this.editForm.countryCode) || {}).name || this.editForm.countryCode,
          operators: originalData.operators || this.generateOperators(this.editForm.availableQuantity, this.editForm.countryCode),
          uploadTime: originalData.uploadTime || Date.now(),
          publishTime: originalData.publishTime,
          publishStatus: originalData.publishStatus
        }

        localStorage.setItem('dataListData', JSON.stringify(dataListData))

        // 同时更新资源中心数据（如果已发布）
        if (originalData.publishStatus === 'published') {
          const savedDataList = localStorage.getItem('dataList')
          const dataList = savedDataList ? JSON.parse(savedDataList) : []

          const resourceIndex = dataList.findIndex(item =>
            item.country === originalData.country &&
            item.dataType === originalData.dataType &&
            item.validity === originalData.validity
          )

          if (resourceIndex !== -1) {
            dataList[resourceIndex] = {
              ...dataList[resourceIndex],
              ...this.editForm,
              country: this.editForm.country || (getCountryByCode(this.editForm.countryCode) || {}).name || this.editForm.countryCode
            }
            localStorage.setItem('dataList', JSON.stringify(dataList))
          }
        }
      }
    },

    // 创建带文件的数据记录
    async createDataWithFile() {
      console.log('🚀 创建带文件的数据记录')

      const countryInfo = getCountryByCode(this.editForm.countryCode)
      const operators = this.generateOperators(this.editForm.availableQuantity, this.editForm.countryCode)

      // 准备请求数据
      const requestData = {
        // 基本数据信息
        country: this.editForm.countryCode,
        countryCode: this.editForm.countryCode,
        country_name: countryInfo ? countryInfo.name : this.editForm.countryCode,
        dataType: this.editForm.dataType,
        data_type: this.editForm.dataType,
        validity: this.editForm.validity,
        validity_name: this.getValidityText(this.editForm.validity),
        validityDisplay: this.getValidityText(this.editForm.validity),
        source: this.editForm.source || '数据上传',
        operators: operators,
        sellPrice: this.editForm.sellPrice,
        sell_price: this.editForm.sellPrice,
        costPrice: this.editForm.costPrice,
        cost_price: this.editForm.costPrice,
        remark: this.editForm.remark || '',
        uploadBy: this.$store.state.user.loginAccount || null,
        upload_by: this.$store.state.user.loginAccount || null,

        // 文件信息（如果有文件上传）
        fileName: this.fileInfo.name,
        filePath: this.fileInfo.serverPath,
        fileSize: this.fileInfo.size,
        fileHash: this.fileInfo.hash,
        fileLines: this.fileInfo.lines
      }

      try {
        // 尝试调用数据库API（带文件的创建接口）
        const response = await request({
          url: '/api/upload/create-with-file',
          method: 'post',
          data: requestData
        })

        if (response.data && response.data.success) {
          console.log('✅ 数据已保存到数据库:', response.data.data)
          this.$message.success('数据已保存到数据库，待发布状态')
          return
        } else {
          throw new Error(response.data.message || '数据库保存失败')
        }
      } catch (error) {
        console.warn('⚠️ 数据库保存失败，回退到localStorage:', error.message)

        // 回退到localStorage存储
        const savedDataListData = localStorage.getItem('dataListData')
        const dataListData = savedDataListData ? JSON.parse(savedDataListData) : []

        const maxId = dataListData.reduce((max, item) => Math.max(max, item.id || 0), 0)

        const newData = {
          ...this.editForm,
          id: maxId + 1,
          country: countryInfo ? countryInfo.name : this.editForm.countryCode,
          countryCode: this.editForm.countryCode,
          operators: operators,
          uploadTime: Date.now(),
          publishTime: null,
          publishStatus: 'pending',
          status: 'uploaded',

          // 文件信息
          fileName: this.fileInfo.name,
          filePath: this.fileInfo.serverPath,
          fileSize: this.fileInfo.size,
          fileHash: this.fileInfo.hash
        }

        dataListData.push(newData)
        localStorage.setItem('dataListData', JSON.stringify(dataListData))

        console.log('✅ 数据已保存到localStorage（待发布）:', newData)
        this.$message.success('数据已保存到本地存储，待发布状态')
      }
    },

    // 保存定价
    handleSavePricing() {
      this.$refs.pricingForm.validate((valid) => {
        if (valid) {
          this.savePricing()
        }
      })
    },

    // 文件上传相关方法
    // 文件改变时
    async handleFileChange(file, fileList) {
      console.log('📁 文件选择:', file)
      console.log('📁 文件列表:', fileList)

      // 获取原始文件对象
      const rawFile = file.raw || file

      if (!rawFile) {
        console.error('❌ 无法获取文件对象')
        this.$message.error('文件选择失败，请重试')
        return
      }

      console.log('📄 原始文件:', rawFile.name, rawFile.size)

      this.fileInfo = {
        name: rawFile.name,
        size: rawFile.size,
        uploadTime: new Date().toLocaleString(),
        lines: 0,
        uploading: true
      }

      this.fileList = fileList

      // 设置表单file字段以通过验证
      this.editForm.file = rawFile

      // 上传文件到服务器
      try {
        await this.uploadFileToServer(rawFile)
      } catch (error) {
        console.error('文件上传失败:', error)
        this.$message.error('文件上传失败: ' + error.message)
        this.fileList = []
        this.fileInfo = { name: '', size: 0, lines: 0, uploadTime: '' }
        this.editForm.file = null
      }
    },

    // 文件移除时
    handleFileRemove(file, fileList) {
      console.log('🗑️ 文件移除:', file.name)
      this.fileList = fileList
      this.fileInfo = { name: '', size: 0, lines: 0, uploadTime: '' }
      this.editForm.file = null
      this.editForm.availableQuantity = 0
    },

    // 上传文件到服务器
    async uploadFileToServer(file) {
      console.log('🚀 开始上传文件到服务器:', file.name)

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await request({
          url: '/api/upload/upload',
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // 60秒超时
        })

        if (response.data && response.data.success) {
          const fileData = response.data.data

          // 更新文件信息
          this.fileInfo = {
            name: fileData.originalName,
            size: fileData.size,
            lines: fileData.lines,
            uploadTime: new Date(fileData.uploadTime).toLocaleString(),
            serverPath: fileData.path,
            hash: fileData.hash,
            uploading: false
          }

          // 自动填充数量字段
          this.editForm.availableQuantity = fileData.lines

          console.log(`✅ 文件上传成功: ${fileData.lines} 行`)
          this.$message.success('文件上传成功')
        } else {
          throw new Error(response.data.message || '上传失败')
        }
      } catch (error) {
        console.error('❌ 上传文件失败:', error)
        this.fileInfo.uploading = false

        // 如果API调用失败，降级到本地计算行数
        console.log('⚠️ 降级到本地计算文件行数')
        this.calculateFileLines(file)
        this.fileInfo.uploading = false
        this.fileInfo.serverPath = null // 标记未上传到服务器
      }
    },

    // 文件上传前验证
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

    // 计算文件行数
    calculateFileLines(file) {
      if (file && file.size > 0) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const text = e.target.result
            // 计算实际行数（非空行）
            const lines = text.split('\n').filter(line => line.trim().length > 0)
            this.fileInfo.lines = lines.length

            // 自动填充数量字段
            this.editForm.availableQuantity = lines.length

            console.log(`✅ 文件行数计算完成: ${lines.length} 行`)

            // 如果文件太大，只读取前面部分进行估算
            if (file.size > 10 * 1024 * 1024) { // 10MB以上的文件
              const sampleLines = lines.length
              const sampleSize = text.length
              const estimatedLines = Math.round((file.size / sampleSize) * sampleLines)
              this.fileInfo.lines = estimatedLines
              this.editForm.availableQuantity = estimatedLines
              console.log(`ℹ️ 大文件估算行数: ${estimatedLines} 行`)
            }
          } catch (error) {
            console.error('读取文件失败:', error)
            // 如果读取失败，使用文件大小估算
            this.fileInfo.lines = Math.floor(file.size / 50) // 假设平均每行50字节
            this.editForm.availableQuantity = this.fileInfo.lines
          }
        }

        reader.onerror = () => {
          console.error('文件读取错误')
          // 使用文件大小估算
          this.fileInfo.lines = Math.floor(file.size / 50)
          this.editForm.availableQuantity = this.fileInfo.lines
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
        this.editForm.availableQuantity = 0
      }
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },

    // 执行定价保存
    async savePricing() {
      console.log('💰 开始保存定价:', this.pricingForm)

      try {
        const dataId = this.pricingForm.id
        const costPrice = this.pricingForm.costPrice
        const sellPrice = this.pricingForm.sellPrice

        // 1. 优先更新数据库
        let databaseUpdated = false
        try {
          console.log('📡 调用数据库API更新定价，ID:', dataId)
          const response = await request({
            url: `/api/data-library/${dataId}`,
            method: 'put',
            data: {
              cost_price: costPrice,
              sell_price: sellPrice
            }
          })

          if (response && response.success) {
            databaseUpdated = true
            console.log('✅ 数据库定价更新成功')
          } else {
            console.warn('⚠️  数据库定价更新失败:', response)
          }
        } catch (dbError) {
          console.error('❌ 数据库定价更新失败:', dbError.message)
          // 如果数据库更新失败，继续尝试更新localStorage
        }

        // 2. 更新 localStorage - dataListData（主数据源）
        let dataListDataUpdated = false
        const savedDataListData = localStorage.getItem('dataListData')
        if (savedDataListData) {
          const dataListData = JSON.parse(savedDataListData)
          const index = dataListData.findIndex(item => item.id === dataId)

          if (index !== -1) {
            dataListData[index].costPrice = costPrice
            dataListData[index].sellPrice = sellPrice
            localStorage.setItem('dataListData', JSON.stringify(dataListData))
            dataListDataUpdated = true
            console.log('✅ 已更新 dataListData 定价')
          } else {
            console.warn('⚠️  在 dataListData 中未找到数据，ID:', dataId)
          }
        }

        // 3. 更新 localStorage - dataList（资源中心数据）
        let dataListUpdated = false
        const savedDataList = localStorage.getItem('dataList')
        if (savedDataList) {
          const dataList = JSON.parse(savedDataList)
          const index = dataList.findIndex(item => item.id === dataId)

          if (index !== -1) {
            dataList[index].costPrice = costPrice
            dataList[index].sellPrice = sellPrice
            localStorage.setItem('dataList', JSON.stringify(dataList))
            dataListUpdated = true
            console.log('✅ 已更新 dataList 定价')
          } else {
            console.log('ℹ️  在 dataList 中未找到数据（可能未发布到资源中心）')
          }
        }

        // 4. 验证至少有一个数据源更新成功
        if (!databaseUpdated && !dataListDataUpdated && !dataListUpdated) {
          console.error('❌ 所有数据源都未找到该数据，ID:', dataId)
          this.$message.error('数据不存在，请刷新页面后重试')
          return
        }

        // 5. 记录操作日志
        const pricingLog = {
          timestamp: Date.now(),
          action: 'UPDATE_PRICING',
          target: 'DATA_RECORD',
          data: {
            id: dataId,
            country: this.pricingForm.country,
            dataType: this.pricingForm.dataType,
            costPrice: costPrice,
            sellPrice: sellPrice,
            profitRate: this.calculateProfitRate(this.pricingForm)
          },
          operator: this.$store.getters.name || 'admin',
          syncStatus: {
            database: databaseUpdated,
            dataListData: dataListDataUpdated,
            dataList: dataListUpdated
          }
        }

        // 保存操作日志
        const savedLogs = localStorage.getItem('operationLogs')
        const logs = savedLogs ? JSON.parse(savedLogs) : []
        logs.unshift(pricingLog)
        if (logs.length > 100) {
          logs.splice(100)
        }
        localStorage.setItem('operationLogs', JSON.stringify(logs))

        // 6. 通知定价管理页面刷新
        localStorage.setItem('pricingNeedsRefresh', 'true')
        console.log('🔔 已通知定价管理页面刷新')

        // 7. 显示成功消息
        this.$message({
          type: 'success',
          message: databaseUpdated ? '定价更新成功（已同步数据库）' : '定价更新成功（仅本地缓存）',
          duration: 3000
        })

        // 8. 关闭对话框并刷新列表
        this.pricingDialogVisible = false
        this.getList()

        console.log('✅ 定价保存完成:', pricingLog)
      } catch (error) {
        console.error('❌ 保存定价失败:', error)
        this.$message.error('保存定价失败: ' + error.message)
      }
    },

    // 应用推荐定价
    applyRecommendedPricing() {
      const { validity } = this.pricingForm
      let costPrice = 0.02
      let sellPrice = 0.03

      // 根据记忆中的定价规则设置推荐价格
      switch (validity) {
        case '3':
          costPrice = 0.04
          sellPrice = 0.05
          break
        case '30':
          costPrice = 0.03
          sellPrice = 0.04
          break
        case '30+':
          costPrice = 0.02
          sellPrice = 0.03
          break
      }

      this.pricingForm.costPrice = costPrice
      this.pricingForm.sellPrice = sellPrice

      this.$message({
        type: 'success',
        message: '已应用推荐定价',
        duration: 2000
      })
    },

    // 重置编辑表单
    resetEditForm() {
      this.editForm = {
        id: null,
        country: '',
        countryCode: '',
        dataType: '',
        validity: '',
        source: '',
        availableQuantity: 0,
        costPrice: 0,
        sellPrice: 0,
        remark: '',
        status: 'available',
        operators: [],
        file: null // 添加file字段
      }

      // 重置文件上传状态
      this.fileList = []
      this.fileInfo = {
        name: '',
        size: 0,
        lines: 0,
        uploadTime: ''
      }

      // 清空上传组件
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
    },

    // 国家选择相关方法（与上传页面一致）
    initCountryData() {
      // 初始化国家数据
      this.popularCountries = getPopularCountries()
      this.groupedCountries = {}
      this.filteredCountries = []
    },

    // 初始化国家选项
    initCountryOptions() {
      if (this.popularCountries.length === 0) {
        this.popularCountries = getPopularCountries()
      }
      this.showPopularCountries = true
    },

    // 搜索国家
    searchCountries(keyword) {
      this.countryLoading = true
      this.countrySearchKeyword = keyword

      if (!keyword) {
        this.filteredCountries = []
        this.showPopularCountries = true
        this.countryLoading = false
        return
      }

      this.showPopularCountries = false

      setTimeout(() => {
        this.filteredCountries = filterCountries(keyword)
        this.countryLoading = false
      }, 200)
    },

    // 获取地区名称
    getRegionName(region) {
      const regionNames = {
        'Asia': '亚洲',
        'Europe': '欧洲',
        'Africa': '非洲',
        'North America': '北美洲',
        'South America': '南美洲',
        'Oceania': '大洋洲'
      }
      return regionNames[region] || region
    },

    // 处理国家选择变更
    handleCountryChange(countryCode) {
      if (countryCode) {
        const country = getCountryByCode(countryCode)
        this.editForm.country = country ? country.name : countryCode
      } else {
        this.editForm.country = ''
      }
    },

    // 排序处理
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else if (order === 'descending') {
        this.listQuery.sort = `-${prop}`
      } else {
        this.listQuery.sort = '+id'
      }
      this.handleFilter()
    },

    // 生成运营商分布
    generateOperators(totalQuantity, countryCode) {
      try {
        return distributeQuantityByOperators(totalQuantity, countryCode || 'DEFAULT')
      } catch (error) {
        console.error('生成运营商分布失败:', error)
        return [
          { name: '默认运营商', quantity: totalQuantity }
        ]
      }
    },

    // 格式化数字
    formatNumber(num) {
      return num ? num.toLocaleString() : '0'
    },

    // 获取时效性文本
    getValidityText(validity) {
      const validityMap = {
        '3': '3天内',
        '30': '30天内',
        '30+': '30天以上'
      }
      return validityMap[validity] || validity
    },

    // 获取时效性标签类型
    getValidityTagType(validity) {
      const tagMap = {
        '3': 'danger',
        '30': 'warning',
        '30+': 'success'
      }
      return tagMap[validity]
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'available': '可用',
        'disabled': '停用',
        'sold_out': '已售完'
      }
      return statusMap[status] || status
    },

    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        'available': 'success',
        'disabled': 'warning',
        'sold_out': 'info'
      }
      return typeMap[status] || 'info'
    },

    // 计算利润率
    calculateProfitRate(data) {
      if (!data.costPrice || data.costPrice <= 0) return '0.00'
      const rate = ((data.sellPrice - data.costPrice) / data.costPrice * 100)
      return rate.toFixed(1)
    },

    // 获取利润率样式类
    getProfitClass(data) {
      const rate = parseFloat(this.calculateProfitRate(data))
      if (rate >= 50) return 'profit-high'
      if (rate >= 20) return 'profit-medium'
      if (rate >= 0) return 'profit-low'
      return 'profit-negative'
    },

    // 获取利润率提示类型
    getProfitAlertType(data) {
      const rate = parseFloat(this.calculateProfitRate(data))
      if (rate >= 50) return 'success'
      if (rate >= 20) return 'warning'
      if (rate >= 0) return 'info'
      return 'error'
    },

    // 获取发布状态文本
    getPublishStatusText(status) {
      const statusMap = {
        'pending': '待发布',
        'published': '已发布',
        'unpublished': '已下线'
      }
      return statusMap[status] || '未知'
    },

    // 获取发布状态类型
    getPublishStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'published': 'success',
        'unpublished': 'info'
      }
      return typeMap[status] || 'info'
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

.stat-card {
  position: relative;
  overflow: hidden;

  .stat-content {
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      color: #606266;
    }
  }

  .stat-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 40px;
    color: #ddd;
  }
}

.operator-item {
  margin-bottom: 3px;
  font-size: 12px;

  .operator-name {
    font-weight: bold;
    margin-right: 5px;
  }

  .operator-count {
    color: #409eff;
    margin-right: 3px;
  }

  .operator-percent {
    color: #909399;
    font-size: 11px;
  }
}

.operator-detail {
  margin-bottom: 8px;

  .operator-tag {
    margin-right: 10px;
    margin-bottom: 5px;
  }
}

// 利润率样式
.profit-high {
  color: #67c23a;
  font-weight: bold;
}

.profit-medium {
  color: #e6a23c;
  font-weight: bold;
}

.profit-low {
  color: #409eff;
}

.profit-negative {
  color: #f56c6c;
  font-weight: bold;
}

// 对话框样式
.dialog-footer {
  text-align: right;
}

.profit-info {
  margin-top: 15px;
}

.recommended-pricing {
  .pricing-tips {
    margin-top: 5px;
    color: #909399;
  }
}

.profit-analysis {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409eff;

  p {
    margin: 8px 0;
    font-size: 14px;
  }
}

// 表格样式优化
::v-deep .el-table {
  .el-table__body-wrapper {
    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .filter-container {
    .filter-item {
      margin-bottom: 10px;
      width: 100%;
    }
  }

  .stat-card {
    margin-bottom: 15px;
  }
}

// 文件上传样式
.upload-demo {
  width: 100%;

  ::v-deep .el-upload {
    width: 100%;
  }

  ::v-deep .el-upload-dragger {
    width: 100%;
  }
}

.el-upload__tip {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}

// 利润率提示
.profit-alert {
  margin-top: 15px;
}

// 危险操作确认对话框样式
::v-deep .dangerous-operation-confirm {
  .el-message-box__header {
    background: linear-gradient(135deg, #f56c6c, #ff8a80);
    color: white;
    border-radius: 4px 4px 0 0;

    .el-message-box__title {
      color: white;
      font-weight: bold;
    }
  }

  .el-message-box__content {
    padding: 20px 25px;
  }

  .el-message-box__btns {
    padding: 15px 25px 25px;

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

// 删除按钮加强视觉效果
// 删除按钮加强视觉效果
.delete-button-highlight {
  color: #f56c6c !important;
  border-color: #f56c6c !important;
  position: relative;
  overflow: visible;

  &:hover {
    background-color: #f56c6c !important;
    border-color: #f56c6c !important;
    color: white !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
    transition: all 0.3s ease;

    .delete-icon-highlight {
      animation: deleteIconPulse 0.6s ease-in-out;
      color: white !important;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3);
  }
}

// 删除图标高亮效果
.delete-icon-highlight {
  color: #f56c6c;
  margin-right: 4px;
  font-size: 14px;
  transition: all 0.3s ease;

  // 添加闪烁动画提醒危险操作
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: rgba(245, 108, 108, 0.2);
    border-radius: 50%;
    opacity: 0;
    animation: dangerWarning 2s infinite;
  }
}

// 危险操作闪烁警告动画
@keyframes dangerWarning {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}

// 删除图标脉冲动画
@keyframes deleteIconPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.el-button--danger {
  &:hover {
    background-color: #f78989;
    border-color: #f78989;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
    transition: all 0.2s ease;
  }
}

// 自动发布确认对话框样式
::v-deep .auto-publish-confirm {
  .el-message-box__header {
    background: linear-gradient(135deg, #409eff, #66b3ff);
    color: white;
    border-radius: 4px 4px 0 0;

    .el-message-box__title {
      color: white;
      font-weight: bold;
    }
  }

  .el-message-box__content {
    padding: 20px 25px;
  }

  .el-message-box__btns {
    padding: 15px 25px 25px;

    .el-button--primary {
      background-color: #409eff;
      border-color: #409eff;

      &:hover {
        background-color: #66b3ff;
        border-color: #66b3ff;
      }
    }
  }
}
</style>
