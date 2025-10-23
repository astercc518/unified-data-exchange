#!/bin/bash

echo "========================================"
echo "🔍 KL01880V01 用户登录测试"
echo "========================================"
echo ""

# 测试1: 检查用户是否存在
echo "📊 测试1: 检查用户数据"
echo "----------------------------------------"
mysql -u root -D vue_admin -e "SELECT id, login_account, customer_name, email, account_balance, status FROM users WHERE login_account='KL01880V01';" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 用户数据查询成功"
else
    echo "❌ 用户数据查询失败"
fi

echo ""
echo "----------------------------------------"
echo ""

# 测试2: 测试后端登录API
echo "🔐 测试2: 测试后端登录API"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"KL01880V01","password":"123456"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP状态码: $HTTP_CODE"
echo "响应内容:"
echo "$BODY" | python -m json.tool 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" == "200" ]; then
    echo ""
    echo "✅ 登录API测试成功"
    
    # 提取token
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "🔑 Token: $TOKEN"
    fi
else
    echo ""
    echo "❌ 登录API测试失败 (HTTP $HTTP_CODE)"
fi

echo ""
echo "----------------------------------------"
echo ""

# 测试3: 测试获取用户信息
if [ "$HTTP_CODE" == "200" ] && [ -n "$TOKEN" ]; then
    echo "👤 测试3: 获取用户信息"
    echo "----------------------------------------"
    
    INFO_RESPONSE=$(curl -s -w "\n%{http_code}" \
      "http://localhost:3000/api/auth/info?token=$TOKEN")
    
    INFO_HTTP_CODE=$(echo "$INFO_RESPONSE" | tail -n1)
    INFO_BODY=$(echo "$INFO_RESPONSE" | head -n-1)
    
    echo "HTTP状态码: $INFO_HTTP_CODE"
    echo "响应内容:"
    echo "$INFO_BODY" | python -m json.tool 2>/dev/null || echo "$INFO_BODY"
    
    if [ "$INFO_HTTP_CODE" == "200" ]; then
        echo ""
        echo "✅ 用户信息获取成功"
    else
        echo ""
        echo "❌ 用户信息获取失败 (HTTP $INFO_HTTP_CODE)"
    fi
    
    echo ""
    echo "----------------------------------------"
fi

echo ""

# 总结
echo "📊 测试总结"
echo "----------------------------------------"
echo ""
echo "用户信息："
echo "  - 登录账号: KL01880V01"
echo "  - 登录密码: 123456"
echo "  - 用户类型: customer"
echo ""
echo "测试结果："
if [ "$HTTP_CODE" == "200" ]; then
    echo "  ✅ 后端登录功能正常"
    echo "  ✅ Token生成成功"
    if [ "$INFO_HTTP_CODE" == "200" ]; then
        echo "  ✅ 用户信息获取正常"
    fi
else
    echo "  ❌ 后端登录功能异常"
fi
echo ""
echo "前端登录测试："
echo "  1. 访问: http://localhost:9528/#/user/list"
echo "  2. 找到 KL01880V01 用户"
echo "  3. 点击\"登录账号\"按钮"
echo "  4. 应该能够成功登录并跳转到首页"
echo ""
echo "========================================"
echo "✅ 测试完成"
echo "========================================"
