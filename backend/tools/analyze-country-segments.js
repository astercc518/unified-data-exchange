/**
 * 通用国家号段分析工具
 * 用法: node tools/analyze-country-segments.js <国家代码> <数据文件路径>
 * 示例: node tools/analyze-country-segments.js TH /path/to/thailand-data.txt
 */

const fs = require('fs');
const path = require('path');
const { parsePhoneNumber } = require('awesome-phonenumber');

// 国家名称映射
const countryNames = {
  'TH': '泰国',
  'MY': '马来西亚',
  'IN': '印度',
  'PK': '巴基斯坦',
  'GB': '英国',
  'KR': '韩国',
  'LK': '斯里兰卡',
  'NP': '尼泊尔',
  'LA': '老挝',
  'AF': '阿富汗',
  'IR': '伊朗',
  'IQ': '伊拉克',
  'SA': '沙特',
  'IL': '以色列',
  'KZ': '哈萨克斯坦',
  'UZ': '乌兹别克斯坦',
  'PL': '波兰',
  'RO': '罗马尼亚',
  'BE': '比利时',
  'PT': '葡萄牙',
  'CZ': '捷克',
  'HU': '匈牙利',
  'SE': '瑞典',
  'NO': '挪威',
  'DK': '丹麦',
  'FI': '芬兰',
  'CH': '瑞士',
  'AT': '奥地利',
  'AR': '阿根廷',
  'VE': '委内瑞拉',
  'EG': '埃及',
  'ZA': '南非',
  'UG': '乌干达',
  'TZ': '坦桑尼亚',
  'NZ': '新西兰'
};

// 解析命令行参数
const countryCode = process.argv[2];
const filePath = process.argv[3];

if (!countryCode || !filePath) {
  console.log('❌ 参数不足\n');
  console.log('用法: node analyze-country-segments.js <国家代码> <数据文件路径>');
  console.log('\n示例:');
  console.log('  node tools/analyze-country-segments.js TH thailand.txt');
  console.log('  node tools/analyze-country-segments.js MY /path/to/malaysia-data.txt');
  console.log('\n支持的国家代码: TH, MY, IN, PK, GB, KR, LK, NP, LA, 等35个国家');
  process.exit(1);
}

const countryName = countryNames[countryCode] || countryCode;

console.log(`========== ${countryName}（${countryCode}）运营商号段分析 ==========\n`);

// 检查文件是否存在
if (!fs.existsSync(filePath)) {
  console.log(`❌ 文件不存在: ${filePath}`);
  process.exit(1);
}

// 读取数据文件
const content = fs.readFileSync(filePath, 'utf-8');
const phoneNumbers = content.split('\n').filter(line => line.trim());

console.log(`📊 总数据量: ${phoneNumbers.length.toLocaleString()} 条\n`);

if (phoneNumbers.length < 1000) {
  console.log('⚠️  警告：数据量少于1000条，可能影响分析准确性');
  console.log('   建议：至少提供5,000条数据\n');
}

// 提取号段前缀
const segmentMap = new Map();
let validCount = 0;
let invalidCount = 0;
const invalidSamples = [];

console.log('正在分析号段分布...\n');

phoneNumbers.forEach((phone, index) => {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return;
  
  const pn = parsePhoneNumber(cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone);
  
  if (!pn.valid || pn.regionCode !== countryCode) {
    invalidCount++;
    if (invalidSamples.length < 5) {
      invalidSamples.push({
        original: cleanPhone,
        reason: !pn.valid ? '无效号码' : `国家不匹配(${pn.regionCode})`
      });
    }
    return;
  }
  
  validCount++;
  const significant = pn.number.significant; // 本地号码（去掉国码）
  
  // 提取不同长度的号段（1-4位）
  for (let len = 1; len <= 4; len++) {
    const segment = significant.substring(0, len);
    if (!segmentMap.has(segment)) {
      segmentMap.set(segment, new Set());
    }
    segmentMap.get(segment).add(cleanPhone);
  }
  
  // 显示进度（每1000条）
  if ((index + 1) % 1000 === 0) {
    process.stdout.write(`\r已处理: ${(index + 1).toLocaleString()} 条...`);
  }
});

console.log(`\r已处理: ${phoneNumbers.length.toLocaleString()} 条 ✓\n`);

