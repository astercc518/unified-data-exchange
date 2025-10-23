const { analyzeOperatorDistribution } = require('./utils/phoneNumberAnalyzer');

// 印尼运营商配置
const idOperators = [
  { 
    name: 'Telkomsel', 
    marketShare: 42, 
    numberSegments: ['811', '812', '813', '821', '822', '823', '852', '853', '851'], 
    description: '印尼最大的移动运营商' 
  },
  { 
    name: 'Indosat Ooredoo', 
    marketShare: 25, 
    numberSegments: ['814', '815', '816', '855', '856', '857', '858'], 
    description: '印尼第二大运营商' 
  },
  { 
    name: 'XL Axiata', 
    marketShare: 20, 
    numberSegments: ['817', '818', '819', '859', '877', '878'], 
    description: '马来西亚Axiata在印尼的子公司' 
  },
  { 
    name: '3 (Tri)', 
    marketShare: 13, 
    numberSegments: ['895', '896', '897', '898', '899', '889'], 
    description: '印尼第四大移动运营商' 
  }
];

// 从实际数据文件读取测试号码
const fs = require('fs');
const filePath = '/home/vue-element-admin/backend/uploads/customer_data/77b8da88-2408-4ed8-87c5-b165d945b1b9.txt';

console.log('=== 印尼运营商分析完整测试 ===\n');

try {
  // 读取前100个号码进行测试
  const content = fs.readFileSync(filePath, 'utf-8');
  const phoneNumbers = content.split('\n').filter(line => line.trim()).slice(0, 100);
  
  console.log(`读取到 ${phoneNumbers.length} 个号码\n`);
  console.log('前10个号码样本:');
  phoneNumbers.slice(0, 10).forEach((num, i) => {
    console.log(`  ${i + 1}. ${num}`);
  });
  
  // 显示印尼运营商配置
  console.log('\n印尼运营商配置:');
  idOperators.forEach(op => {
    console.log(`  ${op.name}: ${op.numberSegments.slice(0, 5).join(', ')}...`);
  });
  
  // 分析运营商分布
  console.log('\n开始分析运营商分布...\n');
  const result = analyzeOperatorDistribution(phoneNumbers, idOperators, 'ID');
  
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
