// 单词主题数据
const WORD_TOPICS = {
    "appliances": {
        name: "家用电器",
        emoji: "🏠",
        words: [
            { word: "camera", translation: "相机", image: "camera" },
            { word: "DVD player", translation: "DVD播放机", image: "dvd" },
            { word: "laptop", translation: "笔记本电脑", image: "laptop" },
            { word: "radio", translation: "收音机", image: "radio" },
            { word: "CD player", translation: "CD播放机", image: "cd" },
            { word: "electric lights", translation: "电灯", image: "lights" },
            { word: "telephone", translation: "电话", image: "telephone" },
            { word: "cell phone", translation: "手机", image: "phone" },
            { word: "television", translation: "电视", image: "tv" },
            { word: "clock", translation: "时钟", image: "clock" },
            { word: "fridge", translation: "冰箱", image: "fridge" },
            { word: "oven", translation: "烤箱", image: "oven" },
            { word: "computer", translation: "电脑", image: "computer" },
            { word: "washing machine", translation: "洗衣机", image: "washing" },
            { word: "lamp", translation: "台灯", image: "lamp" }
        ]
    },
    "clothes": {
        name: "衣物配饰",
        emoji: "👕",
        words: [
            { word: "backpack", translation: "背包", image: "backpack" },
            { word: "bag", translation: "包", image: "bag" },
            { word: "raincoat", translation: "雨衣", image: "raincoat" },
            { word: "tie", translation: "领带", image: "tie" },
            { word: "glasses", translation: "眼镜", image: "glasses" },
            { word: "ring", translation: "戒指", image: "ring" },
            { word: "belt", translation: "腰带", image: "belt" },
            { word: "glove", translation: "手套", image: "glove" },
            { word: "trainers", translation: "运动鞋", image: "trainers" },
            { word: "blouse", translation: "女士衬衫", image: "blouse" },
            { word: "handbag", translation: "手提包", image: "handbag" },
            { word: "scarf", translation: "围巾", image: "scarf" },
            { word: "trousers", translation: "裤子", image: "trousers" },
            { word: "boot", translation: "靴子", image: "boot" },
            { word: "hat", translation: "帽子", image: "hat" },
            { word: "shirt", translation: "衬衫", image: "shirt" },
            { word: "shoes", translation: "鞋子", image: "shoes" },
            { word: "T-shirt", translation: "T恤", image: "tshirt" },
            { word: "jacket", translation: "夹克", image: "jacket" },
            { word: "shorts", translation: "短裤", image: "shorts" },
            { word: "umbrella", translation: "雨伞", image: "umbrella" },
            { word: "jeans", translation: "牛仔裤", image: "jeans" },
            { word: "skirt", translation: "裙子", image: "skirt" },
            { word: "uniform", translation: "校服", image: "uniform" },
            { word: "sock", translation: "袜子", image: "sock" },
            { word: "coat", translation: "外套", image: "coat" },
            { word: "suit", translation: "西装", image: "suit" },
            { word: "watch", translation: "手表", image: "watch" },
            { word: "dress", translation: "连衣裙", image: "dress" },
            { word: "sweater", translation: "毛衣", image: "sweater" }
        ]
    },
    "colors": {
        name: "颜色",
        emoji: "🎨",
        words: [
            { word: "black", translation: "黑色", image: "black" },
            { word: "golden", translation: "金色", image: "golden" },
            { word: "orange", translation: "橙色", image: "orange" },
            { word: "red", translation: "红色", image: "red" },
            { word: "blue", translation: "蓝色", image: "blue" },
            { word: "green", translation: "绿色", image: "green" },
            { word: "silver", translation: "银色", image: "silver" },
            { word: "brown", translation: "棕色", image: "brown" },
            { word: "grey", translation: "灰色", image: "grey" },
            { word: "pink", translation: "粉色", image: "pink" },
            { word: "white", translation: "白色", image: "white" },
            { word: "purple", translation: "紫色", image: "purple" },
            { word: "yellow", translation: "黄色", image: "yellow" }
        ]
    },
    "food": {
        name: "食物饮料",
        emoji: "🍔",
        words: [
            { word: "apple", translation: "苹果", image: "apple" },
            { word: "banana", translation: "香蕉", image: "banana" },
            { word: "pizza", translation: "披萨", image: "pizza" },
            { word: "hamburger", translation: "汉堡", image: "burger" },
            { word: "chocolate", translation: "巧克力", image: "chocolate" },
            { word: "ice cream", translation: "冰淇淋", image: "icecream" },
            { word: "cake", translation: "蛋糕", image: "cake" },
            { word: "bread", translation: "面包", image: "bread" },
            { word: "rice", translation: "米饭", image: "rice" },
            { word: "noodles", translation: "面条", image: "noodles" },
            { word: "chicken", translation: "鸡肉", image: "chicken" },
            { word: "fish", translation: "鱼", image: "fish" },
            { word: "egg", translation: "鸡蛋", image: "egg" },
            { word: "milk", translation: "牛奶", image: "milk" },
            { word: "water", translation: "水", image: "water" },
            { word: "juice", translation: "果汁", image: "juice" },
            { word: "coffee", translation: "咖啡", image: "coffee" },
            { word: "tea", translation: "茶", image: "tea" },
            { word: "sandwich", translation: "三明治", image: "sandwich" },
            { word: "salad", translation: "沙拉", image: "salad" },
            { word: "soup", translation: "汤", image: "soup" },
            { word: "cheese", translation: "奶酪", image: "cheese" },
            { word: "butter", translation: "黄油", image: "butter" },
            { word: "sugar", translation: "糖", image: "sugar" },
            { word: "salt", translation: "盐", image: "salt" },
            { word: "pepper", translation: "胡椒", image: "pepper" },
            { word: "tomato", translation: "番茄", image: "tomato" },
            { word: "potato", translation: "土豆", image: "potato" },
            { word: "carrot", translation: "胡萝卜", image: "carrot" },
            { word: "onion", translation: "洋葱", image: "onion" },
            { word: "garlic", translation: "大蒜", image: "garlic" }
        ]
    },
    "animals": {
        name: "动物",
        emoji: "🐾",
        words: [
            { word: "cat", translation: "猫", image: "cat" },
            { word: "dog", translation: "狗", image: "dog" },
            { word: "bird", translation: "鸟", image: "bird" },
            { word: "fish", translation: "鱼", image: "fish" },
            { word: "rabbit", translation: "兔子", image: "rabbit" },
            { word: "horse", translation: "马", image: "horse" },
            { word: "cow", translation: "牛", image: "cow" },
            { word: "pig", translation: "猪", image: "pig" },
            { word: "sheep", translation: "羊", image: "sheep" },
            { word: "chicken", translation: "鸡", image: "chicken" },
            { word: "duck", translation: "鸭子", image: "duck" },
            { word: "mouse", translation: "老鼠", image: "mouse" },
            { word: "elephant", translation: "大象", image: "elephant" },
            { word: "lion", translation: "狮子", image: "lion" },
            { word: "tiger", translation: "老虎", image: "tiger" },
            { word: "bear", translation: "熊", image: "bear" },
            { word: "monkey", translation: "猴子", image: "monkey" },
            { word: "panda", translation: "熊猫", image: "panda" },
            { word: "zebra", translation: "斑马", image: "zebra" },
            { word: "giraffe", translation: "长颈鹿", image: "giraffe" }
        ]
    },
    "fruits": {
        name: "水果",
        emoji: "🍎",
        words: [
            { word: "apple", translation: "苹果", image: "apple" },
            { word: "banana", translation: "香蕉", image: "banana" },
            { word: "orange", translation: "橙子", image: "orange" },
            { word: "grape", translation: "葡萄", image: "grape" },
            { word: "strawberry", translation: "草莓", image: "strawberry" },
            { word: "watermelon", translation: "西瓜", image: "watermelon" },
            { word: "pineapple", translation: "菠萝", image: "pineapple" },
            { word: "mango", translation: "芒果", image: "mango" },
            { word: "pear", translation: "梨", image: "pear" },
            { word: "peach", translation: "桃子", image: "peach" },
            { word: "cherry", translation: "樱桃", image: "cherry" },
            { word: "lemon", translation: "柠檬", image: "lemon" },
            { word: "kiwi", translation: "猕猴桃", image: "kiwi" },
            { word: "coconut", translation: "椰子", image: "coconut" },
            { word: "avocado", translation: "牛油果", image: "avocado" }
        ]
    },
    "sports": {
        name: "运动",
        emoji: "⚽",
        words: [
            { word: "football", translation: "足球", image: "football" },
            { word: "basketball", translation: "篮球", image: "basketball" },
            { word: "tennis", translation: "网球", image: "tennis" },
            { word: "swimming", translation: "游泳", image: "swimming" },
            { word: "running", translation: "跑步", image: "running" },
            { word: "cycling", translation: "骑行", image: "cycling" },
            { word: "skiing", translation: "滑雪", image: "skiing" },
            { word: "baseball", translation: "棒球", image: "baseball" },
            { word: "volleyball", translation: "排球", image: "volleyball" },
            { word: "golf", translation: "高尔夫", image: "golf" },
            { word: "boxing", translation: "拳击", image: "boxing" },
            { word: "yoga", translation: "瑜伽", image: "yoga" },
            { word: "dance", translation: "跳舞", image: "dance" },
            { word: "surfing", translation: "冲浪", image: "surfing" },
            { word: "climbing", translation: "攀岩", image: "climbing" }
        ]
    },
    "vehicles": {
        name: "交通工具",
        emoji: "🚗",
        words: [
            { word: "car", translation: "汽车", image: "car" },
            { word: "bus", translation: "公交车", image: "bus" },
            { word: "train", translation: "火车", image: "train" },
            { word: "airplane", translation: "飞机", image: "airplane" },
            { word: "bicycle", translation: "自行车", image: "bicycle" },
            { word: "motorcycle", translation: "摩托车", image: "motorcycle" },
            { word: "boat", translation: "船", image: "boat" },
            { word: "ship", translation: "轮船", image: "ship" },
            { word: "subway", translation: "地铁", image: "subway" },
            { word: "taxi", translation: "出租车", image: "taxi" },
            { word: "truck", translation: "卡车", image: "truck" },
            { word: "helicopter", translation: "直升机", image: "helicopter" },
            { word: "rocket", translation: "火箭", image: "rocket" },
            { word: "scooter", translation: "滑板车", image: "scooter" },
            { word: "tram", translation: "有轨电车", image: "tram" }
        ]
    },
    "school": {
        name: "学校教育",
        emoji: "🏫",
        words: [
            { word: "school", translation: "学校", image: "school" },
            { word: "teacher", translation: "老师", image: "teacher" },
            { word: "student", translation: "学生", image: "student" },
            { word: "book", translation: "书", image: "book" },
            { word: "pencil", translation: "铅笔", image: "pencil" },
            { word: "pen", translation: "钢笔", image: "pen" },
            { word: "ruler", translation: "尺子", image: "ruler" },
            { word: "eraser", translation: "橡皮", image: "eraser" },
            { word: "desk", translation: "课桌", image: "desk" },
            { word: "chair", translation: "椅子", image: "chair" },
            { word: "blackboard", translation: "黑板", image: "blackboard" },
            { word: "notebook", translation: "笔记本", image: "notebook" },
            { word: "backpack", translation: "背包", image: "backpack" },
            { word: "classroom", translation: "教室", image: "classroom" },
            { word: "library", translation: "图书馆", image: "library" },
            { word: "playground", translation: "操场", image: "playground" },
            { word: "homework", translation: "作业", image: "homework" },
            { word: "exam", translation: "考试", image: "exam" },
            { word: "lesson", translation: "课程", image: "lesson" }
        ]
    },
    "weather": {
        name: "天气",
        emoji: "☀️",
        words: [
            { word: "sunny", translation: "晴天", image: "sunny" },
            { word: "cloudy", translation: "多云", image: "cloudy" },
            { word: "rainy", translation: "下雨", image: "rainy" },
            { word: "snowy", translation: "下雪", image: "snowy" },
            { word: "windy", translation: "有风", image: "windy" },
            { word: "hot", translation: "热", image: "hot" },
            { word: "cold", translation: "冷", image: "cold" },
            { word: "warm", translation: "温暖", image: "warm" },
            { word: "cool", translation: "凉爽", image: "cool" },
            { word: "storm", translation: "暴风雨", image: "storm" },
            { word: "thunder", translation: "雷", image: "thunder" },
            { word: "lightning", translation: "闪电", image: "lightning" },
            { word: "fog", translation: "雾", image: "fog" },
            { word: "rainbow", translation: "彩虹", image: "rainbow" }
        ]
    }
};

// 获取随机单词对
function getRandomWordPairs(topicId, count = 4) {
    const topic = WORD_TOPICS[topicId];
    if (!topic) return [];
    
    const words = [...topic.words];
    const shuffled = words.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 获取所有主题
function getAllTopics() {
    return Object.keys(WORD_TOPICS).map(key => ({
        id: key,
        ...WORD_TOPICS[key]
    }));
}

// 检查单词匹配
function checkWordMatch(word1, word2) {
    return word1.word === word2.word;
}

// 获取单词图片URL
function getWordImageUrl(wordData) {
    // 这里可以配置图片的基础路径
    return `assets/images/${wordData.image}.png`;
}

// 获取主题的随机子集
function getRandomTopics(count = 3) {
    const topics = getAllTopics();
    const shuffled = topics.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
