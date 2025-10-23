/**
 * 通用国家配置验证工具
 * 验证operators.js中的配置是否能达到100%匹配率
 * 
 * 用法: node tools/verify-country-config.js <国家代码> <数据文件路径>
 * 示例: node tools/verify-country-config.js TH thailand.txt
 */

const fs = require('fs');
const path = require('path');
const { parsePhoneNumber } = require('awesome-phonenumber');
const { getOperatorsByCountry } = require('../../src/data/operators.js');

// 国家名称映射
const countryNames = {
  'TH': '泰国', 'MY': '马来西亚', 'IN': '印度', 'PK': '巴基斯坦',
  'GB': '英国', 'KR': '韩国', 'LK': '斯里兰卡', 'NP': '尼泊尔',
  'LA': '老挝', 'AF': '阿富汗', 'IR': '伊朗', 'IQ': '伊拉克',
  'SA': '沙特', 'IL': '以色列', 'KZ': '哈萨克斯坦', 'UZ': '乌兹别克斯坦',
  'PL': '波兰', 'RO': '罗马尼亚', 'BE': '比利时', 'PT': '葡萄牙',
  'CZ': '捷克', 'HU': '匈牙利', 'SE': '瑞典', 'NO': '挪威',
  'DK': '丹麦', 'FI': '芬兰', 'CH': '瑞士', 'AT': '奥地利',
  'AR': '阿根廷', 'VE': '委内瑞拉', 'EG': '埃及', 'ZA': '南非',
  'UG': '乌干达', 'TZ': '坦桑尼亚', 'NZ': '新西兰'
};

// 解析命令行参数
const countryCode = process.argv[2];
const filePath = process.argv[3];

if (!countryCode || !filePath) {
  console.log('❌ 参数不足\n');
  console.log('用法: node verify-country-config.js <国家代码> <数据文件路径>');
  console.log('\n示例:');
  console.log('  node tools/verify-country-config.js TH thailand.txt');
  console.log('  node tools/verify-country-config.js MY /path/to/malaysia-data.txt');
  process.exit(1);
}

const countryName = countryNames[countryCode] || countryCode;

console.log(`========== ${countryName}（${countryCode}）运营商配置验证 ==========\n`);

// 获取运营商配置
const operators = getOperatorsByCountry(countryCode);
if (!operators || operators.length === 0) {
  console.log(`❌ 未找到${countryName}的运营商配置`);
  console.log('请先在 /home/vue-element-admin/src/data/operators.js 中添加配置');
  process.exit(1);
}

console.log(`📋 当前配置的运营商（${operators.length}个）：`);
operators.forEach((op, index) => {
  console.log(`  ${index + 1}. ${op.name}: ${op.numberSegments.length}个号段`);
  if (op.marketShare) {
    console.log(`     市场份额: ${op.marketShare}%`);
  }
});
console.log('');

// 检查文件
if (!fs.existsSync(filePath)) {
  console.log(`❌ 文件不存在: ${filePath}`);
  process.exit(1);
}

// 读取测试数据
const content = fs.readFileSync(filePath, 'utf-8');
const phoneNumbers = content.split('\n').filter(line => line.trim());

console.log(`📊 测试数据: ${phoneNumbers.length.toLocaleString()} 条\n`);
console.log('正在验证匹配情况...\n');

// 分析匹配情况
const distribution = operators.map(op => ({
  name: op.name,
  numberSegments: op.numberSegments,
  marketShare: op.marketShare,
  count: 0,
  numbers: []
}));

let validCount = 0;
let invalidCount = 0;
let unmatchedCount = 0;
const unmatchedSamples = [];
const unmatchedSegments = new Map();

phoneNumbers.forEach((phone, index) => {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return;
  
  const pn = parsePhoneNumber(cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone);
  
  if (!pn.valid || pn.regionCode !== countryCode) {
    invalidCount++;
    return;
  }
  
  validCount++;
  const significant = pn.number.significant;
  
  // 尝试匹配运营商（从4位到1位）
  let matched = false;
  let matchedSegment = null;
  
  for (let len = 4; len >= 1; len--) {
    const segment = significant.substring(0, len);
    
    for (const op of distribution) {
      if (op.numberSegments.includes(segment)) {
        op.count++;
        matched = true;
        matchedSegment = segment;
        break;
      }
    }
    
    if (matched) break;
  }
  
  if (!matched) {
    unmatchedCount++;
    
    // 记录未匹配的号段
    const seg2 = significant.substring(0, 2);
    const seg3 = significant.substring(0, 3);
    
    if (!unmatchedSegments.has(seg2)) {
      unmatchedSegments.set(seg2, 0);
    }
    unmatchedSegments.set(seg2, unmatchedSegments.get(seg2) + 1);
    
    if (unmatchedSamples.length < 20) {
      unmatchedSamples.push({
        original: cleanPhone,
        significant: significant,
        segment2: seg2,
        segment3: seg3
      });
    }
  }
  
  // 显示进度
  if ((index + 1) % 1000 === 0) {
    process.stdout.write(`\r已验证: ${(index + 1).toLocaleString()} 条...`);
  }
});

