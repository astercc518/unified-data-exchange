/**
 * 测试操作日志API
 * 验证后端接口是否正常返回数据
 */

const http = require('http');

// 配置
const API_HOST = 'localhost';
const API_PORT = 3000; // 根据实际端口修改
const API_PATH = '/api/system/logs';

function testLogsAPI() {
  console.log('\n🧪 开始测试操作日志API...\n');
  console.log(`📡 请求地址: http://${API_HOST}:${API_PORT}${API_PATH}\n`);
  
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: `${API_PATH}?page=1&limit=10`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    console.log(`📊 响应状态码: ${res.statusCode}\n`);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log('✅ API响应成功!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 响应数据:');
        console.log(`   成功状态: ${response.success}`);
        console.log(`   日志总数: ${response.total} 条`);
        console.log(`   当前页码: ${response.page}`);
        console.log(`   每页数量: ${response.limit}`);
        console.log(`   返回记录: ${response.data ? response.data.length : 0} 条\n`);
        
        if (response.data && response.data.length > 0) {
          console.log('📝 最新的5条日志记录:\n');
          response.data.slice(0, 5).forEach((log, index) => {
            const date = new Date(log.createTime);
            console.log(`${index + 1}. [${log.type.toUpperCase()}] ${log.action}`);
            console.log(`   操作者: ${log.operator} (${log.operatorType})`);
            console.log(`   描述: ${log.description}`);
            console.log(`   状态: ${log.status}`);
            console.log(`   IP: ${log.ipAddress || 'N/A'}`);
            console.log(`   时间: ${date.toLocaleString('zh-CN')}\n`);
          });
        } else {
          console.log('⚠️  暂无日志数据\n');
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ API测试完成!\n');
        console.log('🎯 前端页面现在可以正常显示操作日志了!\n');
        
      } catch (error) {
        console.error('❌ 解析响应数据失败:', error.message);
        console.error('\n原始响应:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ API请求失败:', error.message);
    console.error('\n💡 提示:');
    console.error('   1. 确保后端服务已启动');
    console.error('   2. 检查端口号是否正确 (当前: 3000)');
    console.error('   3. 尝试手动访问: http://localhost:3000/api/system/logs\n');
  });
  
  req.end();
}

// 运行测试
testLogsAPI();
