const { analyzeOperatorDistribution } = require('./utils/phoneNumberAnalyzer');

// 菲律宾运营商配置
const phOperators = [
  { 
    name: 'Smart Communications', 
    marketShare: 42, 
    numberSegments: ['813', '900', '907', '908', '909', '910', '912', '918', '919', '920', '921', '928', '929', '930', '938', '939', '946', '947', '948', '949', '950', '951', '961', '962', '963', '964', '998', '999'], 
    description: '菲律宾最大的移动运营商，PLDT子公司' 
  },
  { 
    name: 'Globe Telecom', 
    marketShare: 40, 
    numberSegments: ['817', '905', '906', '915', '916', '917', '926', '927', '935', '936', '937', '945', '953', '954', '955', '956', '965', '966', '967', '975', '976', '977', '995', '996', '997'], 
    description: '菲律宾第二大运营商' 
  },
  { 
    name: 'DITO Telecommunity', 
    marketShare: 12, 
    numberSegments: ['895', '896', '897', '991', '992', '993', '994'], 
    description: '菲律宾第三大运营商，中国电信合作伙伴' 
  },
  { 
    name: 'Sun Cellular', 
    marketShare: 6, 
    numberSegments: ['922', '923', '925', '931', '932', '933', '942', '943', '952', '958', '960', '968', '969', '970', '981', '985'], 
    description: 'Smart旗下品牌' 
  }
];

// 从实际数据文件读取号码
const fs = require('fs');
const filePath = '/home/vue-element-admin/backend/uploads/customer_data/240ab79f-0cb6-46bd-8b6d-4c802dcca702.txt';

console.log('=== 菲律宾运营商分析完整测试 ===\n');

try {
  const content = fs.readFileSync(filePath, 'utf-8');
  const phoneNumbers = content.split('\n').filter(line => line.trim());
  
  console.log(`读取到 ${phoneNumbers.length} 个号码\n`);
  console.log('前10个号码样本:');
  phoneNumbers.slice(0, 10).forEach((num, i) => {
    console.log(`  ${i + 1}. ${num}`);
  });
  
  // 显示菲律宾运营商配置
  console.log('\n菲律宾运营商配置:');
  phOperators.forEach(op => {
    console.log(`  ${op.name}: ${op.numberSegments.length} 个号段`);
  });
  
  // 分析运营商分布
  console.log('\n开始分析运营商分布...\n');
  const result = analyzeOperatorDistribution(phoneNumbers, phOperators, 'PH');
  
  console.log('=== 分析结果 ===\n');
  console.log(`总数量: ${result.totalCount}`);
  console.log(`有效号码: ${result.validCount}`);
  console.log(`无效号码: ${result.invalidCount}`);
  console.log(`未匹配号码: ${result.unmatchedCount}`);
  console.log(`匹配率: ${((result.validCount - result.unmatchedCount) / result.validCount * 100).toFixed(2)}%`);
  
  console.log('\n运营商分布:');
  if (result.distribution && result.distribution.length > 0) {
    let totalMatched = 0;
    result.distribution.forEach(dist => {
      totalMatched += dist.count;
      const percentage = (dist.count / result.validCount * 100).toFixed(2);
      console.log(`\n  ${dist.name}: ${dist.count} 个号码 (${percentage}%)`);
      console.log(`    示例号码 (前5个):`);
      dist.numbers.slice(0, 5).forEach((num, i) => {
        console.log(`      ${i + 1}. ${num.original} (号段: ${num.segment})`);
      });
    });
    
    const totalPercentage = (totalMatched / result.validCount * 100).toFixed(2);
    console.log(`\n  总匹配占比: ${totalPercentage}%`);
    
    if (totalPercentage >= 99) {
      console.log('\n✅ 成功！运营商识别率达到 99% 以上！');
    } else {
      console.log(`\n⚠️  警告：匹配率为 ${totalPercentage}%，仍有 ${result.unmatchedCount} 个号码未匹配`);
    }
  } else {
    console.log('  ❌ 错误：没有识别到任何运营商数据');
  }
  
  // 统计号段分布
  console.log('\n=== 号段分布统计（前20） ===\n');
  const segmentMap = new Map();
  result.distribution.forEach(dist => {
    dist.numbers.forEach(num => {
      const count = segmentMap.get(num.segment) || 0;
      segmentMap.set(num.segment, count + 1);
    });
  });
  
  const sortedSegments = Array.from(segmentMap.entries()).sort((a, b) => b[1] - a[1]);
  sortedSegments.slice(0, 20).forEach(([segment, count]) => {
    console.log(`  ${segment}: ${count} 个`);
  });
  
} catch (error) {
  console.error('错误:', error.message);
  console.error(error.stack);
}
