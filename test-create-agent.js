/**
 * 测试创建代理功能
 */

const { models } = require('./backend/config/database');
const { Agent } = models;

async function testCreateAgent() {
  console.log('\n🧪 测试创建代理功能...\n');
  
  try {
    // 测试数据
    const testAgent = {
      agent_name: '测试代理001',
      login_account: 'testagent001',
      login_password: 'test123456',
      agent_code: 'TA001',
      commission: 5.00,
      region: '测试地区',
      email: 'testagent001@test.com',
      phone: '13800138000',
      status: 1,
      create_time: Date.now()
    };
    
    console.log('📝 准备创建代理,数据:');
    console.log(JSON.stringify(testAgent, null, 2));
    console.log('');
    
    // 尝试创建
    console.log('⏳ 正在创建代理...\n');
    const agent = await Agent.create(testAgent);
    
    console.log('✅ 代理创建成功!');
    console.log('   ID:', agent.id);
    console.log('   代理名称:', agent.agent_name);
    console.log('   登录账号:', agent.login_account);
    console.log('');
    
    // 清理测试数据
    console.log('🧹 清理测试数据...');
    await agent.destroy();
    console.log('✅ 测试数据已删除\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 测试通过: 创建代理功能正常!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ 测试失败!');
    console.error('\n错误信息:', error.message);
    console.error('\n完整错误:', error);
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('问题分析:');
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('  • 唯一性约束冲突 - 登录账号或代理编码已存在');
      console.error('  • 字段:', Object.keys(error.fields));
    } else if (error.name === 'SequelizeValidationError') {
      console.error('  • 数据验证失败');
      console.error('  • 验证错误:', error.errors);
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('  • 数据库错误');
      console.error('  • SQL:', error.sql);
    } else {
      console.error('  • 其他错误:', error.name);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
  
  process.exit(0);
}

// 运行测试
testCreateAgent();
