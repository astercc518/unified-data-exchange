/**
 * 查询所有删除用户的操作日志
 */

const { models } = require('./backend/config/database');
const { OperationLog } = models;

async function queryDeleteLogs() {
  console.log('\n🔍 查询所有删除用户的操作日志...\n');
  
  try {
    // 查询所有删除相关的日志
    const allLogs = await OperationLog.findAll({
      order: [['create_time', 'DESC']]
    });
    
    // 手动筛选删除相关的日志
    const deleteLogs = allLogs.filter(log => 
      (log.action && log.action.includes('删除')) || 
      (log.description && log.description.includes('删除'))
    );
    
    console.log(`📊 找到 ${deleteLogs.length} 条删除相关的日志:\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (deleteLogs.length > 0) {
      deleteLogs.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`${index + 1}. ID: ${log.id}`);
        console.log(`   类型: [${log.type.toUpperCase()}]`);
        console.log(`   操作: ${log.action}`);
        console.log(`   描述: ${log.description}`);
        console.log(`   操作者: ${log.operator} (${log.operator_type})`);
        console.log(`   IP地址: ${log.ip_address || 'N/A'}`);
        console.log(`   状态: ${log.status}`);
        console.log(`   时间: ${date.toLocaleString('zh-CN', { 
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}`);
        console.log('');
      });
    } else {
      console.log('⚠️  未找到任何删除相关的日志\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 特别查询testuser888相关的日志
    console.log('\n🔍 查询testuser888相关的所有日志...\n');
    
    const testuser888Logs = allLogs.filter(log => 
      (log.operator && log.operator.includes('testuser888')) ||
      (log.description && (log.description.includes('testuser888') || log.description.includes('测试用户888')))
    );
    
    console.log(`📊 找到 ${testuser888Logs.length} 条testuser888相关的日志:\n`);
    
    if (testuser888Logs.length > 0) {
      testuser888Logs.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`${index + 1}. ${log.action} - ${log.description}`);
        console.log(`   操作者: ${log.operator}, 时间: ${date.toLocaleString('zh-CN')}\n`);
      });
    } else {
      console.log('⚠️  未找到testuser888相关的日志\n');
      console.log('💡 这说明:\n');
      console.log('   1. 用户testuser888可能还没有被删除');
      console.log('   2. 或者删除时发生了错误,没有记录日志');
      console.log('   3. 或者删除时没有正确的认证信息\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
    console.error('\n错误详情:', error.message);
  }
  
  process.exit(0);
}

// 运行查询
queryDeleteLogs();
