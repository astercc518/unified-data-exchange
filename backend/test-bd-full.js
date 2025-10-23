const { analyzeOperatorDistribution } = require('./utils/phoneNumberAnalyzer');

// 孟加拉运营商配置
const bdOperators = [
  { 
    name: 'Grameenphone', 
    marketShare: 46, 
    numberSegments: ['17', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '13', '130', '131', '132', '133', '19', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199'], 
    description: '孟加拉国最大的移动运营商' 
  },
  { 
    name: 'Robi', 
    marketShare: 29, 
    numberSegments: ['18', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'], 
    description: '孟加拉国第二大运营商' 
  },
  { 
    name: 'Banglalink', 
    marketShare: 20, 
    numberSegments: ['14', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '16', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169'], 
    description: '孟加拉国第三大运营商' 
  },
  { 
    name: 'Teletalk', 
    marketShare: 5, 
    numberSegments: ['15', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159'], 
    description: '孟加拉国国有运营商' 
  }
];

// 从实际数据文件读取测试号码
const fs = require('fs');
const filePath = '/home/vue-element-admin/backend/uploads/customer_data/cb0a55fb-d5d5-4d91-8c17-09c4a9de4371.txt';

console.log('=== 孟加拉运营商分析完整测试 ===\n');

try {
  // 读取前100个号码进行测试
  const content = fs.readFileSync(filePath, 'utf-8');
  const phoneNumbers = content.split('\n').filter(line => line.trim()).slice(0, 100);
  
  console.log(`读取到 ${phoneNumbers.length} 个号码\n`);
  console.log('前10个号码样本:');
  phoneNumbers.slice(0, 10).forEach((num, i) => {
    console.log(`  ${i + 1}. ${num}`);
  });
  
  // 显示孟加拉运营商配置
  console.log('\n孟加拉运营商配置:');
  bdOperators.forEach(op => {
    console.log(`  ${op.name}: ${op.numberSegments.slice(0, 5).join(', ')}...`);
  });
  
  // 分析运营商分布
  console.log('\n开始分析运营商分布...\n');
  const result = analyzeOperatorDistribution(phoneNumbers, bdOperators, 'BD');
  
  console.log('=== 分析结果 ===\n');
  console.log(`总数量: ${result.totalCount}`);
  console.log(`有效号码: ${result.validCount}`);
  console.log(`无效号码: ${result.invalidCount}`);
  console.log(`未匹配号码: ${result.unmatchedCount}`);
  
  console.log('\n运营商分布:');
  if (result.distribution && result.distribution.length > 0) {
    result.distribution.forEach(dist => {
      console.log(`\n  ${dist.name}: ${dist.count} 个号码`);
      console.log(`    示例号码 (前5个):`);
      dist.numbers.slice(0, 5).forEach((num, i) => {
        console.log(`      ${i + 1}. ${num.original} (号段: ${num.segment})`);
      });
    });
    
    console.log('\n✅ 成功！运营商识别正常！');
  } else {
    console.log('  ❌ 错误：没有识别到任何运营商数据');
  }
  
  // 统计号段分布
  console.log('\n=== 号段分布统计 ===\n');
  const segmentMap = new Map();
  result.distribution.forEach(dist => {
    dist.numbers.forEach(num => {
      const count = segmentMap.get(num.segment) || 0;
      segmentMap.set(num.segment, count + 1);
    });
  });
  
  const sortedSegments = Array.from(segmentMap.entries()).sort((a, b) => b[1] - a[1]);
  sortedSegments.forEach(([segment, count]) => {
    console.log(`  ${segment}: ${count} 个`);
  });
  
} catch (error) {
  console.error('错误:', error.message);
  console.error(error.stack);
}
