/**
 * 测试删除用户操作日志
 * 模拟管理员删除用户testuser888的操作
 */

const { models } = require('./backend/config/database');
const { logUserOperation } = require('./backend/utils/operationLogger');
const { Sequelize } = require('sequelize');
const { OperationLog, User } = models;

async function testDeleteUserLog() {
  console.log('\n🧪 测试删除用户操作日志...\n');
  
  try {
    // 1. 检查操作日志表
    console.log('📊 步骤1: 检查当前操作日志数量');
    const beforeCount = await OperationLog.count();
    console.log(`   当前操作日志总数: ${beforeCount} 条\n`);
    
    // 2. 查找用户
    console.log('📊 步骤2: 查找用户 testuser888');
    let testUser = await User.findOne({
      where: { login_account: 'testuser888' }
    });
    
    if (testUser) {
      console.log(`   ✓ 找到用户: ${testUser.customer_name} (ID: ${testUser.id})\n`);
    } else {
      console.log('   ⚠️  用户不存在，创建测试用户...');
      testUser = await User.create({
        login_account: 'testuser888',
        login_password: 'test123',
        customer_name: '测试用户888',
        email: 'testuser888@test.com',
        status: 1,
        create_time: Date.now()
      });
      console.log(`   ✓ 创建成功: ${testUser.customer_name} (ID: ${testUser.id})\n`);
    }
    
    // 3. 模拟请求对象
    console.log('📊 步骤3: 模拟管理员删除请求');
    const mockReq = {
      user: {
        userId: 1,
        userName: 'admin',
        loginAccount: 'admin',
        userType: 'admin'
      },
      ip: '192.168.1.100',
      get: (header) => {
        if (header === 'user-agent') {
          return 'Mozilla/5.0 (Test Script)';
        }
        return null;
      }
    };
    
    const userId = testUser.id;
    const userName = testUser.customer_name;
    
    console.log(`   模拟删除用户: ${userName} (ID: ${userId})`);
    console.log(`   操作人: ${mockReq.user.userName} (${mockReq.user.userType})\n`);
    
    // 4. 记录删除操作日志
    console.log('📊 步骤4: 记录删除操作日志');
    await logUserOperation('删除客户', mockReq, userId, userName);
    console.log('   ✓ 操作日志已记录\n');
    
    // 5. 删除用户
    console.log('📊 步骤5: 删除用户');
    await testUser.destroy();
    console.log('   ✓ 用户已删除\n');
    
    // 6. 验证日志是否记录
    console.log('📊 步骤6: 验证操作日志');
    const afterCount = await OperationLog.count();
    console.log(`   删除前日志数: ${beforeCount} 条`);
    console.log(`   删除后日志数: ${afterCount} 条`);
    console.log(`   新增日志数: ${afterCount - beforeCount} 条\n`);
    
    // 7. 查询最新的删除日志
    console.log('📊 步骤7: 查询最新的删除日志');
    const deleteLogs = await OperationLog.findAll({
      where: {
        action: { [Sequelize.Op.like]: '%删除客户%' }
      },
      order: [['create_time', 'DESC']],
      limit: 5
    });
    
    if (deleteLogs.length > 0) {
      console.log(`   ✓ 找到 ${deleteLogs.length} 条删除日志:\n`);
      deleteLogs.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`   ${index + 1}. [${log.type}] ${log.action}`);
        console.log(`      操作者: ${log.operator} (${log.operator_type})`);
        console.log(`      描述: ${log.description}`);
        console.log(`      状态: ${log.status}`);
        console.log(`      时间: ${date.toLocaleString('zh-CN')}\n`);
      });
    } else {
      console.log('   ❌ 未找到删除日志!\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (afterCount > beforeCount) {
      console.log('✅ 测试通过: 删除用户操作已成功记录到操作日志!');
    } else {
      console.log('❌ 测试失败: 删除用户操作未记录到操作日志!');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('\n错误详情:', error.message);
    console.error('\n堆栈信息:', error.stack);
  }
  
  process.exit(0);
}

// 运行测试
testDeleteUserLog();
