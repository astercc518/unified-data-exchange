<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 邮箱发货配置 -->
      <el-tab-pane label="邮箱发货配置" name="email">
        <el-card>
          <div slot="header">
            <span>邮箱发货配置</span>
            <el-switch
              v-model="emailConfig.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
              style="float: right;"
            />
          </div>

          <el-form ref="emailForm" :model="emailConfig.config_data" :rules="emailRules" label-width="140px">
            <el-form-item label="SMTP服务器" prop="smtp_host">
              <el-input v-model="emailConfig.config_data.smtp_host" placeholder="例如: smtp.gmail.com" />
            </el-form-item>

            <el-form-item label="SMTP端口" prop="smtp_port">
              <el-input-number v-model="emailConfig.config_data.smtp_port" :min="1" :max="65535" />
              <span class="form-tip">常用端口: 25(非加密), 465(SSL), 587(TLS)</span>
            </el-form-item>

            <el-form-item label="使用SSL/TLS">
              <el-switch v-model="emailConfig.config_data.smtp_secure" />
              <span class="form-tip">端口465时通常启用</span>
            </el-form-item>

            <el-form-item label="发件邮箱" prop="smtp_user">
              <el-input v-model="emailConfig.config_data.smtp_user" placeholder="例如: service@example.com" />
            </el-form-item>

            <el-form-item label="邮箱密码" prop="smtp_pass">
              <el-input v-model="emailConfig.config_data.smtp_pass" type="password" show-password placeholder="SMTP授权密码" />
            </el-form-item>

            <el-form-item label="发件人名称">
              <el-input v-model="emailConfig.config_data.sender_name" placeholder="例如: 数据平台" />
            </el-form-item>

            <el-form-item label="备注">
              <el-input v-model="emailConfig.remark" type="textarea" :rows="3" placeholder="配置说明（选填）" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveEmailConfig">
                <i class="el-icon-check" /> 保存配置
              </el-button>
              <el-button @click="testEmailConfig">
                <i class="el-icon-s-promotion" /> 测试发送
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- TGBot发货配置 -->
      <el-tab-pane label="TGBot发货配置" name="tgbot">
        <el-card>
          <div slot="header">
            <span>TGBot发货配置</span>
            <el-switch
              v-model="tgbotConfig.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
              style="float: right;"
            />
          </div>

          <el-form ref="tgbotForm" :model="tgbotConfig.config_data" :rules="tgbotRules" label-width="140px">
            <el-form-item label="Bot Token" prop="bot_token">
              <el-input v-model="tgbotConfig.config_data.bot_token" placeholder="例如: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
              <span class="form-tip">从 @BotFather 获取</span>
            </el-form-item>

            <el-form-item label="Bot 用户名">
              <el-input v-model="tgbotConfig.config_data.bot_username" placeholder="例如: YourBot">
                <template slot="prepend">@</template>
              </el-input>
            </el-form-item>

            <el-form-item label="Webhook URL">
              <el-input v-model="tgbotConfig.config_data.webhook_url" placeholder="https://your-domain.com/api/tgbot/webhook" />
              <span class="form-tip">可选，用于接收TG消息</span>
            </el-form-item>

            <el-form-item label="备注">
              <el-input v-model="tgbotConfig.remark" type="textarea" :rows="3" placeholder="配置说明（选填）" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveTGBotConfig">
                <i class="el-icon-check" /> 保存配置
              </el-button>
              <el-button @click="testTGBotConfig">
                <i class="el-icon-s-promotion" /> 测试发送
              </el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <div class="help-section">
            <h4><i class="el-icon-question" /> 使用说明</h4>
            <ol>
              <li>客户需要先添加TGBot账号（@{{ tgbotConfig.config_data.bot_username || 'YourBot' }}）</li>
              <li>客户发送已完成的订单号给Bot</li>
              <li>系统验证订单状态为"待发货"</li>
              <li>验证通过后自动发送数据文件</li>
            </ol>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 测试对话框 -->
    <el-dialog :visible.sync="testDialogVisible" :title="activeTab === 'email' ? '测试邮箱发送' : '测试TGBot发送'" width="500px">
      <el-form :model="testForm" label-width="120px">
        <el-form-item v-if="activeTab === 'email'" label="接收邮箱">
          <el-input v-model="testForm.test_email" placeholder="请输入测试邮箱地址" />
        </el-form-item>
        <el-form-item v-else label="Chat ID">
          <el-input v-model="testForm.test_chat_id" placeholder="请输入测试Chat ID" />
          <span class="form-tip">向Bot发送任意消息，在日志中可看到Chat ID</span>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="testDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="testing" @click="doTest">
          <i class="el-icon-s-promotion" /> 发送测试
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'DeliveryConfig',
  data() {
    return {
      activeTab: 'email',
      saving: false,
      testing: false,
      testDialogVisible: false,
      emailConfig: {
        status: 1,
        config_data: {
          smtp_host: '',
          smtp_port: 587,
          smtp_secure: false,
          smtp_user: '',
          smtp_pass: '',
          sender_name: '数据平台'
        },
        remark: ''
      },
      tgbotConfig: {
        status: 0,
        config_data: {
          bot_token: '',
          bot_username: '',
          webhook_url: ''
        },
        remark: ''
      },
      testForm: {
        test_email: '',
        test_chat_id: ''
      },
      emailRules: {
        smtp_host: [{ required: true, message: '请输入SMTP服务器', trigger: 'blur' }],
        smtp_port: [{ required: true, message: '请输入SMTP端口', trigger: 'blur' }],
        smtp_user: [
          { required: true, message: '请输入发件邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        smtp_pass: [{ required: true, message: '请输入邮箱密码', trigger: 'blur' }]
      },
      tgbotRules: {
        bot_token: [{ required: true, message: '请输入Bot Token', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.loadConfigs()
  },
  methods: {
    async loadConfigs() {
      try {
        // 加载邮箱配置
        const emailRes = await request({
          url: '/api/delivery/config/email',
          method: 'get'
        })
        if (emailRes.success && emailRes.data) {
          this.emailConfig = {
            status: emailRes.data.status || 0,
            config_data: emailRes.data.config_data || this.emailConfig.config_data,
            remark: emailRes.data.remark || ''
          }
        }

        // 加载TGBot配置
        const tgbotRes = await request({
          url: '/api/delivery/config/tgbot',
          method: 'get'
        })
        if (tgbotRes.success && tgbotRes.data) {
          this.tgbotConfig = {
            status: tgbotRes.data.status || 0,
            config_data: tgbotRes.data.config_data || this.tgbotConfig.config_data,
            remark: tgbotRes.data.remark || ''
          }
        }
      } catch (error) {
        this.$message.error('加载配置失败')
      }
    },

    async saveEmailConfig() {
      this.$refs.emailForm.validate(async valid => {
        if (!valid) return

        this.saving = true
        try {
          await request({
            url: '/api/delivery/config/email',
            method: 'put',
            data: this.emailConfig
          })
          this.$message.success('邮箱配置保存成功')
        } catch (error) {
          this.$message.error('保存失败: ' + (error.message || '未知错误'))
        } finally {
          this.saving = false
        }
      })
    },

    async saveTGBotConfig() {
      this.$refs.tgbotForm.validate(async valid => {
        if (!valid) return

        this.saving = true
        try {
          await request({
            url: '/api/delivery/config/tgbot',
            method: 'put',
            data: this.tgbotConfig
          })
          this.$message.success('TGBot配置保存成功')
        } catch (error) {
          this.$message.error('保存失败: ' + (error.message || '未知错误'))
        } finally {
          this.saving = false
        }
      })
    },

    testEmailConfig() {
      this.$refs.emailForm.validate(valid => {
        if (!valid) {
          this.$message.warning('请先完善配置信息')
          return
        }
        this.testForm.test_email = ''
        this.testDialogVisible = true
      })
    },

    testTGBotConfig() {
      this.$refs.tgbotForm.validate(valid => {
        if (!valid) {
          this.$message.warning('请先完善配置信息')
          return
        }
        this.testForm.test_chat_id = ''
        this.testDialogVisible = true
      })
    },

    async doTest() {
      if (this.activeTab === 'email') {
        if (!this.testForm.test_email) {
          this.$message.warning('请输入测试邮箱地址')
          return
        }

        this.testing = true
        try {
          await request({
            url: '/api/delivery/config/email/test',
            method: 'post',
            data: {
              config_data: this.emailConfig.config_data,
              test_email: this.testForm.test_email
            }
          })
          this.$message.success('测试邮件发送成功，请查收')
          this.testDialogVisible = false
        } catch (error) {
          this.$message.error('发送失败: ' + (error.message || '未知错误'))
        } finally {
          this.testing = false
        }
      } else {
        if (!this.testForm.test_chat_id) {
          this.$message.warning('请输入测试Chat ID')
          return
        }

        this.testing = true
        try {
          await request({
            url: '/api/delivery/config/tgbot/test',
            method: 'post',
            data: {
              config_data: this.tgbotConfig.config_data,
              test_chat_id: this.testForm.test_chat_id
            }
          })
          this.$message.success('测试消息发送成功')
          this.testDialogVisible = false
        } catch (error) {
          this.$message.error('发送失败: ' + (error.message || '未知错误'))
        } finally {
          this.testing = false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.help-section {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;

  h4 {
    margin-top: 0;
    color: #409eff;

    i {
      margin-right: 8px;
    }
  }

  ol {
    margin: 10px 0;
    padding-left: 20px;

    li {
      margin: 8px 0;
      color: #606266;
      line-height: 1.6;
    }
  }
}
</style>
