// Three.js 3D场景管理器
// 版本: v5.0 - 添加所有动画安全检查
console.log('✅ ThreeSceneManager v5.0 已加载');

class ThreeSceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.container = null;
        this.isInitialized = false;
        this.animationId = null;
        
        // 游戏对象
        this.wordBalls = [];
        this.selectedBalls = [];
        this.particles = [];
        this.animations = [];
        
        // 配置
        this.config = {
            antialias: true,
            alpha: true,
            backgroundColor: 0x1e3c72,
            cameraFov: 75,
            cameraNear: 0.1,
            cameraFar: 1000,
            ballRadius: 0.5,
            ballSpacing: 3,
            selectionDistance: 2,
            particleCount: 50
        };
    }

    // 初始化Three.js场景
    async init(containerId) {
        try {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                throw new Error(`容器 ${containerId} 不存在`);
            }

            // 创建场景
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x1e3c72, 10, 50);

            // 创建相机
            const aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(
                this.config.cameraFov,
                aspect,
                this.config.cameraNear,
                this.config.cameraFar
            );
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);

            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({
                antialias: this.config.antialias,
                alpha: this.config.alpha
            });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setClearColor(this.config.backgroundColor, 1);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.container.appendChild(this.renderer.domElement);

            // 添加灯光
            this.setupLighting();
            
            // 创建环境
            this.createEnvironment();
            
            // 设置事件监听
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Three.js场景初始化成功');
            
            // 开始动画循环
            this.animate();
            
            return true;
        } catch (error) {
            console.error('Three.js场景初始化失败:', error);
            return false;
        }
    }

    // 设置灯光
    setupLighting() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // 主光源
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // 点光源（用于强调效果）
        const pointLight = new THREE.PointLight(0xff6b6b, 1, 10);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
    }

    // 创建环境
    createEnvironment() {
        // 创建地面
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2a5298,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // 创建背景粒子
        this.createBackgroundParticles();
    }

    // 创建背景粒子
    createBackgroundParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 40;
            positions[i3 + 1] = Math.random() * 20 - 5;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;

            colors[i3] = Math.random() * 0.5 + 0.5;
            colors[i3 + 1] = Math.random() * 0.5 + 0.5;
            colors[i3 + 2] = 1;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        this.particles.push(particles);
    }

    // 创建单词球体
    createWordBalls(wordPairs) {
        // 清除现有的球体
        this.clearWordBalls();

        const positions = [
            { x: -this.config.ballSpacing, y: 1, z: 0 },  // 左前
            { x: -this.config.ballSpacing, y: 1, z: 2 },  // 左后
            { x: this.config.ballSpacing, y: 1, z: 0 },   // 右前
            { x: this.config.ballSpacing, y: 1, z: 2 }    // 右后
        ];

        wordPairs.forEach((wordData, index) => {
            if (index < positions.length) {
                const ball = this.createSingleBall(wordData, positions[index], index);
                this.wordBalls.push(ball);
            }
        });

        return this.wordBalls;
    }

    // 创建单个球体
    createSingleBall(wordData, position, index) {
        const group = new THREE.Group();
        
        // 将普通对象转换为THREE.Vector3
        const positionVector = new THREE.Vector3(position.x, position.y, position.z);
        
        // 创建球体几何
        const geometry = new THREE.SphereGeometry(this.config.ballRadius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: this.getBallColor(index),
            emissive: this.getBallColor(index),
            emissiveIntensity: 0.2,
            shininess: 100
        });
        
        const ball = new THREE.Mesh(geometry, material);
        ball.castShadow = true;
        ball.receiveShadow = true;
        ball.userData = {
            wordData: wordData,
            index: index,
            isSelected: false,
            originalColor: this.getBallColor(index),
            targetPosition: positionVector.clone(),
            currentPosition: positionVector.clone()
        };
        
        group.add(ball);
        
        // 创建文字标签
        const label = this.createTextLabel(wordData, index);
        label.position.y = this.config.ballRadius + 0.5;
        group.add(label);
        
        // 设置位置
        group.position.copy(positionVector);
        
        // 将targetPosition也存储到group.userData中，供动画使用
        group.userData = {
            targetPosition: positionVector.clone()
        };
        
        // 添加动画
        this.addBallAnimation(group, ball);
        
        this.scene.add(group);
        
        return {
            group: group,
            ball: ball,
            label: label,
            userData: ball.userData
        };
    }

    // 获取球体颜色
    getBallColor(index) {
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24];
        return colors[index % colors.length];
    }

    // 创建文字标签
    createTextLabel(wordData, index) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        // 设置样式
        context.fillStyle = 'white';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 绘制文字
        const text = index < 2 ? wordData.word : wordData.translation;
        context.fillText(text, 256, 128);
        
        // 创建纹理
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 1, 1);
        
        return sprite;
    }

    // 添加球体动画
    addBallAnimation(group, ball) {
        // 保存初始Y位置用于动画
        const initialY = group.position.y;
        
        // 浮动动画
        const floatAnimation = {
            object: group,
            initialY: initialY,
            startTime: Date.now(),
            amplitude: 0.2,
            frequency: 1,
            update: function() {
                // 安全检查
                if (!this.object || !this.object.position) {
                    return true; // 返回true表示应该移除此动画
                }
                const elapsed = (Date.now() - this.startTime) / 1000;
                const offset = Math.sin(elapsed * this.frequency * Math.PI * 2) * this.amplitude;
                this.object.position.y = this.initialY + offset;
                return false;
            }
        };
        
        this.animations.push(floatAnimation);
        
        // 旋转动画
        const rotateAnimation = {
            object: ball,
            update: function() {
                // 安全检查
                if (!this.object || !this.object.rotation) {
                    return true; // 返回true表示应该移除此动画
                }
                this.object.rotation.y += 0.01;
                this.object.rotation.x += 0.005;
                return false;
            }
        };
        
        this.animations.push(rotateAnimation);
    }

    // 选择球体
    selectBall(ballIndex) {
        if (ballIndex < 0 || ballIndex >= this.wordBalls.length) return false;
        
        const ballObject = this.wordBalls[ballIndex];
        if (ballObject.userData.isSelected) return false;
        
        ballObject.userData.isSelected = true;
        ballObject.ball.material.emissiveIntensity = 0.5;
        ballObject.ball.scale.set(1.2, 1.2, 1.2);
        
        this.selectedBalls.push(ballObject);
        
        // 创建选择特效
        this.createSelectionEffect(ballObject.group.position);
        
        return true;
    }

    // 创建选择特效
    createSelectionEffect(position) {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 20;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y + (Math.random() - 0.5) * 2;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffff00,
            size: 0.1,
            transparent: true,
            opacity: 1
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        
        // 粒子扩散动画
        const animation = {
            particles: particles,
            startTime: Date.now(),
            duration: 1000,
            update: function() {
                // 安全检查
                if (!this.particles || !this.particles.scale || !this.particles.material) {
                    return true; // 返回true表示删除此动画
                }
                
                const elapsed = Date.now() - this.startTime;
                const progress = elapsed / this.duration;
                
                if (progress >= 1) {
                    if (this.scene && this.particles) {
                        this.scene.remove(this.particles);
                    }
                    return true; // 删除动画
                }
                
                this.particles.scale.set(1 + progress, 1 + progress, 1 + progress);
                this.particles.material.opacity = 1 - progress;
                
                return false;
            }.bind(this)
        };
        
        this.animations.push(animation);
    }

    // 清除选中的球体
    clearSelection() {
        this.selectedBalls.forEach(ballObject => {
            ballObject.userData.isSelected = false;
            ballObject.ball.material.emissiveIntensity = 0.2;
            ballObject.ball.scale.set(1, 1, 1);
        });
        this.selectedBalls = [];
    }

    // 移除球体
    removeBalls(ballIndices) {
        ballIndices.forEach(index => {
            if (index < this.wordBalls.length) {
                const ballObject = this.wordBalls[index];
                this.createRemovalEffect(ballObject.group.position);
                this.scene.remove(ballObject.group);
            }
        });
        
        // 从数组中移除
        this.wordBalls = this.wordBalls.filter((_, index) => !ballIndices.includes(index));
        this.selectedBalls = this.selectedBalls.filter(ball => 
            !ballIndices.includes(ball.userData.index)
        );
    }

    // 创建移除特效
    createRemovalEffect(position) {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 30;
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.1,
                y: Math.random() * 0.1,
                z: (Math.random() - 0.5) * 0.1
            });
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ff00,
            size: 0.15,
            transparent: true,
            opacity: 1
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        
        // 爆炸动画
        const animation = {
            particles: particles,
            velocities: velocities,
            startTime: Date.now(),
            duration: 1500,
            update: function() {
                // 安全检查
                if (!this.particles || !this.particles.geometry || !this.particles.material) {
                    return true; // 返回true表示删除此动画
                }
                
                const elapsed = Date.now() - this.startTime;
                const progress = elapsed / this.duration;
                
                if (progress >= 1) {
                    if (this.scene && this.particles) {
                        this.scene.remove(this.particles);
                    }
                    return true; // 删除动画
                }
                
                try {
                    const positions = this.particles.geometry.attributes.position.array;
                    for (let i = 0; i < this.velocities.length; i++) {
                        const i3 = i * 3;
                        positions[i3] += this.velocities[i].x;
                        positions[i3 + 1] += this.velocities[i].y;
                        positions[i3 + 2] += this.velocities[i].z;
                        this.velocities[i].y -= 0.002; // 重力
                    }
                    
                    this.particles.geometry.attributes.position.needsUpdate = true;
                    this.particles.material.opacity = 1 - progress;
                } catch (error) {
                    return true; // 出错时移除动画
                }
                
                return false;
            }.bind(this)
        };
        
        this.animations.push(animation);
    }

    // 清除所有单词球体
    clearWordBalls() {
        this.wordBalls.forEach(ballObject => {
            this.scene.remove(ballObject.group);
        });
        this.wordBalls = [];
        this.selectedBalls = [];
    }

    // 设置事件监听
    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    // 窗口大小改变
    onWindowResize() {
        if (!this.camera || !this.renderer || !this.container) return;
        
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    // 动画循环
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        // 更新动画
        this.updateAnimations();
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }

    // 更新动画
    updateAnimations() {
        this.animations = this.animations.filter(animation => {
            const shouldRemove = animation.update();
            return !shouldRemove;
        });
    }

    // 获取选中的球体
    getSelectedBalls() {
        return this.selectedBalls.map(ballObject => ballObject.userData);
    }

    // 清除所有选中
    clearAllSelected() {
        this.clearSelection();
    }

    // 清理资源
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container && this.renderer.domElement) {
                this.container.removeChild(this.renderer.domElement);
            }
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.wordBalls = [];
        this.selectedBalls = [];
        this.particles = [];
        this.animations = [];
        this.isInitialized = false;
    }
}

// 创建全局Three.js场景管理器实例
const threeSceneManager = new ThreeSceneManager();

// 导出场景管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeSceneManager;
}