console.log(`\r已验证: ${phoneNumbers.length.toLocaleString()} 条 ✓\n`);

// 显示结果
console.log('========== 验证结果 ==========\n');

console.log(`总数据量: ${phoneNumbers.length.toLocaleString()}`);
console.log(`有效${countryName}号码: ${validCount.toLocaleString()}`);
console.log(`无效/其他国家号码: ${invalidCount.toLocaleString()}`);
console.log(`已匹配: ${(validCount - unmatchedCount).toLocaleString()} 条`);
console.log(`未匹配: ${unmatchedCount.toLocaleString()} 条`);

const matchRate = validCount > 0 ? ((validCount - unmatchedCount) / validCount * 100).toFixed(2) : 0;
console.log(`\n📊 匹配率: ${matchRate}%`);

if (matchRate === '100.00') {
  console.log('✅ 匹配率达到100%，配置完美！\n');
} else {
  console.log(`⚠️  匹配率未达到100%，还有${unmatchedCount}条未匹配\n`);
}

// 运营商分布
console.log('========== 运营商分布 ==========\n');

const sortedDistribution = distribution
  .filter(op => op.count > 0)
  .sort((a, b) => b.count - a.count);

sortedDistribution.forEach((op, index) => {
  const percent = ((op.count / validCount) * 100).toFixed(2);
  const bar = '█'.repeat(Math.floor(parseFloat(percent) / 2));
  
  console.log(`${(index + 1).toString().padStart(2)}. ${op.name.padEnd(25)}: ${op.count.toLocaleString().padStart(8)}条 (${percent.padStart(6)}%) ${bar}`);
  
  if (op.marketShare) {
    const expectedCount = Math.round(validCount * op.marketShare / 100);
    const diff = op.count - expectedCount;
    const diffPercent = ((diff / expectedCount) * 100).toFixed(1);
    
    if (Math.abs(parseFloat(diffPercent)) > 20) {
      console.log(`      预期: ${expectedCount.toLocaleString()}条 (${op.marketShare}%), 偏差: ${diff > 0 ? '+' : ''}${diffPercent}%`);
    }
  }
});

// 显示未匹配的情况
if (unmatchedCount > 0) {
  console.log('\n========== 未匹配分析 ==========\n');
  
  // 按号段统计
  const sortedUnmatched = Array.from(unmatchedSegments.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  console.log('未匹配号段分布（前10个）：');
  sortedUnmatched.forEach(([segment, count], index) => {
    const percent = ((count / unmatchedCount) * 100).toFixed(1);
    console.log(`  ${(index + 1).toString().padStart(2)}. ${segment}: ${count.toLocaleString()}条 (${percent}%)`);
  });
  
  console.log('\n未匹配样本（前10个）：');
  unmatchedSamples.slice(0, 10).forEach((sample, i) => {
    console.log(`  ${i + 1}. ${sample.original}`);
    console.log(`     本地号码: ${sample.significant}, 2位前缀: ${sample.segment2}, 3位前缀: ${sample.segment3}`);
  });
  
  console.log('\n💡 建议：');
  console.log('  1. 将以上高频未匹配号段添加到对应运营商的 numberSegments 中');
  console.log('  2. 如果不确定归属，可以创建新运营商或归入"其他运营商"');
  console.log('  3. 重新运行验证，直到匹配率达到100%');
  console.log('');
  console.log('  建议添加的号段（JSON格式）：');
  console.log('  ' + JSON.stringify(sortedUnmatched.map(([seg]) => seg)));
}

// 保存验证结果
const outputDir = path.join(__dirname, '..', 'verification-results');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const result = {
  country: countryName,
  countryCode: countryCode,
  verificationDate: new Date().toISOString().split('T')[0],
  dataSource: path.basename(filePath),
  statistics: {
    totalNumbers: phoneNumbers.length,
    validNumbers: validCount,
    invalidNumbers: invalidCount,
    matchedNumbers: validCount - unmatchedCount,
    unmatchedNumbers: unmatchedCount,
    matchRate: matchRate + '%'
  },
  operatorDistribution: sortedDistribution.map(op => ({
    name: op.name,
    count: op.count,
    percentage: ((op.count / validCount) * 100).toFixed(2) + '%',
    marketShare: op.marketShare ? op.marketShare + '%' : null
  })),
  unmatchedSegments: sortedUnmatched.map(([segment, count]) => ({
    segment,
    count,
    percentage: ((count / unmatchedCount) * 100).toFixed(2) + '%'
  })),
  success: matchRate === '100.00'
};

const outputFile = path.join(outputDir, `${countryCode.toLowerCase()}-verification-${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

console.log(`📄 验证结果已保存到: ${outputFile}\n`);

// 退出码
process.exit(matchRate === '100.00' ? 0 : 1);
