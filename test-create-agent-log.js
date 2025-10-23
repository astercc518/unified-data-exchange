/**
 * 测试创建代理的操作日志记录功能
 * 验证认证中间件是否正确设置req.user
 */

const axios = require('axios');
const { models } = require('./backend/config/database');
const { OperationLog } = models;

const BASE_URL = 'http://localhost:3000/api';

async function testCreateAgentLog() {
  console.log('\n🧪 测试创建代理的操作日志记录功能...\n');
  
  try {
    // 1. 管理员登录
    console.log('1️⃣ 管理员登录...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      loginAccount: 'admin',
      loginPassword: '58ganji@123',
      userType: 'admin'
    });
    
    if (!loginRes.data.success) {
      console.error('❌ 登录失败:', loginRes.data.message);
      return;
    }
    
    const token = loginRes.data.data.token;
    console.log('✅ 登录成功, Token:', token.substring(0, 20) + '...\n');
    
    // 2. 创建测试代理
    console.log('2️⃣ 创建测试代理...');
    const agentData = {
      login_account: `testagent_${Date.now()}`,
      login_password: 'test123456',
      agent_name: `测试代理_${Date.now()}`,
      agent_code: `TA_${Date.now()}`,
      commission: 5.00,
      region: '测试地区',
      email: `test_${Date.now()}@test.com`,
      phone: '13800138000',
      status: 1
    };
    
    const createRes = await axios.post(`${BASE_URL}/agents`, agentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!createRes.data.success) {
      console.error('❌ 创建代理失败:', createRes.data.message);
      return;
    }
    
    const agent = createRes.data.data;
    console.log('✅ 代理创建成功!');
    console.log(`   ID: ${agent.id}`);
    console.log(`   账号: ${agent.login_account}`);
    console.log(`   名称: ${agent.agent_name}\n`);
    
    // 3. 等待1秒让日志记录完成
    console.log('3️⃣ 等待日志记录...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. 查询操作日志
    console.log('4️⃣ 查询操作日志...');
    const logs = await OperationLog.findAll({
      where: {
        description: {
          [require('sequelize').Op.like]: `%${agent.login_account}%`
        }
      },
      order: [['create_time', 'DESC']],
      limit: 5
    });
    
    console.log(`\n📋 找到 ${logs.length} 条相关日志:\n`);
    
    if (logs.length > 0) {
      logs.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`${index + 1}. [ID: ${log.id}] ${log.action}`);
        console.log(`   操作人: ${log.operator} (${log.operator_type})`);
        console.log(`   描述: ${log.description}`);
        console.log(`   状态: ${log.status}`);
        console.log(`   时间: ${date.toLocaleString('zh-CN')}`);
        console.log('');
        
        // 验证操作人不是unknown
        if (log.operator === 'unknown') {
          console.log('⚠️  警告: 操作人为"unknown",认证信息未正确传递!\n');
        } else if (log.operator === 'admin') {
          console.log('✅ 操作人记录正确: admin\n');
        }
      });
    } else {
      console.log('❌ 没有找到操作日志记录!');
    }
    
    // 5. 清理测试数据
    console.log('5️⃣ 清理测试数据...');
    const deleteRes = await axios.delete(`${BASE_URL}/agents/${agent.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (deleteRes.data.success) {
      console.log('✅ 测试数据已删除\n');
    }
    
    // 6. 总结
    console.log('='.repeat(50));
    if (logs.length > 0 && logs[0].operator !== 'unknown') {
      console.log('✅ 测试通过: 操作日志记录功能正常!');
    } else if (logs.length > 0 && logs[0].operator === 'unknown') {
      console.log('❌ 测试失败: 操作日志已记录但操作人为unknown');
      console.log('   原因: 认证中间件未正确设置req.user');
    } else {
      console.log('❌ 测试失败: 操作日志未记录');
    }
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }
  
  process.exit(0);
}

testCreateAgentLog();
