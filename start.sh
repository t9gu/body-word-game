#!/bin/bash

# 体感单词游戏 - 启动脚本
# 用于启动本地HTTP服务器

echo "🎮 体感单词游戏 - 启动服务"
echo "================================"

# 检测端口是否被占用
PORT=8000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 $PORT 已被占用"
    echo "正在尝试使用其他端口..."
    PORT=8001
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        PORT=8002
    fi
fi

# 保存PID到文件
PID_FILE=".server.pid"

# 检测可用的服务器
if command -v python3 &> /dev/null; then
    echo "✓ 使用 Python 3 启动服务器"
    echo "📡 服务器地址: http://localhost:$PORT"
    echo "📁 工作目录: $(pwd)"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "或运行 ./stop.sh 停止服务"
    echo "================================"
    echo ""
    
    # 启动Python服务器并保存PID
    python3 -m http.server $PORT &
    echo $! > $PID_FILE
    
    # 等待服务器启动
    sleep 2
    
    # 尝试自动打开浏览器
    if command -v open &> /dev/null; then
        echo "🌐 正在打开浏览器..."
        open "http://localhost:$PORT"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT"
    fi
    
    # 等待进程
    wait

elif command -v python &> /dev/null; then
    echo "✓ 使用 Python 2 启动服务器"
    echo "📡 服务器地址: http://localhost:$PORT"
    echo "📁 工作目录: $(pwd)"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "或运行 ./stop.sh 停止服务"
    echo "================================"
    echo ""
    
    # 启动Python服务器并保存PID
    python -m SimpleHTTPServer $PORT &
    echo $! > $PID_FILE
    
    # 等待服务器启动
    sleep 2
    
    # 尝试自动打开浏览器
    if command -v open &> /dev/null; then
        echo "🌐 正在打开浏览器..."
        open "http://localhost:$PORT"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT"
    fi
    
    # 等待进程
    wait

elif command -v php &> /dev/null; then
    echo "✓ 使用 PHP 启动服务器"
    echo "📡 服务器地址: http://localhost:$PORT"
    echo "📁 工作目录: $(pwd)"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "或运行 ./stop.sh 停止服务"
    echo "================================"
    echo ""
    
    # 启动PHP服务器并保存PID
    php -S localhost:$PORT &
    echo $! > $PID_FILE
    
    # 等待服务器启动
    sleep 2
    
    # 尝试自动打开浏览器
    if command -v open &> /dev/null; then
        echo "🌐 正在打开浏览器..."
        open "http://localhost:$PORT"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT"
    fi
    
    # 等待进程
    wait

elif command -v npx &> /dev/null; then
    echo "✓ 使用 Node.js (npx serve) 启动服务器"
    echo "📡 服务器地址: http://localhost:$PORT"
    echo "📁 工作目录: $(pwd)"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "或运行 ./stop.sh 停止服务"
    echo "================================"
    echo ""
    
    # 启动Node服务器并保存PID
    npx serve -l $PORT &
    echo $! > $PID_FILE
    
    # 等待服务器启动
    sleep 2
    
    # 尝试自动打开浏览器
    if command -v open &> /dev/null; then
        echo "🌐 正在打开浏览器..."
        open "http://localhost:$PORT"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT"
    fi
    
    # 等待进程
    wait

else
    echo "❌ 错误: 未找到可用的HTTP服务器"
    echo ""
    echo "请安装以下任一工具："
    echo "  - Python 3: brew install python3"
    echo "  - PHP: brew install php"
    echo "  - Node.js: brew install node"
    echo ""
    exit 1
fi
