/**
 * 运营商号段前导0问题分析脚本
 * 扫描所有国家配置，识别存在前导0的号段
 */

const fs = require('fs');

// 读取 operators.js 的内容
const content = fs.readFileSync('/home/vue-element-admin/src/data/operators.js', 'utf-8');

// 提取所有国家的运营商配置
const countryPattern = /'([A-Z]{2})':\s*\{[\s\S]*?operators:\s*\[([\s\S]*?)\]\s*\}/g;
const segmentPattern = /numberSegments:\s*\[([^\]]+)\]/g;

const issues = [];
let match;

while ((match = countryPattern.exec(content)) !== null) {
  const countryCode = match[1];
  const operatorBlock = match[0];
  
  // 跳过已修复的国家
  if (['BD', 'ID'].includes(countryCode)) {
    console.log(`✅ ${countryCode}: 已修复`);
    continue;
  }
  
  // 提取号段
  const segments = [];
  let segMatch;
  while ((segMatch = segmentPattern.exec(operatorBlock)) !== null) {
    const segmentStr = segMatch[1];
    // 提取所有号段
    const segs = segmentStr.match(/'([^']+)'/g);
    if (segs) {
      segs.forEach(s => {
        const clean = s.replace(/'/g, '');
        segments.push(clean);
      });
    }
  }
  
  // 检查是否有前导0的号段
  const hasLeadingZero = segments.some(seg => {
    // 检查号段是否以0开头且长度大于1
    return seg.startsWith('0') && seg.length > 1 && /^0\d+$/.test(seg);
  });
  
  if (hasLeadingZero) {
    const leadingZeroSegs = segments.filter(seg => seg.startsWith('0') && seg.length > 1 && /^0\d+$/.test(seg));
    issues.push({
      country: countryCode,
      segments: [...new Set(leadingZeroSegs)].slice(0, 10) // 去重并只显示前10个
    });
    console.log(`❌ ${countryCode}: 发现 ${leadingZeroSegs.length} 个前导0号段`);
  } else {
    console.log(`✅ ${countryCode}: 无前导0问题`);
  }
}

console.log('\n=== 需要修复的国家汇总 ===\n');
issues.forEach(issue => {
  console.log(`${issue.country}: ${issue.segments.slice(0, 5).join(', ')}${issue.segments.length > 5 ? '...' : ''}`);
});

console.log(`\n总计需要修复: ${issues.length} 个国家`);

// 按类型分组
const byType = {
  '3位号段': [],
  '4位号段': [],
  '5位号段': [],
  '混合': []
};

issues.forEach(issue => {
  const lengths = [...new Set(issue.segments.map(s => s.length))];
  if (lengths.length === 1) {
    const key = `${lengths[0]}位号段`;
    if (byType[key]) {
      byType[key].push(issue.country);
    }
  } else {
    byType['混合'].push(issue.country);
  }
});

console.log('\n=== 按号段类型分类 ===\n');
Object.entries(byType).forEach(([type, countries]) => {
  if (countries.length > 0) {
    console.log(`${type}: ${countries.join(', ')}`);
  }
});

// 输出到JSON文件
fs.writeFileSync(
  '/home/vue-element-admin/backend/operator-fix-report.json',
  JSON.stringify(issues, null, 2)
);

console.log('\n详细报告已保存到: /home/vue-element-admin/backend/operator-fix-report.json');
