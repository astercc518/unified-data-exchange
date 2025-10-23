/**
 * 查询创建代理KL05的操作日志
 * 用于验证日志是否已记录到数据库
 */

const { models, sequelize } = require('./backend/config/database');
const { OperationLog } = models;
const { Op } = require('sequelize');

async function queryCreateAgentLog() {
  console.log('\n🔍 查询创建代理KL05的操作日志...\n');
  
  try {
    // 查询包含KL05的所有日志
    const logsWithKL05 = await OperationLog.findAll({
      where: {
        description: {
          [Op.like]: '%KL05%'
        }
      },
      order: [['create_time', 'DESC']],
      limit: 20
    });
    
    console.log(`📊 找到 ${logsWithKL05.length} 条包含"KL05"的日志记录:\n`);
    
    if (logsWithKL05.length > 0) {
      logsWithKL05.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`${index + 1}. [ID: ${log.id}] ${log.action}`);
        console.log(`   操作人: ${log.operator} (${log.operator_type})`);
        console.log(`   描述: ${log.description}`);
        console.log(`   状态: ${log.status}`);
        console.log(`   IP: ${log.ip_address || '无'}`);
        console.log(`   时间: ${date.toLocaleString('zh-CN')}`);
        console.log('');
      });
    } else {
      console.log('❌ 没有找到包含"KL05"的日志记录');
    }
    
    console.log('\n---\n');
    
    // 查询最近的创建代理日志
    const recentCreateLogs = await OperationLog.findAll({
      where: {
        action: '创建代理'
      },
      order: [['create_time', 'DESC']],
      limit: 10
    });
    
    console.log(`📋 最近10条"创建代理"操作日志:\n`);
    
    if (recentCreateLogs.length > 0) {
      recentCreateLogs.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`${index + 1}. [ID: ${log.id}] ${log.action}`);
        console.log(`   操作人: ${log.operator} (${log.operator_type})`);
        console.log(`   描述: ${log.description}`);
        console.log(`   时间: ${date.toLocaleString('zh-CN')}`);
        console.log('');
      });
    } else {
      console.log('❌ 没有找到任何"创建代理"日志记录');
    }
    
    console.log('\n---\n');
    
    // 查询所有operator为unknown的日志
    const unknownOperatorLogs = await OperationLog.findAll({
      where: {
        operator: 'unknown'
      },
      order: [['create_time', 'DESC']],
      limit: 10
    });
    
    console.log(`⚠️  最近10条操作人为"unknown"的日志:\n`);
    
    if (unknownOperatorLogs.length > 0) {
      unknownOperatorLogs.forEach((log, index) => {
        const date = new Date(log.create_time);
        console.log(`${index + 1}. [ID: ${log.id}] ${log.action}`);
        console.log(`   操作人: ${log.operator} (${log.operator_type})`);
        console.log(`   描述: ${log.description}`);
        console.log(`   时间: ${date.toLocaleString('zh-CN')}`);
        console.log('');
      });
      console.log('💡 提示: 如果找到相关日志但operator为unknown,说明认证信息未正确传递');
    } else {
      console.log('✅ 没有找到操作人为"unknown"的日志');
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

queryCreateAgentLog();
