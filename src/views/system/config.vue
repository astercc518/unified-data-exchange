<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ $t('system.config.title') }}</span>
      </div>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基础配置 -->
        <el-tab-pane :label="$t('system.config.basicConfig')" name="basic">
          <el-form ref="configForm" :model="configForm" :rules="rules" label-width="120px">
            <!-- 项目名称 -->
            <el-form-item :label="$t('system.config.projectName')" prop="projectName">
              <el-input
                v-model="configForm.projectName"
                :placeholder="$t('system.config.projectNamePlaceholder')"
                style="width: 400px;"
              />
              <div class="form-tip">{{ $t('system.config.projectNameTip') }}</div>
            </el-form-item>

            <!-- Logo URL -->
            <el-form-item :label="$t('system.config.logoUrl')" prop="logoUrl">
              <el-input
                v-model="configForm.logoUrl"
                :placeholder="$t('system.config.logoUrlPlaceholder')"
                style="width: 400px;"
              >
                <el-button slot="append" icon="el-icon-upload" @click="uploadDialogVisible = true">
                  {{ $t('system.config.uploadLogo') }}
                </el-button>
              </el-input>
              <div class="form-tip">{{ $t('system.config.logoUrlTip') }}</div>
            </el-form-item>

            <!-- Logo 预览 -->
            <el-form-item :label="$t('system.config.logoPreview')">
              <div class="logo-preview">
                <img v-if="configForm.logoUrl" :src="configForm.logoUrl" class="preview-image">
                <div v-else class="no-logo">{{ $t('system.config.noLogo') }}</div>
              </div>
            </el-form-item>

            <!-- 是否显示 Logo -->
            <el-form-item :label="$t('system.config.showLogo')">
              <el-switch v-model="configForm.sidebarLogo" />
              <div class="form-tip">{{ $t('system.config.showLogoTip') }}</div>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="saveConfig">
                {{ $t('common.save') }}
              </el-button>
              <el-button @click="resetConfig">
                {{ $t('common.reset') }}
              </el-button>
              <el-button type="success" @click="previewConfig">
                <i class="el-icon-view" /> {{ $t('system.config.preview') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 页面样式设置 -->
        <el-tab-pane :label="$t('system.config.pageStyle')" name="style">
          <el-form label-width="120px">
            <!-- 主题颜色 -->
            <el-form-item :label="$t('system.config.themeColor')">
              <theme-picker @change="themeChange" />
              <div class="form-tip">{{ $t('system.config.themeColorTip') }}</div>
            </el-form-item>

            <!-- 开启标签页 -->
            <el-form-item :label="$t('system.config.openTagsView')">
              <el-switch v-model="styleConfig.tagsView" />
              <div class="form-tip">{{ $t('system.config.tagsViewTip') }}</div>
            </el-form-item>

            <!-- 固定头部 -->
            <el-form-item :label="$t('system.config.fixedHeader')">
              <el-switch v-model="styleConfig.fixedHeader" />
              <div class="form-tip">{{ $t('system.config.fixedHeaderTip') }}</div>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
              <el-button type="primary" @click="saveStyleConfig">
                {{ $t('common.save') }}
              </el-button>
              <el-button @click="resetStyleConfig">
                {{ $t('common.reset') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- Logo 上传对话框 -->
    <el-dialog
      :title="$t('system.config.uploadLogo')"
      :visible.sync="uploadDialogVisible"
      width="500px"
    >
      <el-upload
        class="logo-uploader"
        action="#"
        :http-request="handleUpload"
        :show-file-list="false"
        :before-upload="beforeUpload"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          {{ $t('system.config.uploadTip') }}
          <em>{{ $t('system.config.uploadClickTip') }}</em>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">{{ $t('common.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ThemePicker from '@/components/ThemePicker'

export default {
  name: 'SystemConfig',
  components: { ThemePicker },
  data() {
    return {
      activeTab: 'basic',
      loading: false,
      uploadDialogVisible: false,
      configForm: {
        projectName: '',
        logoUrl: '',
        sidebarLogo: false
      },
      styleConfig: {
        tagsView: true,
        fixedHeader: false
      },
      originalConfig: {},
      originalStyleConfig: {},
      rules: {
        projectName: [
          { required: true, message: this.$t('system.config.projectNameRequired'), trigger: 'blur' },
          { min: 2, max: 50, message: this.$t('system.config.projectNameLength'), trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadConfig()
    this.loadStyleConfig()
  },
  methods: {
    // 加载配置
    async loadConfig() {
      try {
        // 从 settings.js 和 localStorage 加载配置
        const defaultTitle = require('@/settings').title
        const savedConfig = localStorage.getItem('systemConfig')
        
        if (savedConfig) {
          const config = JSON.parse(savedConfig)
          this.configForm = {
            projectName: config.projectName || defaultTitle,
            logoUrl: config.logoUrl || '',
            sidebarLogo: this.$store.state.settings.sidebarLogo
          }
        } else {
          this.configForm = {
            projectName: defaultTitle,
            logoUrl: 'https://wpimg.wallstcn.com/69a1c46c-eb1c-4b46-8bd4-e9e686ef5251.png',
            sidebarLogo: this.$store.state.settings.sidebarLogo
          }
        }
        
        // 保存原始配置
        this.originalConfig = { ...this.configForm }
      } catch (error) {
        this.$message.error(this.$t('system.config.loadFailed'))
      }
    },
    
    // 保存配置
    async saveConfig() {
      this.$refs.configForm.validate(async(valid) => {
        if (valid) {
          this.loading = true
          try {
            // 保存到 localStorage
            localStorage.setItem('systemConfig', JSON.stringify(this.configForm))
            
            // 更新 store
            this.$store.dispatch('settings/changeSetting', {
              key: 'sidebarLogo',
              value: this.configForm.sidebarLogo
            })
            
            // 触发全局事件，更新 Logo 组件
            this.$root.$emit('updateSystemConfig', this.configForm)
            
            this.$message.success(this.$t('system.config.saveSuccess'))
            
            // 更新原始配置
            this.originalConfig = { ...this.configForm }
          } catch (error) {
            this.$message.error(this.$t('system.config.saveFailed'))
          } finally {
            this.loading = false
          }
        }
      })
    },
    
    // 重置配置
    resetConfig() {
      this.$confirm(this.$t('system.config.resetConfirm'), this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.configForm = { ...this.originalConfig }
        this.$message.success(this.$t('system.config.resetSuccess'))
      }).catch(() => {})
    },
    
    // 预览配置
    previewConfig() {
      // 临时应用配置
      this.$store.dispatch('settings/changeSetting', {
        key: 'sidebarLogo',
        value: this.configForm.sidebarLogo
      })
      
      this.$root.$emit('updateSystemConfig', this.configForm)
      
      this.$message.success(this.$t('system.config.previewSuccess'))
    },
    
    // 上传前验证
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error(this.$t('system.config.uploadImageOnly'))
        return false
      }
      if (!isLt2M) {
        this.$message.error(this.$t('system.config.uploadSizeLimit'))
        return false
      }
      return true
    },
    
    // 处理上传
    handleUpload(param) {
      const file = param.file
      const reader = new FileReader()
      
      reader.onload = (e) => {
        this.configForm.logoUrl = e.target.result
        this.uploadDialogVisible = false
        this.$message.success(this.$t('system.config.uploadSuccess'))
      }
      
      reader.readAsDataURL(file)
    },
    
    // 加载样式配置
    loadStyleConfig() {
      this.styleConfig = {
        tagsView: this.$store.state.settings.tagsView,
        fixedHeader: this.$store.state.settings.fixedHeader
      }
      this.originalStyleConfig = { ...this.styleConfig }
    },
    
    // 保存样式配置
    saveStyleConfig() {
      try {
        // 更新 store
        this.$store.dispatch('settings/changeSetting', {
          key: 'tagsView',
          value: this.styleConfig.tagsView
        })
        this.$store.dispatch('settings/changeSetting', {
          key: 'fixedHeader',
          value: this.styleConfig.fixedHeader
        })
        
        this.$message.success(this.$t('system.config.saveSuccess'))
        this.originalStyleConfig = { ...this.styleConfig }
      } catch (error) {
        this.$message.error(this.$t('system.config.saveFailed'))
      }
    },
    
    // 重置样式配置
    resetStyleConfig() {
      this.$confirm(this.$t('system.config.resetConfirm'), this.$t('common.warning'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.styleConfig = { ...this.originalStyleConfig }
        this.$message.success(this.$t('system.config.resetSuccess'))
      }).catch(() => {})
    },
    
    // 主题颜色变化
    themeChange(val) {
      this.$store.dispatch('settings/changeSetting', {
        key: 'theme',
        value: val
      })
      this.$message.success(this.$t('system.config.themeChangeSuccess'))
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.logo-preview {
  width: 200px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  
  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .no-logo {
    color: #c0c4cc;
    font-size: 14px;
  }
}

.logo-uploader {
  ::v-deep .el-upload {
    width: 100%;
  }
  
  ::v-deep .el-upload-dragger {
    width: 100%;
  }
}
</style>
