// 主应用程序控制器
// 版本: v6.0 - 使用2D渲染器
console.log('✅ Main v6.0 已加载');

class BodyWordGame {
    constructor() {
        this.currentScreen = 'start';
        this.isInitialized = false;
        this.cameraEnabled = false;
        this.selectedTopic = null;
        
        // DOM元素引用
        this.elements = {};
        
        // 初始化
        this.init();
    }

    // 初始化应用
    async init() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupApp());
            } else {
                this.setupApp();
            }
        } catch (error) {
            console.error('应用初始化失败:', error);
        }
    }

    // 设置应用
    async setupApp() {
        try {
            // 获取DOM元素
            this.cacheElements();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 初始化游戏逻辑
            const gameInitialized = await gameLogic.init();
            if (!gameInitialized) {
                throw new Error('游戏逻辑初始化失败');
            }
            
            // 设置游戏回调
            this.setupGameCallbacks();
            
            // 隐藏加载指示器
            this.hideLoading();
            
            // 显示开始界面
            this.showScreen('start');
            
            this.isInitialized = true;
            console.log('体感单词游戏初始化完成');
            
        } catch (error) {
            console.error('应用设置失败:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }

    // 缓存DOM元素
    cacheElements() {
        this.elements = {
            // 屏幕
            screens: {
                start: document.getElementById('startScreen'),
                camera: document.getElementById('cameraScreen'),
                topic: document.getElementById('topicScreen'),
                game: document.getElementById('gameScreen'),
                result: document.getElementById('resultScreen')
            },
            
            // 按钮
            buttons: {
                start: document.getElementById('startBtn'),
                enableCamera: document.getElementById('enableCameraBtn'),
                skipCamera: document.getElementById('skipCameraBtn'),
                pause: document.getElementById('pauseBtn'),
                exit: document.getElementById('exitBtn'),
                playAgain: document.getElementById('playAgainBtn'),
                changeTopic: document.getElementById('changeTopicBtn'),
                backToMenu: document.getElementById('backToMenuBtn')
            },
            
            // 游戏元素
            gameElements: {
                cameraVideo: document.getElementById('cameraVideo'),
                gameVideo: document.getElementById('gameVideo'),
                gameCanvas: document.getElementById('gameCanvas'),
                topicGrid: document.getElementById('topicGrid'),
                currentTopic: document.getElementById('currentTopic'),
                scoreValue: document.getElementById('scoreValue'),
                correctCount: document.getElementById('correctCount'),
                wrongCount: document.getElementById('wrongCount'),
                timeValue: document.getElementById('timeValue'),
                feedbackMessage: document.getElementById('feedbackMessage')
            },
            
            // 结算界面元素
            resultElements: {
                finalScore: document.getElementById('finalScore'),
                accuracy: document.getElementById('accuracy'),
                finalCorrect: document.getElementById('finalCorrect'),
                finalWrong: document.getElementById('finalWrong'),
                finalTime: document.getElementById('finalTime')
            },
            
            // 其他
            loadingIndicator: document.getElementById('loadingIndicator')
        };
    }

    // 设置事件监听器
    setupEventListeners() {
        // 开始按钮
        this.elements.buttons.start?.addEventListener('click', () => {
            this.onStartGame();
        });

        // 摄像头按钮
        this.elements.buttons.enableCamera?.addEventListener('click', () => {
            this.onEnableCamera();
        });

        this.elements.buttons.skipCamera?.addEventListener('click', () => {
            this.onSkipCamera();
        });

        // 游戏控制按钮
        this.elements.buttons.pause?.addEventListener('click', () => {
            this.onPauseGame();
        });

        this.elements.buttons.exit?.addEventListener('click', () => {
            this.onExitGame();
        });

        // 结算界面按钮
        this.elements.buttons.playAgain?.addEventListener('click', () => {
            this.onPlayAgain();
        });

        this.elements.buttons.changeTopic?.addEventListener('click', () => {
            this.onChangeTopic();
        });

        this.elements.buttons.backToMenu?.addEventListener('click', () => {
            this.onBackToMenu();
        });

        // 键盘事件
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });

        // 窗口事件 - 使用同步清理避免async问题
        window.addEventListener('beforeunload', () => {
            // beforeunload无法等待async，直接停止检测防止message channel错误
            if (poseDetector) {
                poseDetector.isDetecting = false;
                if (poseDetector.camera) {
                    try { poseDetector.camera.stop(); } catch(e) {}
                }
            }
        });
        
        // pagehide事件更可靠，用于移动端
        window.addEventListener('pagehide', () => {
            if (poseDetector) {
                poseDetector.isDetecting = false;
                if (poseDetector.camera) {
                    try { poseDetector.camera.stop(); } catch(e) {}
                }
            }
        });
    }

    // 设置游戏回调
    setupGameCallbacks() {
        // 游戏开始
        gameLogic.setCallback('gameStart', (data) => {
            this.onGameStart(data);
        });

        // 游戏结束
        gameLogic.setCallback('gameEnd', (stats) => {
            this.onGameEnd(stats);
        });

        // 轮次开始
        gameLogic.setCallback('roundStart', (data) => {
            this.onRoundStart(data);
        });

        // 分数更新
        gameLogic.setCallback('scoreUpdate', (data) => {
            this.onScoreUpdate(data);
        });

        // 反馈消息
        gameLogic.setCallback('feedback', (data) => {
            this.onFeedback(data);
        });
    }

    // 处理键盘事件
    handleKeyPress(event) {
        switch (event.key) {
            case 'Escape':
                if (this.currentScreen === 'game') {
                    this.onExitGame();
                }
                break;
            case ' ':
                if (this.currentScreen === 'game') {
                    event.preventDefault();
                    this.onPauseGame();
                }
                break;
            case 'Enter':
                if (this.currentScreen === 'start') {
                    this.onStartGame();
                }
                break;
        }
    }

    // 开始游戏流程
    onStartGame() {
        this.showScreen('camera');
    }

    // 启用摄像头
    async onEnableCamera() {
        try {
            this.showLoading('正在启动摄像头...');
            
            // 检查摄像头支持 - 使用静态方法
            const cameraSupported = await PoseDetector.checkCameraSupport();
            if (!cameraSupported) {
                throw new Error('摄像头不支持或未授权');
            }

            // 先获取摄像头流
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            });
            
            // 设置视频元素
            const videoElement = this.elements.gameElements.gameVideo;
            const cameraVideoElement = this.elements.gameElements.cameraVideo;
            
            videoElement.srcObject = stream;
            cameraVideoElement.srcObject = stream;
            
            // 等待视频加载
            await new Promise((resolve, reject) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play()
                        .then(resolve)
                        .catch(reject);
                };
                videoElement.onerror = reject;
                
                // 超时保护
                setTimeout(() => reject(new Error('视频加载超时')), 10000);
            });

            this.showLoading('正在初始化姿态检测...');

            // 初始化姿态检测
            const canvasElement = this.elements.gameElements.poseCanvas;
            const poseInitialized = await poseDetector.init(videoElement, canvasElement);
            
            if (!poseInitialized) {
                throw new Error('姿态检测初始化失败');
            }
            
            this.cameraEnabled = true;
            this.hideLoading();
            
            console.log('✅ 摄像头和姿态检测初始化成功');
            this.showScreen('topic');
            
        } catch (error) {
            console.error('摄像头启用失败:', error);
            this.hideLoading();
            
            // 显示详细错误信息
            let errorMessage = '摄像头启用失败: ';
            if (error.name === 'NotAllowedError') {
                errorMessage += '用户拒绝了摄像头权限';
            } else if (error.name === 'NotFoundError') {
                errorMessage += '未找到摄像头设备';
            } else if (error.name === 'NotReadableError') {
                errorMessage += '摄像头被其他应用占用';
            } else {
                errorMessage += error.message;
            }
            
            this.showError(errorMessage + '\n\n游戏需要摄像头才能进行体感互动，请允许摄像头权限后重试。');
            
            // 不自动跳过，让用户手动选择
            // setTimeout(() => {
            //     this.onSkipCamera();
            // }, 2000);
        }
    }

    // 跳过摄像头（显示警告）
    onSkipCamera() {
        const confirmed = confirm(
            '⚠️ 警告：体感单词游戏需要摄像头来检测身体动作。\n\n' +
            '没有摄像头，游戏将无法正常进行体感互动。\n\n' +
            '您确定要跳过摄像头设置吗？'
        );
        
        if (confirmed) {
            this.cameraEnabled = false;
            console.warn('⚠️ 用户选择跳过摄像头，游戏体感功能将不可用');
            this.showScreen('topic');
        }
    }

    // 选择主题
    onTopicSelected(topicId) {
        this.selectedTopic = topicId;
        this.startGameWithTopic(topicId);
    }

    // 开始游戏
    async startGameWithTopic(topicId) {
        try {
            this.showLoading(true);
            
            // 启动姿态检测（如果摄像头已启用）
            if (this.cameraEnabled) {
                await poseDetector.startDetection();
            }
            
            // 开始游戏
            const gameStarted = await gameLogic.startGame(topicId);
            if (!gameStarted) {
                throw new Error('游戏启动失败');
            }
            
            // 设置当前主题显示
            const topic = WORD_TOPICS[topicId];
            if (topic && this.elements.gameElements.currentTopic) {
                this.elements.gameElements.currentTopic.textContent = topic.name;
            }
            
            this.showScreen('game');
            this.hideLoading();
            
        } catch (error) {
            console.error('游戏启动失败:', error);
            this.hideLoading();
            this.showError('游戏启动失败，请重试');
        }
    }

    // 暂停游戏
    onPauseGame() {
        const gameState = gameLogic.getGameState();
        if (gameState.isPaused) {
            gameLogic.resumeGame();
            this.elements.buttons.pause.textContent = '暂停';
        } else {
            gameLogic.pauseGame();
            this.elements.buttons.pause.textContent = '继续';
        }
    }

    // 退出游戏
    onExitGame() {
        if (confirm('确定要退出当前游戏吗？')) {
            gameLogic.endGame();
            this.showScreen('start');
        }
    }

    // 再玩一次
    onPlayAgain() {
        if (this.selectedTopic) {
            this.startGameWithTopic(this.selectedTopic);
        }
    }

    // 更换主题
    onChangeTopic() {
        this.showScreen('topic');
    }

    // 返回主菜单
    onBackToMenu() {
        this.showScreen('start');
    }

    // 游戏回调处理
    onGameStart(data) {
        console.log('游戏开始:', data);
    }

    onGameEnd(stats) {
        console.log('游戏结束:', stats);
        this.updateResultScreen(stats);
        this.showScreen('result');
    }

    onRoundStart(data) {
        console.log('轮次开始:', data);
    }

    onScoreUpdate(data) {
        // UI已通过gameLogic自动更新
        console.log('分数更新:', data);
    }

    onFeedback(data) {
        // 反馈已通过gameLogic自动显示
        console.log('反馈:', data);
    }

    // 更新结算界面
    updateResultScreen(stats) {
        if (this.elements.resultElements.finalScore) {
            this.elements.resultElements.finalScore.textContent = stats.score;
        }
        if (this.elements.resultElements.accuracy) {
            this.elements.resultElements.accuracy.textContent = `${stats.accuracy}%`;
        }
        if (this.elements.resultElements.finalCorrect) {
            this.elements.resultElements.finalCorrect.textContent = stats.correctCount;
        }
        if (this.elements.resultElements.finalWrong) {
            this.elements.resultElements.finalWrong.textContent = stats.wrongCount;
        }
        if (this.elements.resultElements.finalTime) {
            this.elements.resultElements.finalTime.textContent = `${stats.timeInSeconds}s`;
        }
    }

    // 显示屏幕
    showScreen(screenName) {
        // 隐藏所有屏幕
        Object.values(this.elements.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });

        // 显示目标屏幕
        const targetScreen = this.elements.screens[screenName];
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // 特殊处理
            if (screenName === 'topic') {
                this.renderTopicGrid();
            }
        }
    }

    // 渲染主题网格
    renderTopicGrid() {
        const topicGrid = this.elements.gameElements.topicGrid;
        if (!topicGrid) return;

        topicGrid.innerHTML = '';

        const topics = getAllTopics();
        topics.forEach(topic => {
            const button = document.createElement('button');
            button.className = 'topic-btn';
            button.innerHTML = `
                <span class="emoji">${topic.emoji}</span>
                <span>${topic.name}</span>
            `;
            button.addEventListener('click', () => {
                this.onTopicSelected(topic.id);
            });
            topicGrid.appendChild(button);
        });
    }

    // 显示加载指示器
    showLoading(message = '加载中...') {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.classList.add('show');
            const textElement = this.elements.loadingIndicator.querySelector('p');
            if (textElement) {
                textElement.textContent = message;
            }
        }
    }

    // 隐藏加载指示器
    hideLoading() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.classList.remove('show');
        }
    }

    // 显示错误信息
    showError(message) {
        alert(message); // 简单实现，可以改进为更好的UI
    }

    // 清理资源
    async cleanup() {
        // 停止游戏
        if (gameLogic) {
            await gameLogic.cleanup();
        }

        // 停止摄像头
        if (this.elements.gameElements.cameraVideo && this.elements.gameElements.cameraVideo.srcObject) {
            const stream = this.elements.gameElements.cameraVideo.srcObject;
            stream.getTracks().forEach(track => track.stop());
        }

        console.log('应用资源已清理');
    }
}

// 创建应用实例
const app = new BodyWordGame();

// 导出到全局作用域（用于调试）
window.BodyWordGame = BodyWordGame;
window.app = app;
window.gameLogic = gameLogic;
window.poseDetector = poseDetector;
window.game2DRenderer = game2DRenderer;
window.audioManager = audioManager;
