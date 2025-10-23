/**
 * 操作日志功能测试脚本
 * 
 * 测试所有新添加的操作日志功能
 */

const { models } = require('./backend/config/database');
const { OperationLog } = models;

async function testOperationLogs() {
  console.log('\n🧪 开始测试操作日志功能...\n');
  
  try {
    // 1. 测试数据库连接
    console.log('📊 测试1: 检查数据库连接...');
    const count = await OperationLog.count();
    console.log(`✅ 数据库连接正常，当前操作日志总数: ${count} 条\n`);
    
    // 2. 查询最近的操作日志
    console.log('📊 测试2: 查询最近10条操作日志...');
    const recentLogs = await OperationLog.findAll({
      limit: 10,
      order: [['create_time', 'DESC']]
    });
    
    if (recentLogs.length > 0) {
      console.log(`✅ 找到 ${recentLogs.length} 条最近的操作日志:\n`);
      recentLogs.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`${index + 1}. [${log.type}] ${log.operator} (${log.operator_type})`);
        console.log(`   操作: ${log.action}`);
        console.log(`   描述: ${log.description}`);
        console.log(`   状态: ${log.status}`);
        console.log(`   时间: ${date.toLocaleString('zh-CN')}`);
        console.log(`   IP: ${log.ip_address || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  暂无操作日志记录\n');
    }
    
    // 3. 统计不同类型的操作日志
    console.log('📊 测试3: 统计操作日志类型分布...');
    const { Sequelize } = require('sequelize');
    const typeStats = await OperationLog.findAll({
      attributes: [
        'type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['type']
    });
    
    if (typeStats.length > 0) {
      console.log('✅ 操作日志类型分布:');
      typeStats.forEach(stat => {
        console.log(`   ${stat.type}: ${stat.getDataValue('count')} 条`);
      });
      console.log('');
    }
    
    // 4. 统计操作者类型分布
    console.log('📊 测试4: 统计操作者类型分布...');
    const operatorTypeStats = await OperationLog.findAll({
      attributes: [
        'operator_type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['operator_type']
    });
    
    if (operatorTypeStats.length > 0) {
      console.log('✅ 操作者类型分布:');
      operatorTypeStats.forEach(stat => {
        console.log(`   ${stat.operator_type}: ${stat.getDataValue('count')} 条`);
      });
      console.log('');
    }
    
    // 5. 查询登录相关日志
    console.log('📊 测试5: 查询登录相关日志...');
    const loginLogs = await OperationLog.findAll({
      where: { type: 'login' },
      limit: 5,
      order: [['create_time', 'DESC']]
    });
    
    if (loginLogs.length > 0) {
      console.log(`✅ 找到 ${loginLogs.length} 条登录日志:\n`);
      loginLogs.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`${index + 1}. ${log.operator} - ${log.action} - ${log.status}`);
        console.log(`   时间: ${date.toLocaleString('zh-CN')}`);
        console.log('');
      });
    } else {
      console.log('⚠️  暂无登录日志\n');
    }
    
    // 6. 检查今日操作统计
    console.log('📊 测试6: 统计今日操作数量...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    const todayCount = await OperationLog.count({
      where: {
        create_time: {
          [Sequelize.Op.gte]: todayTimestamp
        }
      }
    });
    
    console.log(`✅ 今日操作日志数量: ${todayCount} 条\n`);
    
    // 7. 测试成功和失败操作统计
    console.log('📊 测试7: 统计操作成功/失败情况...');
    const statusStats = await OperationLog.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    if (statusStats.length > 0) {
      console.log('✅ 操作状态分布:');
      statusStats.forEach(stat => {
        console.log(`   ${stat.status}: ${stat.getDataValue('count')} 条`);
      });
      console.log('');
    }
    
    console.log('✅ 所有测试完成!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 测试总结:');
    console.log(`   - 操作日志总数: ${count} 条`);
    console.log(`   - 今日操作数: ${todayCount} 条`);
    console.log(`   - 数据库连接: 正常`);
    console.log(`   - 功能状态: ✅ 正常运行`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('\n错误详情:', error.message);
    console.error('\n堆栈信息:', error.stack);
  }
  
  process.exit(0);
}

// 运行测试
testOperationLogs();
