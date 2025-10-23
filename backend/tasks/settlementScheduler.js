/**
 * 短信结算定时任务调度器
 * 每天凌晨2点自动结算前一天的数据（旧结算系统）
 * 每月1号凌晨2点自动结算代理和通道月度数据（新结算系统）
 */

const cron = require('node-cron');
const moment = require('moment');
const SettlementService = require('../services/settlementService');
const AgentSettlementService = require('../services/agentSettlementService');
const ChannelSettlementService = require('../services/channelSettlementService');
const logger = require('../utils/logger');

// 自动结算任务 - 每天凌晨2点执行
const autoSettlementTask = cron.schedule('0 2 * * *', async () => {
  try {
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    logger.info(`🔄 开始自动结算任务，结算日期: ${yesterday}`);

    const result = await SettlementService.autoSettle(yesterday);
    
    if (result.success) {
      logger.info(`✅ 自动结算完成: ${yesterday}`, {
        settlements_created: result.data.settlements_created,
        total_records: result.data.total_records
      });
    } else {
      logger.error(`❌ 自动结算失败: ${yesterday}`, result.error);
    }
  } catch (error) {
    logger.error('❌ 自动结算任务执行出错:', error);
  }
}, {
  scheduled: false,
  timezone: "Asia/Shanghai"
});

// 每周日凌晨3点生成上周业绩报表
const weeklyReportTask = cron.schedule('0 3 * * 0', async () => {
  try {
    const lastWeekStart = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
    const lastWeekEnd = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
    
    logger.info(`📊 开始生成上周业绩报表: ${lastWeekStart} 至 ${lastWeekEnd}`);

    const report = await SettlementService.generateReport({
      start_date: lastWeekStart,
      end_date: lastWeekEnd,
      group_by: 'customer'
    });
    
    if (report.success) {
      logger.info(`✅ 上周业绩报表生成完成`, {
        summary: report.data.summary
      });
      
      // 这里可以添加发送邮件通知的逻辑
      // await sendReportEmail(report.data);
    }
  } catch (error) {
    logger.error('❌ 生成周报表任务执行出错:', error);
  }
}, {
  scheduled: false,
  timezone: "Asia/Shanghai"
});

// 每月1号凌晨4点生成上月业绩报表
const monthlyReportTask = cron.schedule('0 4 1 * *', async () => {
  try {
    const lastMonthStart = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
    const lastMonthEnd = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
    
    logger.info(`📊 开始生成上月业绩报表: ${lastMonthStart} 至 ${lastMonthEnd}`);

    const report = await SettlementService.generateReport({
      start_date: lastMonthStart,
      end_date: lastMonthEnd,
      group_by: 'customer'
    });
    
    if (report.success) {
      logger.info(`✅ 上月业绩报表生成完成`, {
        summary: report.data.summary
      });
      
      // 这里可以添加发送邮件通知的逻辑
      // await sendReportEmail(report.data);
    }
  } catch (error) {
    logger.error('❌ 生成月报表任务执行出错:', error);
  }
}, {
  scheduled: false,
  timezone: "Asia/Shanghai"
});

// 每月1号凌晨2点自动结算代理和通道月度数据（新结算系统）
const monthlyAgentSettlementTask = cron.schedule('0 2 1 * *', async () => {
  try {
    const lastMonth = moment().subtract(1, 'months').format('YYYY-MM');
    logger.info(`💼 开始代理月度结算: ${lastMonth}`);

    const result = await AgentSettlementService.autoSettleAllAgents(lastMonth);
    
    if (result.success) {
      logger.info(`✅ 代理月度结算完成`, {
        total_agents: result.data.total_agents,
        success_count: result.data.success_count,
        failed_count: result.data.failed_count
      });
    }
  } catch (error) {
    logger.error('❌ 代理月度结算任务执行出错:', error);
  }
}, {
  scheduled: false,
  timezone: "Asia/Shanghai"
});

const monthlyChannelSettlementTask = cron.schedule('0 2 1 * *', async () => {
  try {
    const lastMonth = moment().subtract(1, 'months').format('YYYY-MM');
    logger.info(`📡 开始通道月度结算: ${lastMonth}`);

    const result = await ChannelSettlementService.autoSettleAllChannels(lastMonth);
    
    if (result.success) {
      logger.info(`✅ 通道月度结算完成`, {
        total_channels: result.data.total_channels,
        success_count: result.data.success_count,
        failed_count: result.data.failed_count
      });
    }
  } catch (error) {
    logger.error('❌ 通道月度结算任务执行出错:', error);
  }
}, {
  scheduled: false,
  timezone: "Asia/Shanghai"
});

/**
 * 启动所有结算定时任务
 */
function startSettlementTasks() {
  logger.info('⏰ 启动短信结算定时任务...');
  
  // 启动自动结算任务（旧系统）
  autoSettlementTask.start();
  logger.info('  ✓ 日结算任务已启动 (每天凌晨2点)');
  
  // 启动周报表任务
  weeklyReportTask.start();
  logger.info('  ✓ 周报表任务已启动 (每周日凌晨3点)');
  
  // 启动月报表任务
  monthlyReportTask.start();
  logger.info('  ✓ 月报表任务已启动 (每月1号凌晨4点)');
  
  // 启动代理月度结算任务（新系统）
  monthlyAgentSettlementTask.start();
  logger.info('  ✓ 代理月度结算任务已启动 (每月1号凌晨2点)');
  
  // 启动通道月度结算任务（新系统）
  monthlyChannelSettlementTask.start();
  logger.info('  ✓ 通道月度结算任务已启动 (每月1号凌晨2点)');
  
  logger.info('✅ 所有短信结算定时任务启动完成');
}

/**
 * 停止所有结算定时任务
 */
function stopSettlementTasks() {
  logger.info('⏸️  停止短信结算定时任务...');
  
  autoSettlementTask.stop();
  weeklyReportTask.stop();
  monthlyReportTask.stop();
  monthlyAgentSettlementTask.stop();
  monthlyChannelSettlementTask.stop();
  
  logger.info('✅ 所有短信结算定时任务已停止');
}

/**
 * 手动执行结算任务（用于测试）
 * @param {string} date - 结算日期 YYYY-MM-DD
 */
async function manualSettle(date) {
  try {
    logger.info(`🔧 手动执行结算任务: ${date}`);
    const result = await SettlementService.autoSettle(date);
    logger.info(`✅ 手动结算完成:`, result);
    return result;
  } catch (error) {
    logger.error('❌ 手动结算失败:', error);
    throw error;
  }
}

module.exports = {
  startSettlementTasks,
  stopSettlementTasks,
  manualSettle,
  tasks: {
    autoSettlementTask,
    weeklyReportTask,
    monthlyReportTask,
    monthlyAgentSettlementTask,
    monthlyChannelSettlementTask
  }
};
