/**
 * 创建示例操作日志
 * 用于测试操作日志页面显示功能
 */

const { models } = require('./backend/config/database');
const { OperationLog } = models;

async function createSampleLogs() {
  console.log('\n🎨 开始创建示例操作日志...\n');
  
  try {
    // 检查现有日志数量
    const existingCount = await OperationLog.count();
    console.log(`📊 当前操作日志数量: ${existingCount} 条\n`);
    
    // 示例日志数据
    const sampleLogs = [
      // 登录日志
      {
        type: 'login',
        operator: 'admin',
        operator_type: 'admin',
        action: '用户登录',
        description: '管理员登录系统',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 3600000 * 2 // 2小时前
      },
      {
        type: 'login',
        operator: 'agent001',
        operator_type: 'agent',
        action: '用户登录',
        description: '代理登录系统',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        status: 'success',
        create_time: Date.now() - 3600000 * 1.5 // 1.5小时前
      },
      {
        type: 'login',
        operator: 'testuser',
        operator_type: 'customer',
        action: '用户登录',
        description: '客户登录系统',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
        status: 'success',
        create_time: Date.now() - 3600000 // 1小时前
      },
      {
        type: 'login',
        operator: 'hacker',
        operator_type: 'unknown',
        action: '用户登录失败',
        description: '用户名或密码错误',
        ip_address: '203.0.113.42',
        user_agent: 'curl/7.68.0',
        status: 'failed',
        create_time: Date.now() - 3600000 * 0.5 // 30分钟前
      },
      
      // 用户管理操作
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '创建客户',
        description: '创建客户: 张三 (账号: zhangsan)',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 1800000 // 30分钟前
      },
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '更新客户',
        description: '更新客户: 李四',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 1500000 // 25分钟前
      },
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '删除客户',
        description: '删除客户: 王五',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 1200000 // 20分钟前
      },
      
      // 数据管理操作
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '上传',
        description: '上传数据: 墨西哥-SMS',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 900000 // 15分钟前
      },
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '发布',
        description: '发布数据: 美国-WhatsApp',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 600000 // 10分钟前
      },
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '批量发布',
        description: '批量发布数据: 共5条',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 480000 // 8分钟前
      },
      
      // 订单操作
      {
        type: 'operation',
        operator: 'testuser',
        operator_type: 'customer',
        action: '购买数据',
        description: '购买数据 - 订单号: ORD2025102101001',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
        status: 'success',
        create_time: Date.now() - 360000 // 6分钟前
      },
      {
        type: 'operation',
        operator: 'agent001',
        operator_type: 'agent',
        action: '审核订单-通过',
        description: '审核订单-通过: ORD2025102101001',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        status: 'success',
        create_time: Date.now() - 240000 // 4分钟前
      },
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '订单发货',
        description: '订单发货: ORD2025102101001',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 120000 // 2分钟前
      },
      
      // 代理管理操作
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '创建代理',
        description: '创建代理: 东区代理 (agent_east)',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 7200000 // 2小时前
      },
      
      // 系统配置操作
      {
        type: 'system',
        operator: 'admin',
        operator_type: 'admin',
        action: '修改管理员密码',
        description: '管理员: admin',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 86400000 // 1天前
      },
      {
        type: 'system',
        operator: 'admin',
        operator_type: 'admin',
        action: '更新安全配置',
        description: '密码级别: high, IP限制: false',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 86400000 - 3600000 // 1天1小时前
      },
      
      // 充值操作
      {
        type: 'operation',
        operator: 'admin',
        operator_type: 'admin',
        action: '客户充值',
        description: '客户 张三 充值 1000 U',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 3600000 * 3 // 3小时前
      },
      
      // 登出日志
      {
        type: 'login',
        operator: 'admin',
        operator_type: 'admin',
        action: '用户登出',
        description: '管理员登出系统',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        status: 'success',
        create_time: Date.now() - 60000 // 1分钟前
      }
    ];
    
    console.log('📝 准备创建以下示例日志:\n');
    sampleLogs.forEach((log, index) => {
      const date = new Date(log.create_time);
      console.log(`${index + 1}. [${log.type}] ${log.action} - ${log.operator} (${log.operator_type})`);
      console.log(`   时间: ${date.toLocaleString('zh-CN')}`);
    });
    
    console.log('\n⏳ 正在创建日志记录...\n');
    
    // 批量创建日志
    const createdLogs = await OperationLog.bulkCreate(sampleLogs);
    
    console.log(`✅ 成功创建 ${createdLogs.length} 条示例操作日志!\n`);
    
    // 显示统计信息
    const newCount = await OperationLog.count();
    console.log('📊 统计信息:');
    console.log(`   总日志数: ${newCount} 条`);
    console.log(`   新增日志: ${newCount - existingCount} 条\n`);
    
    // 按类型统计
    const loginCount = await OperationLog.count({ where: { type: 'login' } });
    const operationCount = await OperationLog.count({ where: { type: 'operation' } });
    const systemCount = await OperationLog.count({ where: { type: 'system' } });
    
    console.log('📈 日志类型分布:');
    console.log(`   登录日志: ${loginCount} 条`);
    console.log(`   操作日志: ${operationCount} 条`);
    console.log(`   系统日志: ${systemCount} 条\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ 示例日志创建完成!');
    console.log('');
    console.log('🎯 下一步:');
    console.log('   1. 访问前端页面: http://your-domain/system/logs');
    console.log('   2. 登录系统查看操作日志');
    console.log('   3. 可以按类型、操作者、时间等条件筛选');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ 创建示例日志失败:', error);
    console.error('\n错误详情:', error.message);
    console.error('\n堆栈信息:', error.stack);
  }
  
  process.exit(0);
}

// 运行脚本
createSampleLogs();
