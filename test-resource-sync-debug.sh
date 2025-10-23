#!/bin/bash

echo "========================================"
echo "📋 调试：资源中心数据同步问题"
echo "========================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 步骤1：检查数据库已发布数据"
echo "----------------------------------------"
echo "查询所有已发布数据..."
PUBLISHED_DATA=$(curl -s 'http://localhost:3000/api/data-library/published?page=1&limit=100')
TOTAL=$(echo "$PUBLISHED_DATA" | python -c "import sys, json; print(json.load(sys.stdin).get('total', 0))" 2>/dev/null)
DATA_COUNT=$(echo "$PUBLISHED_DATA" | python -c "import sys, json; print(len(json.load(sys.stdin).get('data', [])))" 2>/dev/null)

echo "   API返回总数: $TOTAL"
echo "   实际数据条数: $DATA_COUNT"

if [ "$DATA_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ API返回了 $DATA_COUNT 条数据${NC}"
    
    # 显示详细信息
    echo ""
    echo "已发布数据详情："
    echo "$PUBLISHED_DATA" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for i, item in enumerate(data.get('data', [])[:5], 1):
        print('  %d. ID=%s, 国家=%s, 类型=%s, 数量=%s, 状态=%s, 发布=%s' % (
            i,
            item.get('id', 'N/A'),
            item.get('country_name', item.get('country', 'N/A')),
            item.get('data_type', 'N/A'),
            item.get('available_quantity', 'N/A'),
            item.get('status', 'N/A'),
            item.get('publish_status', 'N/A')
        ))
except Exception as e:
    print('解析失败:', e)
" 2>/dev/null
else
    echo -e "${RED}❌ API未返回数据${NC}"
fi
echo ""

echo "🔍 步骤2：检查资源中心代码配置"
echo "----------------------------------------"

# 检查是否调用正确的API
if grep -q "api/data-library/published" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 资源中心使用正确的API${NC}"
else
    echo -e "${RED}❌ 资源中心未使用已发布数据API${NC}"
fi

# 检查getList方法
if grep -q "getPublishedDataFromAPI()" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ getList方法调用getPublishedDataFromAPI${NC}"
else
    echo -e "${RED}❌ getList方法未调用getPublishedDataFromAPI${NC}"
fi

# 检查运营商字段映射
if grep -q "count: op.quantity || op.count" /home/vue-element-admin/src/views/resource/center.vue; then
    echo -e "${GREEN}✅ 运营商字段映射已配置${NC}"
else
    echo -e "${YELLOW}⚠️  运营商字段映射缺失${NC}"
fi

echo ""

echo "🔍 步骤3：检查可能的问题点"
echo "----------------------------------------"

# 检查是否有降级到localStorage的情况
LOCALSTORAGE_FALLBACK=$(grep -n "getListFromLocalStorage()" /home/vue-element-admin/src/views/resource/center.vue | wc -l)
echo "   localStorage降级调用点: $LOCALSTORAGE_FALLBACK 处"

# 检查applyFilters是否被错误调用
APPLY_FILTERS_IN_API=$(grep -A 30 "getPublishedDataFromAPI" /home/vue-element-admin/src/views/resource/center.vue | grep -c "applyFilters")
if [ "$APPLY_FILTERS_IN_API" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  getPublishedDataFromAPI中调用了applyFilters（可能导致数据被过滤）${NC}"
else
    echo -e "${GREEN}✅ getPublishedDataFromAPI未调用applyFilters${NC}"
fi

echo ""

echo "🔍 步骤4：检查数据状态字段"
echo "----------------------------------------"
# 检查每条数据的status字段
echo "$PUBLISHED_DATA" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('检查数据状态字段:')
    statuses = {}
    for item in data.get('data', []):
        status = item.get('status', 'N/A')
        statuses[status] = statuses.get(status, 0) + 1
    
    for status, count in statuses.items():
        print('   %s: %d 条' % (status, count))
    
    # 检查是否有非available状态的数据
    if 'available' in statuses and len(statuses) == 1:
        print('\033[0;32m✅ 所有数据状态为 available\033[0m')
    else:
        print('\033[1;33m⚠️  存在非available状态的数据\033[0m')
except Exception as e:
    print('解析失败:', e)
" 2>/dev/null

echo ""

echo "🔍 步骤5：模拟前端数据转换"
echo "----------------------------------------"
echo "检查运营商数据转换..."
OPERATOR_TEST=$(echo "$PUBLISHED_DATA" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('data') and len(data['data']) > 0:
        item = data['data'][0]
        operators = item.get('operators', [])
        
        print('原始运营商数据:')
        if operators and len(operators) > 0:
            op = operators[0]
            print('   name: %s' % op.get('name', 'N/A'))
            print('   quantity: %s' % op.get('quantity', 'N/A'))
            print('   count: %s' % op.get('count', 'N/A'))
            
            # 模拟字段映射
            count = op.get('quantity', op.get('count', 0))
            print('   转换后count: %s' % count)
            
            if count > 0:
                print('\033[0;32m✅ 运营商数据转换成功\033[0m')
            else:
                print('\033[0;31m❌ 运营商数据转换失败\033[0m')
        else:
            print('\033[1;33m⚠️  无运营商数据\033[0m')
    else:
        print('无数据')
except Exception as e:
    print('解析失败:', e)
" 2>/dev/null)

echo "$OPERATOR_TEST"
echo ""

echo "========================================"
echo "📊 问题诊断结果"
echo "========================================"
echo ""

if [ "$DATA_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ 数据库中有 $DATA_COUNT 条已发布数据${NC}"
    echo -e "${GREEN}✅ API正常返回数据${NC}"
    echo ""
    echo "🔍 可能的原因:"
    echo "   1. 浏览器缓存了旧版本代码（最常见）"
    echo "      解决方案: 按 Ctrl+F5 强制刷新浏览器"
    echo ""
    echo "   2. 前端代码未更新"
    echo "      解决方案: 检查是否已刷新页面"
    echo ""
    echo "   3. API调用失败降级到localStorage"
    echo "      解决方案: 打开浏览器控制台（F12）查看API调用日志"
    echo ""
    echo "   4. 数据被筛选过滤"
    echo "      解决方案: 检查资源中心的筛选条件是否有设置"
    echo ""
else
    echo -e "${RED}❌ 数据库中没有已发布数据${NC}"
    echo ""
    echo "请先在数据列表中发布一些数据"
fi

echo "🧪 建议的测试步骤:"
echo "   1. 按 Ctrl+F5 强制刷新浏览器"
echo "   2. 打开浏览器控制台（F12）"
echo "   3. 切换到 Console 标签"
echo "   4. 进入资源中心页面"
echo "   5. 查看日志输出:"
echo "      - 应看到: '💾 从数据库API获取已发布数据...'"
echo "      - 应看到: '✅ 数据库API返回数据: X 条'"
echo "      - 应看到: '✅ 数据加载完成，最终显示: X 条'"
echo "   6. 如果看到降级日志，说明API调用失败"
echo ""

exit 0
