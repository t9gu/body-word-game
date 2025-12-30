// MediaPipe姿态检测器
// 版本: v6.0 - 优化姿态检测，支持2D渲染器
console.log('✅ PoseDetector v6.0 已加载');

class PoseDetector {
    constructor() {
        this.pose = null;
        this.camera = null;
        this.isInitialized = false;
        this.isDetecting = false;
        this.currentPose = null;
        this.onPoseDetected = null;
        this.onPoseLost = null;
        this.detectionInterval = null;
        this.lastDetectionTime = 0;
        this.detectionThreshold = 100; // 毫秒
        
        // 姿态检测配置
        this.config = {
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        };
    }

    // 初始化MediaPipe Pose
    async init(videoElement, canvasElement = null) {
        try {
            console.log('开始初始化MediaPipe Pose...');
            
            // 保存canvas元素引用
            this.canvasElement = canvasElement;
            
            // 创建Pose实例
            this.pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });
            
            // 配置Pose选项
            await this.pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            console.log('Pose配置完成');
            
            // 设置结果回调
            this.pose.onResults(this.onResults.bind(this));
            
            // 设置摄像头（添加帧率限制）
            let errorCount = 0;
            const maxErrors = 10;
            let lastFrameTime = 0;
            const minFrameInterval = 50; // 最小50ms间隔，约20fps
            let isProcessing = false;
            
            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    // 防止重复处理
                    if (isProcessing) return;
                    
                    // 帧率限制
                    const now = Date.now();
                    if (now - lastFrameTime < minFrameInterval) return;
                    lastFrameTime = now;
                    
