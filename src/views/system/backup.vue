<template>
  <div class="app-container">
    <el-card class="backup-card">
      <div slot="header" class="clearfix">
        <span class="card-title">系统备份管理</span>
        <el-button
          style="float: right; margin-left: 10px;"
          type="primary"
          icon="el-icon-plus"
          :loading="creating"
          @click="handleCreateBackup"
        >
          创建备份
        </el-button>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          icon="el-icon-refresh"
          :loading="loading"
          @click="fetchBackupList"
        >
          刷新
        </el-button>
      </div>

      <!-- 备份统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="8">
          <div class="stat-item">
            <div class="stat-icon" style="background: #409EFF;">
              <i class="el-icon-files" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ backupStats.count }}</div>
              <div class="stat-label">备份总数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="stat-item">
            <div class="stat-icon" style="background: #67C23A;">
              <i class="el-icon-folder-opened" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ backupStats.totalSize }}</div>
              <div class="stat-label">占用空间</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="stat-item">
            <div class="stat-icon" style="background: #E6A23C;">
              <i class="el-icon-time" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ latestBackupTime }}</div>
              <div class="stat-label">最新备份</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 备份列表 -->
      <el-table
        v-loading="loading"
        :data="backupList"
        style="width: 100%; margin-top: 20px;"
      >
        <el-table-column
          prop="name"
          label="备份文件名"
          min-width="200"
        >
          <template slot-scope="scope">
            <i class="el-icon-document" style="color: #409EFF; margin-right: 5px;" />
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          prop="size"
          label="文件大小"
          width="120"
        />
        <el-table-column
          prop="formattedDate"
          label="创建时间"
          width="180"
        />
        <el-table-column
          label="操作"
          width="280"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="success"
              size="mini"
              icon="el-icon-download"
              @click="handleDownload(scope.row)"
            >
              下载
            </el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-refresh-left"
              :loading="restoringBackup === scope.row.name"
              @click="handleRestore(scope.row)"
            >
              恢复
            </el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 备份说明 -->
      <el-alert
        style="margin-top: 20px;"
        title="备份说明"
        type="info"
        :closable="false"
      >
        <div>
          <p>• 系统会每天凌晨 2 点自动创建数据库备份</p>
          <p>• 备份文件保留最近 30 天</p>
          <p>• 您也可以随时手动创建备份</p>
          <p>• 备份文件存储在: /home/vue-element-admin/backups/database/</p>
          <p style="color: #E6A23C; font-weight: 600;">• 恢复备份将覆盖当前数据库，操作前会自动创建安全快照</p>
          <p style="color: #E6A23C; font-weight: 600;">• 恢复后建议立即重启后端服务：pm2 restart backend</p>
        </div>
      </el-alert>
    </el-card>
  </div>
</template>

<script>
import { getBackupList, createBackup, deleteBackup, downloadBackup, restoreBackup } from '@/api/stats'

export default {
  name: 'SystemBackup',
  data() {
    return {
      loading: false,
      creating: false,
      restoringBackup: null,
      backupList: [],
      backupStats: {
        count: 0,
        totalSize: '0 MB'
      }
    }
  },
  computed: {
    latestBackupTime() {
      if (this.backupList.length > 0) {
        return this.backupList[0].formattedDate
      }
      return '-'
    }
  },
  mounted() {
    this.fetchBackupList()
  },
  methods: {
    async fetchBackupList() {
      this.loading = true
      try {
        const response = await getBackupList()
        if (response.success) {
          this.backupList = response.data.backups
          this.backupStats = {
            count: response.data.count,
            totalSize: response.data.totalSize
          }
        } else {
          this.$message.error('获取备份列表失败')
        }
      } catch (error) {
        console.error('获取备份列表失败:', error)
        this.$message.error('获取备份列表失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    async handleCreateBackup() {
      this.$confirm('确定要创建新的数据库备份吗？', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async() => {
        this.creating = true
        try {
          const response = await createBackup()
          if (response.success) {
            this.$message.success('备份创建成功')
            // 延迟 1 秒后刷新列表
            setTimeout(() => {
              this.fetchBackupList()
            }, 1000)
          } else {
            this.$message.error('备份创建失败: ' + response.message)
          }
        } catch (error) {
          console.error('创建备份失败:', error)
          this.$message.error('创建备份失败: ' + error.message)
        } finally {
          this.creating = false
        }
      }).catch(() => {
        // 取消操作
      })
    },
    handleDownload(backup) {
      const downloadUrl = process.env.VUE_APP_BASE_API + downloadBackup(backup.name)
      // 创建隐藏的 a 标签触发下载
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = backup.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      this.$message.success('开始下载备份文件')
    },
    handleDelete(backup) {
      this.$confirm(`确定要删除备份文件 "${backup.name}" 吗？此操作不可恢复！`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const response = await deleteBackup(backup.name)
          if (response.success) {
            this.$message.success('备份删除成功')
            this.fetchBackupList()
          } else {
            this.$message.error('备份删除失败: ' + response.message)
          }
        } catch (error) {
          console.error('删除备份失败:', error)
          this.$message.error('删除备份失败: ' + error.message)
        }
      }).catch(() => {
        // 取消操作
      })
    },
    handleRestore(backup) {
      this.$confirm(
        `确定要恢复备份 "${backup.name}" 吗？\n\n` +
        '⚠️  警告：\n' +
        '1. 此操作将覆盖当前数据库的所有数据\n' +
        '2. 恢复前会自动创建安全快照\n' +
        '3. 恢复后建议重启后端服务\n' +
        '4. 恢复过程需要 30-60 秒\n\n' +
        '请确认您已理解上述风险！',
        '危险操作确认',
        {
          confirmButtonText: '确认恢复',
          cancelButtonText: '取消',
          type: 'error',
          dangerouslyUseHTMLString: true
        }
      ).then(async() => {
        this.restoringBackup = backup.name
        try {
          this.$message({
            message: '正在恢复数据库，请稍候...',
            type: 'info',
            duration: 3000
          })

          const response = await restoreBackup(backup.name)

          if (response.success) {
            this.$alert(
              '数据库恢复成功！\n\n' +
              '建议操作：\n' +
              '1. 立即重启后端服务：pm2 restart backend\n' +
              '2. 验证数据是否正确\n' +
              '3. 检查系统功能是否正常',
              '恢复成功',
              {
                confirmButtonText: '我知道了',
                type: 'success',
                dangerouslyUseHTMLString: true
              }
            )
          } else {
            this.$alert(
              '数据库恢复失败！\n\n' +
              '错误信息：' + response.message + '\n\n' +
              '建议操作：\n' +
              '1. 检查后端日志：pm2 logs backend\n' +
              '2. 检查数据库连接\n' +
              '3. 尝试使用安全快照恢复',
              '恢复失败',
              {
                confirmButtonText: '知道了',
                type: 'error',
                dangerouslyUseHTMLString: true
              }
            )
          }
        } catch (error) {
          console.error('恢复备份失败:', error)
          this.$alert(
            '恢复过程中发生错误！\n\n' +
            '错误信息：' + error.message + '\n\n' +
            '请联系管理员处理',
            '系统错误',
            {
              confirmButtonText: '知道了',
              type: 'error',
              dangerouslyUseHTMLString: true
            }
          )
        } finally {
          this.restoringBackup = null
        }
      }).catch(() => {
        // 取消操作
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.backup-card {
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.stats-row {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;

    i {
      font-size: 24px;
      color: #fff;
    }
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

::v-deep .el-alert {
  p {
    margin: 5px 0;
    line-height: 1.6;
  }
}
</style>
