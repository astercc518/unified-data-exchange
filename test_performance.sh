#!/bin/bash

# 页面加载性能测试脚本

echo "================================================"
echo "  页面加载性能测试"
echo "================================================"
echo ""

# 配置
API_URL="http://localhost:3000/api/auth/info"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInVzZXJUeXBlIjoiYWRtaW4iLCJsb2dpbkFjY291bnQiOiJhZG1pbiIsImlhdCI6MTc2MTA0MjE2MiwiZXhwIjoxNzYxMTI4NTYyfQ.yllSDuwGd7f2Z-KeT_3wZEE-Fj8eRECWYZ51tu26rkQ"

# 创建curl格式化输出文件
cat > /tmp/curl-format.txt << 'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF

echo "1️⃣  测试用户信息API（首次请求 - 无缓存）"
echo "-------------------------------------------"
curl -w "@/tmp/curl-format.txt" -o /dev/null -s "${API_URL}?token=${TOKEN}"
echo ""

echo "2️⃣  测试用户信息API（第二次请求 - 有缓存）"
echo "-------------------------------------------"
curl -w "@/tmp/curl-format.txt" -o /dev/null -s "${API_URL}?token=${TOKEN}"
echo ""

echo "3️⃣  测试用户信息API（第三次请求 - 缓存）"
echo "-------------------------------------------"
curl -w "@/tmp/curl-format.txt" -o /dev/null -s "${API_URL}?token=${TOKEN}"
echo ""

# 测试其他API
echo "4️⃣  测试通道列表API"
echo "-------------------------------------------"
curl -w "@/tmp/curl-format.txt" -o /dev/null -s "http://localhost:3000/api/sms/admin/channels?page=1&limit=20" \
  -H "Authorization: Bearer ${TOKEN}"
echo ""

echo "5️⃣  测试客户列表API"
echo "-------------------------------------------"
curl -w "@/tmp/curl-format.txt" -o /dev/null -s "http://localhost:3000/api/users?page=1&limit=20" \
  -H "Authorization: Bearer ${TOKEN}"
echo ""

# 清理
rm -f /tmp/curl-format.txt

echo "================================================"
echo "  测试完成！"
echo "================================================"
echo ""
echo "📊 性能分析："
echo "  - time_total < 50ms    ✅ 优秀"
echo "  - time_total < 200ms   ✔️  良好"
echo "  - time_total < 500ms   ⚠️  一般"
echo "  - time_total >= 500ms  ❌ 需要优化"
echo ""
echo "💡 缓存效果："
echo "  - 第一次请求：查询数据库"
echo "  - 第二次及以后：从内存缓存返回（应该更快）"
echo ""
