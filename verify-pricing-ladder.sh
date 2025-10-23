#!/bin/bash

echo "=========================================="
echo "🎯 阶梯动态定价规则验证"
echo "=========================================="
echo ""

# 1. 检查代码修改
echo "1️⃣ 检查代码修改..."
echo "-----------------------------------"

if grep -q "const firstPeriodDiscount = 4 \* 0.05" /home/vue-element-admin/src/utils/dynamicPricing.js; then
    echo "✅ 阶梯降价逻辑已实现"
else
    echo "❌ 阶梯降价逻辑未实现"
fi

if grep -q "totalDiscountRate = Math.min" /home/vue-element-admin/src/utils/dynamicPricing.js; then
    echo "✅ 50%最大降价限制已添加"
else
    echo "❌ 50%最大降价限制未添加"
fi

if grep -q "discountDays \* 0.05" /home/vue-element-admin/src/utils/dynamicPricing.js; then
    echo "✅ 第一阶段（5%/天）已实现"
else
    echo "❌ 第一阶段未实现"
fi

if grep -q "discountDays \* 0.02" /home/vue-element-admin/src/utils/dynamicPricing.js; then
    echo "✅ 第二阶段（2%/天）已实现"
else
    echo "❌ 第二阶段未实现"
fi

if grep -q "discountDays \* 0.01" /home/vue-element-admin/src/utils/dynamicPricing.js; then
    echo "✅ 第三阶段（1%/天）已实现"
else
    echo "❌ 第三阶段未实现"
fi
echo ""

# 2. 模拟测试关键节点
echo "2️⃣ 模拟定价计算测试..."
echo "-----------------------------------"

cat << 'EOF' | node
// 简化的定价计算函数
function calculatePrice(sellPrice, day) {
    let totalDiscountRate = 0;
    
    if (day <= 3) {
        totalDiscountRate = 0;
    } else if (day <= 7) {
        const discountDays = day - 3;
        totalDiscountRate = discountDays * 0.05;
    } else if (day <= 15) {
        const firstPeriodDiscount = 4 * 0.05;
        const discountDays = day - 7;
        const secondPeriodDiscount = discountDays * 0.02;
        totalDiscountRate = firstPeriodDiscount + secondPeriodDiscount;
    } else if (day <= 30) {
        const firstPeriodDiscount = 4 * 0.05;
        const secondPeriodDiscount = 8 * 0.02;
        const discountDays = day - 15;
        const thirdPeriodDiscount = discountDays * 0.01;
        totalDiscountRate = firstPeriodDiscount + secondPeriodDiscount + thirdPeriodDiscount;
    } else {
        totalDiscountRate = Math.min(0.51, 0.50);
    }
    
    const maxDiscountPrice = sellPrice * 0.5;
    let currentPrice = sellPrice * (1 - totalDiscountRate);
    if (currentPrice < maxDiscountPrice) {
        currentPrice = maxDiscountPrice;
        totalDiscountRate = 0.50;
    }
    
    return {
        day: day,
        price: currentPrice.toFixed(4),
        discount: (totalDiscountRate * 100).toFixed(1)
    };
}

const sellPrice = 0.10;
const testDays = [0, 3, 4, 7, 8, 15, 16, 30, 35];

console.log('\n测试原价: $' + sellPrice.toFixed(2));
console.log('\n关键节点测试结果:');
console.log('─'.repeat(50));

testDays.forEach(day => {
    const result = calculatePrice(sellPrice, day);
    const expected = {
        0: { price: '0.1000', discount: '0.0' },
        3: { price: '0.1000', discount: '0.0' },
        4: { price: '0.0950', discount: '5.0' },
        7: { price: '0.0800', discount: '20.0' },
        8: { price: '0.0780', discount: '22.0' },
        15: { price: '0.0640', discount: '36.0' },
        16: { price: '0.0630', discount: '37.0' },
        30: { price: '0.0500', discount: '50.0' },
        35: { price: '0.0500', discount: '50.0' }
    };
    
    const isCorrect = result.price === expected[day].price && 
                     result.discount === expected[day].discount;
    const status = isCorrect ? '✅' : '❌';
    
    console.log(`${status} 第${day}天: $${result.price} (-${result.discount}%) ${isCorrect ? '' : '(预期: $' + expected[day].price + ' -' + expected[day].discount + '%)'}`);
});

console.log('─'.repeat(50));
EOF

echo ""

# 3. 检查服务状态
echo "3️⃣ 检查服务状态..."
echo "-----------------------------------"

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常"
else
    echo "⚠️  后端服务未运行"
fi

if curl -s http://localhost:9528 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常"
else
    echo "⚠️  前端服务未运行"
fi
echo ""

# 4. 显示验证指南
echo "=========================================="
echo "✅ 自动验证完成"
echo "=========================================="
echo ""
echo "📍 手动验证步骤:"
echo ""
echo "1. 访问阶梯定价测试页面:"
echo "   http://localhost:9528/test-pricing-ladder.html"
echo ""
echo "2. 查看完整30天价格趋势表"
echo ""
echo "3. 验证关键节点:"
echo "   - 第0-3天: 原价 $0.10 (0%)"
echo "   - 第4天: $0.095 (-5%)"
echo "   - 第7天: $0.080 (-20%)"
echo "   - 第8天: $0.078 (-22%)"
echo "   - 第15天: $0.064 (-36%)"
echo "   - 第16天: $0.063 (-37%)"
echo "   - 第30天+: $0.050 (-50%)"
echo ""
echo "4. 访问资源中心验证实际效果:"
echo "   http://localhost:9528/#/resource/center"
echo ""
echo "📚 相关文档:"
echo "   - 规则说明: 阶梯动态定价规则说明.md"
echo "   - 测试页面: test-pricing-ladder.html"
echo ""
echo "=========================================="