console.log(`✅ 有效${countryName}号码: ${validCount.toLocaleString()} 条 (${((validCount / phoneNumbers.length) * 100).toFixed(1)}%)`);
console.log(`❌ 无效/非${countryName}号码: ${invalidCount.toLocaleString()} 条 (${((invalidCount / phoneNumbers.length) * 100).toFixed(1)}%)\n`);

if (invalidSamples.length > 0) {
  console.log('无效号码样本（前5个）：');
  invalidSamples.forEach((sample, i) => {
    console.log(`  ${i + 1}. ${sample.original} - ${sample.reason}`);
  });
  console.log('');
}

// 分析号段分布
console.log('========== 号段分布分析 ==========\n');

const analysisResult = {};

for (let len = 1; len <= 4; len++) {
  const segments = Array.from(segmentMap.keys()).filter(s => s.length === len);
  const sortedSegments = segments.sort((a, b) => 
    segmentMap.get(b).size - segmentMap.get(a).size
  );
  
  analysisResult[`${len}digit`] = sortedSegments.map(seg => ({
    segment: seg,
    count: segmentMap.get(seg).size,
    percent: ((segmentMap.get(seg).size / validCount) * 100).toFixed(2)
  }));
  
  console.log(`${len}位号段（共${sortedSegments.length}个）：`);
  
  const displayCount = len <= 2 ? sortedSegments.length : Math.min(20, sortedSegments.length);
  
  sortedSegments.slice(0, displayCount).forEach((seg, index) => {
    const count = segmentMap.get(seg).size;
    const percent = ((count / validCount) * 100).toFixed(2);
    const bar = '█'.repeat(Math.floor(percent / 2));
    console.log(`  ${(index + 1).toString().padStart(2)}. ${seg.padEnd(4)} : ${count.toLocaleString().padStart(8)}条 (${percent.padStart(6)}%) ${bar}`);
  });
  
  if (sortedSegments.length > displayCount) {
    console.log(`  ... 还有${sortedSegments.length - displayCount}个号段`);
  }
  
  console.log('');
}

// 生成配置建议
console.log('========== 配置建议 ==========\n');

// 根据号段长度特征推荐
let recommendedLength = 2; // 默认2位
const segmentLengths = [1, 2, 3, 4];
const lengthCounts = segmentLengths.map(len => 
  Array.from(segmentMap.keys()).filter(s => s.length === len).length
);

// 如果4位号段很多，可能是特殊格式
if (lengthCounts[3] > 20) {
  recommendedLength = 4;
} else if (lengthCounts[2] > 10) {
  recommendedLength = 3;
} else if (lengthCounts[1] > 5) {
  recommendedLength = 2;
} else {
  recommendedLength = 1;
}

const recommendedSegments = Array.from(segmentMap.keys())
  .filter(s => s.length === recommendedLength)
  .sort((a, b) => segmentMap.get(b).size - segmentMap.get(a).size);

console.log(`推荐使用${recommendedLength}位号段（共${recommendedSegments.length}个）：`);
console.log(JSON.stringify(recommendedSegments, null, 2));

console.log('\n📋 可以复制到 operators.js 中：');
console.log('─'.repeat(60));
console.log(`numberSegments: ${JSON.stringify(recommendedSegments)}`);
console.log('─'.repeat(60));

// 保存分析结果
const outputDir = path.join(__dirname, '..', 'analysis-results');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const result = {
  country: countryName,
  countryCode: countryCode,
  analysisDate: new Date().toISOString().split('T')[0],
  dataSource: path.basename(filePath),
  statistics: {
    totalNumbers: phoneNumbers.length,
    validNumbers: validCount,
    invalidNumbers: invalidCount,
    validityRate: ((validCount / phoneNumbers.length) * 100).toFixed(2) + '%'
  },
  segments: analysisResult,
  recommendation: {
    segmentLength: recommendedLength,
    segments: recommendedSegments
  }
};

const outputFile = path.join(outputDir, `${countryCode.toLowerCase()}-segments-analysis.json`);
fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

console.log(`\n📄 详细结果已保存到: ${outputFile}`);

// 生成处理建议
console.log('\n========== 下一步操作 ==========\n');
console.log('1. 根据上面的号段列表和官方资料，将号段分配给各运营商');
console.log('2. 更新 /home/vue-element-admin/src/data/operators.js 中的配置');
console.log('3. 运行验证脚本确认匹配率达到100%：');
console.log(`   node tools/verify-country-config.js ${countryCode} ${filePath}`);
console.log('');
console.log('💡 提示：如果不确定号段归属，可以按号段使用量分配给市场份额较大的运营商');
console.log('');
