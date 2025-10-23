#!/usr/bin/env node

/**
 * 自动创建考拉短信 SMPP 通道配置脚本
 * 
 * 使用方法：
 * node scripts/create-kaola-smpp-channel.js
 */

const axios = require('axios');

// 配置信息
const config = {
  // 后端API地址
  apiBaseUrl: 'http://localhost:3000',
  
  // 通道配置数据
  channelData: {
    // 基础信息
    channel_name: '考拉短信SMPP',
    protocol_type: 'smpp',
    status: 1,
    
    // SMPP 配置
    smpp_host: 'www.kaolasms.com',
    smpp_port: 7099,
    smpp_system_id: '888888',
    smpp_system_type: 'CMT',
    smpp_ton: 0,
    smpp_npi: 0,
    
    // 通用配置
    account: '888888',
    password: 'LI3pMBo',
    extno: '10690',
    api_key: '',
    daily_limit: 0,
    
    // HTTP配置（SMPP不需要，但保留空值）
    gateway_url: '',
    http_method: 'POST',
    http_headers: '',
    request_template: '',
    response_success_pattern: ''
  },
  
  // 测试发送数据
  testData: {
    phone_number: '8613800138000',
    content: 'This is a test message from Kaola SMS SMPP'
  }
};

// 创建 axios 实例
const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 主函数
async function main() {
  log('\n========================================', 'cyan');
  log('考拉短信 SMPP 通道自动配置脚本', 'cyan');
  log('========================================\n', 'cyan');
  
  try {
    // 步骤1：检查是否已存在同名通道
    logInfo('步骤 1/3: 检查是否已存在通道...');
    const existingChannels = await checkExistingChannel();
    
    if (existingChannels.length > 0) {
      logWarning(`发现已存在名为 "${config.channelData.channel_name}" 的通道`);
      existingChannels.forEach((channel, index) => {
        log(`  ${index + 1}. ID: ${channel.id}, 协议: ${channel.protocol_type.toUpperCase()}, 状态: ${channel.status === 1 ? '启用' : '禁用'}`, 'yellow');
      });
      
      logWarning('如需重新创建，请先删除现有通道或修改通道名称');
      process.exit(0);
    }
    
    logSuccess('未发现重复通道，可以继续创建');
    
    // 步骤2：创建通道
    logInfo('\n步骤 2/3: 创建 SMPP 通道...');
    const channelId = await createChannel();
    logSuccess(`通道创建成功！通道 ID: ${channelId}`);
    
    // 步骤3：测试发送
    logInfo('\n步骤 3/3: 执行测试发送...');
    logWarning('跳过测试发送（需要真实的SMPP连接）');
    logInfo('请在系统界面中手动测试发送');
    
    // 显示配置摘要
    displaySummary(channelId);
    
    log('\n========================================', 'cyan');
    logSuccess('通道配置完成！');
    log('========================================\n', 'cyan');
    
  } catch (error) {
    logError('\n配置过程中发生错误：');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

// 检查是否存在同名通道
async function checkExistingChannel() {
  try {
    const response = await api.get('/api/sms/admin/channels');
    const channels = response.data.data || [];
    
    // 查找同名通道
    return channels.filter(channel => 
      channel.channel_name === config.channelData.channel_name
    );
  } catch (error) {
    logWarning('无法检查现有通道（可能是服务未启动）');
    return [];
  }
}

// 创建通道
async function createChannel() {
  try {
    const response = await api.post('/api/sms/admin/channels', config.channelData);
    
    if (response.data.success || response.data.code === 200 || response.data.code === 20000) {
      return response.data.data?.id || response.data.data;
    } else {
      throw new Error(response.data.message || '创建失败');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.data.message || error.response.statusText}`);
    }
    throw error;
  }
}

// 显示配置摘要
function displaySummary(channelId) {
  log('\n┌─────────────────────────────────────┐', 'cyan');
  log('│      通道配置摘要                   │', 'cyan');
  log('└─────────────────────────────────────┘\n', 'cyan');
  
  log('基础信息：', 'bright');
  log(`  通道 ID:        ${channelId}`);
  log(`  通道名称:       ${config.channelData.channel_name}`);
  log(`  协议类型:       ${config.channelData.protocol_type.toUpperCase()}`);
  log(`  状态:           ${config.channelData.status === 1 ? '启用' : '禁用'}`);
  
  log('\nSMPP 配置：', 'bright');
  log(`  服务器地址:     ${config.channelData.smpp_host}`);
  log(`  服务器端口:     ${config.channelData.smpp_port}`);
  log(`  系统 ID:        ${config.channelData.smpp_system_id}`);
  log(`  系统类型:       ${config.channelData.smpp_system_type}`);
  log(`  TON:            ${config.channelData.smpp_ton}`);
  log(`  NPI:            ${config.channelData.smpp_npi}`);
  
  log('\n认证信息：', 'bright');
  log(`  账号:           ${config.channelData.account}`);
  log(`  密码:           ${config.channelData.password.replace(/./g, '*')}`);
  log(`  接入码:         ${config.channelData.extno}`);
  
  log('\n限额设置：', 'bright');
  log(`  每日限额:       ${config.channelData.daily_limit === 0 ? '不限制' : config.channelData.daily_limit}`);
  
  log('\n后续步骤：', 'yellow');
  log('  1. 登录系统，进入 短信管理 → 通道管理');
  log('  2. 找到 "考拉短信SMPP" 通道');
  log('  3. 点击 "测试" 按钮，测试发送');
  log('  4. 点击 "国家定价" 按钮，配置各国家定价');
  log('  5. 验证通道状态和发送成功率\n');
}

// 运行主函数
main().catch(error => {
  logError('脚本执行失败');
  console.error(error);
  process.exit(1);
});
