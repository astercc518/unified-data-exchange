#!/bin/bash

echo "=== Environment Test ==="
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo "Date: $(date)"
echo ""

echo "=== Node.js Check ==="
if command -v node &> /dev/null; then
    echo "Node.js found: $(command -v node)"
    echo "Node.js version: $(node --version)"
else
    echo "Node.js NOT found in PATH"
fi
echo ""

echo "=== npm Check ==="
if command -v npm &> /dev/null; then
    echo "npm found: $(command -v npm)"
    echo "npm version: $(npm --version)"
else
    echo "npm NOT found in PATH"
fi
echo ""

echo "=== Process Check ==="
echo "Backend process:"
ps aux | grep "node.*server.js" | grep -v grep || echo "No backend process"
echo ""
echo "Frontend process:"
ps aux | grep "vue-cli-service" | grep -v grep || echo "No frontend process"
echo ""

echo "=== Port Check ==="
echo "Port 3000:"
netstat -tlnp 2>/dev/null | grep ":3000" || echo "Port 3000 not in use"
echo ""
echo "Port 3001:"
netstat -tlnp 2>/dev/null | grep ":3001" || echo "Port 3001 not in use"
echo ""

echo "=== Backend Health Check ==="
if curl -s http://localhost:3000/health &> /dev/null; then
    echo "Backend is responding:"
    curl -s http://localhost:3000/health
else
    echo "Backend is NOT responding"
fi
echo ""

echo "=== Test Complete ==="
