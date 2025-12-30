# 🎮 体感单词游戏 (Body Word Game)

一个为6岁儿童设计的互动体感英语学习游戏，结合MediaPipe姿态检测、Three.js 3D视觉效果和Web Audio API音效系统。

## 🌟 游戏特色

- **体感互动**: 使用MediaPipe实时检测身体动作，通过举手、挥手等手势进行游戏
- **3D视觉效果**: 基于Three.js的精美3D场景和动画效果
- **音效反馈**: Web Audio API生成的动态音效系统
- **教育性**: 10个主题类别，超过300个英语单词
- **儿童友好**: 色彩鲜艳的界面设计，简单直观的操作方式

## 🎯 游戏玩法

### 基本流程
1. **启动游戏** → 确认开启摄像头 → 选择单词主题 → 开始游戏
2. **游戏界面**显示4个彩色球体：
   - 左侧2个：英语单词
   - 右侧2个：中文翻译/图片
3. **体感操作**：
   - 左手举手 → 选择左侧球体
   - 右手举手 → 选择右侧球体
   - 双手举手 → 确认选择
4. **匹配规则**：选择1个单词+1个对应图片，匹配成功得分
5. **游戏结束**：显示得分、正确率和游戏统计

### 手势说明
- ✋ **左手举起**: 选择左侧球体
- ✋ **右手举起**: 选择右侧球体  
- 🙌 **双手举起**: 确认当前选择
- 🙋 **挥手**: 重新选择

## 🛠️ 技术架构

### 核心技术栈
- **前端框架**: HTML5 + CSS3 + JavaScript (ES6+)
- **3D渲染**: Three.js r128
- **计算机视觉**: MediaPipe Pose
- **音频处理**: Web Audio API
- **实时通信**: getUserMedia API

### 项目结构
```
body-word-game/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── main.js            # 主应用控制器
│   ├── gameLogic.js       # 游戏逻辑管理
│   ├── poseDetector.js    # MediaPipe姿态检测
│   ├── threeSceneManager.js # Three.js 3D场景
│   └── audioManager.js    # 音频管理器
├── data/
│   └── wordData.js        # 单词主题数据
├── assets/
│   ├── images/            # 图片资源
│   ├── sounds/            # 音效文件
│   └── models/            # 3D模型文件
└── README.md              # 项目说明
```

## 📚 单词主题

游戏包含10个精心设计的主题类别：

1. **🏠 家用电器** - camera, laptop, television, fridge等
2. **👕 衣物配饰** - hat, shoes, jacket, umbrella等  
3. **🎨 颜色** - red, blue, green, yellow等
4. **🍔 食物饮料** - apple, pizza, cake, milk等
5. **🐾 动物** - cat, dog, bird, elephant等
6. **🍎 水果** - banana, orange, strawberry等
7. **⚽ 运动** - football, swimming, running等
8. **🚗 交通工具** - car, airplane, bicycle等
9. **🏫 学校教育** - teacher, book, pencil等
10. **☀️ 天气** - sunny, rainy, snowy, windy等

## 🚀 快速开始

### 环境要求
- 现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）
- 摄像头设备（可选，用于体感检测）
- HTTPS环境（摄像头权限要求）

### 本地运行
1. 克隆或下载项目文件
2. 使用本地服务器运行（推荐）：
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```
3. 访问 `http://localhost:8000`
4. 允许摄像头权限（如需体感功能）

### 直接运行
- 直接双击 `index.html` 文件（部分功能可能受限）

## 🎮 游戏配置

### 难度设置
```javascript
// gameLogic.js 中的配置项
config: {
    roundDuration: 30000,      // 每轮时长（毫秒）
    gestureTimeout: 3000,      // 手势超时（毫秒）
    scorePerCorrect: 10,        // 正确匹配得分
    minConfidence: 0.6          // 姿态检测最小置信度
}
```

### 自定义主题
可在 `data/wordData.js` 中添加新主题：
```javascript
"newTopic": {
    name: "新主题",
    emoji: "🆕",
    words: [
        { word: "example", translation: "例子", image: "example" }
    ]
}
```

## 🔧 开发指南

### 添加新功能
1. **新手势**: 在 `poseDetector.js` 的 `detectGestures()` 方法中添加
2. **新音效**: 在 `audioManager.js` 中创建音效函数
3. **新动画**: 在 `threeSceneManager.js` 中添加动画逻辑
4. **新主题**: 在 `wordData.js` 中定义主题数据

### 调试模式
浏览器控制台可访问全局对象：
- `app` - 主应用实例
- `gameLogic` - 游戏逻辑管理器
- `poseDetector` - 姿态检测器
- `threeSceneManager` - 3D场景管理器
- `audioManager` - 音频管理器

## 🐛 常见问题

### 摄像头无法启动
1. 检查浏览器是否允许摄像头权限
2. 确保使用HTTPS协议
3. 尝试关闭其他使用摄像头的应用

### 姿态检测不准确
1. 确保光线充足
2. 保持身体在摄像头视野内
3. 穿着与背景对比明显的衣物

### 3D场景显示异常
1. 检查浏览器WebGL支持
2. 更新显卡驱动程序
3. 尝试刷新页面

### 音效无法播放
1. 现代浏览器需要用户交互后才能播放音频
2. 检查浏览器音频权限设置
3. 确保音频设备正常工作

## 🎯 教育价值

### 学习目标
- ✅ 英语单词认知
- ✅ 中英文对应关系
- ✅ 身体协调能力
- ✅ 反应速度训练
- ✅ 游戏化学习体验

### 适合年龄
- 主要面向：6-12岁儿童
- 难度可调节，适合不同年龄段

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发环境设置
1. Fork本项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

### 代码规范
- 使用ES6+语法
- 遵循驼峰命名法
- 添加适当的注释
- 保持代码整洁

## 📄 许可证

本项目采用MIT许可证 - 详见LICENSE文件

## 🙏 致谢

- [MediaPipe](https://mediapipe.dev/) - 姿态检测技术
- [Three.js](https://threejs.org/) - 3D图形库
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - 音频处理

---

**🎮 让孩子在运动中快乐学习英语！**
