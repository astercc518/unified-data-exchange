/**
 * 检查所有国家运营商号段覆盖率
 * 分析每个国家配置的号段数量是否充足
 */

const fs = require('fs');

// 读取 operators.js 的内容
const content = fs.readFileSync('/home/vue-element-admin/src/data/operators.js', 'utf-8');

// 提取所有国家的运营商配置
const countryPattern = /'([A-Z]{2})':\s*\{[\s\S]*?operators:\s*\[([\s\S]*?)\]\s*\}/g;
const segmentPattern = /numberSegments:\s*\[([^\]]+)\]/g;

const analysis = [];
let match;

console.log('=== 全球运营商号段覆盖率分析 ===\n');

while ((match = countryPattern.exec(content)) !== null) {
  const countryCode = match[1];
  const operatorBlock = match[0];
  
  // 提取运营商数量
  const operatorMatches = operatorBlock.match(/\{\s*name:/g);
  const operatorCount = operatorMatches ? operatorMatches.length : 0;
  
  // 提取所有号段
  const allSegments = [];
  let segMatch;
  while ((segMatch = segmentPattern.exec(operatorBlock)) !== null) {
    const segmentStr = segMatch[1];
    const segs = segmentStr.match(/'([^']+)'/g);
    if (segs) {
      segs.forEach(s => {
        const clean = s.replace(/'/g, '');
        allSegments.push(clean);
      });
    }
  }
  
  // 去重后的号段数量
  const uniqueSegments = [...new Set(allSegments)];
  const totalSegments = uniqueSegments.length;
  
  // 分析号段长度分布
  const segmentLengths = uniqueSegments.map(s => s.length);
  const avgLength = segmentLengths.reduce((a, b) => a + b, 0) / segmentLengths.length || 0;
  const minLength = Math.min(...segmentLengths) || 0;
  const maxLength = Math.max(...segmentLengths) || 0;
  
  // 评估覆盖率（基于运营商数量和号段数量的启发式规则）
  let status = '✅ 正常';
  let riskLevel = 'low';
  let reason = '';
  
  // 高风险指标
  if (totalSegments < 10 && operatorCount > 2) {
    status = '⚠️  号段过少';
    riskLevel = 'high';
    reason = `${operatorCount}个运营商仅${totalSegments}个号段，可能不足`;
  } else if (totalSegments < 20 && operatorCount > 3) {
    status = '⚠️  号段过少';
    riskLevel = 'high';
    reason = `${operatorCount}个运营商仅${totalSegments}个号段，可能不足`;
  } else if (avgLength === 1 && totalSegments < 5) {
    status = '⚠️  覆盖不足';
    riskLevel = 'medium';
    reason = '1位号段但数量过少';
  } else if (avgLength >= 3 && totalSegments < 30) {
    status = '🔍 需检查';
    riskLevel = 'medium';
    reason = `3位号段应有更多覆盖（当前${totalSegments}个）`;
  } else if (totalSegments > 100) {
    status = '✅ 优秀';
    riskLevel = 'low';
    reason = '号段配置充足';
  }
  
  // 特殊国家的额外检查
  if (['US', 'CA'].includes(countryCode)) {
    // 美国、加拿大的区号系统
    if (totalSegments < 50) {
      status = '⚠️  区号不足';
      riskLevel = 'medium';
      reason = '区号系统应包含更多号段';
    } else {
      status = '✅ 正常';
      riskLevel = 'low';
    }
  }
  
  analysis.push({
    country: countryCode,
    operators: operatorCount,
    segments: totalSegments,
    avgLength: avgLength.toFixed(1),
    lengthRange: `${minLength}-${maxLength}`,
    status,
    riskLevel,
    reason
  });
}

// 按风险级别排序
analysis.sort((a, b) => {
  const riskOrder = { high: 0, medium: 1, low: 2 };
  return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
});

// 输出结果
console.log('国家 | 运营商数 | 号段数 | 平均长度 | 长度范围 | 状态 | 原因');
console.log('-----|----------|--------|----------|----------|------|------');

analysis.forEach(item => {
  console.log(`${item.country.padEnd(4)} | ${String(item.operators).padEnd(8)} | ${String(item.segments).padEnd(6)} | ${item.avgLength.padEnd(8)} | ${item.lengthRange.padEnd(8)} | ${item.status.padEnd(6)} | ${item.reason}`);
});

// 统计汇总
const highRisk = analysis.filter(a => a.riskLevel === 'high');
const mediumRisk = analysis.filter(a => a.riskLevel === 'medium');
const lowRisk = analysis.filter(a => a.riskLevel === 'low');

console.log('\n=== 风险汇总 ===\n');
console.log(`🔴 高风险 (需要立即检查): ${highRisk.length} 个国家`);
if (highRisk.length > 0) {
  console.log(`   ${highRisk.map(a => a.country).join(', ')}`);
}

console.log(`\n🟡 中风险 (建议检查): ${mediumRisk.length} 个国家`);
if (mediumRisk.length > 0) {
  console.log(`   ${mediumRisk.map(a => a.country).join(', ')}`);
}

console.log(`\n🟢 低风险: ${lowRisk.length} 个国家`);

// 生成详细报告
const report = {
  timestamp: new Date().toISOString(),
  totalCountries: analysis.length,
  highRisk: highRisk.map(a => ({
    country: a.country,
    operators: a.operators,
    segments: a.segments,
    reason: a.reason
  })),
  mediumRisk: mediumRisk.map(a => ({
    country: a.country,
    operators: a.operators,
    segments: a.segments,
    reason: a.reason
  })),
  allCountries: analysis
};

fs.writeFileSync(
  '/home/vue-element-admin/backend/operator-coverage-report.json',
  JSON.stringify(report, null, 2)
);

console.log('\n详细报告已保存到: /home/vue-element-admin/backend/operator-coverage-report.json');

// 针对高风险国家提供建议
if (highRisk.length > 0) {
  console.log('\n=== 高风险国家建议 ===\n');
  highRisk.forEach(item => {
    console.log(`${item.country}: ${item.reason}`);
    console.log(`  建议: 检查实际数据号段分布，补全缺失的号段配置`);
    console.log('');
  });
}