                    if (this.isDetecting && this.pose) {
                        isProcessing = true;
                        try {
                            await this.pose.send({image: videoElement});
                            errorCount = Math.max(0, errorCount - 1); // 逐渐减少错误计数
                        } catch (error) {
                            errorCount++;
                            if (errorCount <= 3) {
                                console.warn(`姿态检测帧处理警告 (${errorCount}):`, error.message);
                            }
                            if (errorCount >= maxErrors) {
                                console.error('❌ MediaPipe错误过多，暂停1秒后重试');
                                errorCount = 0;
                                // 暂停检测1秒后自动恢复
                                this.isDetecting = false;
                                setTimeout(() => {
                                    this.isDetecting = true;
                                    console.log('🔄 自动恢复姿态检测');
                                }, 1000);
                            }
                        } finally {
                            isProcessing = false;
                        }
                    }
                },
                width: 640,
                height: 480
            });
            
            this.isInitialized = true;
            console.log('✅ MediaPipe姿态检测器初始化成功');
            
            return true;
        } catch (error) {
            console.error('❌ MediaPipe姿态检测器初始化失败:', error);
            return false;
        }
    }

    // 处理姿态检测结果
    onResults(results) {
        const currentTime = Date.now();
        
        // 控制检测频率
        if (currentTime - this.lastDetectionTime < this.detectionThreshold) {
            return;
        }
        this.lastDetectionTime = currentTime;
        
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            this.currentPose = results.poseLandmarks;
            
            // 计算关键点位置
            const poseData = this.analyzePose(results.poseLandmarks);
            
            // 触发姿态检测回调
            if (this.onPoseDetected) {
                this.onPoseDetected(poseData);
            }
        } else {
            this.currentPose = null;
            
            // 触发姿态丢失回调
            if (this.onPoseLost) {
                this.onPoseLost();
            }
        }
        
        // 可选：在画布上绘制姿态
        if (this.canvasElement) {
            this.drawPose(results, this.canvasElement);
        }
    }

    // 分析姿态数据
    analyzePose(landmarks) {
        const poseData = {
            landmarks: landmarks,
            bodyParts: {},
            gestures: {},
            confidence: 0
        };

        // 提取关键身体部位坐标
        poseData.bodyParts = {
            head: this.getLandmarkPosition(landmarks, 0), // 鼻子
            leftShoulder: this.getLandmarkPosition(landmarks, 11),
            rightShoulder: this.getLandmarkPosition(landmarks, 12),
            leftElbow: this.getLandmarkPosition(landmarks, 13),
            rightElbow: this.getLandmarkPosition(landmarks, 14),
            leftWrist: this.getLandmarkPosition(landmarks, 15),
            rightWrist: this.getLandmarkPosition(landmarks, 16),
            leftHip: this.getLandmarkPosition(landmarks, 23),
            rightHip: this.getLandmarkPosition(landmarks, 24),
            leftKnee: this.getLandmarkPosition(landmarks, 25),
            rightKnee: this.getLandmarkPosition(landmarks, 26),
            leftAnkle: this.getLandmarkPosition(landmarks, 27),
            rightAnkle: this.getLandmarkPosition(landmarks, 28)
        };

        // 检测手势
        poseData.gestures = this.detectGestures(poseData.bodyParts);
        
        // 计算整体置信度
        poseData.confidence = this.calculateConfidence(landmarks);

        return poseData;
    }

    // 获取特定地标位置
    getLandmarkPosition(landmarks, index) {
        if (landmarks && landmarks[index]) {
            return {
                x: landmarks[index].x,
                y: landmarks[index].y,
                z: landmarks[index].z,
                visibility: landmarks[index].visibility || 0
            };
        }
        return null;
    }

    // 检测手势和动作
    detectGestures(bodyParts) {
        const gestures = {
            leftHandUp: false,
            rightHandUp: false,
            bothHandsUp: false,
            leftHandForward: false,
            rightHandForward: false,
            jumping: false,
            squatting: false,
            waving: false,
            pointing: false
        };

        if (!bodyParts.head || !bodyParts.leftShoulder || !bodyParts.rightShoulder) {
            return gestures;
        }

        const headY = bodyParts.head.y;
        const shoulderY = (bodyParts.leftShoulder.y + bodyParts.rightShoulder.y) / 2;

        // 检测举手
        if (bodyParts.leftWrist && bodyParts.leftWrist.visibility > 0.5) {
            gestures.leftHandUp = bodyParts.leftWrist.y < shoulderY;
            gestures.leftHandForward = bodyParts.leftWrist.z < -0.1;
        }

        if (bodyParts.rightWrist && bodyParts.rightWrist.visibility > 0.5) {
            gestures.rightHandUp = bodyParts.rightWrist.y < shoulderY;
            gestures.rightHandForward = bodyParts.rightWrist.z < -0.1;
        }

        gestures.bothHandsUp = gestures.leftHandUp && gestures.rightHandUp;

        // 检测跳跃（头部位置显著上升）
        if (bodyParts.leftHip && bodyParts.rightHip) {
            const hipY = (bodyParts.leftHip.y + bodyParts.rightHip.y) / 2;
            const headHipRatio = headY / hipY;
            gestures.jumping = headHipRatio < 0.8; // 头部相对于髋部位置较高
        }

        // 检测下蹲
        if (bodyParts.leftKnee && bodyParts.rightKnee && bodyParts.leftHip && bodyParts.rightHip) {
            const hipY = (bodyParts.leftHip.y + bodyParts.rightHip.y) / 2;
            const kneeY = (bodyParts.leftKnee.y + bodyParts.rightKnee.y) / 2;
            const hipKneeRatio = hipY / kneeY;
            gestures.squatting = hipKneeRatio > 0.7; // 髋部接近膝盖
        }

        // 检测挥手（手腕快速移动）
        gestures.waving = this.detectWaving(bodyParts);

        // 检测指向
        gestures.pointing = this.detectPointing(bodyParts);

        return gestures;
    }

    // 检测挥手动作
    detectWaving(bodyParts) {
        // 简化的挥手检测：手腕在肩膀上方且左右移动
        if (!bodyParts.leftWrist || !bodyParts.leftShoulder || !bodyParts.rightWrist || !bodyParts.rightShoulder) {
            return false;
        }

        const leftWristUp = bodyParts.leftWrist.y < bodyParts.leftShoulder.y;
        const rightWristUp = bodyParts.rightWrist.y < bodyParts.rightShoulder.y;

        return leftWristUp || rightWristUp;
    }

    // 检测指向动作
    detectPointing(bodyParts) {
        // 检测手臂伸直指向
        if (!bodyParts.leftShoulder || !bodyParts.leftElbow || !bodyParts.leftWrist) {
            return false;
        }

        // 计算手臂伸直程度
        const leftArmStraight = this.isArmStraight(bodyParts.leftShoulder, bodyParts.leftElbow, bodyParts.leftWrist);
        const rightArmStraight = this.isArmStraight(bodyParts.rightShoulder, bodyParts.rightElbow, bodyParts.rightWrist);

        return leftArmStraight || rightArmStraight;
    }

    // 判断手臂是否伸直
    isArmStraight(shoulder, elbow, wrist) {
        if (!shoulder || !elbow || !wrist) return false;

        // 计算肩-肘-腕角度
        const angle = this.calculateAngle(shoulder, elbow, wrist);
        return angle > 160; // 接近180度为伸直
    }

    // 计算三点角度
    calculateAngle(point1, point2, point3) {
        const vector1 = {
            x: point1.x - point2.x,
            y: point1.y - point2.y
        };
        const vector2 = {
            x: point3.x - point2.x,
            y: point3.y - point2.y
        };

        const dot = vector1.x * vector2.x + vector1.y * vector2.y;
        const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
        const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

        const cosAngle = dot / (mag1 * mag2);
        const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);

        return angle;
    }

    // 计算整体置信度
    calculateConfidence(landmarks) {
        if (!landmarks || landmarks.length === 0) return 0;

        let totalVisibility = 0;
        let visibleCount = 0;

        landmarks.forEach(landmark => {
            if (landmark.visibility !== undefined) {
                totalVisibility += landmark.visibility;
                visibleCount++;
            }
        });

        return visibleCount > 0 ? totalVisibility / visibleCount : 0;
    }

    // 在画布上绘制姿态
    drawPose(results, canvasElement) {
        const canvasCtx = canvasElement.getContext('2d');
        
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        // 绘制连接线
        if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 4
            });
            
            // 绘制关键点
            drawLandmarks(canvasCtx, results.poseLandmarks, {
                color: '#FF0000',
                lineWidth: 2,
                radius: 6
            });
        }
        
        canvasCtx.restore();
    }

    // 开始检测
    async startDetection() {
        if (!this.isInitialized || !this.camera) {
            console.error('姿态检测器未初始化');
            return false;
        }

        try {
            this.isDetecting = true;
            await this.camera.start();
            console.log('姿态检测已开始');
            return true;
        } catch (error) {
            console.error('开始姿态检测失败:', error);
            return false;
        }
    }

    // 停止检测
    stopDetection() {
        if (this.camera) {
            this.camera.stop();
        }
        this.isDetecting = false;
        this.currentPose = null;
        console.log('姿态检测已停止');
    }

    // 获取当前姿态
    getCurrentPose() {
        return this.currentPose;
    }

    // 设置姿态检测回调
    setPoseDetectedCallback(callback) {
        this.onPoseDetected = callback;
    }

    // 设置姿态丢失回调
    setPoseLostCallback(callback) {
        this.onPoseLost = callback;
    }

    // 设置检测频率
    setDetectionThreshold(threshold) {
        this.detectionThreshold = Math.max(16, threshold); // 最小16ms (60fps)
    }

    // 清理资源
    cleanup() {
        this.stopDetection();
        
        if (this.pose) {
            this.pose.close();
            this.pose = null;
        }
        
        if (this.camera) {
            this.camera = null;
        }
        
        this.isInitialized = false;
        this.currentPose = null;
        this.onPoseDetected = null;
        this.onPoseLost = null;
    }

    // 检查是否支持摄像头
    static async checkCameraSupport() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('摄像头不支持:', error);
            return false;
        }
    }
}

// 创建全局姿态检测器实例
const poseDetector = new PoseDetector();

// 导出姿态检测器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PoseDetector;
}
