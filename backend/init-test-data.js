/**
 * 初始化测试数据脚本
 * 创建admin、agent01和customer01测试账号
 */
const { models, sequelize } = require('./config/database');
const logger = require('./utils/logger');

const { User, Agent } = models;

async function initTestData() {
  try {
    logger.info('🚀 开始初始化测试数据...');
    
    // 同步数据库模型（确保表存在）
    await sequelize.sync({ alter: true });
    logger.info('✅ 数据库模型同步完成');
    
    // 1. 创建admin超级管理员账号
    const existingAdmin = await Agent.findOne({ where: { login_account: 'admin' } });
    if (!existingAdmin) {
      await Agent.create({
        agent_name: '超级管理员',
        login_account: 'admin',
        login_password: '111111',
        agent_code: 'ADMIN001',
        email: 'admin@system.com',
        level: 'super',
        commission: 0,
        status: 1,
        create_time: Date.now()
      });
      logger.info('✅ Admin账号创建成功 (账号: admin, 密码: 111111)');
    } else {
      logger.info('ℹ️ Admin账号已存在');
    }
    
    // 2. 创建agent01销售代理账号
    let agent01 = await Agent.findOne({ where: { login_account: 'agent01' } });
    if (!agent01) {
      agent01 = await Agent.create({
        agent_name: '张三代理',
        login_account: 'agent01',
        login_password: '123456',
        agent_code: 'AG001',
        email: 'agent01@example.com',
        level: 'gold',
        commission: 10,
        status: 1,
        create_time: Date.now()
      });
      logger.info('✅ Agent01账号创建成功 (账号: agent01, 密码: 123456)');
    } else {
      logger.info('ℹ️ Agent01账号已存在');
    }
    
    // 3. 创建agent02销售代理账号
    let agent02 = await Agent.findOne({ where: { login_account: 'agent02' } });
    if (!agent02) {
      agent02 = await Agent.create({
        agent_name: '李四代理',
        login_account: 'agent02',
        login_password: '123456',
        agent_code: 'AG002',
        email: 'agent02@example.com',
        level: 'silver',
        commission: 8,
        status: 1,
        create_time: Date.now()
      });
      logger.info('✅ Agent02账号创建成功 (账号: agent02, 密码: 123456)');
    } else {
      logger.info('ℹ️ Agent02账号已存在');
    }
    
    // 4. 创建customer01客户账号（属于agent01）
    const existingCustomer01 = await User.findOne({ where: { login_account: 'customer01' } });
    if (!existingCustomer01) {
      await User.create({
        customer_name: '客户王五',
        login_account: 'customer01',
        login_password: '123456',
        customer_code: 'CU001',
        email: 'customer01@example.com',
        agent_id: agent01.id,
        status: 1,
        create_time: Date.now()
      });
      logger.info('✅ Customer01账号创建成功 (账号: customer01, 密码: 123456, 归属: agent01)');
    } else {
      logger.info('ℹ️ Customer01账号已存在');
    }
    
    // 5. 创建customer02客户账号（属于agent02）
    const existingCustomer02 = await User.findOne({ where: { login_account: 'customer02' } });
    if (!existingCustomer02) {
      await User.create({
        customer_name: '客户赵六',
        login_account: 'customer02',
        login_password: '123456',
        customer_code: 'CU002',
        email: 'customer02@example.com',
        agent_id: agent02.id,
        status: 1,
        create_time: Date.now()
      });
      logger.info('✅ Customer02账号创建成功 (账号: customer02, 密码: 123456, 归属: agent02)');
    } else {
      logger.info('ℹ️ Customer02账号已存在');
    }
    
    logger.info('');
    logger.info('🎉 测试数据初始化完成！');
    logger.info('');
    logger.info('📋 测试账号列表：');
    logger.info('1. 超级管理员: admin / 111111');
    logger.info('2. 销售代理1: agent01 / 123456');
    logger.info('3. 销售代理2: agent02 / 123456');
    logger.info('4. 客户1: customer01 / 123456 (归属: agent01)');
    logger.info('5. 客户2: customer02 / 123456 (归属: agent02)');
    logger.info('');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ 初始化测试数据失败:', error);
    process.exit(1);
  }
}

// 执行初始化
initTestData();
