<template>
  <div class="data-processing-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="el-icon-s-operation" /> 数据处理中心
      </h2>
      <p class="page-description">提供全方位的数据清洗、转换、提取和生成功能</p>
    </div>

    <!-- 推荐功能 -->
    <div class="function-section">
      <div class="section-header">
        <i class="el-icon-star-on" /> 推荐功能
      </div>
      <el-row :gutter="20" class="function-modules">
        <!-- 一键清洗 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="module-card module-card-featured" shadow="hover" @click.native="openModule('cleanData')">
            <div class="module-icon" style="color: #67C23A">
              <i class="el-icon-magic-stick" />
            </div>
            <div class="module-title" style="color: #67C23A">一键清洗</div>
            <div class="module-desc">自动校验国码、去重、去除异常数据</div>
            <div class="module-badge">推荐</div>
          </el-card>
        </el-col>

        <!-- 号码生成 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="module-card module-card-new" shadow="hover" @click.native="openModule('generateNumbers')">
            <div class="module-icon" style="color: #E6A23C">
              <i class="el-icon-connection" />
            </div>
            <div class="module-title" style="color: #E6A23C">号码生成</div>
            <div class="module-desc">基于Google libphonenumber生成号码</div>
            <div class="module-badge module-badge-new">新功能</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据清洗功能 -->
    <div class="function-section">
      <div class="section-header">
        <i class="el-icon-brush" /> 数据清洗
      </div>
      <el-row :gutter="20" class="function-modules">
        <!-- 增加国码 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="module-card" shadow="hover" @click.native="openModule('addCode')">
            <div class="module-icon" style="color: #409EFF">
              <i class="el-icon-plus" />
            </div>
            <div class="module-title">增加国码</div>
            <div class="module-desc">批量为数据添加国家代码</div>
          </el-card>
        </el-col>

        <!-- 去除国码 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="module-card" shadow="hover" @click.native="openModule('removeCode')">
            <div class="module-icon" style="color: #409EFF">
              <i class="el-icon-remove-outline" />
            </div>
            <div class="module-title">去除国码</div>
            <div class="module-desc">批量去除数据中的国家代码</div>
          </el-card>
        </el-col>

        <!-- 数据去重 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="module-card" shadow="hover" @click.native="openModule('deduplicate')">
            <div class="module-icon" style="color: #409EFF">
              <i class="el-icon-files" />
            </div>
            <div class="module-title">数据去重</div>
            <div class="module-desc">智能去除重复数据</div>
          </el-card>
        </el-col>

        <!-- 数据对比 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="module-card" shadow="hover" @click.native="openModule('compare')">
            <div class="module-icon" style="color: #409EFF">
              <i class="el-icon-s-data" />
            </div>
            <div class="module-title">数据对比</div>
            <div class="module-desc">对比多个数据文件的差异</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据提取功能 -->
    <div class="function-section">
      <div class="section-header">
        <i class="el-icon-download" /> 数据提取
      </div>
      <el-row :gutter="20" class="function-modules">
        <!-- 按运营商提取 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="module-card" shadow="hover" @click.native="openModule('extractOperator')">
            <div class="module-icon" style="color: #909399">
              <i class="el-icon-share" />
            </div>
            <div class="module-title">按运营商提取</div>
            <div class="module-desc">根据运营商筛选数据</div>
          </el-card>
        </el-col>

        <!-- 按条数提取 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="module-card" shadow="hover" @click.native="openModule('extractCount')">
            <div class="module-icon" style="color: #909399">
              <i class="el-icon-document-copy" />
            </div>
            <div class="module-title">按条数提取</div>
            <div class="module-desc">按指定条数提取数据</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据文件管理 -->
    <el-card class="file-manager-card">
      <div slot="header" class="clearfix">
        <span class="card-title"><i class="el-icon-folder-opened" /> 数据文件管理</span>
        <el-button style="float: right" type="primary" size="small" @click="showUploadDialog">
          <i class="el-icon-upload" /> 上传文件
        </el-button>
        <el-button style="float: right; margin-right: 10px" type="text" @click="fetchFileList">
          <i class="el-icon-refresh" /> 刷新
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="fileList"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="original_filename" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column label="上传用户" width="120" align="center">
          <template slot-scope="{row}">
            <span>{{ row.customer_name || row.customer_account || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="120" align="center">
          <template slot-scope="{row}">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column label="数据行数" width="120" align="center">
          <template slot-scope="{row}">
            {{ formatNumber(row.line_count) }}
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="160" align="center">
          <template slot-scope="{row}">
            {{ formatTime(row.upload_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="{row}">
            <el-button
              type="text"
              size="small"
              icon="el-icon-view"
              @click="handlePreview(row)"
            >
              预览
            </el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="selectedFiles.length > 0" class="batch-actions">
        <el-alert
          :title="`已选择 ${selectedFiles.length} 个文件`"
          type="info"
          :closable="false"
        />
      </div>
    </el-card>

    <!-- 文件上传对话框 -->
    <el-dialog title="上传数据文件" :visible.sync="uploadDialogVisible" width="600px" @close="handleUploadDialogClose">
      <el-upload
        ref="upload"
        class="upload-demo"
        drag
        :action="uploadAction"
        :headers="uploadHeaders"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :file-list="uploadFileList"
        multiple
        accept=".txt"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          支持同时上传多个 TXT 文件，单个文件不超过100MB<br>
          <span style="color: #E6A23C">✔ 上传时自动去除重复数据</span><br>
          <span style="color: #E6A23C">✔ 自动检验数据国码是否与基本信息一致</span>
        </div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 数据预览对话框 -->
    <el-dialog title="数据预览" :visible.sync="previewDialogVisible" width="800px">
      <el-alert
        v-if="previewData.duplicateCount > 0"
        :title="`已自动去除 ${formatNumber(previewData.duplicateCount)} 条重复数据`"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 15px"
      />

      <el-alert
        v-if="previewData.codeDetection && previewData.codeDetection.hasCode"
        :title="`检测到国码：${previewData.codeDetection.countryCode} (置信度：${(previewData.codeDetection.confidence * 100).toFixed(1)}%)`"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 15px"
      />

      <div class="preview-info">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">文件名：</span>
              <span class="info-value">{{ previewData.filename }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <el-tag type="success">原始：{{ formatNumber(previewData.originalCount) }} 条</el-tag>
            <el-tag type="primary" style="margin-left: 10px">最终：{{ formatNumber(previewData.finalCount) }} 条</el-tag>
          </el-col>
          <el-col :span="8">
            <el-tag v-if="previewData.duplicateCount > 0" type="warning">
              去重：{{ formatNumber(previewData.duplicateCount) }} 条
            </el-tag>
          </el-col>
        </el-row>
      </div>

      <el-divider content-position="left">前20条数据预览</el-divider>

      <div class="preview-content">
        <el-table
          :data="previewData.preview"
          border
          stripe
          max-height="400"
        >
          <el-table-column type="index" label="#" width="60" align="center" />
          <el-table-column label="数据" min-width="200">
            <template slot-scope="{row}">
              <code>{{ row }}</code>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="previewDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 去除国码对话框 -->
    <el-dialog title="去除国码" :visible.sync="dialogRemoveCode" width="700px">
      <el-form :model="removeCodeForm" label-width="120px">
        <el-form-item label="处理文件">
          <el-select v-model="removeCodeForm.fileIds" multiple placeholder="请选择要处理的文件" style="width: 100%">
            <el-option
              v-for="file in fileList"
              :key="file.id"
              :label="`${file.original_filename} (${formatNumber(file.line_count)}行)`"
              :value="file.id"
            />
          </el-select>
          <div style="margin-top: 10px; color: #909399; font-size: 12px">
            已选择 {{ removeCodeForm.fileIds.length }} 个文件
          </div>
        </el-form-item>
        <el-form-item label="指定国码">
          <el-input v-model="removeCodeForm.countryCode" placeholder="留空则去除所有国码，例如：+86" />
        </el-form-item>
        <el-form-item label="处理方式">
          <el-radio-group v-model="removeCodeForm.processMode">
            <el-radio label="immediate">立即处理</el-radio>
            <el-radio label="background">移至后台队列</el-radio>
          </el-radio-group>
          <div v-if="removeCodeForm.processMode === 'background'" style="margin-top: 5px; color: #E6A23C; font-size: 12px">
            <i class="el-icon-info" /> 任务将在后台队列中处理,可在"处理任务"页面查看进度
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogRemoveCode = false">取消</el-button>
        <el-button type="primary" :loading="processing" @click="confirmRemoveCode">开始处理</el-button>
      </span>
    </el-dialog>

    <!-- 数据去重对话框 -->
    <el-dialog title="数据去重" :visible.sync="dialogDeduplicate" width="700px">
      <el-form :model="deduplicateForm" label-width="120px">
        <el-form-item label="处理文件">
          <el-select v-model="deduplicateForm.fileIds" multiple placeholder="请选择要去重的文件" style="width: 100%">
            <el-option
              v-for="file in fileList"
              :key="file.id"
              :label="`${file.original_filename} (${formatNumber(file.line_count)}行)`"
              :value="file.id"
            />
          </el-select>
          <div style="margin-top: 10px; color: #909399; font-size: 12px">
            已选择 {{ deduplicateForm.fileIds.length }} 个文件
          </div>
        </el-form-item>
        <el-form-item label="处理方式">
          <el-radio-group v-model="deduplicateForm.processMode">
            <el-radio label="immediate">立即处理</el-radio>
            <el-radio label="background">移至后台队列</el-radio>
          </el-radio-group>
          <div v-if="deduplicateForm.processMode === 'background'" style="margin-top: 5px; color: #E6A23C; font-size: 12px">
            <i class="el-icon-info" /> 任务将在后台队列中处理,可在"处理任务"页面查看进度
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDeduplicate = false">取消</el-button>
        <el-button type="primary" :loading="processing" @click="confirmDeduplicate">开始去重</el-button>
      </span>
    </el-dialog>

    <!-- 数据对比对话框 -->
    <el-dialog title="数据对比" :visible.sync="dialogCompare" width="700px">
      <el-form :model="compareForm" label-width="120px">
        <el-form-item label="主文件">
          <el-select v-model="compareForm.file1Id" placeholder="请选择主文件" style="width: 100%">
            <el-option
              v-for="file in fileList"
              :key="file.id"
              :label="`${file.original_filename} (${formatNumber(file.line_count)}行)`"
              :value="file.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="对比文件">
          <el-select v-model="compareForm.file2Id" placeholder="请选择对比文件" style="width: 100%">
            <el-option
              v-for="file in fileList.filter(f => f.id !== compareForm.file1Id)"
              :key="file.id"
              :label="`${file.original_filename} (${formatNumber(file.line_count)}行)`"
              :value="file.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="对比模式">
          <el-radio-group v-model="compareForm.mode">
            <el-radio label="diff">差异（文件1独有）</el-radio>
            <el-radio label="common">共有数据</el-radio>
            <el-radio label="unique">各自独有</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCompare = false">取消</el-button>
        <el-button type="primary" :loading="processing" @click="confirmCompare">开始对比</el-button>
      </span>
    </el-dialog>

    <!-- 按运营商提取对话框 -->
    <el-dialog title="按运营商提取" :visible.sync="dialogExtractOperator" width="800px">
      <el-form :model="extractOperatorForm" label-width="120px">
        <el-form-item label="处理文件">
          <el-select
            v-model="extractOperatorForm.fileId"
            placeholder="请选择要处理的文件"
            style="width: 100%"
            @change="handleFileChange"
          >
            <el-option
              v-for="file in fileList"
              :key="file.id"
              :label="`${file.original_filename} (${formatNumber(file.line_count)}行)`"
              :value="file.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="国家">
          <el-select
            v-model="extractOperatorForm.countryCode"
            placeholder="请选择国家"
            filterable
            @change="handleCountryChange"
          >
            <el-option
              v-for="country in countryList"
              :key="country.code"
              :label="`${country.name} (${country.dialCode})`"
              :value="country.code"
            >
              <span style="float: left">{{ country.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ country.dialCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-divider content-position="left">运营商选择与提取条数</el-divider>

        <el-alert
          v-if="extractOperatorForm.analyzing"
          title="正在分析文件中的运营商分布..."
          type="info"
          :closable="false"
          show-icon
        />

        <el-form-item v-if="!extractOperatorForm.analyzing && operatorList.length > 0" label="选择运营商">
          <div style="margin-bottom: 15px">
            <el-checkbox-group v-model="extractOperatorForm.selectedOperators" @change="handleOperatorSelection">
              <el-checkbox
                v-for="operator in operatorList"
                :key="operator.name"
                :label="operator.name"
                style="display: block; margin-bottom: 10px"
              >
                {{ operator.name }} (数量: {{ formatNumber(operator.count) }}, 占比: {{ operator.percentage }}%)
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-alert
          v-if="!extractOperatorForm.analyzing && operatorList.length === 0 && extractOperatorForm.countryCode"
          type="warning"
          :closable="false"
        >
          <template slot="title">
            <div v-if="extractOperatorForm.countryCode === 'US'" style="line-height: 1.8;">
              <strong>美国号码运营商识别说明</strong><br>
              <div style="margin-top: 8px; font-weight: normal; font-size: 13px;">
                ⚠️ 原因：美国所有运营商共享相同的区号池，系统将按区号进行模拟分组<br>
                ✓ 如果文件中未检测到数据，请检查号码格式：1 + 区号(3位) + 号码(7位)<br>
                <strong>建议：</strong>使用“按条数提取”功能进行数据提取，更加准确
              </div>
            </div>
            <div v-else>
              文件中未检测到该国家的运营商数据，请选择其他国家或文件
            </div>
          </template>
        </el-alert>

        <el-form-item v-if="extractOperatorForm.selectedOperators.length > 0" label="提取条数设置">
          <div
            v-for="opName in extractOperatorForm.selectedOperators"
            :key="opName"
            style="margin-bottom: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px"
          >
            <div v-if="extractOperatorForm.operatorLimits[opName]" style="display: flex; align-items: center; justify-content: space-between">
              <span style="font-weight: 600; color: #303133">{{ opName }}</span>
              <div style="display: flex; align-items: center">
                <el-switch
                  v-model="extractOperatorForm.operatorLimits[opName].enabled"
                  active-text="限制条数"
                  inactive-text="全部提取"
                  style="margin-right: 15px"
                />
                <el-input-number
                  v-if="extractOperatorForm.operatorLimits[opName].enabled"
                  v-model="extractOperatorForm.operatorLimits[opName].limit"
                  :min="1"
                  :max="1000000"
                  :step="1000"
                  placeholder="提取条数"
                  style="width: 180px"
                />
              </div>
            </div>
          </div>
          <div style="margin-top: 10px; color: #909399; font-size: 12px">
            💡 提示：开启"限制条数"后，将仅提取指定数量的数据；关闭则提取该运营商的全部数据
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogExtractOperator = false">取消</el-button>
        <el-button type="primary" :loading="processing" @click="confirmExtractOperator">开始提取</el-button>
      </span>
    </el-dialog>

    <!-- 按条数提取对话框 -->
    <el-dialog title="按条数提取" :visible.sync="dialogExtractCount" width="700px">
      <el-form :model="extractCountForm" label-width="120px">
        <el-form-item label="处理文件">
          <el-select v-model="extractCountForm.fileIds" multiple placeholder="请选择要处理的文件" style="width: 100%">
            <el-option
              v-for="file in fileList"
              :key="file.id"
              :label="`${file.original_filename} (${formatNumber(file.line_count)}行)`"
              :value="file.id"
            />
          </el-select>
          <div style="margin-top: 10px; color: #909399; font-size: 12px">
            已选择 {{ extractCountForm.fileIds.length }} 个文件
          </div>
        </el-form-item>
        <el-form-item label="起始位置">
          <el-input-number v-model="extractCountForm.startFrom" :min="0" />
        </el-form-item>
        <el-form-item label="提取条数">
          <el-input-number v-model="extractCountForm.count" :min="1" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogExtractCount = false">取消</el-button>
        <el-button type="primary" :loading="processing" @click="confirmExtractCount">开始提取</el-button>
      </span>
    </el-dialog>

    <!-- 增加国码对话框 -->
    <el-dialog title="增加国码" :visible.sync="dialogAddCode" width="700px">
      <el-form :model="addCodeForm" label-width="120px">
        <el-form-item label="处理文件">
          <el-select v-model="addCodeForm.fileIds" multiple placeholder="请选择要处理的文件" style="width: 100%">
            <el-option
              v-for="file in fileList"
              :key="file.id"
              :label="`${file.original_filename} (${formatNumber(file.line_count)}行)`"
              :value="file.id"
            />
          </el-select>
          <div style="margin-top: 10px; color: #909399; font-size: 12px">
            已选择 {{ addCodeForm.fileIds.length }} 个文件
          </div>
        </el-form-item>
        <el-form-item label="选择国家">
          <el-select
            v-model="addCodeForm.countryCode"
            placeholder="请选择国家"
            filterable
            style="width: 100%"
            @change="handleAddCodeCountryChange"
          >
            <el-option-group label="热门国家">
              <el-option
                v-for="country in hotCountries"
                :key="country.code"
                :label="`${country.name} (${country.dialCode})`"
                :value="country.dialCode"
              >
                <span style="float: left">{{ country.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ country.dialCode }}</span>
              </el-option>
            </el-option-group>
            <el-option-group label="全部国家">
              <el-option
                v-for="country in countryList"
                :key="country.code"
                :label="`${country.name} (${country.dialCode})`"
                :value="country.dialCode"
              >
                <span style="float: left">{{ country.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ country.dialCode }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>

        <!-- 共用国码选择器（如 +1） -->
        <el-form-item v-if="showAddCodeCountrySelector" label="具体国家">
          <el-select v-model="addCodeForm.specificCountry" placeholder="请选择具体国家" style="width: 100%">
            <el-option
              v-for="country in addCodeCountryOptions"
              :key="country.code"
              :label="country.name"
              :value="country.code"
            >
              <span>{{ country.name }} ({{ country.nameEn }})</span>
            </el-option>
          </el-select>
          <div style="margin-top: 5px; color: #909399; font-size: 12px">
            {{ addCodeForm.countryCode }} 有多个国家共用，请选择具体国家
          </div>
        </el-form-item>

        <el-form-item label="国码">
          <el-input v-model="addCodeForm.countryCodePrefix" placeholder="例如：+86" disabled>
            <template slot="prepend">选中国家的国码</template>
          </el-input>
          <div style="margin-top: 5px; color: #909399; font-size: 12px">
            国码将添加到每行数据的开头
          </div>
        </el-form-item>
        <el-form-item label="处理方式">
          <el-radio-group v-model="addCodeForm.processMode">
            <el-radio label="immediate">立即处理</el-radio>
            <el-radio label="background">移至后台队列</el-radio>
          </el-radio-group>
          <div v-if="addCodeForm.processMode === 'background'" style="margin-top: 5px; color: #E6A23C; font-size: 12px">
            <i class="el-icon-info" /> 任务将在后台队列中处理,可在"处理任务"页面查看进度
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAddCode = false">取消</el-button>
        <el-button type="primary" :loading="processing" @click="confirmAddCode">开始处理</el-button>
      </span>
    </el-dialog>

    <!-- 一键清洗对话框 -->
    <el-dialog title="一键清洗数据" :visible.sync="dialogCleanData" width="800px">
      <el-alert
        title="一键清洗将执行以下操作："
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <div slot="default">
          <p style="margin: 5px 0">✔ <strong>步骤1：去除异常数据</strong>：去除小于7位或大于15位、包含非数字、超8位相同数字的数据</p>
          <p style="margin: 5px 0">✔ <strong>步骤2：去除重复数据</strong>：去除数据中的相同号码</p>
          <p style="margin: 5px 0">✔ <strong>步骤3：智能校验国码</strong>：根据选择的国家，检查数据前1-3位是否已包含该国码，有则保留，无则添加</p>
        </div>
      </el-alert>

      <el-form :model="cleanDataForm" label-width="120px">
        <el-form-item label="处理文件">
          <el-select v-model="cleanDataForm.fileIds" multiple placeholder="请选择要清洗的文件" style="width: 100%">
            <el-option
              v-for="file in fileList"
              :key="file.id"
              :label="`${file.original_filename} (${formatNumber(file.line_count)}行)`"
              :value="file.id"
            />
          </el-select>
          <div style="margin-top: 10px; color: #909399; font-size: 12px">
            已选择 {{ cleanDataForm.fileIds.length }} 个文件
          </div>
        </el-form-item>

        <el-form-item label="选择国家">
          <el-select
            v-model="cleanDataForm.countryCode"
            placeholder="请选择国家"
            filterable
            clearable
            style="width: 100%"
            @change="handleCleanDataCountryChange"
          >
            <el-option-group label="热门国家">
              <el-option
                v-for="country in hotCountries"
                :key="country.code"
                :label="`${country.name} (${country.dialCode})`"
                :value="country.dialCode"
              >
                <span style="float: left">{{ country.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ country.dialCode }}</span>
              </el-option>
            </el-option-group>
            <el-option-group label="全部国家">
              <el-option
                v-for="country in countryList"
                :key="country.code"
                :label="`${country.name} (${country.dialCode})`"
                :value="country.dialCode"
              >
                <span style="float: left">{{ country.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ country.dialCode }}</span>
              </el-option>
            </el-option-group>
          </el-select>
          <div style="margin-top: 5px; color: #909399; font-size: 12px">
            智能校验：检查数据前1-3位是否为选择的国码（如美国检1，墨西哥检52，阿联酋检测971），有则保留，无则添加
          </div>
        </el-form-item>

        <!-- 共用国码选择器（如 +1） -->
        <el-form-item v-if="showCleanDataCountrySelector" label="具体国家">
          <el-select v-model="cleanDataForm.specificCountry" placeholder="请选择具体国家" style="width: 100%">
            <el-option
              v-for="country in cleanDataCountryOptions"
              :key="country.code"
              :label="country.name"
              :value="country.code"
            >
              <span>{{ country.name }} ({{ country.nameEn }})</span>
            </el-option>
          </el-select>
          <div style="margin-top: 5px; color: #909399; font-size: 12px">
            {{ cleanDataForm.countryCode }} 有多个国家共用，请选择具体国家
          </div>
        </el-form-item>

        <el-form-item label="清洗选项">
          <el-checkbox-group v-model="cleanDataForm.options">
            <el-checkbox label="autoAddCode">智能校验国码</el-checkbox>
            <el-checkbox label="autoDeduplicate">自动去重</el-checkbox>
            <el-checkbox label="removeInvalid">去除异常数据</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCleanData = false">取消</el-button>
        <el-button type="success" :loading="processing" @click="confirmCleanData">
          <i class="el-icon-magic-stick" /> 开始清洗
        </el-button>
      </span>
    </el-dialog>

    <!-- 清洗结果对话框 -->
    <el-dialog title="数据清洗结果" :visible.sync="cleanResultDialogVisible" width="900px">
      <el-alert
        title="数据清洗完成！"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      />

      <div class="clean-result-summary">
        <el-row :gutter="20">
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-label">原始数据</div>
              <div class="stat-value">{{ formatNumber(cleanResult.originalCount) }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-label">最终数据</div>
              <div class="stat-value" style="color: #67C23A">{{ formatNumber(cleanResult.finalCount) }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-label">去除异常</div>
              <div class="stat-value" style="color: #E6A23C">{{ formatNumber(cleanResult.invalidCount) }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-label">去除重复</div>
              <div class="stat-value" style="color: #F56C6C">{{ formatNumber(cleanResult.duplicateCount) }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-label">添加国码</div>
              <div class="stat-value" style="color: #409EFF">{{ formatNumber(cleanResult.addedCodeCount) }}</div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-label">已有国码</div>
              <div class="stat-value" style="color: #909399">{{ formatNumber(cleanResult.skippedCount) }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-divider content-position="left">处理步骤</el-divider>

      <el-timeline>
        <el-timeline-item
          v-for="(step, index) in cleanResult.steps"
          :key="index"
          :timestamp="step.step"
          placement="top"
          :type="index === cleanResult.steps.length - 1 ? 'success' : 'primary'"
        >
          <el-card>
            <p v-if="step.removed">去除：<strong>{{ formatNumber(step.removed) }}</strong> 条</p>
            <p v-if="step.added">添加国码：<strong>{{ formatNumber(step.added) }}</strong> 条</p>
            <p v-if="step.skipped">已有国码：<strong>{{ formatNumber(step.skipped) }}</strong> 条</p>
            <p v-if="step.remaining">剩余：<strong>{{ formatNumber(step.remaining) }}</strong> 条</p>
            <p v-if="step.countryCode">国码：<strong>{{ step.countryCode }}</strong></p>
            <p v-if="step.description" style="color: #909399; font-size: 12px; margin-top: 5px;">{{ step.description }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-divider content-position="left">详细预览</el-divider>

      <el-tabs type="border-card">
        <!-- 最终数据预览 -->
        <el-tab-pane label="最终数据（前20条）">
          <el-table :data="cleanResult.preview" border stripe max-height="400">
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column label="数据" min-width="200">
              <template slot-scope="{row}">
                <code>{{ row }}</code>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 异常数据预览 -->
        <el-tab-pane :label="`异常数据（前20条，共${formatNumber(cleanResult.invalidCount)}条）`">
          <el-alert
            v-if="!cleanResult.invalidDataPreview || cleanResult.invalidDataPreview.length === 0"
            title="没有异常数据"
            type="success"
            :closable="false"
            show-icon
          />
          <el-table v-else :data="cleanResult.invalidDataPreview" border stripe max-height="400">
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column label="异常数据" min-width="200">
              <template slot-scope="{row}">
                <code>{{ row.data }}</code>
              </template>
            </el-table-column>
            <el-table-column label="数据长度" width="100" align="center">
              <template slot-scope="{row}">
                {{ row.length }}
              </template>
            </el-table-column>
            <el-table-column label="过滤原因" width="200">
              <template slot-scope="{row}">
                <el-tag :type="row.reason.includes('过短') ? 'warning' : row.reason.includes('过长') ? 'danger' : 'info'" size="small">
                  {{ row.reason }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 重复数据预览 -->
        <el-tab-pane :label="`重复数据（前20条，共${formatNumber(cleanResult.duplicateCount)}条）`">
          <el-alert
            v-if="!cleanResult.duplicateDataPreview || cleanResult.duplicateDataPreview.length === 0"
            title="没有重复数据"
            type="success"
            :closable="false"
            show-icon
          />
          <el-table v-else :data="cleanResult.duplicateDataPreview" border stripe max-height="400">
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column label="重复数据" min-width="200">
              <template slot-scope="{row}">
                <code>{{ row.data }}</code>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 国码异常数据预览 -->
        <el-tab-pane :label="`国码异常（前20条，共${formatNumber(cleanResult.addedCodeCount)}条）`">
          <el-alert
            v-if="!cleanResult.addedCodePreview || cleanResult.addedCodePreview.length === 0"
            title="没有国码异常数据"
            type="success"
            :closable="false"
            show-icon
          />
          <el-table v-else :data="cleanResult.addedCodePreview" border stripe max-height="400">
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column label="原始数据" width="200">
              <template slot-scope="{row}">
                <code style="color: #909399;">{{ row.original }}</code>
              </template>
            </el-table-column>
            <el-table-column label="修正后" width="200">
              <template slot-scope="{row}">
                <code :style="row.status === '已修正' ? 'color: #67C23A; font-weight: bold;' : 'color: #E6A23C;'">{{ row.result }}</code>
              </template>
            </el-table-column>
            <el-table-column label="异常原因" width="150" align="center">
              <template slot-scope="{row}">
                <el-tag :type="row.reason === '缺少国码' ? 'warning' : 'danger'" size="small">
                  {{ row.reason }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="处理状态" width="120" align="center">
              <template slot-scope="{row}">
                <el-tag :type="row.status === '已修正' ? 'success' : 'info'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cleanResultDialogVisible = false">关闭</el-button>
        <el-button type="success" @click="downloadCleanedFiles">
          <i class="el-icon-download" /> 下载所有文件
        </el-button>
      </span>
    </el-dialog>

    <!-- 号码生成对话框 -->
    <el-dialog title="号码生成" :visible.sync="dialogGenerateNumbers" width="900px">
      <el-alert
        title="基于 Google libphonenumber 库生成符合国际标准的手机号码"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <div slot="default">
          <p style="margin: 5px 0">✔ 支持全球所有国家</p>
          <p style="margin: 5px 0">✔ 按运营商号段生成</p>
          <p style="margin: 5px 0">✔ 自动验证号码有效性</p>
        </div>
      </el-alert>

      <el-form :model="generateNumbersForm" label-width="120px">
        <el-form-item label="选择国家">
          <el-select
            v-model="generateNumbersForm.countryCode"
            placeholder="请选择国家"
            filterable
            style="width: 100%"
            @change="handleGenerateCountryChange"
          >
            <el-option-group label="热门国家">
              <el-option
                v-for="country in hotCountries"
                :key="country.code"
                :label="`${country.name} (${country.dialCode})`"
                :value="country.code"
              >
                <span style="float: left">{{ country.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ country.dialCode }}</span>
              </el-option>
            </el-option-group>
            <el-option-group label="全部国家">
              <el-option
                v-for="country in countryList"
                :key="country.code"
                :label="`${country.name} (${country.dialCode})`"
                :value="country.code"
              >
                <span style="float: left">{{ country.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ country.dialCode }}</span>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item v-if="generateNumbersForm.countryCode" label="国家信息">
          <div style="padding: 12px; background: #f5f7fa; border-radius: 4px; border: 1px solid #e4e7ed">
            <el-row :gutter="20">
              <el-col :span="8">
                <div style="margin-bottom: 8px">
                  <span style="color: #909399; font-size: 12px">国码：</span>
                  <strong>{{ generateNumbersForm.countryInfo.countryCode || '-' }}</strong>
                </div>
              </el-col>
              <el-col :span="8">
                <div style="margin-bottom: 8px">
                  <span style="color: #909399; font-size: 12px">号码长度：</span>
                  <strong>{{ generateNumbersForm.countryInfo.phoneLength || '-' }} 位</strong>
                </div>
              </el-col>
              <el-col :span="8">
                <div style="margin-bottom: 8px">
                  <span style="color: #909399; font-size: 12px">示例号码：</span>
                  <code style="color: #E6A23C">{{ generateNumbersForm.countryInfo.exampleNumber || '-' }}</code>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-form-item>

        <el-divider content-position="left">运营商选择与生成设置</el-divider>

        <el-alert
          v-if="generateNumbersForm.loadingOperators"
          title="正在加载运营商信息..."
          type="info"
          :closable="false"
          show-icon
        />

        <el-form-item v-if="!generateNumbersForm.loadingOperators && generateOperatorList.length > 0" label="选择运营商">
          <div style="margin-bottom: 15px">
            <el-checkbox-group v-model="generateNumbersForm.selectedOperators" @change="handleGenerateOperatorSelection">
              <el-checkbox
                v-for="operator in generateOperatorList"
                :key="operator.name"
                :label="operator.name"
                style="display: block; margin-bottom: 10px"
              >
                {{ operator.name }} (号段数: {{ operator.numberSegments.length }}, 市场份额: {{ operator.marketShare }}%)
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-alert
          v-if="!generateNumbersForm.loadingOperators && generateOperatorList.length === 0 && generateNumbersForm.countryCode"
          type="warning"
          :closable="false"
        >
          <template slot="title">
            <div style="line-height: 1.8;">
              该国家暂无运营商配置数据，请联系管理员添加
            </div>
          </template>
        </el-alert>

        <el-form-item v-if="generateNumbersForm.selectedOperators.length > 0" label="生成数量设置">
          <div
            v-for="opName in generateNumbersForm.selectedOperators"
            :key="opName"
            style="margin-bottom: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px"
          >
            <div style="display: flex; align-items: center; justify-content: space-between">
              <span style="font-weight: 600; color: #303133">{{ opName }}</span>
              <el-input-number
                v-if="generateNumbersForm.operatorCounts[opName]"
                v-model="generateNumbersForm.operatorCounts[opName]"
                :min="1"
                :max="1000000"
                :step="1000"
                placeholder="生成数量"
                style="width: 180px"
              />
            </div>
          </div>
          <div style="margin-top: 10px; color: #909399; font-size: 12px">
            💡 提示：设置每个运营商需要生成的号码数量
          </div>
        </el-form-item>

        <el-form-item label="高级选项">
          <el-checkbox v-model="generateNumbersForm.includeCountryCode">包含国码</el-checkbox>
          <div style="margin-top: 5px; color: #909399; font-size: 12px">
            选中后生成的号码包含国际区号（如 52xxxxxxxxxx），否则仅生成本地号码（如 xxxxxxxxxx）
          </div>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogGenerateNumbers = false">取消</el-button>
        <el-button type="warning" :loading="processing" @click="confirmGenerateNumbers">
          <i class="el-icon-connection" /> 开始生成
        </el-button>
      </span>
    </el-dialog>

    <!-- 号码生成结果对话框 -->
    <el-dialog title="号码生成结果" :visible.sync="generateResultDialogVisible" width="900px">
      <el-alert
        title="号码生成完成！"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      />

      <div class="clean-result-summary">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">国家</div>
              <div class="stat-value" style="color: #409EFF; font-size: 20px">{{ generateResult.regionCode }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">运营商数</div>
              <div class="stat-value" style="color: #67C23A">{{ generateResult.operatorCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">总生成数</div>
              <div class="stat-value" style="color: #E6A23C">{{ formatNumber(generateResult.totalCount) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-label">成功率</div>
              <div class="stat-value" style="color: #67C23A; font-size: 20px">100%</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-divider content-position="left">运营商生成结果</el-divider>

      <el-table :data="generateResult.operators" border stripe>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="operatorName" label="运营商" width="200" />
        <el-table-column label="生成数量" width="150" align="center">
          <template slot-scope="{row}">
            <el-tag type="success">{{ formatNumber(row.count) }} 条</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{row}">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="downloadFile(row.downloadPath)"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-divider content-position="left">数据预览（前20条）</el-divider>

      <el-table :data="generateResult.preview" border stripe max-height="400">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column label="生成的号码" min-width="200">
          <template slot-scope="{row}">
            <code style="color: #67C23A; font-weight: bold">{{ row }}</code>
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button @click="generateResultDialogVisible = false">关闭</el-button>
        <el-button type="success" icon="el-icon-download" @click="downloadFile(generateResult.mergedDownloadPath)">
          下载合并文件
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import request from '@/utils/request'
import { getOperatorsByCountry } from '@/data/operators'
import { countryList } from '@/data/countries'
import { createTask } from '@/api/dataProcessing'

export default {
  name: 'DataProcessing',
  data() {
    return {
      loading: false,
      processing: false,
      fileList: [],
      selectedFiles: [],

      // 上传配置
      uploadDialogVisible: false,
      uploadAction: process.env.VUE_APP_BASE_API + '/api/data-processing/upload',
      uploadHeaders: {
        Authorization: 'Bearer ' + getToken()
      },
      uploadFileList: [],

      // 对话框
      dialogDeduplicate: false,
      dialogRemoveCode: false,
      dialogAddCode: false,
      dialogCompare: false,
      dialogExtractOperator: false,
      dialogExtractCount: false,
      previewDialogVisible: false,
      dialogCleanData: false,
      cleanResultDialogVisible: false,
      dialogGenerateNumbers: false, // 号码生成对话框
      generateResultDialogVisible: false, // 生成结果对话框

      // 预览数据
      previewData: {
        filename: '',
        originalCount: 0,
        finalCount: 0,
        duplicateCount: 0,
        preview: [],
        codeDetection: null
      },

      // 表单
      deduplicateForm: {
        fileIds: [],
        processMode: 'immediate' // immediate | background
      },
      removeCodeForm: {
        fileIds: [],
        countryCode: '',
        processMode: 'immediate' // immediate | background
      },
      addCodeForm: {
        fileIds: [],
        countryCode: '',
        countryCodePrefix: '',
        specificCountry: '', // 共用国码时选择的具体国家代码
        processMode: 'immediate' // immediate | background
      },
      showAddCodeCountrySelector: false, // 是否显示共用国码的二级选择器
      addCodeCountryOptions: [], // 共用国码的国家选项列表
      compareForm: {
        file1Id: null,
        file2Id: null,
        mode: 'diff'
      },
      extractOperatorForm: {
        fileId: null,
        countryCode: '',
        selectedOperators: [], // 选中的运营商名称列表
        operatorLimits: {}, // 存储每个运营商的限制设置: { operatorName: { enabled: false, limit: 10000 } }
        analyzing: false // 是否正在分析
      },
      extractCountForm: {
        fileIds: [],
        startFrom: 0,
        count: 1000
      },
      cleanDataForm: {
        fileIds: [],
        countryCode: '',
        specificCountry: '', // 共用国码时选择的具体国家代码
        options: ['autoAddCode', 'autoDeduplicate', 'removeInvalid']
      },
      showCleanDataCountrySelector: false, // 是否显示共用国码的二级选择器
      cleanDataCountryOptions: [], // 共用国码的国家选项列表
      cleanResult: {
        originalCount: 0,
        finalCount: 0,
        invalidCount: 0,
        duplicateCount: 0,
        addedCodeCount: 0,
        skippedCount: 0, // 已有国码跳过的数量
        steps: [],
        preview: [],
        // 新增：详细预览数据
        invalidDataPreview: [], // X - 异常数据预览（步骤1过滤掉的）
        duplicateDataPreview: [], // Y - 重复数据预览（步骤2去除的）
        addedCodePreview: [], // Z - 国码异常数据预览（步骤3修正的）
        removedCodePreview: [] // 去除国码的数据预览（预留）
      },
      cleanedFiles: [],

      // 号码生成表单
      generateNumbersForm: {
        countryCode: '',
        selectedOperators: [],
        operatorCounts: {}, // { operatorName: count }
        includeCountryCode: true,
        countryInfo: {},
        loadingOperators: false
      },
      generateOperatorList: [], // 当前国家的运营商列表
      generateResult: {
        regionCode: '',
        totalCount: 0,
        operatorCount: 0,
        operators: [],
        mergedDownloadPath: '',
        preview: []
      },

      // 数据
      countryList: [],
      operatorList: [],
      hotCountries: [
        { dialCode: '+86', name: '中国', code: 'CN' },
        { dialCode: '+1', name: '美国', code: 'US' },
        { dialCode: '+44', name: '英国', code: 'GB' },
        { dialCode: '+81', name: '日本', code: 'JP' },
        { dialCode: '+82', name: '韩国', code: 'KR' },
        { dialCode: '+65', name: '新加坡', code: 'SG' },
        { dialCode: '+60', name: '马来西亚', code: 'MY' },
        { dialCode: '+66', name: '泰国', code: 'TH' },
        { dialCode: '+84', name: '越南', code: 'VN' },
        { dialCode: '+62', name: '印度尼西亚', code: 'ID' },
        { dialCode: '+63', name: '菲律宾', code: 'PH' },
        { dialCode: '+91', name: '印度', code: 'IN' },
        { dialCode: '+7', name: '俄罗斯', code: 'RU' },
        { dialCode: '+61', name: '澳大利亚', code: 'AU' },
        { dialCode: '+64', name: '新西兰', code: 'NZ' },
        { dialCode: '+49', name: '德国', code: 'DE' },
        { dialCode: '+52', name: '墨西哥', code: 'MX' }
      ]
    }
  },
  watch: {
    // 监听国家选择，自动填充国码（国际电话区号）
    'addCodeForm.countryCode'(newVal) {
      if (newVal) {
        // newVal 现在是 dialCode（如 +52），直接使用
        this.addCodeForm.countryCodePrefix = newVal
      } else {
        this.addCodeForm.countryCodePrefix = ''
      }
    }
  },
  created() {
    this.fetchFileList()
    this.countryList = countryList
  },
  methods: {
    // 获取国家运营商数据（包含sharedSegments标记）
    getCountryOperatorData(countryCode) {
      const { operatorData } = require('@/data/operators')
      return operatorData[countryCode] || null
    },

    // 获取国家名称
    getCountryName(countryCode) {
      const country = this.countryList.find(c => c.code === countryCode)
      return country ? country.name : countryCode
    },

    // 打开功能模块
    openModule(moduleName) {
      switch (moduleName) {
        case 'cleanData':
          this.cleanDataForm.fileIds = this.selectedFiles.map(f => f.id)
          this.cleanDataForm.countryCode = ''
          this.cleanDataForm.options = ['autoAddCode', 'autoDeduplicate', 'removeInvalid']
          this.dialogCleanData = true
          break
        case 'removeCode':
          this.removeCodeForm.fileIds = this.selectedFiles.map(f => f.id)
          this.removeCodeForm.countryCode = ''
          this.dialogRemoveCode = true
          break
        case 'deduplicate':
          this.deduplicateForm.fileIds = this.selectedFiles.map(f => f.id)
          this.dialogDeduplicate = true
          break
        case 'addCode':
          this.addCodeForm.fileIds = this.selectedFiles.map(f => f.id)
          this.addCodeForm.countryCode = ''
          this.addCodeForm.countryCodePrefix = ''
          this.dialogAddCode = true
          break
        case 'compare':
          this.compareForm.file1Id = null
          this.compareForm.file2Id = null
          this.compareForm.mode = 'diff'
          this.dialogCompare = true
          break
        case 'extractOperator':
          this.extractOperatorForm.fileId = this.selectedFiles.length > 0 ? this.selectedFiles[0].id : null
          this.extractOperatorForm.countryCode = ''
          this.extractOperatorForm.selectedOperators = []
          this.extractOperatorForm.operatorLimits = {}
          this.operatorList = []
          this.dialogExtractOperator = true
          break
        case 'extractCount':
          this.extractCountForm.fileIds = this.selectedFiles.map(f => f.id)
          this.extractCountForm.startFrom = 0
          this.extractCountForm.count = 1000
          this.dialogExtractCount = true
          break
        case 'generateNumbers':
          // 打开号码生成对话框
          this.generateNumbersForm.countryCode = ''
          this.generateNumbersForm.selectedOperators = []
          this.generateNumbersForm.operatorCounts = {}
          this.generateNumbersForm.includeCountryCode = true
          this.generateNumbersForm.countryInfo = {}
          this.generateOperatorList = []
          this.dialogGenerateNumbers = true
          break
      }
    },

    // 文件选择变化
    handleSelectionChange(selection) {
      this.selectedFiles = selection
    },

    // 显示上传对话框
    showUploadDialog() {
      this.uploadDialogVisible = true
      this.uploadFileList = []
    },

    async fetchFileList() {
      this.loading = true
      try {
        const response = await request({
          url: '/api/data-processing/files',
          method: 'get'
        })
        this.fileList = response.data
      } catch (error) {
        this.$message.error('获取文件列表失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    beforeUpload(file) {
      const isValidSize = file.size / 1024 / 1024 < 100
      if (!isValidSize) {
        this.$message.error('文件大小不能超过 100MB!')
        return false
      }
      const isTxt = file.name.toLowerCase().endsWith('.txt')
      if (!isTxt) {
        this.$message.error('只能上传 TXT 格式文件!')
        return false
      }
      return true
    },

    handleUploadSuccess(response) {
      if (response.success) {
        // 显示成功消息
        this.$message.success(response.message)

        // 如果有过滤的异常数据，显示详细信息
        if (response.data.invalidCount > 0) {
          this.$notify({
            title: '上传完成',
            message: `原始数据：${this.formatNumber(response.data.originalCount)}条<br>有效数据：${this.formatNumber(response.data.lineCount)}条<br>过滤异常：${this.formatNumber(response.data.invalidCount)}条`,
            type: 'success',
            dangerouslyUseHTMLString: true,
            duration: 5000
          })
        }

        // 延迟刷新文件列表，确保数据已保存
        setTimeout(() => {
          this.fetchFileList()
        }, 500)
      } else {
        this.$message.error('上传失败: ' + response.message)
      }
    },

    handleUploadError(error) {
      this.$message.error('上传失败: ' + error.message)
    },

    // 上传对话框关闭时刷新列表
    handleUploadDialogClose() {
      // 关闭对话框时刷新文件列表，确保显示最新数据
      this.fetchFileList()
      // 清空上传列表
      this.uploadFileList = []
    },

    // 预览文件数据
    async handlePreview(file) {
      this.loading = true
      try {
        const response = await request({
          url: `/api/data-processing/file/${file.id}/preview`,
          method: 'get'
        })

        // 设置预览数据
        this.previewData = {
          filename: response.data.filename,
          originalCount: response.data.lineCount,
          finalCount: response.data.lineCount,
          duplicateCount: 0,
          preview: response.data.preview,
          codeDetection: response.data.codeDetection
        }

        this.previewDialogVisible = true
      } catch (error) {
        this.$message.error('获取预览数据失败: ' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },

    // 数据去重
    async confirmDeduplicate() {
      if (!this.deduplicateForm.fileIds || this.deduplicateForm.fileIds.length === 0) {
        this.$message.warning('请选择要处理的文件')
        return
      }

      this.processing = true
      try {
        // 后台队列模式
        if (this.deduplicateForm.processMode === 'background') {
          for (const fileId of this.deduplicateForm.fileIds) {
            const file = this.fileList.find(f => f.id === fileId)
            await createTask({
              taskType: 'deduplicate',
              taskName: `去重: ${file ? file.original_filename : fileId}`,
              params: { fileId }
            })
          }

          this.$message.success(`已创建 ${this.deduplicateForm.fileIds.length} 个后台任务，请在"处理任务"页面查看进度`)
          
          // 提示跳转
          this.$confirm('是否跳转到"处理任务"页面查看进度?', '提示', {
            confirmButtonText: '立即跳转',
            cancelButtonText: '稍后查看',
            type: 'info'
          }).then(() => {
            this.$router.push('/data/processing-tasks')
          }).catch(() => {})

          this.dialogDeduplicate = false
          this.deduplicateForm.fileIds = []
          return
        }

        // 立即处理模式
        const results = []
        for (const fileId of this.deduplicateForm.fileIds) {
          const response = await request({
            url: '/api/data-processing/deduplicate',
            method: 'post',
            data: { fileId }
          })
          results.push(response.data)
        }

        this.$message.success(`处理完成！共处理 ${results.length} 个文件`)

        // 下载所有结果
        results.forEach(result => {
          this.downloadFile(result.downloadPath)
        })

        this.dialogDeduplicate = false
        this.deduplicateForm.fileIds = []
      } catch (error) {
        this.$message.error('处理失败: ' + error.message)
      } finally {
        this.processing = false
      }
    },

    // 去除国码
    async confirmRemoveCode() {
      if (!this.removeCodeForm.fileIds || this.removeCodeForm.fileIds.length === 0) {
        this.$message.warning('请选择要处理的文件')
        return
      }

      this.processing = true
      try {
        // 后台队列模式
        if (this.removeCodeForm.processMode === 'background') {
          for (const fileId of this.removeCodeForm.fileIds) {
            const file = this.fileList.find(f => f.id === fileId)
            await createTask({
              taskType: 'remove_code',
              taskName: `去除国码: ${file ? file.original_filename : fileId}`,
              params: {
                fileId,
                countryCode: this.removeCodeForm.countryCode
              }
            })
          }

          this.$message.success(`已创建 ${this.removeCodeForm.fileIds.length} 个后台任务，请在"处理任务"页面查看进度`)
          
          this.$confirm('是否跳转到"处理任务"页面查看进度?', '提示', {
            confirmButtonText: '立即跳转',
            cancelButtonText: '稍后查看',
            type: 'info'
          }).then(() => {
            this.$router.push('/data/processing-tasks')
          }).catch(() => {})

          this.dialogRemoveCode = false
          this.removeCodeForm.fileIds = []
          this.removeCodeForm.countryCode = ''
          return
        }

        // 立即处理模式
        const results = []
        for (const fileId of this.removeCodeForm.fileIds) {
          const response = await request({
            url: '/api/data-processing/remove-country-code',
            method: 'post',
            data: {
              fileId,
              countryCode: this.removeCodeForm.countryCode
            }
          })
          results.push(response.data)
        }

        this.$message.success(`处理完成！共处理 ${results.length} 个文件`)

        // 下载所有结果
        results.forEach(result => {
          this.downloadFile(result.downloadPath)
        })

        this.dialogRemoveCode = false
        this.removeCodeForm.fileIds = []
        this.removeCodeForm.countryCode = ''
      } catch (error) {
        this.$message.error('处理失败: ' + error.message)
      } finally {
        this.processing = false
      }
    },

    // 增加国码
    async confirmAddCode() {
      if (!this.addCodeForm.fileIds || this.addCodeForm.fileIds.length === 0) {
        this.$message.warning('请选择要处理的文件')
        return
      }
      if (!this.addCodeForm.countryCode) {
        this.$message.warning('请选择国家')
        return
      }

      this.processing = true
      try {
        // 去掉国码中的 + 号，只保留数字
        const countryCodeNumber = this.addCodeForm.countryCode.replace(/^\+/, '')

        // 后台队列模式
        if (this.addCodeForm.processMode === 'background') {
          for (const fileId of this.addCodeForm.fileIds) {
            const file = this.fileList.find(f => f.id === fileId)
            await createTask({
              taskType: 'add_code',
              taskName: `增加国码: ${file ? file.original_filename : fileId}`,
              params: {
                fileId,
                countryCode: countryCodeNumber
              }
            })
          }

          this.$message.success(`已创建 ${this.addCodeForm.fileIds.length} 个后台任务，请在"处理任务"页面查看进度`)
          
          this.$confirm('是否跳转到"处理任务"页面查看进度?', '提示', {
            confirmButtonText: '立即跳转',
            cancelButtonText: '稍后查看',
            type: 'info'
          }).then(() => {
            this.$router.push('/data/processing-tasks')
          }).catch(() => {})

          this.dialogAddCode = false
          this.addCodeForm.fileIds = []
          this.addCodeForm.countryCode = ''
          this.addCodeForm.countryCodePrefix = ''
          return
        }

        // 立即处理模式
        const results = []
        for (const fileId of this.addCodeForm.fileIds) {
          const response = await request({
            url: '/api/data-processing/add-country-code',
            method: 'post',
            data: {
              fileId,
              countryCode: countryCodeNumber
            }
          })
          results.push(response.data)
        }

        this.$message.success(`处理完成！共处理 ${results.length} 个文件`)

        // 下载所有结果
        results.forEach(result => {
          this.downloadFile(result.downloadPath)
        })

        this.dialogAddCode = false
        this.addCodeForm.fileIds = []
        this.addCodeForm.countryCode = ''
        this.addCodeForm.countryCodePrefix = ''
      } catch (error) {
        this.$message.error('处理失败: ' + error.message)
      } finally {
        this.processing = false
      }
    },

    // 数据对比
    async confirmCompare() {
      if (!this.compareForm.file1Id || !this.compareForm.file2Id) {
        this.$message.warning('请选择两个文件进行对比')
        return
      }
      if (this.compareForm.file1Id === this.compareForm.file2Id) {
        this.$message.warning('请选择不同的文件')
        return
      }

      this.processing = true
      try {
        const response = await request({
          url: '/api/data-processing/compare',
          method: 'post',
          data: {
            file1Id: this.compareForm.file1Id,
            file2Id: this.compareForm.file2Id,
            mode: this.compareForm.mode
          }
        })
        this.$message.success(`对比完成！结果${response.data.resultCount}行`)
        this.downloadFile(response.data.downloadPath)
        this.dialogCompare = false
      } catch (error) {
        this.$message.error('对比失败: ' + error.message)
      } finally {
        this.processing = false
      }
    },

    handleCountryChange(countryCode) {
      // 清空之前的选择
      this.extractOperatorForm.selectedOperators = []
      this.extractOperatorForm.operatorLimits = {}
      this.operatorList = []

      if (!countryCode || !this.extractOperatorForm.fileId) {
        return
      }

      // 分析文件中的运营商分布
      this.analyzeOperatorDistribution()
    },

    // 处理文件选择变化
    handleFileChange(fileId) {
      // 清空之前的选择
      this.extractOperatorForm.selectedOperators = []
      this.extractOperatorForm.operatorLimits = {}
      this.operatorList = []

      if (!fileId || !this.extractOperatorForm.countryCode) {
        return
      }

      // 分析文件中的运营商分布
      this.analyzeOperatorDistribution()
    },

    // 分析文件的运营商分布
    async analyzeOperatorDistribution() {
      if (!this.extractOperatorForm.fileId || !this.extractOperatorForm.countryCode) {
        return
      }

      // 检查是否为共享号段的国家
      const countryData = this.getCountryOperatorData(this.extractOperatorForm.countryCode)
      if (countryData && countryData.sharedSegments) {
        this.$alert(
          `<div style="line-height: 1.8;">
            <strong>⚠️ 该国家运营商共享号段池</strong><br/>
            <div style="margin-top: 10px; font-size: 13px;">
              由于${this.getCountryName(this.extractOperatorForm.countryCode)}的所有运营商共享相同的号段池，<br/>
              系统将按市场份额进行模拟分组，<strong>不代表号码的真实运营商归属</strong>。<br/><br/>
              <strong style="color: #E6A23C;">强烈建议：</strong>使用"按条数提取"功能代替按运营商提取
            </div>
          </div>`,
          '运营商识别限制',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '继续使用模拟分组',
            cancelButtonText: '切换到按条数提取',
            showCancelButton: true,
            type: 'warning'
          }
        ).then(() => {
          // 用户选择继续，执行分析
          this.performOperatorAnalysis()
        }).catch(() => {
          // 用户选择切换功能
          this.dialogExtractOperator = false
          this.$nextTick(() => {
            this.openModule('extractCount')
          })
        })
        return
      }

      // 正常国家，直接分析
      this.performOperatorAnalysis()
    },

    // 执行运营商分析（从analyzeOperatorDistribution分离出来）
    async performOperatorAnalysis() {
      // 获取国家的所有运营商
      const allOperators = getOperatorsByCountry(this.extractOperatorForm.countryCode)
      if (allOperators.length === 0) {
        this.$message.warning('该国家暂无运营商数据')
        return
      }

      // 获取国码
      const country = this.countryList.find(c => c.code === this.extractOperatorForm.countryCode)
      const countryCode = country ? country.dialCode.replace(/^\+/, '') : null

      this.extractOperatorForm.analyzing = true
      try {
        const response = await request({
          url: '/api/data-processing/analyze-operator-distribution',
          method: 'post',
          data: {
            fileId: this.extractOperatorForm.fileId,
            countryCode: countryCode,
            operators: allOperators
          }
        })

        const { totalCount, distribution, unmatchedCount } = response.data

        // 根据实际分析结果设置运营商列表
        if (distribution.length === 0) {
          // 针对美国数据给出特殊提示
          if (this.extractOperatorForm.countryCode === 'US') {
            this.$message({
              type: 'warning',
              duration: 8000,
              dangerouslyUseHTMLString: true,
              message: '<div style="line-height: 1.6;">' +
                '<strong>文件中未检测到美国运营商数据</strong><br/>' +
                '可能的原因：<br/>' +
                '1. 号码格式不正确（美国号码格式：1+区号+7位号码，共11位）<br/>' +
                '2. 缺少区号（美国号码必须包含3位区号）<br/>' +
                '3. 区号不在配置范围内<br/><br/>' +
                '<strong>建议：</strong><br/>' +
                '• 使用"按条数提取"功能代替按运营商提取<br/>' +
                '• 确认号码格式为：1+区号(3位)+号码(7位)<br/>' +
                '• 检查文件数据预览确认格式正确性' +
                '</div>'
            })
          } else {
            this.$message.warning('文件中未检测到任何运营商数据，请检查文件内容和国家选择是否正确')
          }
          this.operatorList = []
          return
        }

        // 构建运营商列表，显示实际数量和百分比
        this.operatorList = distribution.map(d => {
          const percentage = ((d.count / totalCount) * 100).toFixed(1)
          return {
            name: d.name,
            numberSegments: d.numberSegments,
            count: d.count,
            percentage: percentage,
            displayText: `${d.name} (数量: ${this.formatNumber(d.count)}, 占比: ${percentage}%)`
          }
        })

        // 如果有未匹配的数据，也显示出来
        if (unmatchedCount > 0) {
          const percentage = ((unmatchedCount / totalCount) * 100).toFixed(1)
          const analysisMethod = response.data.analysisMethod || 'unknown'
          const methodText = analysisMethod === 'awesome-phonenumber'
            ? '使用 Google libphonenumber 库进行智能分析'
            : '使用号段匹配'

          // 美国数据特殊提示
          if (this.extractOperatorForm.countryCode === 'US') {
            this.$message({
              type: 'info',
              duration: 8000,
              dangerouslyUseHTMLString: true,
              message: `<div style="line-height: 1.6;">
                <strong>分析完成！</strong><br/>
                检测到 ${distribution.length} 个运营商，另有 ${this.formatNumber(unmatchedCount)} 条 (${percentage}%) 未匹配<br/>
                <span style="color: #67C23A;">✓ 分析方法：${methodText}</span><br/>
                <span style="color: #E6A23C;">⚠️ 注意：美国运营商共享相同的区号池，此分配仅按区号进行模拟分组，不代表真实运营商归属</span>
              </div>`
            })
          } else {
            this.$message({
              type: 'info',
              duration: 6000,
              dangerouslyUseHTMLString: true,
              message: `<div style="line-height: 1.6;">
                <strong>分析完成！</strong><br/>
                检测到 ${distribution.length} 个运营商，另有 ${this.formatNumber(unmatchedCount)} 条 (${percentage}%) 未匹配<br/>
                <span style="color: #67C23A;">✓ 分析方法：${methodText}</span>
              </div>`
            })
          }
        } else {
          const analysisMethod = response.data.analysisMethod || 'unknown'
          const methodText = analysisMethod === 'awesome-phonenumber'
            ? '使用 Google libphonenumber 库进行智能分析'
            : '使用号段匹配'

          if (this.extractOperatorForm.countryCode === 'US') {
            this.$message({
              type: 'success',
              duration: 6000,
              dangerouslyUseHTMLString: true,
              message: `<div style="line-height: 1.6;">
                分析完成！检测到 ${distribution.length} 个运营商<br/>
                <span style="color: #67C23A;">✓ 分析方法：${methodText}</span><br/>
                <span style="color: #E6A23C;">⚠️ 注意：美国运营商共享相同的区号池，此分配仅按区号进行模拟分组，不代表真实运营商归属</span>
              </div>`
            })
          } else {
            this.$message({
              type: 'success',
              duration: 5000,
              dangerouslyUseHTMLString: true,
              message: `<div style="line-height: 1.6;">
                分析完成！检测到 ${distribution.length} 个运营商<br/>
                <span style="color: #67C23A;">✓ 分析方法：${methodText}</span>
              </div>`
            })
          }
        }
      } catch (error) {
        this.$message.error('分析失败: ' + (error.response?.data?.message || error.message))
        this.operatorList = []
      } finally {
        this.extractOperatorForm.analyzing = false
      }
    },

    // 处理运营商选择变化
    handleOperatorSelection(selectedOperators) {
      // 为新选中的运营商初始化限制设置
      selectedOperators.forEach(opName => {
        if (!this.extractOperatorForm.operatorLimits[opName]) {
          this.$set(this.extractOperatorForm.operatorLimits, opName, {
            enabled: false, // 默认不限制，提取全部
            limit: 10000 // 默认限制数量
          })
        }
      })

      // 清理已取消选择的运营商的设置
      Object.keys(this.extractOperatorForm.operatorLimits).forEach(opName => {
        if (!selectedOperators.includes(opName)) {
          this.$delete(this.extractOperatorForm.operatorLimits, opName)
        }
      })
    },

    // 按运营商提取
    async confirmExtractOperator() {
      if (!this.extractOperatorForm.fileId) {
        this.$message.warning('请选择要处理的文件')
        return
      }
      if (!this.extractOperatorForm.countryCode) {
        this.$message.warning('请选择国家')
        return
      }
      if (!this.extractOperatorForm.selectedOperators || this.extractOperatorForm.selectedOperators.length === 0) {
        this.$message.warning('请至少选择一个运营商')
        return
      }

      // 获取国码
      const country = this.countryList.find(c => c.code === this.extractOperatorForm.countryCode)
      const countryCode = country ? country.dialCode.replace(/^\+/, '') : null

      // 构建运营商数据
      const operators = []
      for (const opName of this.extractOperatorForm.selectedOperators) {
        const operator = this.operatorList.find(op => op.name === opName)
        if (!operator) {
          this.$message.error(`运营商 ${opName} 数据不存在，请重新分析`)
          return
        }
        if (!operator.numberSegments || !Array.isArray(operator.numberSegments)) {
          this.$message.error(`运营商 ${opName} 号段数据不完整，请重新分析`)
          return
        }
        const limitConfig = this.extractOperatorForm.operatorLimits[opName]
        if (!limitConfig) {
          this.$message.error(`运营商 ${opName} 配置不存在，请重新选择`)
          return
        }

        operators.push({
          name: opName,
          numberSegments: operator.numberSegments,
          countryCode: countryCode,
          limit: limitConfig.enabled ? limitConfig.limit : null // 如果未开启限制，传null表示提取全部
        })
      }

      console.log('提取参数:', {
        fileId: this.extractOperatorForm.fileId,
        operators: operators
      })

      this.processing = true
      try {
        const response = await request({
          url: '/api/data-processing/extract-by-operator',
          method: 'post',
          data: {
            fileId: this.extractOperatorForm.fileId,
            operators: operators
          }
        })

        const { totalMatched, totalProcessed, operatorCount, operatorStats, downloadPath } = response.data

        // 显示详细结果
        let message = `提取完成！\n`
        message += `总数据: ${this.formatNumber(totalProcessed)} 条\n`
        message += `提取总数: ${this.formatNumber(totalMatched)} 条\n`
        message += `运营商数: ${operatorCount} 个\n\n`
        message += `各运营商提取明细：\n`

        operatorStats.forEach(stat => {
          message += `● ${stat.operatorName}: ${this.formatNumber(stat.matchedCount)} 条`
          if (stat.limit) {
            message += ` (限制${this.formatNumber(stat.limit)}条`
            if (stat.limitReached) {
              message += ', 已达上限'
            }
            message += ')'
          }
          message += '\n'
        })

        message += `\n已生成合并文件，正在下载...`

        this.$alert(message, '提取结果', {
          confirmButtonText: '确定',
          type: 'success',
          dangerouslyUseHTMLString: false
        })

        // 下载合并文件（只有一个文件）
        this.downloadFile(downloadPath)

        this.dialogExtractOperator = false
        this.extractOperatorForm.fileId = null
        this.extractOperatorForm.selectedOperators = []
        this.extractOperatorForm.operatorLimits = {}
      } catch (error) {
        this.$message.error('提取失败: ' + (error.response?.data?.message || error.message))
      } finally {
        this.processing = false
      }
    },

    // 按条数提取
    async confirmExtractCount() {
      if (!this.extractCountForm.fileIds || this.extractCountForm.fileIds.length === 0) {
        this.$message.warning('请选择要处理的文件')
        return
      }
      if (!this.extractCountForm.count || this.extractCountForm.count <= 0) {
        this.$message.warning('请输入有效的提取条数')
        return
      }

      this.processing = true
      try {
        const results = []
        let totalExtracted = 0

        for (const fileId of this.extractCountForm.fileIds) {
          const response = await request({
            url: '/api/data-processing/extract-by-count',
            method: 'post',
            data: {
              fileId,
              count: this.extractCountForm.count,
              startFrom: this.extractCountForm.startFrom
            }
          })
          results.push(response.data)
          totalExtracted += response.data.extractedCount || 0
        }

        this.$message.success(
          `处理完成！共处理 ${results.length} 个文件，` +
          `提取出 ${this.formatNumber(totalExtracted)} 条数据`
        )

        // 下载所有结果
        results.forEach(result => {
          this.downloadFile(result.downloadPath)
        })

        this.dialogExtractCount = false
        this.extractCountForm.fileIds = []
      } catch (error) {
        this.$message.error('提取失败: ' + error.message)
      } finally {
        this.processing = false
      }
    },

    // 一键清洗
    async confirmCleanData() {
      if (!this.cleanDataForm.fileIds || this.cleanDataForm.fileIds.length === 0) {
        this.$message.warning('请选择要清洗的文件')
        return
      }
      if (!this.cleanDataForm.countryCode && this.cleanDataForm.options.includes('autoAddCode')) {
        this.$message.warning('请选择国家或取消"智能校验国码"选项')
        return
      }

      this.processing = true
      this.cleanedFiles = []

      try {
        const results = []
        let totalOriginal = 0
        let totalFinal = 0
        let totalInvalid = 0
        let totalDuplicate = 0
        let totalAddedCode = 0
        let totalSkippedCode = 0 // 累计跳过（已有国码）数量

        // 去掉国码中的 + 号，只保留数字（如果有选择国家的话）
        const countryCodeNumber = this.cleanDataForm.countryCode ? this.cleanDataForm.countryCode.replace(/^\+/, '') : null

        for (const fileId of this.cleanDataForm.fileIds) {
          const response = await request({
            url: '/api/data-processing/clean-data',
            method: 'post',
            data: {
              fileId,
              countryCode: countryCodeNumber,
              autoAddCode: this.cleanDataForm.options.includes('autoAddCode'),
              autoDeduplicate: this.cleanDataForm.options.includes('autoDeduplicate'),
              removeInvalid: this.cleanDataForm.options.includes('removeInvalid')
            }
          })

          results.push(response.data)
          totalOriginal += response.data.originalCount || 0
          totalFinal += response.data.finalCount || 0
          totalInvalid += response.data.invalidCount || 0
          totalDuplicate += response.data.duplicateCount || 0
          totalAddedCode += response.data.addedCodeCount || 0
          totalSkippedCode += response.data.skippedCount || 0 // 累计跳过数量

          this.cleanedFiles.push({
            downloadPath: response.data.downloadPath,
            filename: `cleaned_file_${fileId}.txt`
          })
        }

        // 设置清洗结果（使用第一个文件的结果作为示例）
        if (results.length > 0) {
          const firstResult = results[0]
          this.cleanResult = {
            originalCount: totalOriginal,
            finalCount: totalFinal,
            invalidCount: totalInvalid,
            duplicateCount: totalDuplicate,
            addedCodeCount: totalAddedCode,
            skippedCount: totalSkippedCode, // 设置跳过数量
            steps: firstResult.steps || [],
            preview: firstResult.preview || [],
            // 新增：详细预览数据
            invalidDataPreview: firstResult.invalidDataPreview || [],
            duplicateDataPreview: firstResult.duplicateDataPreview || [],
            addedCodePreview: firstResult.addedCodePreview || [],
            removedCodePreview: firstResult.removedCodePreview || []
          }
        }

        // 关闭清洗对话框，打开结果对话框
        this.dialogCleanData = false
        this.cleanResultDialogVisible = true

        this.$message.success(
          `清洗完成！共处理 ${results.length} 个文件，` +
          `原始 ${this.formatNumber(totalOriginal)} 条，` +
          `最终 ${this.formatNumber(totalFinal)} 条`
        )
      } catch (error) {
        this.$message.error('清洗失败: ' + error.message)
      } finally {
        this.processing = false
      }
    },

    // 下载清洗后的文件
    downloadCleanedFiles() {
      this.cleanedFiles.forEach(file => {
        this.downloadFile(file.downloadPath)
      })
      this.$message.success(`开始下载 ${this.cleanedFiles.length} 个文件`)
    },

    downloadFile(downloadPath) {
      const url = process.env.VUE_APP_BASE_API + downloadPath + '?token=' + getToken()
      window.open(url, '_blank')
    },

    async handleDelete(row) {
      try {
        await this.$confirm(`确定要删除文件 "${row.original_filename}" 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await request({
          url: `/api/data-processing/file/${row.id}`,
          method: 'delete'
        })

        this.$message.success('删除成功')
        this.fetchFileList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败: ' + error.message)
        }
      }
    },

    formatFileSize(bytes) {
      if (bytes === null || bytes === undefined) return '0 B'
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
      return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    },

    formatNumber(num) {
      if (num === null || num === undefined) return '0'
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },

    // 处理清洗时的国家选择变化（处理共用国码）
    handleCleanDataCountryChange(dialCode) {
      const { isSharedDialCode, getCountriesByDialCode, getDefaultCountryForDialCode } = require('@/data/countries')

      if (dialCode && isSharedDialCode(dialCode)) {
        // 共用国码，显示二级选择器
        this.showCleanDataCountrySelector = true
        this.cleanDataCountryOptions = getCountriesByDialCode(dialCode)
        // 设置默认值为美国（+1的情况）或其他默认值
        const defaultCountry = getDefaultCountryForDialCode(dialCode)
        this.cleanDataForm.specificCountry = defaultCountry ? defaultCountry.code : ''
      } else {
        // 非共用国码，隐藏二级选择器
        this.showCleanDataCountrySelector = false
        this.cleanDataCountryOptions = []
        this.cleanDataForm.specificCountry = ''
      }
    },

    // 处理增加国码时的国家选择变化（处理共用国码）
    handleAddCodeCountryChange(dialCode) {
      const { isSharedDialCode, getCountriesByDialCode, getDefaultCountryForDialCode } = require('@/data/countries')

      if (dialCode && isSharedDialCode(dialCode)) {
        // 共用国码，显示二级选择器
        this.showAddCodeCountrySelector = true
        this.addCodeCountryOptions = getCountriesByDialCode(dialCode)
        // 设置默认值为美国（+1的情况）或其他默认值
        const defaultCountry = getDefaultCountryForDialCode(dialCode)
        this.addCodeForm.specificCountry = defaultCountry ? defaultCountry.code : ''
      } else {
        // 非共用国码，隐藏二级选择器
        this.showAddCodeCountrySelector = false
        this.addCodeCountryOptions = []
        this.addCodeForm.specificCountry = ''
      }
    },

    // ========== 号码生成功能 ==========

    // 处理生成号码时的国家选择
    async handleGenerateCountryChange(countryCode) {
      if (!countryCode) {
        this.generateOperatorList = []
        this.generateNumbersForm.countryInfo = {}
        return
      }

      // 加载运营商列表
      this.generateNumbersForm.loadingOperators = true

      try {
        // 获取国家信息
        const formatResponse = await request({
          url: `/api/data-processing/country-format/${countryCode}`,
          method: 'get'
        })

        this.generateNumbersForm.countryInfo = formatResponse.data

        // 加载运营商数据
        const operatorData = this.getCountryOperatorData(countryCode)
        if (operatorData && operatorData.operators) {
          this.generateOperatorList = operatorData.operators
        } else {
          this.generateOperatorList = []
        }

        // 清空选择
        this.generateNumbersForm.selectedOperators = []
        this.generateNumbersForm.operatorCounts = {}
      } catch (error) {
        this.$message.error('获取国家信息失败: ' + error.message)
      } finally {
        this.generateNumbersForm.loadingOperators = false
      }
    },

    // 处理运营商选择
    handleGenerateOperatorSelection(selectedOperators) {
      // 为每个运营商初始化生成数量
      const newCounts = {}
      selectedOperators.forEach(opName => {
        if (this.generateNumbersForm.operatorCounts[opName]) {
          newCounts[opName] = this.generateNumbersForm.operatorCounts[opName]
        } else {
          newCounts[opName] = 10000 // 默认10000条
        }
      })
      this.generateNumbersForm.operatorCounts = newCounts
    },

    // 确认生成号码
    async confirmGenerateNumbers() {
      // 验证
      if (!this.generateNumbersForm.countryCode) {
        this.$message.warning('请选择国家')
        return
      }
      if (this.generateNumbersForm.selectedOperators.length === 0) {
        this.$message.warning('请至少选择一个运营商')
        return
      }

      // 验证每个运营商的生成数量
      for (const opName of this.generateNumbersForm.selectedOperators) {
        const count = this.generateNumbersForm.operatorCounts[opName]
        if (!count || count <= 0) {
          this.$message.warning(`请设置运营商 ${opName} 的生成数量`)
          return
        }
        if (count > 1000000) {
          this.$message.warning(`运营商 ${opName} 的生成数量不能超过 1,000,000`)
          return
        }
      }

      this.processing = true

      try {
        // 准备运营商数据
        const operators = this.generateNumbersForm.selectedOperators.map(opName => {
          const operator = this.generateOperatorList.find(op => op.name === opName)
          return {
            name: opName,
            numberSegments: operator.numberSegments,
            count: this.generateNumbersForm.operatorCounts[opName]
          }
        })

        // 计算总数量和预计时间
        const totalCount = operators.reduce((sum, op) => sum + op.count, 0)
        const estimatedTime = Math.ceil(totalCount / 10000) // 每秒约1W条

        // 显示加载提示
        let loadingMessage = `正在生成 ${totalCount.toLocaleString()} 条号码...`
        if (totalCount > 100000) {
          loadingMessage += `\n预计需要 ${estimatedTime} 秒，请耐心等待`
        }

        const loadingInstance = this.$loading({
          lock: true,
          text: loadingMessage,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        // 调用后端API
        const response = await request({
          url: '/api/data-processing/generate-multiple-operators',
          method: 'post',
          data: {
            regionCode: this.generateNumbersForm.countryCode,
            operators: operators,
            options: {
              includeCountryCode: this.generateNumbersForm.includeCountryCode,
              format: 'e164',
              unique: true
            }
          }
        })

        loadingInstance.close()

        // 显示结果
        this.generateResult = response.data
        this.generateResultDialogVisible = true
        this.dialogGenerateNumbers = false

        this.$message.success(response.message)
      } catch (error) {
        this.$message.error('生成失败: ' + (error.response?.data?.message || error.message))
      } finally {
        this.processing = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.data-processing-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);

  // 页面标题
  .page-header {
    margin-bottom: 30px;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    .page-title {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      display: flex;
      align-items: center;

      i {
        margin-right: 12px;
        font-size: 32px;
      }
    }

    .page-description {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
  }

  // 功能分组
  .function-section {
    margin-bottom: 30px;

    .section-header {
      padding: 12px 20px;
      margin-bottom: 20px;
      background: white;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        font-size: 18px;
        color: #409EFF;
      }
    }
  }

  .function-modules {
    .module-card {
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
      padding: 30px 20px;
      border-radius: 12px;
      position: relative;
      height: 180px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: white;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      &.module-card-featured {
        border: 2px solid #67C23A;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2f1 100%);

        &:hover {
          box-shadow: 0 8px 24px rgba(103, 194, 58, 0.3);
        }
      }

      &.module-card-new {
        border: 2px solid #E6A23C;
        background: linear-gradient(135deg, #fff7e6 0%, #fef5e7 100%);

        &:hover {
          box-shadow: 0 8px 24px rgba(230, 162, 60, 0.3);
        }
      }

      .module-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #67C23A;
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);

        &.module-badge-new {
          background: #E6A23C;
          box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
        }
      }

      .module-icon {
        font-size: 48px;
        color: #409eff;
        margin-bottom: 15px;

        i {
          font-size: 48px;
        }
      }

      .module-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 10px;
      }

      .module-desc {
        font-size: 13px;
        color: #909399;
        line-height: 1.6;
      }
    }
  }

  .file-manager-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .card-title {
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .batch-actions {
      margin-top: 20px;
    }
  }

  .upload-demo {
    margin-top: 10px;
  }

  .preview-info {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .info-item {
      margin-bottom: 10px;

      .info-label {
        font-weight: 600;
        color: #606266;
        margin-right: 10px;
      }

      .info-value {
        color: #303133;
      }
    }
  }

  .preview-content {
    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #e96900;
      background-color: #f8f8f8;
      padding: 2px 6px;
      border-radius: 3px;
    }
  }

  .clean-result-summary {
    margin-bottom: 20px;

    .stat-card {
      text-align: center;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
      }
    }
  }
}

// 响应式优化
@media (max-width: 768px) {
  .data-processing-container {
    padding: 10px;

    .page-header {
      padding: 16px;

      .page-title {
        font-size: 22px;

        i {
          font-size: 24px;
        }
      }
    }

    .function-section {
      .section-header {
        font-size: 14px;
      }
    }

    .function-modules {
      .module-card {
        padding: 20px 15px;
        height: 160px;

        .module-icon {
          font-size: 40px;

          i {
            font-size: 40px;
          }
        }

        .module-title {
          font-size: 16px;
        }

        .module-desc {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
