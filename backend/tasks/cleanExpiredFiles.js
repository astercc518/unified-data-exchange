/**
 * 定时任务：清理过期的客户数据文件
 * 每天凌晨2点执行，删除超过1个月的文件
 */
const cron = require('node-cron');
const { models } = require('../config/database');
const fs = require('fs').promises;
const logger = require('../utils/logger');

const { CustomerDataFile } = models;

/**
 * 清理过期文件
 */
async function cleanExpiredFiles() {
  try {
    const now = Date.now();
    
    // 查找过期文件
    const expiredFiles = await CustomerDataFile.findAll({
      where: {
        expire_time: { [require('sequelize').Op.lt]: now },
        status: 1
      }
    });

    if (expiredFiles.length === 0) {
      logger.info('[定时任务] 没有需要清理的过期文件');
      return;
    }

    logger.info(`[定时任务] 开始清理 ${expiredFiles.length} 个过期文件`);

    let successCount = 0;
    let failCount = 0;

    for (const file of expiredFiles) {
      try {
        // 删除物理文件
        await fs.unlink(file.file_path);
        
        // 更新数据库状态
        file.status = 0;
        await file.save();
        
        successCount++;
        logger.info(`[定时任务] 已删除过期文件: ${file.original_filename}`);
      } catch (err) {
        failCount++;
        logger.error(`[定时任务] 删除文件失败: ${file.original_filename}`, err);
      }
    }

    logger.info(`[定时任务] 清理完成: 成功${successCount}个, 失败${failCount}个`);
  } catch (error) {
    logger.error('[定时任务] 清理过期文件任务失败:', error);
  }
}

/**
 * 启动定时任务
 */
function startCleanupTask() {
  // 每天凌晨2点执行
  cron.schedule('0 2 * * *', async () => {
    logger.info('[定时任务] 开始执行清理过期文件任务');
    await cleanExpiredFiles();
  });

  logger.info('✅ 定时清理任务已启动（每天凌晨2点执行）');

  // 立即执行一次（可选，用于测试）
  // cleanExpiredFiles();
}

module.exports = {
  startCleanupTask,
  cleanExpiredFiles
};
