// let SliderProgress = true;


let pityCounter = {
    ssr: 0,  // 距离上次5星的抽数
    sr: 0    // 距离上次4星的抽数
};

// 全局祈愿开关
let isGachaEnabled = true;

// 祈愿状态标记（用于判断关闭按钮的功能）
let isInGachaResultView = false; // 是否在抽卡结果界面

// 祈愿记录名称
const RecordName = 'RecordWishes';

// 双倍系统状态管理
const DOUBLE_BONUS_KEY = 'doubleBonusStatus';
const DOUBLE_BONUS_RESET_KEY = 'doubleBonusResetDate';

// 双倍奖励配置
// base: 基础数量
// bonus: 赠送数量（双倍消耗后，每次充值额外赠送的数量）
// double: 双倍数量（首次充值获得的数量）
const RECHARGE_CONFIG = {
    60: { base: 60, bonus: 0, double: 120 },      // 6元档：首次120，之后60（无赠送）
    300: { base: 300, bonus: 30, double: 600 },   // 30元档：首次600，之后300+30=330
    980: { base: 980, bonus: 110, double: 1960 }, // 98元档：首次1960，之后980+110=1090
    1980: { base: 1980, bonus: 260, double: 3960 }, // 198元档：首次3960，之后1980+260=2240
    3280: { base: 3280, bonus: 600, double: 6560 }, // 328元档：首次6560，之后3280+600=3880
    6480: { base: 6480, bonus: 1600, double: 12960 } // 648元档：首次12960，之后6480+1600=8080
};

// 核心DOM元素
let cardBox, singleBtn, tenBtn, currentWishItem, skipBtn, closeBtn, wishContainer;
let detailBtn, detailContainer, closeDetailBtn;
let primogemCount, fateCount, starlightCount, stardustCount, addPrimogemBtn, resourcesTop, resourcesBottom;
let dustExchangeBtn, dustExchangeContainer, closeExchangeBtn, tabBtns, tabContents;
let exchange1Btn, exchange10Btn, starlightExchangeFateBtn, starlightExchangeEncounterBtn;
let stardustExchangeFateBtn, stardustExchangeEncounterBtn;
let buy60CrystalBtn, buy300CrystalBtn, buy980CrystalBtn, buy1980CrystalBtn, buy3280CrystalBtn, buy6480CrystalBtn;

// 禁用右键菜单
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 2. 核心DOM
    cardBox = document.querySelector(".card-box");
    singleBtn = document.getElementById("singleBtn");
    tenBtn = document.getElementById("tenBtn");
    currentWishItem = document.querySelector('.card-level');
    skipBtn = document.getElementById("skipBtn"); // 添加跳过按钮
    closeBtn = document.getElementById("closeBtn"); // 关闭按钮
    wishContainer = document.getElementById("wish-container"); // 祈愿容器

    // 获取详情按钮和详情容器
    detailBtn = document.getElementById('detailBtn');
    detailContainer = document.querySelector('.detail-container');
    closeDetailBtn = document.getElementById('closeDetailBtn');

    // 获取资源元素
    primogemCount = document.getElementById('primogemCount');
    fateCount = document.getElementById('fateCount');
    starlightCount = document.getElementById('starlightCount');
    stardustCount = document.getElementById('stardustCount');
    addPrimogemBtn = document.getElementById('addPrimogemBtn');
    resourcesTop = document.querySelector('.resources-top');
    resourcesBottom = document.querySelector('.resources-bottom');

    // 获取尘辉兑换相关元素
    dustExchangeBtn = document.getElementById('dustExchangeBtn');
    dustExchangeContainer = document.querySelector('.dust-exchange-container');
    closeExchangeBtn = document.getElementById('closeExchangeBtn');
    tabBtns = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    exchange1Btn = document.getElementById('exchange1Btn');
    exchange10Btn = document.getElementById('exchange10Btn');
    starlightExchangeFateBtn = document.getElementById('starlightExchangeFateBtn');
    starlightExchangeEncounterBtn = document.getElementById('starlightExchangeEncounterBtn');
    stardustExchangeFateBtn = document.getElementById('stardustExchangeFateBtn');
    stardustExchangeEncounterBtn = document.getElementById('stardustExchangeEncounterBtn');
    buy60CrystalBtn = document.getElementById('buy60CrystalBtn');
    buy300CrystalBtn = document.getElementById('buy300CrystalBtn');
    buy980CrystalBtn = document.getElementById('buy980CrystalBtn');
    buy1980CrystalBtn = document.getElementById('buy1980CrystalBtn');
    buy3280CrystalBtn = document.getElementById('buy3280CrystalBtn');
    buy6480CrystalBtn = document.getElementById('buy6480CrystalBtn');

    // 初始化资源显示
    updateResourceDisplay();

    // 初始化双倍系统
    initDoubleBonusSystem();

    // 绑定按钮事件
    bindButtonEvents();
    bindOtherButtonEvents();
});

// 3. 抽卡概率（原神机制）
function getCardRarity(isTenthWish = false) {
    // 每次抽卡计数器增加
    pityCounter.ssr++;
    pityCounter.sr++;

    const random = Math.random();

    // 如果是10连抽的第10抽
    if (isTenthWish) {
        // 第10抽必出4星或5星
        // 小概率出5星（约0.6%），否则出4星
        if (random < 0.006) {
            pityCounter.ssr = 0;
            pityCounter.sr = 0;
            return "ssr";
        } else {
            pityCounter.sr = 0;
            return "sr";
        }
    }

    // 5星保底：最多90抽必出5星
    if (pityCounter.ssr >= 90) {
        pityCounter.ssr = 0;
        pityCounter.sr = 0;
        return "ssr";
    }

    // 4星保底：最多10抽必出4星
    if (pityCounter.sr >= 10) {
        pityCounter.sr = 0;
        // 4星保底时，有概率出5星（硬保底时是0.6%概率）
        if (random < 0.006) {
            pityCounter.ssr = 0;
            return "ssr";
        }
        return "sr";
    }

    // 正常概率计算
    if (random < 0.006) {
        pityCounter.ssr = 0;
        pityCounter.sr = 0;
        return "ssr";
    }

    if (random < 0.16) {
        pityCounter.sr = 0;
        return "sr";
    }

    return "r";
}

// 4. 创建卡片函数
function createCard(isTenthWish = false) {
    const rarity = getCardRarity(isTenthWish);
    const cardItem = CharList[rarity][Math.floor(Math.random() * CharList[rarity].length)];
    if (!sessionStorage[RecordName]) {
        sessionStorage[RecordName] = "[]";
    }
    const itemsNow = JSON.parse(sessionStorage[RecordName]);
    itemsNow.push(cardItem);
    sessionStorage[RecordName] = JSON.stringify(itemsNow);
    const cardImg = cardItem.path;

    // 计算本次抽卡获得的星尘和星辉数量
    let earnedStarlight = 0;
    let earnedStardust = 0;

    switch (rarity) {
        case "ssr": // 5星
            earnedStarlight = 10; // 每次获得5星角色或武器，给予10个无主的星辉
            break;
        case "sr": // 4星
            earnedStarlight = 2; // 每次获得4星角色或武器，给予2个无主的星辉
            break;
        case "r": // 3星
            earnedStardust = 15; // 每次获得3星武器，给予15个无主的尘辉
            break;
    }

    const card = document.createElement("div");
    card.className = `card ${rarity}`;
    card.dataset.rarity = rarity;
    card.dataset.type = cardItem.type; // 存储卡片类型（角色/武器/魔物）
    card.dataset.name = cardItem.name; // 存储卡片名字
    card.dataset.path = cardItem.path; // 存储卡片图片路径

    // 添加生命值属性
    let maxHealth = 10;
    let attack = 0;

    if (cardItem.type === '武器') {
        // 武器牌的耐久度设置
        switch (rarity) {
            case 'ssr': // 5星武器
                maxHealth = 300;
                attack = 10;
                break;
            case 'sr': // 4星武器
                maxHealth = 150;
                attack = 5;
                break;
            case 'r': // 3星武器
                maxHealth = 50;
                attack = 2;
                break;
        }
    } else if (cardItem.type === '角色') {
        // 角色卡牌的基础属性设置
        card.dataset.level = '1'; // 初始等级
        if (rarity === 'ssr') { // 5星
            maxHealth = 1020;
            attack = 25;
        } else if (rarity === 'sr') { // 4星
            maxHealth = 800;
            attack = 20;
        } else { // 3星
            maxHealth = 600;
            attack = 15;
        }
    } else if (cardItem.type === '魔物') {
        // 魔物卡牌的基础属性设置
        card.dataset.level = '1'; // 初始等级
        const monsterName = cardItem.name;

        // 根据魔物名称设置基础属性
        if (monsterName.includes('遗迹')) {
            // 遗迹守卫系列
            if (monsterName.includes('守卫')) {
                // 遗迹守卫
                maxHealth = 2070;
                attack = 116;
            } else if (monsterName.includes('猎者')) {
                // 遗迹猎者
                maxHealth = 1674;
                attack = 108;
            } else if (monsterName.includes('歼击者')) {
                // 遗迹歼击者
                maxHealth = 1944;
                attack = 114;
            } else if (monsterName.includes('机兵·空巡')) {
                // 遗迹机兵·空巡
                maxHealth = 1536;
                attack = 96;
            } else if (monsterName.includes('机兵·地巡')) {
                // 遗迹机兵·地巡
                maxHealth = 2592;
                attack = 124;
            } else if (monsterName.includes('龙兽·空巡')) {
                // 遗迹龙兽·空巡
                maxHealth = 2304;
                attack = 130;
            } else if (monsterName.includes('龙兽·地巡')) {
                // 遗迹龙兽·地巡
                maxHealth = 3456;
                attack = 135;
            }
        } else if (monsterName.includes('本真蕈')) {
            // 本真蕈系列
            if (monsterName.includes('陆行水')) {
                // 陆行水本真蕈
                maxHealth = 600;
                attack = 60;
            } else if (monsterName.includes('陆行岩')) {
                // 陆行岩本真蕈
                maxHealth = 600;
                attack = 60;
            } else if (monsterName.includes('有翼冰')) {
                // 有翼冰本真蕈（1级基础属性）
                maxHealth = 206;
                attack = 55;
            } else if (monsterName.includes('有翼草')) {
                // 有翼草本真蕈
                maxHealth = 550;
                attack = 55;
            }
        } else if (monsterName.includes('丘丘王')) {
            // 丘丘王系列
            if (monsterName.includes('岩盔')) {
                // 丘丘岩盔王
                maxHealth = 3872;
                attack = 166;
            } else if (monsterName.includes('霜铠')) {
                // 丘丘霜铠王
                maxHealth = 4074;
                attack = 166;
            } else if (monsterName.includes('雷兜')) {
                // 丘丘雷兜王
                maxHealth = 4074;
                attack = 166;
            }
        } else if (monsterName.includes('丘丘人')) {
            // 丘丘人系列
            if (monsterName.includes('打手')) {
                // 打手丘丘人
                maxHealth = 220;
                attack = 22;
            } else if (monsterName.includes('射手') || monsterName.includes('火箭') || monsterName.includes('雷箭') || monsterName.includes('冰箭')) {
                // 射手类丘丘人
                maxHealth = 220;
                attack = 18;
            } else if (monsterName.includes('冲锋')) {
                // 冲锋丘丘人
                maxHealth = 240;
                attack = 24;
            } else if (monsterName.includes('爆破')) {
                // 爆破丘丘人
                maxHealth = 100;
                attack = 10;
            } else if (!monsterName.includes('暴徒')) {
                // 普通丘丘人
                maxHealth = 200;
                attack = 20;
            }
        } else if (monsterName.includes('丘丘暴徒')) {
            // 丘丘暴徒系列
            if (monsterName.includes('斧') && !monsterName.includes('烈焰') && !monsterName.includes('霜铠') && !monsterName.includes('雷')) {
                // 丘丘暴徒·斧
                maxHealth = 726; // 基础生命值
                attack = 56; // 基础攻击力
            } else if (monsterName.includes('盾')) {
                // 丘丘暴徒·盾系列
                maxHealth = 852; // 基础生命值
                attack = 52; // 基础攻击力

                // 根据盾的类型添加对应元素护盾
                if (monsterName.includes('木盾')) {
                    // 木盾丘丘暴徒，添加草元素护盾
                    card.dataset.shield = '250'; // 初始草元素护盾值
                    card.dataset.maxShield = '250'; // 最大草元素护盾值
                    card.dataset.shieldElement = '草'; // 护盾元素类型
                } else if (monsterName.includes('岩盾')) {
                    // 岩盾丘丘暴徒，添加岩元素护盾
                    card.dataset.shield = '300'; // 初始岩元素护盾值
                    card.dataset.maxShield = '300'; // 最大岩元素护盾值
                    card.dataset.shieldElement = '岩'; // 护盾元素类型
                } else if (monsterName.includes('冰盾')) {
                    // 冰盾丘丘暴徒，添加冰元素护盾
                    card.dataset.shield = '300'; // 初始冰元素护盾值
                    card.dataset.maxShield = '300'; // 最大冰元素护盾值
                    card.dataset.shieldElement = '冰'; // 护盾元素类型
                }
            } else if (monsterName.includes('烈焰斧') || monsterName.includes('霜铠斧') || monsterName.includes('雷斧')) {
                // 元素附魔丘丘暴徒
                maxHealth = 852; // 基础生命值
                attack = 58; // 基础攻击力
            } else {
                // 其他丘丘暴徒，使用默认值
                maxHealth = 800; // 取750-850的平均值
                attack = 60; // 取55-65的平均值
            }
        } else if (monsterName.includes('史莱姆')) {
            // 史莱姆
            if (monsterName.includes('大型')) {
                // 大型史莱姆
                maxHealth = 350; // 大型史莱姆生命值更高
                attack = 30; // 大型史莱姆攻击力更高

                // 大型冰史莱姆和大型岩史莱姆有护盾
                if (monsterName.includes('冰')) {
                    card.dataset.shield = '300'; // 冰元素护盾
                    card.dataset.maxShield = '300';
                    card.dataset.shieldElement = '冰';
                } else if (monsterName.includes('岩')) {
                    card.dataset.shield = '350'; // 岩元素护盾（更厚）
                    card.dataset.maxShield = '350';
                    card.dataset.shieldElement = '岩';
                }
            } else {
                // 普通史莱姆
                maxHealth = 175; // 取150-200的平均值
                attack = 18; // 取15-20的平均值
            }
        } else if (monsterName.includes('盗宝团')) {
            // 盗宝团
            maxHealth = 275; // 取250-300的平均值
            attack = 28; // 取25-30的平均值
        } else if (monsterName.includes('愚人众')) {
            // 愚人众先遣队
            maxHealth = 1000; // 取900-1100的平均值
            attack = 70; // 取60-80的平均值

            // 愚人众先遣队·水铳重卫士有水盾
            if (monsterName.includes('水铳重卫士')) {
                card.dataset.shield = '200'; // 初始护盾值
                card.dataset.maxShield = '200'; // 最大护盾值
                card.dataset.shieldElement = '水'; // 护盾元素类型
            }
            // 愚人众先遣队·冰铳重卫士有冰盾
            else if (monsterName.includes('冰铳重卫士')) {
                card.dataset.shield = '200'; // 初始护盾值
                card.dataset.maxShield = '200'; // 最大护盾值
                card.dataset.shieldElement = '冰'; // 护盾元素类型
            }
            // 愚人众先遣队·风拳前锋军有风盾
            else if (monsterName.includes('风拳前锋军')) {
                card.dataset.shield = '200'; // 初始护盾值
                card.dataset.maxShield = '200'; // 最大护盾值
                card.dataset.shieldElement = '风'; // 护盾元素类型
            }
        } else if (monsterName.includes('深渊法师')) {
            // 深渊法师
            maxHealth = 550; // 取500-600的平均值
            attack = 45; // 取40-50的平均值
            // 添加护盾属性
            card.dataset.shield = '300'; // 初始护盾值
            card.dataset.maxShield = '300'; // 最大护盾值

            // 根据深渊法师类型设置护盾元素
            if (monsterName.includes('火')) {
                card.dataset.shieldElement = '火';
            } else if (monsterName.includes('水')) {
                card.dataset.shieldElement = '水';
            } else if (monsterName.includes('雷')) {
                card.dataset.shieldElement = '雷';
            } else if (monsterName.includes('冰')) {
                card.dataset.shieldElement = '冰';
            }
        } else if (monsterName.includes('骗骗花')) {
            // 骗骗花系列
            if (monsterName.includes('炽热')) {
                // 炽热骗骗花
                maxHealth = 800; // 基础生命值
                attack = 60; // 基础攻击力
                // 添加火盾属性
                card.dataset.shield = '150'; // 初始护盾值
                card.dataset.maxShield = '150'; // 最大护盾值
                card.dataset.shieldElement = '火'; // 护盾元素类型
            } else {
                // 普通骗骗花
                maxHealth = 600; // 基础生命值
                attack = 50; // 基础攻击力
            }
        } else if (monsterName.includes('野伏')) {
            // 野伏
            maxHealth = 1288; // 基础生命值
            attack = 101; // 基础攻击力

            // 野伏·火付番有火盾
            if (monsterName.includes('火付番')) {
                card.dataset.shield = '150'; // 初始护盾值
                card.dataset.maxShield = '150'; // 最大护盾值
                card.dataset.shieldElement = '火'; // 护盾元素类型
            }
            // 野伏·机巧番有雷盾
            else if (monsterName.includes('机巧番')) {
                card.dataset.shield = '150'; // 初始护盾值
                card.dataset.maxShield = '150'; // 最大护盾值
                card.dataset.shieldElement = '雷'; // 护盾元素类型
            }
        } else if (monsterName.includes('海乱鬼')) {
            // 海乱鬼
            maxHealth = 2225; // 基础生命值
            attack = 126; // 基础攻击力
            if (monsterName.includes('炎威')) {
                // 海乱鬼·炎威，添加火盾
                card.dataset.shield = '300'; // 初始护盾值
                card.dataset.maxShield = '300'; // 最大护盾值
                card.dataset.shieldElement = '火'; // 护盾元素类型
            } else if (monsterName.includes('雷腾')) {
                // 海乱鬼·雷腾，添加雷盾
                card.dataset.shield = '300'; // 初始护盾值
                card.dataset.maxShield = '300'; // 最大护盾值
                card.dataset.shieldElement = '雷'; // 护盾元素类型
            }
        } else if (monsterName.includes('攻坚特化型机关')) {
            // 攻坚特化型机关
            maxHealth = 1000; // 基础生命值
            attack = 70; // 基础攻击力
            // 添加雷属性护盾
            card.dataset.shield = '300'; // 初始护盾值
            card.dataset.maxShield = '300'; // 最大护盾值
        } else if (monsterName.includes('Mek') || monsterName.includes('机兵') || monsterName.includes('机械')) {
            // 机关系列魔物
            maxHealth = 1900; // 基础生命值
            attack = 70; // 基础攻击力
        } else if (monsterName.includes('猎犬') || monsterName.includes('Rifthound')) {
            // 兽境猎犬系列魔物
            maxHealth = 1820; // 基础生命值
            attack = 110; // 基础攻击力

            // 嗜雷·兽境猎犬有雷盾
            if (monsterName.includes('嗜雷')) {
                card.dataset.shield = '150'; // 初始护盾值
                card.dataset.maxShield = '150'; // 最大护盾值
                card.dataset.shieldElement = '雷'; // 护盾元素类型
            }
            // 嗜岩·兽境猎犬有岩盾
            else if (monsterName.includes('嗜岩')) {
                card.dataset.shield = '150'; // 初始护盾值
                card.dataset.maxShield = '150'; // 最大护盾值
                card.dataset.shieldElement = '岩'; // 护盾元素类型
            }
        } else if (monsterName.includes('黑蛇骑士') || monsterName.includes('Rockbreaker')) {
            // 黑蛇骑士·摧岩之钺
            maxHealth = 2304; // 基础生命值
            attack = 130; // 基础攻击力
        } else if (monsterName.includes('圣骸角鳄') || monsterName.includes('Crocodile')) {
            // 圣骸角鳄
            maxHealth = 2760; // 基础生命值
            attack = 138; // 基础攻击力
        } else if (monsterName.includes('萨满') || monsterName.includes('Samachurl')) {
            // 丘丘萨满系列
            maxHealth = 228; // 基础生命值
            if (monsterName.includes('火')) {
                attack = 22; // 火丘丘萨满攻击力
            } else {
                attack = 20; // 其他元素丘丘萨满攻击力
            }
        } else {
            // 其他魔物，使用默认值
            maxHealth = 300;
            attack = 25;
        }
    }

    // 设置卡牌属性
    card.dataset.health = maxHealth;
    card.dataset.maxHealth = maxHealth;
    card.dataset.attack = attack;

    // 为白缨枪添加特殊属性
    if (cardItem.name === '白缨枪') {
        card.dataset.weaponName = '白缨枪';
        card.dataset.level = '90'; // 初始等级
        card.dataset.critRate = '23.4'; // 初始暴击率
        card.dataset.attack = '401'; // 初始攻击力
    }

    // 为鸦羽弓添加特殊属性
    if (cardItem.name === '鸦羽弓') {
        card.dataset.weaponName = '鸦羽弓';
        card.dataset.level = '90'; // 初始等级
        card.dataset.elementalMastery = '94'; // 初始元素精通
        card.dataset.attack = '448'; // 初始攻击力
    }

    // 为祭礼大剑添加特殊属性
    if (cardItem.name === '祭礼大剑') {
        card.dataset.weaponName = '祭礼大剑';
        card.dataset.level = '90'; // 初始等级
        card.dataset.energyRecharge = '30.6'; // 初始元素充能效率
        card.dataset.attack = '565'; // 初始攻击力
    }

    // 为千岩长枪添加特殊属性
    if (cardItem.name === '千岩长枪') {
        card.dataset.weaponName = '千岩长枪';
        card.dataset.level = '90'; // 初始等级
        card.dataset.attackPercent = '27.6'; // 初始攻击力%
        card.dataset.attack = '565'; // 初始攻击力
    }

    // 为白铁大剑添加特殊属性
    if (cardItem.name === '白铁大剑') {
        card.dataset.weaponName = '白铁大剑';
        card.dataset.level = '90'; // 初始等级
        card.dataset.defensePercent = '43.9'; // 初始防御力%
        card.dataset.attack = '401'; // 初始攻击力
    }

    // 为魔导绪论添加特殊属性
    if (cardItem.name === '魔导绪论') {
        card.dataset.weaponName = '魔导绪论';
        card.dataset.level = '90'; // 初始等级
        card.dataset.elementalMastery = '187'; // 初始元素精通
        card.dataset.attack = '354'; // 初始攻击力
    }

    // 为祭礼弓添加特殊属性
    if (cardItem.name === '祭礼弓') {
        card.dataset.weaponName = '祭礼弓';
        card.dataset.level = '90'; // 初始等级
        card.dataset.energyRecharge = '30.6'; // 初始元素充能效率
        card.dataset.attack = '565'; // 初始攻击力
    }

    // 为旅行剑添加特殊属性
    if (cardItem.name === '旅行剑') {
        card.dataset.weaponName = '旅行剑';
        card.dataset.level = '90'; // 初始等级
        card.dataset.defensePercent = '29.3'; // 初始防御力%
        card.dataset.attack = '448'; // 初始攻击力
    }

    // 为祭礼剑添加特殊属性
    if (cardItem.name === '祭礼剑') {
        card.dataset.weaponName = '祭礼剑';
        card.dataset.level = '90'; // 初始等级
        card.dataset.energyRecharge = '61.3'; // 初始元素充能效率
        card.dataset.attack = '454'; // 初始攻击力
    }

    // 为祭礼残章添加特殊属性
    if (cardItem.name === '祭礼残章') {
        card.dataset.weaponName = '祭礼残章';
        card.dataset.level = '90'; // 初始等级
        card.dataset.elementalMastery = '221'; // 初始元素精通
        card.dataset.attack = '454'; // 初始攻击力
    }

    // 为狼的末路添加特殊属性
    if (cardItem.name === '狼的末路') {
        card.dataset.weaponName = '狼的末路';
        card.dataset.level = '90'; // 初始等级
        card.dataset.attackPercent = '49.6'; // 初始攻击力%
        card.dataset.attack = '608'; // 初始攻击力
    }

    // 为天空之脊添加特殊属性
    if (cardItem.name === '天空之脊') {
        card.dataset.weaponName = '天空之脊';
        card.dataset.level = '90'; // 初始等级
        card.dataset.energyRecharge = '36.8'; // 初始元素充能效率
        card.dataset.attack = '674'; // 初始攻击力
    }

    // 为天空之翼添加特殊属性
    if (cardItem.name === '天空之翼') {
        card.dataset.weaponName = '天空之翼';
        card.dataset.level = '90'; // 初始等级
        card.dataset.critRate = '22.1'; // 初始暴击率
        card.dataset.attack = '674'; // 初始攻击力
    }

    // 为天空之卷添加特殊属性
    if (cardItem.name === '天空之卷') {
        card.dataset.weaponName = '天空之卷';
        card.dataset.level = '90'; // 初始等级
        card.dataset.attackPercent = '33.1'; // 初始攻击力%
        card.dataset.attack = '674'; // 初始攻击力
    }

    // 为薙草之稻光添加特殊属性
    if (cardItem.name === '薙草之稻光') {
        card.dataset.weaponName = '薙草之稻光';
        card.dataset.level = '90'; // 初始等级
        card.dataset.energyRecharge = '55.1'; // 初始元素充能效率
        card.dataset.attack = '608'; // 初始攻击力
    }

    // 为千夜浮梦添加特殊属性
    if (cardItem.name === '千夜浮梦') {
        card.dataset.weaponName = '千夜浮梦';
        card.dataset.level = '90'; // 初始等级
        card.dataset.elementalMastery = '265'; // 初始元素精通
        card.dataset.attack = '542'; // 初始攻击力
    }

    // 为阿莫斯之弓添加特殊属性
    if (cardItem.name === '阿莫斯之弓') {
        card.dataset.weaponName = '阿莫斯之弓';
        card.dataset.level = '90'; // 初始等级
        card.dataset.attackPercent = '49.6'; // 初始攻击力%
        card.dataset.attack = '608'; // 初始攻击力
    }

    let cardBackClass;
    switch (rarity) {
        case "ssr":
            cardBackClass = "ssr-card-back";
            break;
        case "sr":
            cardBackClass = "sr-card-back";
            break;
        case "r":
            cardBackClass = "r-card-back";
            break;
        default:
            cardBackClass = "r-card-back";
    }

    // 根据稀有度添加不同的声音效果
    let raritySound;
    switch (rarity) {
        case "ssr":
            raritySound = "ssrSound";
            break;
        case "sr":
            raritySound = "srSound";
            break;
        case "r":
            raritySound = "rSound";
            break;
        default:
            raritySound = "cardFlip";
    }
    card.dataset.sound = raritySound;

    // 保存图片路径到dataset，方便后续提取
    card.dataset.imagePath = cardImg;

    // 构建卡牌HTML
    card.innerHTML = `
        <div class="${cardBackClass}"></div>
        <div class="card-front" style="background-image: url(${cardImg})"></div>`;

    // 获取card-front元素
    const cardFront = card.querySelector('.card-front');

    // 创建血条容器并添加到card-front内部
    const healthBarContainer = document.createElement('div');
    healthBarContainer.className = 'health-bar-container';
    healthBarContainer.innerHTML = `
        <div class="health-bar" style="width: 100%"></div>
        <div class="health-text">${maxHealth}/${maxHealth}</div>
    `;
    cardFront.appendChild(healthBarContainer);

    // 为有护盾的魔物添加护盾条
    if (cardItem.type === '魔物' && card.dataset.shield) {
        const shieldValue = card.dataset.shield;
        const shieldBarContainer = document.createElement('div');
        shieldBarContainer.className = 'shield-bar-container';
        shieldBarContainer.innerHTML = `
            <div class="shield-bar" style="width: 100%"></div>
            <div class="shield-text">${shieldValue}/${shieldValue}</div>
        `;
        cardFront.appendChild(shieldBarContainer);
    }

    // 为角色和魔物添加初始等级和属性显示（只在正面显示）
    if (cardItem.type === '角色' || cardItem.type === '魔物') {
        const statsElement = document.createElement('div');
        statsElement.className = 'card-stats';
        statsElement.textContent = `Lv.1 | HP: ${maxHealth}/${maxHealth} | ATK: ${attack}`;
        cardFront.appendChild(statsElement);
    }

    // 为角色卡添加装备栏
    if (cardItem.type === '角色') {
        const equipmentSlot = document.createElement('div');
        equipmentSlot.className = 'equipment-slot';
        equipmentSlot.title = '装备栏';
        card.appendChild(equipmentSlot);

        // 添加观察器，在卡片翻转后调整装备栏位置
        const observer = new MutationObserver(() => {
            if (card.classList.contains('active')) {
                adjustEquipmentSlotPosition(card);
            }
        });

        observer.observe(card, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // 为武器添加初始属性显示（只在正面显示）
    if (cardItem.type === '武器') {
        const statsElement = document.createElement('div');
        statsElement.className = 'weapon-stats';
        if (cardItem.name === '白缨枪') {
            statsElement.textContent = `Lv.90 | 攻击: 401 | 暴击率: 23.4%`;
        } else if (cardItem.name === '鸦羽弓') {
            statsElement.textContent = `Lv.90 | 攻击: 448 | 元素精通: 94`;
        } else if (cardItem.name === '祭礼大剑') {
            statsElement.textContent = `Lv.90 | 攻击: 565 | 充能效率: 30.6%`;
        } else if (cardItem.name === '千岩长枪') {
            statsElement.textContent = `Lv.90 | 攻击: 565 | 攻击力: 27.6%`;
        } else if (cardItem.name === '白铁大剑') {
            statsElement.textContent = `Lv.90 | 攻击: 401 | 防御力: 43.9%`;
        } else if (cardItem.name === '魔导绪论') {
            statsElement.textContent = `Lv.90 | 攻击: 354 | 元素精通: 187`;
        } else if (cardItem.name === '祭礼弓') {
            statsElement.textContent = `Lv.90 | 攻击: 565 | 充能效率: 30.6%`;
        } else if (cardItem.name === '旅行剑') {
            statsElement.textContent = `Lv.90 | 攻击: 448 | 防御力: 29.3%`;
        } else if (cardItem.name === '祭礼剑') {
            statsElement.textContent = `Lv.90 | 攻击: 454 | 充能效率: 61.3%`;
        } else if (cardItem.name === '祭礼残章') {
            statsElement.textContent = `Lv.90 | 攻击: 454 | 元素精通: 221`;
        } else if (cardItem.name === '狼的末路') {
            statsElement.textContent = `Lv.90 | 攻击: 608 | 攻击力: 49.6%`;
        } else if (cardItem.name === '天空之脊') {
            statsElement.textContent = `Lv.90 | 攻击: 674 | 充能效率: 36.8%`;
        } else if (cardItem.name === '天空之翼') {
            statsElement.textContent = `Lv.90 | 攻击: 674 | 暴击率: 22.1%`;
        } else if (cardItem.name === '天空之卷') {
            statsElement.textContent = `Lv.90 | 攻击: 674 | 攻击力: 33.1%`;
        } else if (cardItem.name === '薙草之稻光') {
            statsElement.textContent = `Lv.90 | 攻击: 608 | 充能效率: 55.1%`;
        } else if (cardItem.name === '千夜浮梦') {
            statsElement.textContent = `Lv.90 | 攻击: 542 | 元素精通: 265`;
        } else if (cardItem.name === '阿莫斯之弓') {
            statsElement.textContent = `Lv.90 | 攻击: 608 | 攻击力: 49.6%`;
        } else {
            statsElement.textContent = `攻击: ${attack}`;
        }
        cardFront.appendChild(statsElement);
    }

    // 添加卡片点击翻转效果
    card.addEventListener('click', () => {
        const subElement = card.firstElementChild;
        if (!subElement.classList.contains('animate-roll')) {
            soundManager.playSound(card.dataset.sound);
            subElement.classList.add("animate-roll");
            subElement.onanimationend = () => {
                card.classList.add('active');
            }
        }
    });

    // 初始化血条（设置正确的颜色和耐久度显示）
    updateHealthBar(card);

    // 初始化护盾条（设置正确的颜色）
    if (cardItem.type === '魔物' && card.dataset.shield) {
        updateShieldBar(card);
    }

    return {
        card: card,
        earnedStarlight: earnedStarlight,
        earnedStardust: earnedStardust
    };
}

// 记录本次抽卡获得的星尘和星辉数量
let earnedStarlight = 0;
let earnedStardust = 0;

// 伤害计算函数
function getDamageByRarity(rarity) {
    switch (rarity) {
        case 'ssr':
            return 10; // 5星卡造成10点伤害
        case 'sr':
            return 5;  // 4星卡造成5点伤害
        case 'r':
            return 2;  // 3星卡造成2点伤害
        default:
            return 0;
    }
}

// 更新血条函数
function updateHealthBar(card) {
    const health = parseInt(card.dataset.health);
    const maxHealth = parseInt(card.dataset.maxHealth);
    const healthBar = card.querySelector('.health-bar');
    const healthText = card.querySelector('.health-text');
    const cardType = card.dataset.type;

    if (healthBar && healthText) {
        const percentage = (health / maxHealth) * 100;
        healthBar.style.width = `${percentage}%`;
        healthText.textContent = `${health}/${maxHealth}`;

        // 根据卡片类型和生命值改变血条颜色
        if (cardType === '武器') {
            // 武器牌统一使用烟白色血条
            healthBar.style.backgroundColor = '#E5E5DC'; // 烟白色
        } else if (cardType === '魔物') {
            // 魔物用红色血条
            if (percentage <= 25) {
                healthBar.style.backgroundColor = '#FF0000'; // 深红色
            } else if (percentage <= 50) {
                healthBar.style.backgroundColor = '#FF5252'; // 中红色
            } else {
                healthBar.style.backgroundColor = '#FF7F50'; // 浅红色
            }
        } else if (cardType === '角色') {
            // 角色用绿色血条
            if (percentage <= 25) {
                healthBar.style.backgroundColor = '#4CAF50'; // 深绿色
            } else if (percentage <= 50) {
                healthBar.style.backgroundColor = '#8BC34A'; // 中绿色
            } else {
                healthBar.style.backgroundColor = '#CDDC39'; // 浅绿色
            }
        }
    }
}

// 更新护盾条
function updateShieldBar(card) {
    const shield = parseInt(card.dataset.shield);
    const maxShield = parseInt(card.dataset.maxShield);
    const shieldElement = card.dataset.shieldElement; // 获取护盾元素类型
    const shieldBar = card.querySelector('.shield-bar');
    const shieldText = card.querySelector('.shield-text');
    if (shieldBar && shieldText) {
        const percentage = (shield / maxShield) * 100;
        shieldBar.style.width = `${percentage}%`;
        shieldText.textContent = `${shield}/${maxShield}`;

        // 根据护盾元素类型设置颜色
        let shieldColor = '#2196F3'; // 默认蓝色
        if (shieldElement) {
            switch(shieldElement) {
                case '火':
                    shieldColor = '#FFA468';
                    break;
                case '水':
                    shieldColor = '#0DDDFC';
                    break;
                case '风':
                    shieldColor = '#A8FBCF';
                    break;
                case '雷':
                    shieldColor = '#DFBFFF';
                    break;
                case '草':
                    shieldColor = '#B1E739';
                    break;
                case '冰':
                    shieldColor = '#CBFFFC';
                    break;
                case '岩':
                    shieldColor = '#F6D757';
                    break;
            }
        }
        shieldBar.style.backgroundColor = shieldColor;
    }
}

// 显示伤害数字函数
function showDamageNumber(card, damage) {
    const damageNumber = document.createElement('div');
    damageNumber.className = 'damage-number';
    damageNumber.textContent = `-${damage}`;

    // 定位到卡片中心
    const rect = card.getBoundingClientRect();
    damageNumber.style.left = `${rect.left + rect.width / 2}px`;
    damageNumber.style.top = `${rect.top + rect.height / 2}px`;

    document.body.appendChild(damageNumber);

    // 动画结束后移除
    setTimeout(() => {
        damageNumber.remove();
    }, 1000);
}

// 显示反应文字
function showReactionText(card, reaction) {
    const reactionText = document.createElement('div');
    reactionText.className = 'reaction-text';
    reactionText.textContent = reaction;

    // 定位到卡片中心偏上位置
    reactionText.style.position = 'absolute';
    reactionText.style.top = '30%';
    reactionText.style.left = '50%';
    reactionText.style.transform = 'translateX(-50%)';
    reactionText.style.fontSize = '14px';
    reactionText.style.fontWeight = 'bold';
    reactionText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
    reactionText.style.animation = 'reaction-text 1s ease-out forwards';

    // 根据反应类型设置颜色
    if (reaction.includes('感电')) {
        reactionText.style.color = '#9333EA'; // 紫色
    } else if (reaction.includes('超载')) {
        reactionText.style.color = '#EF4444'; // 红色
    } else if (reaction.includes('绽放')) {
        reactionText.style.color = '#10B981'; // 绿色
    } else if (reaction.includes('激化')) {
        // 激化反应系列
        if (reaction.includes('超激化')) {
            reactionText.style.color = '#A855F7'; // 紫色（雷元素）
        } else if (reaction.includes('蔓激化')) {
            reactionText.style.color = '#22C55E'; // 绿色（草元素）
        } else if (reaction.includes('原激化')) {
            reactionText.style.color = '#8B5CF6'; // 紫绿混合色
        }
    } else if (reaction.includes('冻结')) {
        reactionText.style.color = '#60A5FA'; // 冰蓝色
    } else if (reaction.includes('碎冰')) {
        reactionText.style.color = '#F3F4F6'; // 白色
    } else if (reaction.includes('免疫')) {
        reactionText.style.color = '#D1D5DB'; // 烟白色
    } else if (reaction.includes('蒸发')) {
        reactionText.style.color = '#3B82F6'; // 蓝色
    } else if (reaction.includes('燃烧')) {
        reactionText.style.color = '#F59E0B'; // 橙色
    } else if (reaction.includes('扩散')) {
        reactionText.style.color = '#14B8A6'; // 风属性浅蓝色
    } else if (reaction.includes('结晶')) {
        // 结晶颜色根据与岩接触的元素确定
        if (reaction.includes('结晶火')) {
            reactionText.style.color = '#EF4444'; // 红色
        } else if (reaction.includes('结晶水')) {
            reactionText.style.color = '#3B82F6'; // 蓝色
        } else if (reaction.includes('结晶雷')) {
            reactionText.style.color = '#9333EA'; // 紫色
        } else if (reaction.includes('结晶冰')) {
            reactionText.style.color = '#60A5FA'; // 冰蓝色
        } else {
            reactionText.style.color = '#D97706'; // 岩属性棕色
        }
    } else if (reaction.includes('融化')) {
        reactionText.style.color = '#FBBF24'; // 黄色
    } else if (reaction.includes('超导')) {
        reactionText.style.color = '#1E40AF'; // 深蓝色
    } else if (reaction.includes('解冻')) {
        reactionText.style.color = '#93C5FD'; // 浅蓝色
    } else if (reaction.includes('护盾')) {
        // 护盾颜色根据元素类型确定
        if (reaction.includes('火护盾')) {
            reactionText.style.color = '#EF4444'; // 红色
        } else if (reaction.includes('水护盾')) {
            reactionText.style.color = '#3B82F6'; // 蓝色
        } else if (reaction.includes('雷护盾')) {
            reactionText.style.color = '#9333EA'; // 紫色
        } else if (reaction.includes('冰护盾')) {
            reactionText.style.color = '#60A5FA'; // 冰蓝色
        } else {
            reactionText.style.color = '#8B5CF6'; // 紫色
        }
    } else {
        reactionText.style.color = '#FFFFFF'; // 默认白色
    }

    card.appendChild(reactionText);

    // 动画结束后移除
    setTimeout(() => {
        reactionText.remove();
    }, 1000);
}

// 显示元素附着图标
function showElementIcon(card, element) {
    // 元素名称到图标文件名的映射
    const elementIconMap = {
        '火': 'Pyro',
        '水': 'Hydro',
        '雷': 'Electro',
        '冰': 'Cryo',
        '草': 'Dendro',
        '风': 'Anemo',
        '岩': 'Geo'
    };

    const iconFileName = elementIconMap[element];
    if (!iconFileName) {
        console.warn(`未知的元素类型: ${element}`);
        return;
    }

    // 检查卡片的card-front元素
    const cardFront = card.querySelector('.card-front');
    if (!cardFront) {
        console.warn('未找到card-front元素');
        return;
    }

    // 检查是否已经有相同元素的图标
    const existingIcons = cardFront.querySelectorAll('.element-icon');
    for (let icon of existingIcons) {
        if (icon.dataset.element === element) {
            // 已经有相同元素的图标，不重复添加
            return;
        }
    }

    // 创建元素图标
    const elementIcon = document.createElement('img');
    elementIcon.src = `images/Element/${iconFileName}.png`;
    elementIcon.className = 'element-icon';
    elementIcon.dataset.element = element;

    // 设置图标位置（根据已有图标数量）
    const position = existingIcons.length + 1;
    elementIcon.dataset.position = position;

    // 添加到卡片
    cardFront.appendChild(elementIcon);

    // 存储元素附着信息
    if (!card.dataset.elementalAttachments) {
        card.dataset.elementalAttachments = element;
    } else {
        const attachments = card.dataset.elementalAttachments.split(',');
        if (!attachments.includes(element)) {
            attachments.push(element);
            card.dataset.elementalAttachments = attachments.join(',');
        }
    }
}

// 移除元素附着图标
function removeElementIcon(card, element) {
    const cardFront = card.querySelector('.card-front');
    if (!cardFront) return;

    const icons = cardFront.querySelectorAll('.element-icon');
    icons.forEach(icon => {
        if (icon.dataset.element === element) {
            icon.remove();
        }
    });

    // 更新元素附着信息
    if (card.dataset.elementalAttachments) {
        const attachments = card.dataset.elementalAttachments.split(',').filter(e => e !== element);
        card.dataset.elementalAttachments = attachments.join(',');
    }

    // 重新排列剩余图标的位置
    const remainingIcons = cardFront.querySelectorAll('.element-icon');
    remainingIcons.forEach((icon, index) => {
        icon.dataset.position = index + 1;
    });
}

// 清除所有元素附着图标
function clearAllElementIcons(card) {
    const cardFront = card.querySelector('.card-front');
    if (!cardFront) return;

    const icons = cardFront.querySelectorAll('.element-icon');
    icons.forEach(icon => icon.remove());

    card.dataset.elementalAttachments = '';
}


// 绽放反应系统
// 草原核管理
let dendroCoreArray = [];
const MAX_DENDRO_CORES = 5;
const DENDRO_CORE_DURATION = 6000; // 6秒

// 生成草原核
function createDendroCore(card, creatorName) {
    // 检查草原核数量是否达到上限
    if (dendroCoreArray.length >= MAX_DENDRO_CORES) {
        // 达到上限，触发最早生成的草原核爆炸
        explodeOldestDendroCore();
    }

    // 创建草原核对象
    const dendroCore = {
        id: Date.now() + Math.random(),
        card: card,
        creatorName: creatorName,
        createdAt: Date.now(),
        type: 'normal' // normal, burning, hyper
    };

    // 添加到数组
    dendroCoreArray.push(dendroCore);

    // 显示草原核生成效果
    showReactionText(card, '原绽放');

    // 显示元素图标
    showElementIcon(card, '草');
    showElementIcon(card, '水');

    // 在卡牌上添加草原核图标
    addDendroCoreIcon(card, dendroCore.id);

    // 设置爆炸定时器
    setTimeout(() => {
        explodeDendroCore(dendroCore);
    }, DENDRO_CORE_DURATION);

    return dendroCore;
}

// 在卡牌上添加草原核图标
function addDendroCoreIcon(card, coreId) {
    const cardFront = card.querySelector('.card-front');
    if (!cardFront) return;

    // 创建草原核图标容器
    const coreIcon = document.createElement('div');
    coreIcon.className = 'dendro-core-icon';
    coreIcon.dataset.coreId = coreId;
    coreIcon.style.position = 'absolute';
    coreIcon.style.top = '5px';
    coreIcon.style.right = '5px';
    coreIcon.style.width = '30px';
    coreIcon.style.height = '30px';
    coreIcon.style.zIndex = '10';
    coreIcon.style.pointerEvents = 'none';

    // 创建图标图片
    const img = document.createElement('img');
    img.src = 'images/草原核.png';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.filter = 'drop-shadow(0 0 3px rgba(0, 255, 0, 0.8))';
    img.style.animation = 'pulse 1s ease-in-out infinite';

    coreIcon.appendChild(img);
    cardFront.appendChild(coreIcon);
}

// 移除草原核图标
function removeDendroCoreIcon(card, coreId) {
    const coreIcon = card.querySelector(`.dendro-core-icon[data-core-id="${coreId}"]`);
    if (coreIcon) {
        coreIcon.remove();
    }
}

// 爆炸最早生成的草原核
function explodeOldestDendroCore() {
    if (dendroCoreArray.length > 0) {
        const oldestCore = dendroCoreArray.shift(); // 移除并返回第一个元素
        explodeDendroCore(oldestCore);
    }
}

// 计算精通加成
function calculateMasteryBonus(mastery) {
    return (2.78 * mastery) / (mastery + 1400);
}

// 计算精通加成（原绽放专用）
function calculateBloomMasteryBonus(mastery) {
    return 1 + (16 * mastery) / (2000 + mastery);
}

// 爆炸草原核
function explodeDendroCore(core) {
    // 检查卡牌是否还存在
    if (!core.card || !core.card.parentNode) {
        // 卡牌已经被移除，只从数组中移除草原核
        dendroCoreArray = dendroCoreArray.filter(c => c.id !== core.id);
        return;
    }

    // 从数组中移除
    dendroCoreArray = dendroCoreArray.filter(c => c.id !== core.id);

    // 移除草原核图标
    removeDendroCoreIcon(core.card, core.id);

    // 计算伤害（原绽放）
    // 公式：等级系数 * 2 * (精通加成 + 反应系数加成) * 目标草抗
    const levelCoefficient = 1447; // 90级角色等级系数
    const mastery = 0; // 默认精通值
    const masteryBonus = calculateBloomMasteryBonus(mastery);
    const reactionBonus = 0; // 反应系数加成（默认为0）
    const grassResistance = 0.9; // 敌人默认草抗10%（即抗性系数0.9）

    const baseDamage = levelCoefficient * 2 * (masteryBonus + reactionBonus) * grassResistance;

    // 判断目标是角色还是魔物
    const targetType = core.card.dataset.type;
    let finalDamage;

    if (targetType === '角色') {
        // 玩家角色被草原核命中：基础伤害 * 0.05
        finalDamage = Math.round(baseDamage * 0.05);
    } else {
        // 魔物受到完整伤害
        finalDamage = Math.round(baseDamage);
    }

    // 显示爆炸效果
    showReactionText(core.card, '原绽放爆炸');
    showDamageNumber(core.card, finalDamage);

    // 更新生命值
    const currentHealth = parseInt(core.card.dataset.health);
    core.card.dataset.health = Math.max(0, currentHealth - finalDamage);

    // 更新血条
    updateHealthBar(core.card);

    // 检查是否死亡
    checkCardDeath(core.card);
}

// 触发烈绽放
function triggerBurgeon(card, triggerName) {
    // 找到与该卡片相关的草原核
    const cardCores = dendroCoreArray.filter(core => core.card === card);

    if (cardCores.length > 0) {
        // 触发第一个草原核
        const core = cardCores[0];
        core.type = 'burning';

        // 从数组中移除
        dendroCoreArray = dendroCoreArray.filter(c => c.id !== core.id);

        // 移除草原核图标
        removeDendroCoreIcon(core.card, core.id);

        // 计算伤害（烈绽放）
        // 使用与原绽放相同的基础公式
        const levelCoefficient = 1447; // 90级角色等级系数
        const mastery = 0; // 默认精通值
        const masteryBonus = calculateBloomMasteryBonus(mastery);
        const reactionBonus = 0; // 反应系数加成
        const fireResistance = 0.9; // 敌人默认火抗10%

        const baseDamage = levelCoefficient * 2 * (masteryBonus + reactionBonus) * fireResistance;

        // 判断目标类型
        const targetType = card.dataset.type;
        let finalDamage;

        if (targetType === '角色') {
            // 玩家角色被烈绽放命中：基础伤害 * 0.05
            finalDamage = Math.round(baseDamage * 0.05);
        } else {
            // 魔物受到完整伤害
            finalDamage = Math.round(baseDamage);
        }

        // 显示爆炸效果
        showReactionText(card, '烈绽放');

        // 显示元素图标
        showElementIcon(card, '火');
        showElementIcon(card, '草');

        showDamageNumber(card, finalDamage);

        // 更新生命值
        const currentHealth = parseInt(card.dataset.health);
        card.dataset.health = Math.max(0, currentHealth - finalDamage);

        // 更新血条
        updateHealthBar(card);

        // 检查是否死亡
        checkCardDeath(card);
    }
}

// 触发超绽放
function triggerHyperbloom(card, triggerName) {
    // 找到与该卡片相关的草原核
    const cardCores = dendroCoreArray.filter(core => core.card === card);

    if (cardCores.length > 0) {
        // 触发第一个草原核
        const core = cardCores[0];
        core.type = 'hyper';

        // 从数组中移除
        dendroCoreArray = dendroCoreArray.filter(c => c.id !== core.id);

        // 移除草原核图标
        removeDendroCoreIcon(core.card, core.id);

        // 计算伤害（超绽放）
        // 使用与原绽放相同的基础公式，但元素抗性为草抗
        const levelCoefficient = 1447; // 90级角色等级系数
        const mastery = 0; // 默认精通值
        const masteryBonus = calculateBloomMasteryBonus(mastery);
        const reactionBonus = 0; // 反应系数加成
        const grassResistance = 0.9; // 敌人默认草抗10%

        const baseDamage = levelCoefficient * 2 * (masteryBonus + reactionBonus) * grassResistance;

        // 判断目标类型
        const targetType = card.dataset.type;
        let finalDamage;

        if (targetType === '角色') {
            // 玩家角色被超绽放命中：基础伤害 * 0.05
            finalDamage = Math.round(baseDamage * 0.05);
        } else {
            // 魔物受到完整伤害
            finalDamage = Math.round(baseDamage);
        }

        // 显示爆炸效果
        showReactionText(card, '超绽放');

        // 显示元素图标
        showElementIcon(card, '雷');
        showElementIcon(card, '草');

        showDamageNumber(card, finalDamage);

        // 更新生命值
        const currentHealth = parseInt(card.dataset.health);
        card.dataset.health = Math.max(0, currentHealth - finalDamage);

        // 更新血条
        updateHealthBar(card);

        // 检查是否死亡
        checkCardDeath(card);
    }
}

// 扩散反应系统
// 获取所有卡片
function getAllCards() {
    return Array.from(document.querySelectorAll('.card:not(.dead)'));
}

// 检查目标是否有元素附着
function getElementalAttachment(card) {
    // 优先检查卡片的元素附着状态
    if (card.dataset.elementalAttachment) {
        return card.dataset.elementalAttachment;
    }

    // 如果没有附着元素，根据卡片名称判断
    const cardName = card.dataset.name;
    if (cardName.includes('火') || cardName.includes('可莉') || cardName.includes('宵宫') || cardName.includes('债务处理人') || cardName.includes('迪卢克') || cardName.includes('胡桃') || cardName.includes('攻坚特化型机关')) {
        return '火';
    } else if (cardName.includes('水') || cardName.includes('珊瑚宫心海') || cardName.includes('神里绫人') || cardName.includes('藏境仕女') || cardName.includes('达达利亚') || cardName.includes('歼灭特化型机关')) {
        return '水';
    } else if (cardName.includes('冰') || cardName.includes('甘雨') || cardName.includes('神里凌华') || cardName.includes('申鹤') || cardName.includes('优菈') || cardName.includes('魔偶剑鬼')) {
        return '冰';
    } else if (cardName.includes('雷') || cardName.includes('雷电将军') || cardName.includes('八重神子') || cardName.includes('刻晴') || cardName.includes('达达利亚') || cardName.includes('歼灭特化型机关')) {
        return '雷';
    }
    return null;
}

// 计算扩散伤害
function calculateSwirlDamage(element, mastery = 0) {
    const baseDamage = 1447; // 90级角色基础伤害
    const masteryBonus = calculateMasteryBonus(mastery);
    const damageBonus = 0.6; // 风套4件套效果
    const resistance = 1.176; // 风套减抗后抗性区乘数

    return Math.round(baseDamage * (1 + masteryBonus + damageBonus) * resistance);
}

// 触发扩散反应
function triggerSwirlReaction(attackerCard, targetCard) {
    // 检查目标是否有元素附着
    const elementalAttachment = getElementalAttachment(targetCard);
    if (!elementalAttachment) {
        return;
    }

    // 显示扩散反应文字
    showReactionText(targetCard, `扩散${elementalAttachment}`);

    // 显示元素图标
    showElementIcon(targetCard, '风');
    showElementIcon(targetCard, elementalAttachment);

    // 计算扩散伤害
    const swirlDamage = calculateSwirlDamage(elementalAttachment);

    // 获取所有卡片作为范围目标
    const allCards = getAllCards();

    // 对所有目标造成扩散伤害并附着元素
    allCards.forEach(card => {
        if (card !== attackerCard) {
            showDamageNumber(card, swirlDamage);

            // 更新生命值
            const currentHealth = parseInt(card.dataset.health);
            card.dataset.health = Math.max(0, currentHealth - swirlDamage);

            // 更新血条
            updateHealthBar(card);

            // 检查是否死亡
            checkCardDeath(card);

            // 附着扩散的元素
            card.dataset.elementalAttachment = elementalAttachment;
        }
    });
}

// 结晶反应系统
let crystalArray = [];
const MAX_CRYSTALS = 5;
const CRYSTAL_DURATION = 15000; // 15秒

// 创建元素晶片
function createCrystal(element, position) {
    // 检查是否达到晶片上限
    if (crystalArray.length >= MAX_CRYSTALS) {
        // 移除最早的晶片
        const oldestCrystal = crystalArray.shift();
        if (oldestCrystal.elementNode && oldestCrystal.elementNode.parentNode) {
            oldestCrystal.elementNode.parentNode.removeChild(oldestCrystal.elementNode);
        }
    }

    // 创建晶片元素
    const crystal = document.createElement('div');
    crystal.className = 'crystal';
    crystal.dataset.element = element;
    crystal.style.position = 'absolute';
    crystal.style.left = position.x + 'px';
    crystal.style.top = position.y + 'px';
    crystal.style.width = '20px';
    crystal.style.height = '20px';
    crystal.style.borderRadius = '50%';
    crystal.style.display = 'flex';
    crystal.style.alignItems = 'center';
    crystal.style.justifyContent = 'center';
    crystal.style.fontSize = '12px';
    crystal.style.fontWeight = 'bold';
    crystal.style.cursor = 'pointer';
    crystal.style.zIndex = '1000';
    crystal.style.animation = 'crystalFloat 2s ease-in-out infinite';

    // 设置晶片颜色
    switch (element) {
        case '火':
            crystal.style.backgroundColor = 'rgba(255, 100, 100, 0.8)';
            crystal.style.color = 'white';
            break;
        case '水':
            crystal.style.backgroundColor = 'rgba(100, 150, 255, 0.8)';
            crystal.style.color = 'white';
            break;
        case '冰':
            crystal.style.backgroundColor = 'rgba(150, 200, 255, 0.8)';
            crystal.style.color = 'white';
            break;
        case '雷':
            crystal.style.backgroundColor = 'rgba(150, 100, 255, 0.8)';
            crystal.style.color = 'white';
            break;
    }

    // 添加元素符号
    crystal.textContent = element;

    // 添加到游戏区域
    document.querySelector('.battle-area').appendChild(crystal);

    // 创建晶片对象
    const crystalObj = {
        id: Date.now() + Math.random(),
        element: element,
        elementNode: crystal,
        position: position,
        createdAt: Date.now()
    };

    // 添加到数组
    crystalArray.push(crystalObj);

    // 设置过期时间
    setTimeout(() => {
        removeCrystal(crystalObj.id);
    }, CRYSTAL_DURATION);

    // 添加点击事件（拾取晶片）
    crystal.addEventListener('click', () => {
        pickUpCrystal(crystalObj);
    });

    return crystalObj;
}

// 移除晶片
function removeCrystal(crystalId) {
    const index = crystalArray.findIndex(crystal => crystal.id === crystalId);
    if (index !== -1) {
        const crystal = crystalArray[index];
        if (crystal.elementNode && crystal.elementNode.parentNode) {
            crystal.elementNode.parentNode.removeChild(crystal.elementNode);
        }
        crystalArray.splice(index, 1);
    }
}

// 计算护盾值
function calculateShieldValue(element, mastery = 0) {
    const baseShield = 1851; // 90级角色基础吸收量
    const masteryBonus = (4.44 * mastery) / (mastery + 1400);
    const shieldStrength = 0; // 暂时设置为0，后续可扩展
    const crystallizeBonus = 0; // 暂时设置为0，后续可扩展

    return Math.round(baseShield * (1 + masteryBonus) * (1 + shieldStrength) * (1 + crystallizeBonus));
}

// 拾取晶片
function pickUpCrystal(crystal) {
    // 计算护盾值
    const shieldValue = calculateShieldValue(crystal.element);

    // 显示拾取效果
    if (crystal.elementNode) {
        crystal.elementNode.style.animation = 'crystalPickUp 0.5s ease-out forwards';
        setTimeout(() => {
            removeCrystal(crystal.id);
        }, 500);
    }

    // 为所有我方角色添加护盾
    const allCards = getAllCards();
    allCards.forEach(card => {
        // 设置护盾值
        card.dataset.shield = shieldValue;
        card.dataset.shieldElement = crystal.element;

        // 更新护盾条
        updateShieldBar(card);

        // 显示护盾获得文字
        showReactionText(card, `获得${crystal.element}护盾`);
    });
}

// 触发结晶反应
function triggerCrystallizeReaction(attackerCard, targetCard) {
    // 检查目标是否有元素附着
    const elementalAttachment = getElementalAttachment(targetCard);
    if (!elementalAttachment) {
        return;
    }

    // 显示结晶反应文字
    showReactionText(targetCard, `结晶${elementalAttachment}`);

    // 显示元素图标
    showElementIcon(targetCard, '岩');
    showElementIcon(targetCard, elementalAttachment);

    // 获取目标位置
    const rect = targetCard.getBoundingClientRect();
    const battleAreaRect = document.querySelector('.battle-area');
    if (battleAreaRect) {
        const battleAreaRectData = battleAreaRect.getBoundingClientRect();
        const position = {
            x: rect.left - battleAreaRectData.left + rect.width / 2 - 10,
            y: rect.top - battleAreaRectData.top + rect.height / 2 - 10
        };

        // 创建元素晶片
        createCrystal(elementalAttachment, position);
    }

    // 岩元素只能与火、水、雷、冰四种元素发生结晶反应，生成对应元素护盾
    if (elementalAttachment === '火' || elementalAttachment === '水' || elementalAttachment === '雷' || elementalAttachment === '冰') {
        const shieldValue = 150;
        attackerCard.dataset.shield = shieldValue;
        attackerCard.dataset.maxShield = shieldValue;
        attackerCard.dataset.shieldElement = elementalAttachment; // 设置护盾元素类型

        // 检查是否已经有护盾条，如果没有则创建
        const cardFront = attackerCard.querySelector('.card-front');
        let shieldBarContainer = attackerCard.querySelector('.shield-bar-container');

        if (!shieldBarContainer && cardFront) {
            // 创建护盾条容器
            shieldBarContainer = document.createElement('div');
            shieldBarContainer.className = 'shield-bar-container';
            shieldBarContainer.innerHTML = `
                <div class="shield-bar" style="width: 100%"></div>
                <div class="shield-text">${shieldValue}/${shieldValue}</div>
            `;
            cardFront.appendChild(shieldBarContainer);
        }

        // 更新攻击者的护盾条显示
        updateShieldBar(attackerCard);

        // 显示获得护盾的文字
        showReactionText(attackerCard, `获得${elementalAttachment}护盾`);
    }
}

// 激化反应系统（Intensify Reactions）
// 激化状态管理
const quickenedTargets = new Map(); // 存储处于激化状态的目标
const QUICKEN_DURATION = 8000; // 激化状态持续8秒

// 触发原激化反应（Quicken）- 雷+草
function triggerQuickenReaction(attackerCard, targetCard) {
    const targetId = targetCard.dataset.name + '_' + Date.now();

    // 显示原激化反应文字
    showReactionText(targetCard, '原激化');

    // 显示元素图标
    showElementIcon(targetCard, '雷');
    showElementIcon(targetCard, '草');

    // 给目标添加激化状态
    targetCard.dataset.quickened = 'true';
    quickenedTargets.set(targetCard, Date.now());

    // 添加激化视觉效果（紫绿色光晕）
    targetCard.style.boxShadow = '0 0 15px rgba(147, 51, 234, 0.8), 0 0 25px rgba(16, 185, 129, 0.6)';

    // 在卡牌上添加草原核图标（激化状态标识）
    const quickenId = 'quicken_' + Date.now();
    addQuickenIcon(targetCard, quickenId);

    // 8秒后移除激化状态
    setTimeout(() => {
        if (targetCard.dataset.quickened === 'true') {
            targetCard.dataset.quickened = 'false';
            targetCard.style.boxShadow = '';
            quickenedTargets.delete(targetCard);
            // 移除激化图标
            removeQuickenIcon(targetCard, quickenId);
        }
    }, QUICKEN_DURATION);
}

// 在卡牌上添加激化状态图标
function addQuickenIcon(card, quickenId) {
    const cardFront = card.querySelector('.card-front');
    if (!cardFront) return;

    // 创建激化图标容器
    const quickenIcon = document.createElement('div');
    quickenIcon.className = 'quicken-icon';
    quickenIcon.dataset.quickenId = quickenId;
    quickenIcon.style.position = 'absolute';
    quickenIcon.style.top = '5px';
    quickenIcon.style.left = '5px';
    quickenIcon.style.width = '30px';
    quickenIcon.style.height = '30px';
    quickenIcon.style.zIndex = '10';
    quickenIcon.style.pointerEvents = 'none';

    // 创建图标图片
    const img = document.createElement('img');
    img.src = 'images/草原核.png';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.filter = 'drop-shadow(0 0 3px rgba(147, 51, 234, 0.8)) hue-rotate(270deg)';
    img.style.animation = 'pulse 1s ease-in-out infinite';

    quickenIcon.appendChild(img);
    cardFront.appendChild(quickenIcon);
}

// 移除激化状态图标
function removeQuickenIcon(card, quickenId) {
    const quickenIcon = card.querySelector(`.quicken-icon[data-quicken-id="${quickenId}"]`);
    if (quickenIcon) {
        quickenIcon.remove();
    }
}

// 触发超激化反应（Aggravate）- 雷触发激化状态
function triggerAggravateReaction(attackerCard, targetCard) {
    // 计算超激化伤害
    const baseDamage = 2894; // 90级角色基础伤害
    const mastery = 0; // 默认精通值
    const masteryBonus = calculateMasteryBonus(mastery);
    const damageBonus = 0; // 默认伤害加成
    const resistance = 0.9; // 敌人默认雷抗10%

    const aggravateDamage = Math.round(baseDamage * (1 + masteryBonus + damageBonus) * resistance);

    // 显示超激化反应文字
    showReactionText(targetCard, '超激化');

    // 显示伤害
    showDamageNumber(targetCard, aggravateDamage);

    // 更新生命值
    const currentHealth = parseInt(targetCard.dataset.health);
    targetCard.dataset.health = Math.max(0, currentHealth - aggravateDamage);

    // 更新血条
    updateHealthBar(targetCard);

    // 检查是否死亡
    checkCardDeath(targetCard);
}

// 触发蔓激化反应（Spread）- 草触发激化状态
function triggerSpreadReaction(attackerCard, targetCard) {
    // 计算蔓激化伤害
    const baseDamage = 2894; // 90级角色基础伤害
    const mastery = 0; // 默认精通值
    const masteryBonus = calculateMasteryBonus(mastery);
    const damageBonus = 0; // 默认伤害加成
    const resistance = 0.9; // 敌人默认草抗10%

    const spreadDamage = Math.round(baseDamage * (1 + masteryBonus + damageBonus) * resistance);

    // 显示蔓激化反应文字
    showReactionText(targetCard, '蔓激化');

    // 显示伤害
    showDamageNumber(targetCard, spreadDamage);

    // 更新生命值
    const currentHealth = parseInt(targetCard.dataset.health);
    targetCard.dataset.health = Math.max(0, currentHealth - spreadDamage);

    // 更新血条
    updateHealthBar(targetCard);

    // 检查是否死亡
    checkCardDeath(targetCard);
}

// 增幅反应系统
// 计算增幅反应伤害
function calculateAmplifyingDamage(baseDamage, reactionMultiplier, mastery = 0) {
    const masteryBonus = (2.78 * mastery) / (mastery + 1400);
    return Math.round(baseDamage * reactionMultiplier * (1 + masteryBonus));
}

// 触发蒸发反应
function triggerVaporizeReaction(attackerCard, targetCard, isWaterTrigger) {
    // 获取攻击者名称和攻击力
    const attackerName = attackerCard.dataset.name;
    const baseDamage = parseInt(attackerCard.dataset.attack) || getDamageByRarity(attackerCard.dataset.rarity);

    // 确定反应倍率
    const reactionMultiplier = isWaterTrigger ? 2.0 : 1.5;

    // 计算蒸发伤害
    const vaporizeDamage = calculateAmplifyingDamage(baseDamage, reactionMultiplier);

    // 显示蒸发反应文字
    showReactionText(targetCard, '蒸发');

    // 显示元素图标
    if (isWaterTrigger) {
        showElementIcon(targetCard, '水');
    } else {
        showElementIcon(targetCard, '火');
    }

    // 显示蒸发伤害
    showDamageNumber(targetCard, vaporizeDamage);

    // 更新目标生命值
    const defenderHealth = parseInt(targetCard.dataset.health) - vaporizeDamage;
    targetCard.dataset.health = Math.max(0, defenderHealth);

    // 更新血条
    updateHealthBar(targetCard);

    // 检查是否死亡
    checkCardDeath(targetCard);
}

// 触发融化反应
function triggerMeltReaction(attackerCard, targetCard, isIceTrigger) {
    // 获取攻击者名称和攻击力
    const attackerName = attackerCard.dataset.name;
    const baseDamage = parseInt(attackerCard.dataset.attack) || getDamageByRarity(attackerCard.dataset.rarity);

    // 确定反应倍率
    const reactionMultiplier = isIceTrigger ? 2.0 : 1.5;

    // 计算融化伤害
    const meltDamage = calculateAmplifyingDamage(baseDamage, reactionMultiplier);

    // 显示融化反应文字
    showReactionText(targetCard, '融化');

    // 显示元素图标
    if (isIceTrigger) {
        showElementIcon(targetCard, '冰');
    } else {
        showElementIcon(targetCard, '火');
    }

    // 显示融化伤害
    showDamageNumber(targetCard, meltDamage);

    // 更新目标生命值
    const defenderHealth = parseInt(targetCard.dataset.health) - meltDamage;
    targetCard.dataset.health = Math.max(0, defenderHealth);

    // 更新血条
    updateHealthBar(targetCard);

    // 检查是否死亡
    checkCardDeath(targetCard);
}

// 超载反应系统
// 计算超载伤害
function calculateOverloadDamage(mastery = 0) {
    const baseDamage = 2893; // 90级角色基础伤害
    const masteryBonus = (2.78 * mastery) / (mastery + 1400);
    const damageBonus = 0; // 暂时设置为0，后续可扩展
    const resistance = 0.9; // 敌人默认火抗10%

    return Math.round(baseDamage * (1 + masteryBonus + damageBonus) * resistance);
}

// 触发超载反应
function triggerOverloadReaction(attackerCard, targetCard) {
    // 计算超载伤害
    const overloadDamage = calculateOverloadDamage();

    // 显示超载反应文字
    showReactionText(targetCard, '超载');

    // 显示元素图标
    showElementIcon(targetCard, '火');
    showElementIcon(targetCard, '雷');

    // 获取所有卡片作为范围目标
    const allCards = getAllCards();

    // 对所有目标造成超载伤害
    allCards.forEach(card => {
        if (card !== attackerCard) {
            showDamageNumber(card, overloadDamage);

            // 更新生命值
            const currentHealth = parseInt(card.dataset.health);
            card.dataset.health = Math.max(0, currentHealth - overloadDamage);

            // 更新血条
            updateHealthBar(card);

            // 检查是否死亡
            checkCardDeath(card);

            // 检查是否触发碎冰
            if (card.dataset.frozen) {
                triggerShatterReaction(attackerCard, card);
            }
        }
    });
}

// 计算感电伤害
function calculateElectroChargedDamage(mastery = 0) {
    const baseDamage = 1950; // 90级角色基础伤害
    const masteryBonus = (2.78 * mastery) / (mastery + 1400);
    const damageBonus = 0; // 暂时设置为0，后续可扩展
    const resistance = 0.9; // 敌人默认雷抗10%

    return Math.round(baseDamage * (1 + masteryBonus + damageBonus) * resistance);
}

// 触发感电反应
function triggerElectroChargedReaction(attackerCard, targetCard) {
    // 计算感电伤害
    const electroChargedDamage = calculateElectroChargedDamage();

    // 显示感电反应文字
    showReactionText(targetCard, '感电');

    // 显示元素图标
    showElementIcon(targetCard, '水');
    showElementIcon(targetCard, '雷');

    // 显示感电伤害
    showDamageNumber(targetCard, electroChargedDamage);

    // 更新目标生命值
    const currentHealth = parseInt(targetCard.dataset.health);
    targetCard.dataset.health = Math.max(0, currentHealth - electroChargedDamage);

    // 更新血条
    updateHealthBar(targetCard);

    // 检查是否死亡
    checkCardDeath(targetCard);

    // 感电链式攻击：对所有附着水元素的卡牌造成伤害
    const allCards = getAllCards();
    allCards.forEach(card => {
        if (card !== attackerCard && card !== targetCard) {
            // 检查卡牌是否附着了水元素
            const elementalAttachment = getElementalAttachment(card);
            if (elementalAttachment === '水') {
                // 显示感电链式伤害
                showDamageNumber(card, electroChargedDamage);

                // 更新生命值
                const cardHealth = parseInt(card.dataset.health);
                card.dataset.health = Math.max(0, cardHealth - electroChargedDamage);

                // 更新血条
                updateHealthBar(card);

                // 检查是否死亡
                checkCardDeath(card);
            }
        }
    });
}

// 计算超导伤害
function calculateSuperconductDamage(mastery = 0) {
    const baseDamage = 1447; // 90级角色基础伤害
    const masteryBonus = (2.78 * mastery) / (mastery + 1400);
    const damageBonus = 0; // 暂时设置为0，后续可扩展
    const resistance = 0.9; // 敌人默认冰抗10%

    return Math.round(baseDamage * (1 + masteryBonus + damageBonus) * resistance);
}

// 触发超导反应
function triggerSuperconductReaction(attackerCard, targetCard) {
    // 计算超导伤害
    const superconductDamage = calculateSuperconductDamage();

    // 显示超导反应文字
    showReactionText(targetCard, '超导');

    // 显示元素图标
    showElementIcon(targetCard, '冰');
    showElementIcon(targetCard, '雷');

    // 获取所有卡片作为范围目标
    const allCards = getAllCards();

    // 对所有目标造成超导伤害并施加超导状态
    allCards.forEach(card => {
        if (card !== attackerCard) {
            // 显示超导伤害
            showDamageNumber(card, superconductDamage);

            // 更新生命值
            const currentHealth = parseInt(card.dataset.health);
            card.dataset.health = Math.max(0, currentHealth - superconductDamage);

            // 更新血条
            updateHealthBar(card);

            // 检查是否死亡
            checkCardDeath(card);

            // 施加超导状态：物理抗性降低40%（内部状态，不显示额外文字）
            card.dataset.superconduct = 'true';
            card.dataset.superconductExpiry = Date.now() + 12000; // 12秒持续时间
        }
    });
}

// 冻结反应系统
// 计算碎冰伤害
function calculateShatterDamage(mastery = 0) {
    const baseDamage = 1804; // 90级角色基础伤害
    const masteryBonus = (2.78 * mastery) / (mastery + 1400);
    const resistance = 0.9; // 敌人默认物抗10%

    return Math.round(baseDamage * (1 + masteryBonus) * resistance);
}

// 触发冻结反应
function triggerFreezeReaction(attackerCard, targetCard) {
    // 检查目标是否已经冻结
    if (targetCard.dataset.frozen) {
        return;
    }

    // 显示冻结反应文字
    showReactionText(targetCard, '冻结');

    // 显示元素图标
    showElementIcon(targetCard, '水');
    showElementIcon(targetCard, '冰');

    // 设置冻结状态
    targetCard.dataset.frozen = 'true';
    targetCard.style.filter = 'brightness(0.8) contrast(1.2) hue-rotate(180deg)'; // 冻结视觉效果

    // 设置冻结持续时间（3秒）
    setTimeout(() => {
        unfreezeTarget(targetCard);
    }, 3000);
}

// 解除冻结状态
function unfreezeTarget(card) {
    if (card.dataset.frozen) {
        delete card.dataset.frozen;
        card.style.filter = ''; // 移除冻结视觉效果
        showReactionText(card, '解冻');
    }
}

// 触发碎冰反应
function triggerShatterReaction(attackerCard, targetCard) {
    // 计算碎冰伤害
    const shatterDamage = calculateShatterDamage();

    // 显示碎冰反应文字
    showReactionText(targetCard, '碎冰');

    // 显示碎冰伤害
    showDamageNumber(targetCard, shatterDamage);

    // 更新目标生命值
    const currentHealth = parseInt(targetCard.dataset.health);
    targetCard.dataset.health = Math.max(0, currentHealth - shatterDamage);

    // 更新血条
    updateHealthBar(targetCard);

    // 检查是否死亡
    checkCardDeath(targetCard);

    // 解除冻结状态
    unfreezeTarget(targetCard);
}

// 检查卡片是否死亡
function checkCardDeath(card) {
    const health = parseInt(card.dataset.health);
    const cardType = card.dataset.type;
    if (health <= 0) {
        card.classList.add('dead');
        card.dataset.health = 0;

        // 创建死亡/损坏文字元素
        const deathText = document.createElement('div');
        deathText.className = 'death-text';
        deathText.textContent = cardType === '武器' ? '已损坏' : '死亡';
        deathText.style.position = 'absolute';
        deathText.style.top = '50%';
        deathText.style.left = '50%';
        deathText.style.transform = 'translate(-50%, -50%)';
        deathText.style.color = cardType === '武器' ? '#1E90FF' : '#ff0000'; // 武器用蓝色，其他用红色
        deathText.style.fontSize = '20px';
        deathText.style.fontWeight = 'bold';
        deathText.style.zIndex = '9999';
        deathText.style.filter = 'none';
        deathText.style.pointerEvents = 'none';

        card.appendChild(deathText);

        // 从历史记录中删除该卡牌
        removeCardFromHistory(card);

        // 延迟后从界面中移除卡牌
        setTimeout(() => {
            card.remove();
        }, 1000); // 显示死亡文字1秒后移除

        return true;
    }
    return false;
}

// 从历史记录中删除卡牌
function removeCardFromHistory(card) {
    const cardName = card.dataset.name;
    const cardPath = card.dataset.path;

    if (!sessionStorage[RecordName]) {
        return;
    }

    // 获取当前历史记录
    const itemsNow = JSON.parse(sessionStorage[RecordName]);

    // 找到并删除第一个匹配的卡牌（从后往前找，删除最近抽到的）
    for (let i = itemsNow.length - 1; i >= 0; i--) {
        if (itemsNow[i].name === cardName && itemsNow[i].path === cardPath) {
            itemsNow.splice(i, 1);
            break; // 只删除一张
        }
    }

    // 更新历史记录
    sessionStorage[RecordName] = JSON.stringify(itemsNow);
}

// 卡牌互撞逻辑
let draggedCard = null;
window.draggedCard = null; // 全局引用，供武器装备系统使用
let dragOffset = { x: 0, y: 0 };
let dragPreview = null;
window.dragPreview = null; // 全局引用
let dragBubble = null;
window.dragBubble = null; // 全局引用

// 存储全局事件监听器的引用
let globalMouseMoveListener = null;
let globalMouseUpListener = null;

// 创建拖拽气泡函数
function createDragBubble(card) {
    // 清理已存在的气泡
    if (dragBubble) {
        if (dragBubble.parentNode) {
            dragBubble.remove();
        }
        dragBubble = null;
    }

    // 获取卡牌位置和尺寸
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;

    // 计算气泡位置（卡牌头顶居中）
    const bubbleLeft = rect.left + cardWidth / 2 - 10;
    const bubbleTop = rect.top - 30;

    // 创建新气泡
    dragBubble = document.createElement('div');
    dragBubble.style.position = 'fixed';
    dragBubble.style.left = `${bubbleLeft}px`;
    dragBubble.style.top = `${bubbleTop}px`;
    dragBubble.style.zIndex = '1000';
    dragBubble.style.pointerEvents = 'none';
    dragBubble.style.fontSize = '24px';
    dragBubble.style.color = '#666';
    dragBubble.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
    dragBubble.style.animation = 'fadeIn 0.3s ease-in-out';
    dragBubble.textContent = '···';

    document.body.appendChild(dragBubble);
}

// 显示困惑气泡函数（攻击自己时）
function showConfusedBubble(card) {
    // 清理已存在的气泡
    if (dragBubble) {
        if (dragBubble.parentNode) {
            dragBubble.remove();
        }
        dragBubble = null;
    }

    // 获取卡牌位置和尺寸
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;

    // 计算气泡位置（卡牌头顶居中）
    const bubbleLeft = rect.left + cardWidth / 2 - 15;
    const bubbleTop = rect.top - 30;

    // 创建新气泡
    dragBubble = document.createElement('div');
    dragBubble.style.position = 'fixed';
    dragBubble.style.left = `${bubbleLeft}px`;
    dragBubble.style.top = `${bubbleTop}px`;
    dragBubble.style.zIndex = '1000';
    dragBubble.style.pointerEvents = 'none';
    dragBubble.style.fontSize = '24px';
    dragBubble.style.color = '#ffcc00'; // 黄色文本，符合疑问的感觉
    dragBubble.style.textShadow = '0 0 0 3px #000000, 0 0 0 3px #000000, 0 1px 3px rgba(0,0,0,0.8)'; // 更明显的黑色描边效果
    dragBubble.style.animation = 'fadeIn 0.3s ease-in-out';
    dragBubble.textContent = '???';

    document.body.appendChild(dragBubble);

    // 3秒后自动移除气泡
    setTimeout(() => {
        if (dragBubble && dragBubble.parentNode) {
            dragBubble.remove();
            dragBubble = null;
        }
    }, 3000);
}

// 白缨枪升级函数
function upgradeWhiteTassel(draggedCard, targetCard) {
    // 获取目标白缨枪的当前等级
    let currentLevel = parseInt(targetCard.dataset.level) || 1;

    // 定义白缨枪的升级属性表
    const upgradeTable = [
        { level: 1, attack: 39, critRate: 5.1 },
        { level: 2, attack: 113, critRate: 9.0 }, // 20级突破后
        { level: 3, attack: 189, critRate: 13.1 }, // 40级突破后
        { level: 4, attack: 236, critRate: 15.2 }, // 50级突破后
        { level: 5, attack: 282, critRate: 17.3 }, // 60级突破后
        { level: 6, attack: 329, critRate: 19.3 }, // 70级突破后
        { level: 7, attack: 375, critRate: 21.4 }, // 80级突破后
        { level: 8, attack: 401, critRate: 23.4 }  // 90级
    ];

    // 计算升级后的等级（最多到90级）
    const nextLevel = Math.min(currentLevel + 1, upgradeTable.length);

    // 获取升级后的属性
    const nextStats = upgradeTable[nextLevel - 1];

    // 更新目标白缨枪的属性
    targetCard.dataset.level = nextLevel;
    targetCard.dataset.attack = nextStats.attack;
    targetCard.dataset.critRate = nextStats.critRate;

    // 更新白缨枪的显示信息（在血条下方添加等级和属性信息）
    updateWhiteTasselDisplay(targetCard);

    // 显示升级成功的气泡
    showUpgradeBubble(targetCard, nextLevel, nextStats);

    // 移除被拖拽的白缨枪（作为升级材料）
    if (draggedCard.parentNode) {
        draggedCard.remove();
    }
}

// 更新白缨枪的显示信息
function updateWhiteTasselDisplay(card) {
    const level = card.dataset.level;
    const attack = card.dataset.attack;
    const critRate = card.dataset.critRate;

    // 检查是否已经有属性显示元素
    let statsElement = card.querySelector('.weapon-stats');
    if (!statsElement) {
        // 创建新的属性显示元素
        statsElement = document.createElement('div');
        statsElement.className = 'weapon-stats';
        statsElement.style.position = 'absolute';
        statsElement.style.bottom = '5px';
        statsElement.style.left = '5px';
        statsElement.style.right = '5px';
        statsElement.style.fontSize = '12px';
        statsElement.style.color = '#ffffff';
        statsElement.style.textShadow = '0 1px 2px rgba(0,0,0,0.8)';
        statsElement.style.textAlign = 'center';
        statsElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
        statsElement.style.borderRadius = '3px';
        statsElement.style.padding = '2px';

        card.appendChild(statsElement);
    }

    // 更新属性信息
    statsElement.innerHTML = `Lv.${level} | 攻击: ${attack} | 暴击率: ${critRate}%`;
}

// 显示升级成功的气泡
function showUpgradeBubble(card, level, stats) {
    // 清理已存在的气泡
    if (dragBubble) {
        if (dragBubble.parentNode) {
            dragBubble.remove();
        }
        dragBubble = null;
    }

    // 获取卡牌位置和尺寸
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;

    // 计算气泡位置（卡牌头顶居中）
    const bubbleLeft = rect.left + cardWidth / 2 - 30;
    const bubbleTop = rect.top - 40;

    // 创建新气泡
    dragBubble = document.createElement('div');
    dragBubble.style.position = 'fixed';
    dragBubble.style.left = `${bubbleLeft}px`;
    dragBubble.style.top = `${bubbleTop}px`;
    dragBubble.style.zIndex = '1000';
    dragBubble.style.pointerEvents = 'none';
    dragBubble.style.fontSize = '16px';
    dragBubble.style.color = '#4CAF50'; // 绿色文本
    dragBubble.style.textShadow = '0 0 0 2px #000000, 0 1px 2px rgba(0,0,0,0.5)';
    dragBubble.style.animation = 'fadeIn 0.3s ease-in-out';
    dragBubble.textContent = `升级到 Lv.${level}!`;

    document.body.appendChild(dragBubble);

    // 3秒后自动移除气泡
    setTimeout(() => {
        if (dragBubble && dragBubble.parentNode) {
            dragBubble.remove();
            dragBubble = null;
        }
    }, 3000);
}

// 角色和魔物卡牌升级函数
function upgradeCard(draggedCard, targetCard) {
    // 获取目标卡牌的当前等级和属性
    let currentLevel = parseInt(targetCard.dataset.level) || 1;
    let currentHealth = parseInt(targetCard.dataset.maxHealth) || 10;
    let currentAttack = parseInt(targetCard.dataset.attack) || getDamageByRarity(targetCard.dataset.rarity);
    const rarity = targetCard.dataset.rarity;

    // 计算升级后的等级
    const nextLevel = currentLevel + 1;

    // 根据等级阶段计算属性提升
    let healthIncrease = 0;
    let attackIncrease = 0;

    // 基础属性设置（根据卡牌类型和名称）
    let baseHealth, baseAttack;

    // 首先检查是否是魔物
    if (targetCard.dataset.type === '魔物') {
        const monsterName = targetCard.dataset.name;

        // 根据魔物名称设置基础属性
        if (monsterName.includes('遗迹')) {
            // 遗迹守卫系列
            if (monsterName.includes('守卫')) {
                // 遗迹守卫
                baseHealth = 2070;
                baseAttack = 116;
            } else if (monsterName.includes('猎者')) {
                // 遗迹猎者
                baseHealth = 1674;
                baseAttack = 108;
            } else if (monsterName.includes('歼击者')) {
                // 遗迹歼击者
                baseHealth = 1944;
                baseAttack = 114;
            } else if (monsterName.includes('机兵·空巡')) {
                // 遗迹机兵·空巡
                baseHealth = 1536;
                baseAttack = 96;
            } else if (monsterName.includes('机兵·地巡')) {
                // 遗迹机兵·地巡
                baseHealth = 2592;
                baseAttack = 124;
            } else if (monsterName.includes('龙兽·空巡')) {
                // 遗迹龙兽·空巡
                baseHealth = 2304;
                baseAttack = 130;
            } else if (monsterName.includes('龙兽·地巡')) {
                // 遗迹龙兽·地巡
                baseHealth = 3456;
                baseAttack = 135;
            }
        } else if (monsterName.includes('本真蕈')) {
            // 本真蕈系列
            if (monsterName.includes('陆行水')) {
                // 陆行水本真蕈
                baseHealth = 600;
                baseAttack = 60;
            } else if (monsterName.includes('陆行岩')) {
                // 陆行岩本真蕈
                baseHealth = 600;
                baseAttack = 60;
            } else if (monsterName.includes('有翼冰')) {
                // 有翼冰本真蕈
                baseHealth = 550;
                baseAttack = 55;
            } else if (monsterName.includes('有翼草')) {
                // 有翼草本真蕈
                baseHealth = 550;
                baseAttack = 55;
            }
        } else if (monsterName.includes('丘丘王')) {
            // 丘丘王系列
            if (monsterName.includes('岩盔')) {
                // 丘丘岩盔王
                baseHealth = 3872;
                baseAttack = 166;
            } else if (monsterName.includes('霜铠')) {
                // 丘丘霜铠王
                baseHealth = 4074;
                baseAttack = 166;
            } else if (monsterName.includes('雷兜')) {
                // 丘丘雷兜王
                baseHealth = 4074;
                baseAttack = 166;
            }
        } else if (monsterName.includes('丘丘人')) {
            // 丘丘人系列
            if (monsterName.includes('打手')) {
                // 打手丘丘人
                baseHealth = 220;
                baseAttack = 22;
            } else if (monsterName.includes('射手') || monsterName.includes('火箭') || monsterName.includes('雷箭') || monsterName.includes('冰箭')) {
                // 射手类丘丘人
                baseHealth = 220;
                baseAttack = 18;
            } else if (monsterName.includes('冲锋')) {
                // 冲锋丘丘人
                baseHealth = 240;
                baseAttack = 24;
            } else if (monsterName.includes('爆破')) {
                // 爆破丘丘人
                baseHealth = 100;
                baseAttack = 10;
            } else if (!monsterName.includes('暴徒')) {
                // 普通丘丘人
                baseHealth = 200;
                baseAttack = 20;
            }
        } else if (monsterName.includes('丘丘暴徒')) {
            // 丘丘暴徒系列
            if (monsterName.includes('斧') && !monsterName.includes('烈焰') && !monsterName.includes('霜铠') && !monsterName.includes('雷')) {
                // 丘丘暴徒·斧
                baseHealth = 726; // 基础生命值
                baseAttack = 56; // 基础攻击力
            } else if (monsterName.includes('盾')) {
                // 丘丘暴徒·盾
                baseHealth = 852; // 基础生命值
                baseAttack = 52; // 基础攻击力
            } else if (monsterName.includes('烈焰斧') || monsterName.includes('霜铠斧') || monsterName.includes('雷斧')) {
                // 元素附魔丘丘暴徒
                baseHealth = 852; // 基础生命值
                baseAttack = 58; // 基础攻击力
            } else {
                // 其他丘丘暴徒，使用默认值
                baseHealth = 800; // 取750-850的平均值
                baseAttack = 60; // 取55-65的平均值
            }
        } else if (monsterName.includes('史莱姆')) {
            // 史莱姆
            baseHealth = 175; // 取150-200的平均值
            baseAttack = 18; // 取15-20的平均值
        } else if (monsterName.includes('盗宝团')) {
            // 盗宝团
            baseHealth = 275; // 取250-300的平均值
            baseAttack = 28; // 取25-30的平均值
        } else if (monsterName.includes('愚人众')) {
            // 愚人众先遣队
            baseHealth = 1000; // 取900-1100的平均值
            baseAttack = 70; // 取60-80的平均值
        } else if (monsterName.includes('深渊法师')) {
            // 深渊法师
            baseHealth = 550; // 取500-600的平均值
            baseAttack = 45; // 取40-50的平均值
        } else if (monsterName.includes('野伏')) {
            // 野伏
            baseHealth = 1288; // 基础生命值
            baseAttack = 101; // 基础攻击力
        } else if (monsterName.includes('海乱鬼')) {
            // 海乱鬼
            baseHealth = 2225; // 基础生命值
            baseAttack = 126; // 基础攻击力
        } else if (monsterName.includes('Mek') || monsterName.includes('机兵') || monsterName.includes('机械')) {
            // 机关系列魔物
            baseHealth = 1900; // 基础生命值
            baseAttack = 70; // 基础攻击力
        } else if (monsterName.includes('猎犬') || monsterName.includes('Rifthound')) {
            // 兽境猎犬系列魔物
            baseHealth = 1820; // 基础生命值
            baseAttack = 110; // 基础攻击力
        } else if (monsterName.includes('黑蛇骑士') || monsterName.includes('Rockbreaker')) {
            // 黑蛇骑士·摧岩之钺
            baseHealth = 2304; // 基础生命值
            baseAttack = 130; // 基础攻击力
        } else if (monsterName.includes('圣骸角鳄') || monsterName.includes('Crocodile')) {
            // 圣骸角鳄
            baseHealth = 2760; // 基础生命值
            baseAttack = 138; // 基础攻击力
        } else if (monsterName.includes('萨满') || monsterName.includes('Samachurl')) {
            // 丘丘萨满系列
            baseHealth = 228; // 基础生命值
            if (monsterName.includes('火')) {
                baseAttack = 22; // 火丘丘萨满攻击力
            } else {
                baseAttack = 20; // 其他元素丘丘萨满攻击力
            }
        } else {
            // 其他魔物，使用默认值
            baseHealth = 300;
            baseAttack = 25;
        }
    } else {
        // 角色，根据稀有度设置基础属性
        if (rarity === 'ssr') { // 5星
            baseHealth = 1020;
            baseAttack = 25;
        } else if (rarity === 'sr') { // 4星
            baseHealth = 800;
            baseAttack = 20;
        } else { // 3星
            baseHealth = 600;
            baseAttack = 15;
        }
    }

    // 如果是初始等级，设置基础属性
    if (currentLevel === 1) {
        currentHealth = baseHealth;
        currentAttack = baseAttack;
    }

    // 计算属性提升
    if (nextLevel <= 10) {
        // 1-10级：低等级提升
        if (rarity === 'ssr') {
            healthIncrease = Math.floor(980 / 10); // 总提升980，平均每级109
            attackIncrease = Math.floor(24 / 10); // 总提升24，平均每级2.7
        } else if (rarity === 'sr') {
            healthIncrease = 20; // 15-30点
            attackIncrease = 3; // 2-4点
        } else {
            healthIncrease = 15;
            attackIncrease = 2;
        }
    } else if (nextLevel <= 80) {
        // 11-80级：中等提升
        if (rarity === 'ssr') {
            healthIncrease = 50 + Math.floor(nextLevel / 10) * 5;
            attackIncrease = 1 + Math.floor(nextLevel / 10) * 0.5;
        } else if (rarity === 'sr') {
            healthIncrease = 40 + Math.floor(nextLevel / 10) * 3;
            attackIncrease = 1 + Math.floor(nextLevel / 10) * 0.3;
        } else {
            healthIncrease = 30 + Math.floor(nextLevel / 10) * 2;
            attackIncrease = 1 + Math.floor(nextLevel / 10) * 0.2;
        }
    } else if (nextLevel <= 90) {
        // 81-90级：高等级大幅提升
        if (rarity === 'ssr') {
            healthIncrease = 150 + (nextLevel - 80) * 10;
            attackIncrease = 10 + (nextLevel - 80) * 0.5;
        } else if (rarity === 'sr') {
            healthIncrease = 120 + (nextLevel - 80) * 8;
            attackIncrease = 8 + (nextLevel - 80) * 0.4;
        } else {
            healthIncrease = 100 + (nextLevel - 80) * 5;
            attackIncrease = 6 + (nextLevel - 80) * 0.3;
        }
    }

    // 关键等级突破（20/50/70/80级）
    if ([20, 50, 70, 80].includes(currentLevel)) {
        // 突破时额外提升
        if (rarity === 'ssr') {
            healthIncrease += 200;
            attackIncrease += 15;
        } else if (rarity === 'sr') {
            healthIncrease += 150;
            attackIncrease += 10;
        } else {
            healthIncrease += 100;
            attackIncrease += 8;
        }
    }

    // 计算升级后的属性
    const nextHealth = currentHealth + healthIncrease;
    const nextAttack = Math.floor(currentAttack + attackIncrease);

    // 更新目标卡牌的属性
    targetCard.dataset.level = nextLevel;
    targetCard.dataset.maxHealth = nextHealth;
    targetCard.dataset.health = nextHealth; // 同时恢复生命值
    targetCard.dataset.attack = nextAttack;

    // 更新卡牌的显示信息
    updateCardDisplay(targetCard);

    // 更新血条
    updateHealthBar(targetCard);

    // 为升级后的魔物添加护盾（如果它们应该有护盾）
    if (targetCard.dataset.type === '魔物' && !targetCard.dataset.shield) {
        const monsterName = targetCard.dataset.name;
        let shouldHaveShield = false;
        let shieldValue = 0;
        let shieldElement = '';

        // 检查是否是需要护盾的魔物
        if (monsterName.includes('深渊法师')) {
            shouldHaveShield = true;
            shieldValue = 200;
            if (monsterName.includes('水')) {
                shieldElement = '水';
            } else if (monsterName.includes('火')) {
                shieldElement = '火';
            } else if (monsterName.includes('冰')) {
                shieldElement = '冰';
            } else if (monsterName.includes('雷')) {
                shieldElement = '雷';
            }
        } else if (monsterName.includes('愚人众先遣队')) {
            shouldHaveShield = true;
            shieldValue = 200;
            if (monsterName.includes('水铳重卫士')) {
                shieldElement = '水';
            } else if (monsterName.includes('冰铳重卫士')) {
                shieldElement = '冰';
            } else if (monsterName.includes('风拳前锋军')) {
                shieldElement = '风';
            }
        } else if (monsterName.includes('野伏')) {
            shouldHaveShield = true;
            shieldValue = 150;
            if (monsterName.includes('火付番')) {
                shieldElement = '火';
            } else if (monsterName.includes('机巧番')) {
                shieldElement = '雷';
            }
        } else if (monsterName.includes('兽境猎犬')) {
            shouldHaveShield = true;
            shieldValue = 150;
            if (monsterName.includes('嗜雷')) {
                shieldElement = '雷';
            } else if (monsterName.includes('嗜岩')) {
                shieldElement = '岩';
            }
        }

        // 如果需要护盾，添加护盾数据和显示
        if (shouldHaveShield && shieldElement) {
            targetCard.dataset.shield = shieldValue;
            targetCard.dataset.maxShield = shieldValue;
            targetCard.dataset.shieldElement = shieldElement;

            // 创建护盾条
            const cardFront = targetCard.querySelector('.card-front');
            if (cardFront && !targetCard.querySelector('.shield-bar-container')) {
                const shieldBarContainer = document.createElement('div');
                shieldBarContainer.className = 'shield-bar-container';
                shieldBarContainer.innerHTML = `
                    <div class="shield-bar" style="width: 100%"></div>
                    <div class="shield-text">${shieldValue}/${shieldValue}</div>
                `;
                cardFront.appendChild(shieldBarContainer);

                // 更新护盾条颜色
                updateShieldBar(targetCard);
            }
        }
    }

    // 显示升级成功的气泡
    showCardUpgradeBubble(targetCard, nextLevel, nextHealth, nextAttack);

    // 移除被拖拽的卡牌（作为升级材料）
    if (draggedCard.parentNode) {
        draggedCard.remove();
    }
}

// 更新卡牌的显示信息
function updateCardDisplay(card) {
    const level = card.dataset.level;
    const health = card.dataset.health;
    const maxHealth = card.dataset.maxHealth;
    const attack = card.dataset.attack;

    // 获取card-front元素
    const cardFront = card.querySelector('.card-front');

    // 检查是否已经有属性显示元素
    let statsElement = cardFront.querySelector('.card-stats');
    if (!statsElement) {
        // 创建新的属性显示元素
        statsElement = document.createElement('div');
        statsElement.className = 'card-stats';
        cardFront.appendChild(statsElement);
    }

    // 更新属性信息
    statsElement.textContent = `Lv.${level} | HP: ${health}/${maxHealth} | ATK: ${attack}`;
}

// 显示卡牌升级成功的气泡
function showCardUpgradeBubble(card, level, health, attack) {
    // 清理已存在的气泡
    if (dragBubble) {
        if (dragBubble.parentNode) {
            dragBubble.remove();
        }
        dragBubble = null;
    }

    // 获取卡牌位置和尺寸
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;

    // 计算气泡位置（卡牌头顶居中）
    const bubbleLeft = rect.left + cardWidth / 2 - 40;
    const bubbleTop = rect.top - 40;

    // 创建新气泡
    dragBubble = document.createElement('div');
    dragBubble.style.position = 'fixed';
    dragBubble.style.left = `${bubbleLeft}px`;
    dragBubble.style.top = `${bubbleTop}px`;
    dragBubble.style.zIndex = '1000';
    dragBubble.style.pointerEvents = 'none';
    dragBubble.style.fontSize = '14px';
    dragBubble.style.color = '#4CAF50'; // 绿色文本
    dragBubble.style.textShadow = '0 0 0 2px #000000, 0 1px 2px rgba(0,0,0,0.5)';
    dragBubble.style.animation = 'fadeIn 0.3s ease-in-out';
    dragBubble.textContent = `升级到 Lv.${level}!`;

    document.body.appendChild(dragBubble);

    // 3秒后自动移除气泡
    setTimeout(() => {
        if (dragBubble && dragBubble.parentNode) {
            dragBubble.remove();
            dragBubble = null;
        }
    }, 3000);
}

// 武器精炼函数
function refineWeapon(draggedCard, targetCard) {
    // 获取目标武器的当前精炼等级
    let currentRefine = parseInt(targetCard.dataset.refine) || 1;

    // 检查是否已达到最大精炼等级
    if (currentRefine >= 5) {
        // 显示已达到最大精炼等级的提示
        showMaxRefineBubble(targetCard);
        return;
    }

    // 计算精炼后的等级
    const nextRefine = currentRefine + 1;

    // 获取当前武器属性
    let currentAttack = parseInt(targetCard.dataset.attack) || getDamageByRarity(targetCard.dataset.rarity);
    let currentCritRate = parseFloat(targetCard.dataset.critRate) || 0;

    // 计算精炼后的属性（每次精炼提升8%的攻击力，暴击率提升1%）
    const nextAttack = Math.floor(currentAttack * 1.08);
    const nextCritRate = parseFloat((currentCritRate + 1).toFixed(1));

    // 更新目标武器的属性
    targetCard.dataset.refine = nextRefine;
    targetCard.dataset.attack = nextAttack;
    if (currentCritRate > 0) {
        targetCard.dataset.critRate = nextCritRate;
    }

    // 更新武器的显示信息
    updateWeaponDisplay(targetCard);

    // 显示精炼成功的气泡
    showRefineBubble(targetCard, nextRefine, nextAttack, nextCritRate);

    // 移除被拖拽的武器（作为精炼材料）
    if (draggedCard.parentNode) {
        draggedCard.remove();
    }
}

// 更新武器的显示信息
function updateWeaponDisplay(card) {
    const refine = card.dataset.refine || 1;
    const attack = card.dataset.attack || getDamageByRarity(card.dataset.rarity);
    const critRate = card.dataset.critRate;
    const elementalMastery = card.dataset.elementalMastery;
    const energyRecharge = card.dataset.energyRecharge;
    const attackPercent = card.dataset.attackPercent;
    const defensePercent = card.dataset.defensePercent;
    const weaponName = card.dataset.name;

    // 获取card-front元素
    const cardFront = card.querySelector('.card-front');

    // 检查是否已经有属性显示元素
    let statsElement = cardFront.querySelector('.weapon-stats');
    if (!statsElement) {
        // 创建新的属性显示元素
        statsElement = document.createElement('div');
        statsElement.className = 'weapon-stats';
        cardFront.appendChild(statsElement);
    }

    // 更新属性信息
    if (weaponName === '白缨枪' && critRate) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 暴击率: ${critRate}%`;
    } else if (weaponName === '鸦羽弓' && elementalMastery) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 元素精通: ${elementalMastery}`;
    } else if (weaponName === '祭礼大剑' && energyRecharge) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 充能效率: ${energyRecharge}%`;
    } else if (weaponName === '千岩长枪' && attackPercent) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 攻击力: ${attackPercent}%`;
    } else if (weaponName === '白铁大剑' && defensePercent) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 防御力: ${defensePercent}%`;
    } else if (weaponName === '魔导绪论' && elementalMastery) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 元素精通: ${elementalMastery}`;
    } else if (weaponName === '祭礼弓' && energyRecharge) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 充能效率: ${energyRecharge}%`;
    } else if (weaponName === '旅行剑' && defensePercent) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 防御力: ${defensePercent}%`;
    } else if (weaponName === '祭礼剑' && energyRecharge) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 充能效率: ${energyRecharge}%`;
    } else if (weaponName === '祭礼残章' && elementalMastery) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 元素精通: ${elementalMastery}`;
    } else if (weaponName === '狼的末路' && attackPercent) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 攻击力: ${attackPercent}%`;
    } else if (weaponName === '天空之脊' && energyRecharge) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 充能效率: ${energyRecharge}%`;
    } else if (weaponName === '天空之翼' && critRate) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 暴击率: ${critRate}%`;
    } else if (weaponName === '天空之卷' && attackPercent) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 攻击力: ${attackPercent}%`;
    } else if (weaponName === '薙草之稻光' && energyRecharge) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 充能效率: ${energyRecharge}%`;
    } else if (weaponName === '千夜浮梦' && elementalMastery) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 元素精通: ${elementalMastery}`;
    } else if (weaponName === '阿莫斯之弓' && attackPercent) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 攻击力: ${attackPercent}%`;
    } else if (critRate) {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack} | 暴击率: ${critRate}%`;
    } else {
        statsElement.textContent = `精炼 ${refine}/5 | 攻击: ${attack}`;
    }
}

// 显示精炼成功的气泡
function showRefineBubble(card, refine, attack, critRate) {
    // 清理已存在的气泡
    if (dragBubble) {
        if (dragBubble.parentNode) {
            dragBubble.remove();
        }
        dragBubble = null;
    }

    // 获取卡牌位置和尺寸
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;

    // 计算气泡位置（卡牌头顶居中）
    const bubbleLeft = rect.left + cardWidth / 2 - 40;
    const bubbleTop = rect.top - 40;

    // 创建新气泡
    dragBubble = document.createElement('div');
    dragBubble.style.position = 'fixed';
    dragBubble.style.left = `${bubbleLeft}px`;
    dragBubble.style.top = `${bubbleTop}px`;
    dragBubble.style.zIndex = '1000';
    dragBubble.style.pointerEvents = 'none';
    dragBubble.style.fontSize = '14px';
    dragBubble.style.color = '#4CAF50'; // 绿色文本
    dragBubble.style.textShadow = '0 0 0 2px #000000, 0 1px 2px rgba(0,0,0,0.5)';
    dragBubble.style.animation = 'fadeIn 0.3s ease-in-out';
    dragBubble.textContent = `精炼到 ${refine}/5!`;

    document.body.appendChild(dragBubble);

    // 3秒后自动移除气泡
    setTimeout(() => {
        if (dragBubble && dragBubble.parentNode) {
            dragBubble.remove();
            dragBubble = null;
        }
    }, 3000);
}

// 显示已达到最大精炼等级的气泡
function showMaxRefineBubble(card) {
    // 清理已存在的气泡
    if (dragBubble) {
        if (dragBubble.parentNode) {
            dragBubble.remove();
        }
        dragBubble = null;
    }

    // 获取卡牌位置和尺寸
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;

    // 计算气泡位置（卡牌头顶居中）
    const bubbleLeft = rect.left + cardWidth / 2 - 50;
    const bubbleTop = rect.top - 40;

    // 创建新气泡
    dragBubble = document.createElement('div');
    dragBubble.style.position = 'fixed';
    dragBubble.style.left = `${bubbleLeft}px`;
    dragBubble.style.top = `${bubbleTop}px`;
    dragBubble.style.zIndex = '1000';
    dragBubble.style.pointerEvents = 'none';
    dragBubble.style.fontSize = '14px';
    dragBubble.style.color = '#ff6666'; // 红色文本
    dragBubble.style.textShadow = '0 0 0 2px #000000, 0 1px 2px rgba(0,0,0,0.5)';
    dragBubble.style.animation = 'fadeIn 0.3s ease-in-out';
    dragBubble.textContent = '已达到最大精炼等级!';

    document.body.appendChild(dragBubble);

    // 3秒后自动移除气泡
    setTimeout(() => {
        if (dragBubble && dragBubble.parentNode) {
            dragBubble.remove();
            dragBubble = null;
        }
    }, 3000);
}

function initCardDragAndDrop() {
    // 处理所有卡片（包括武器）
    const cards = document.querySelectorAll('.card');

    // 移除之前的全局事件监听器，避免累积
    if (globalMouseMoveListener) {
        document.removeEventListener('mousemove', globalMouseMoveListener);
        globalMouseMoveListener = null;
    }
    if (globalMouseUpListener) {
        document.removeEventListener('mouseup', globalMouseUpListener);
        globalMouseUpListener = null;
    }

    cards.forEach(card => {
        // 移除之前的事件监听器（如果有）
        card.ondragstart = null;
        card.ondragover = null;
        card.ondrop = null;
        card.draggable = false; // 禁用原生拖拽

        // 鼠标按下开始拖拽
        card.addEventListener('mousedown', function(e) {
            if (this.classList.contains('dead')) return;
            if (!this.classList.contains('active')) return; // 卡片未激活（在背面）时不能拖拽

            // 如果已经有拖拽中的卡片，先清理
            if (dragPreview) {
                if (dragPreview.parentNode) {
                    dragPreview.remove();
                }
                dragPreview = null;
                window.dragPreview = null;
            }
            if (draggedCard) {
                draggedCard.style.opacity = '1';
                draggedCard = null;
                window.draggedCard = null;
            }
            if (dragBubble) {
                if (dragBubble.parentNode) {
                    dragBubble.remove();
                }
                dragBubble = null;
                window.dragBubble = null;
            }

            draggedCard = this;
            window.draggedCard = this; // 同步到全局变量

            // 显示秘典之盒的检测范围
            const secretBox = document.getElementById('secretBox');
            if (secretBox && window.getComputedStyle(secretBox).display !== 'none') {
                secretBox.classList.add('show-range');
            }

            // 计算鼠标在卡片内的偏移
            const rect = card.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;

            // 创建拖拽预览
            dragPreview = card.cloneNode(true);
            window.dragPreview = dragPreview; // 同步到全局变量
            dragPreview.style.position = 'fixed';
            dragPreview.style.left = `${e.clientX - dragOffset.x}px`;
            dragPreview.style.top = `${e.clientY - dragOffset.y}px`;
            dragPreview.style.zIndex = '999'; // 降低z-index，避免遮挡按钮
            dragPreview.style.pointerEvents = 'none';
            dragPreview.style.opacity = '1';

            document.body.appendChild(dragPreview);

            // 只有单抽的卡片才显示气泡
            if (this.dataset.single === 'true') {
                createDragBubble(this);
            }

            // 降低原始卡片的透明度，显示正在拖拽
            card.style.opacity = '0.3';
        });
    });

    // 全局鼠标移动事件
    globalMouseMoveListener = function(e) {
        if (draggedCard && dragPreview) {
            // 限制拖拽范围，避免遮挡按钮
            const cardBox = document.querySelector('.card-box');
            if (cardBox) {
                const cardBoxRect = cardBox.getBoundingClientRect();
                const cardWidth = dragPreview.offsetWidth;
                const cardHeight = dragPreview.offsetHeight;

                // 计算限制后的位置
                let newLeft = e.clientX - dragOffset.x;
                let newTop = e.clientY - dragOffset.y;

                // 确保拖拽预览不会超出卡片区域太多
                newLeft = Math.max(cardBoxRect.left - cardWidth / 2, Math.min(newLeft, cardBoxRect.right - cardWidth / 2));
                newTop = Math.max(cardBoxRect.top - cardHeight / 2, Math.min(newTop, cardBoxRect.bottom - cardHeight / 2));

                // 更新拖拽预览的位置
                dragPreview.style.left = `${newLeft}px`;
                dragPreview.style.top = `${newTop}px`;

                // 更新气泡位置，使其固定在卡片头顶
                if (dragBubble && draggedCard.dataset.single === 'true') {
                    const bubbleLeft = newLeft + cardWidth / 2 - 10; // 水平居中
                    const bubbleTop = newTop - 30; // 卡片上方
                    dragBubble.style.left = `${bubbleLeft}px`;
                    dragBubble.style.top = `${bubbleTop}px`;
                }
            }
        }
    };
    document.addEventListener('mousemove', globalMouseMoveListener);

    // 全局鼠标释放事件
    globalMouseUpListener = function(e) {
        if (draggedCard && dragPreview) {
            // 清理拖拽状态
            if (dragPreview.parentNode) {
                dragPreview.remove();
            }
            if (draggedCard) {
                draggedCard.style.opacity = '1';
            }
            // 清理气泡
            if (dragBubble) {
                if (dragBubble.parentNode) {
                    dragBubble.remove();
                }
                dragBubble = null;
                window.dragBubble = null; // 清理全局引用
            }

            // 找到鼠标释放位置下的卡片（包括子元素的情况）
            let targetElement = document.elementFromPoint(e.clientX, e.clientY);
            let targetCard = null;
            let weaponSlot = null;

            // 首先检查是否释放到了武器槽上
            let tempElement = targetElement;
            while (tempElement) {
                if (tempElement.classList && tempElement.classList.contains('weapon-slot')) {
                    weaponSlot = tempElement;
                    break;
                }
                tempElement = tempElement.parentElement;
            }

            // 如果释放到了武器槽上，并且拖拽的是武器卡片
            if (weaponSlot && draggedCard.dataset.type === '武器') {
                // 找到武器槽所属的角色卡片
                let characterCard = weaponSlot.parentElement.parentElement;

                const weaponData = {
                    name: draggedCard.dataset.name,
                    attack: parseInt(draggedCard.dataset.attack) || 0,
                    rarity: draggedCard.dataset.rarity,
                    path: draggedCard.dataset.path || ''
                };

                // 调用装备函数
                if (typeof window.equipWeaponToSlot === 'function') {
                    const equipSuccess = window.equipWeaponToSlot(characterCard, weaponSlot, weaponData, draggedCard);

                    if (equipSuccess) {
                        // 装备成功，隐藏武器卡片
                        draggedCard.style.display = 'none';
                    }
                }

                // 清理拖拽状态
                draggedCard = null;
                window.draggedCard = null;
                dragPreview = null;
                window.dragPreview = null;
                return;
            }

            // 向上查找，找到最近的卡片元素
            tempElement = targetElement;
            while (tempElement) {
                if (tempElement.classList && tempElement.classList.contains('card')) {
                    targetCard = tempElement;
                    break;
                }
                tempElement = tempElement.parentElement;
            }

            // 检查是否释放到了卡片上
            if (targetCard && !targetCard.classList.contains('dead') && !draggedCard.classList.contains('dead')) {
                // 检查是否攻击自己
                if (targetCard === draggedCard) {
                    // 显示???气泡
                    showConfusedBubble(draggedCard);
                    return;
                }

                // 检查是否是白缨枪升级操作
                if (draggedCard.dataset.weaponName === '白缨枪' && targetCard.dataset.weaponName === '白缨枪') {
                    // 执行白缨枪升级
                    upgradeWhiteTassel(draggedCard, targetCard);
                    return;
                }

                // 检查是否是相同名字的角色或魔物卡牌升级操作
                const draggedName = draggedCard.dataset.name;
                const targetName = targetCard.dataset.name;
                const draggedType = draggedCard.dataset.type;
                const targetType = targetCard.dataset.type;

                if (draggedName && targetName && draggedName === targetName && draggedType === targetType) {
                    if (draggedType === '角色' || draggedType === '魔物') {
                        // 执行角色或魔物卡牌升级
                        upgradeCard(draggedCard, targetCard);
                        return;
                    } else if (draggedType === '武器') {
                        // 执行武器精炼
                        refineWeapon(draggedCard, targetCard);
                        return;
                    }
                }

                // 获取攻击者和目标的卡片类型
                const attackerType = draggedCard.dataset.type;

                // 检查攻击规则：武器牌只能攻击魔物牌
                if (attackerType === '武器' && targetType !== '魔物') {
                    // 武器牌不能攻击非魔物牌，直接返回
                    return;
                }

                // 计算伤害
                let attackerDamage = parseInt(draggedCard.dataset.attack) || getDamageByRarity(draggedCard.dataset.rarity);
                let defenderDamage = parseInt(targetCard.dataset.attack) || getDamageByRarity(targetCard.dataset.rarity);

                // 检查超导状态：物理抗性降低40%，增加物理伤害
                // 检查目标是否处于超导状态
                if (targetCard.dataset.superconduct === 'true') {
                    const expiryTime = parseInt(targetCard.dataset.superconductExpiry);
                    if (Date.now() < expiryTime) {
                        // 超导状态生效，物理伤害增加约27.8%
                        attackerDamage = Math.round(attackerDamage * 1.278);
                    } else {
                        // 超导状态已过期，清除状态
                        delete targetCard.dataset.superconduct;
                        delete targetCard.dataset.superconductExpiry;
                    }
                }

                // 检查攻击者是否处于超导状态
                if (draggedCard.dataset.superconduct === 'true') {
                    const expiryTime = parseInt(draggedCard.dataset.superconductExpiry);
                    if (Date.now() < expiryTime) {
                        // 超导状态生效，物理伤害增加约27.8%
                        defenderDamage = Math.round(defenderDamage * 1.278);
                    } else {
                        // 超导状态已过期，清除状态
                        delete draggedCard.dataset.superconduct;
                        delete draggedCard.dataset.superconductExpiry;
                    }
                }

                // 调整伤害计算：武器牌攻击时伤害不变，被攻击时受到的伤害增加
                // 使用之前已经声明的变量，不再重复声明

                if (targetType === '武器') {
                    // 攻击武器牌时，增加伤害（因为武器牌耐久度高）
                    attackerDamage *= 10;
                }

                // 弓箭武器弱点系统
                if (attackerType === '武器' && targetType === '魔物') {
                    const weaponName = draggedCard.dataset.name;
                    const monsterName = targetCard.dataset.name;

                    // 识别弓箭类型武器
                    const isBowWeapon = weaponName.includes('弓') || weaponName.includes('箭');

                    // 识别容易受到弓箭攻击的魔物
                    const isWeakToBow = (
                        // 飞行单位
                        monsterName.includes('翼行') ||
                        monsterName.includes('空巡') ||
                        monsterName.includes('猎者') || // 遗迹猎者是飞行单位
                        // 其他特定魔物
                        monsterName.includes('爆破') || // 爆破丘丘人
                        monsterName.includes('射手') || // 射手类丘丘人
                        monsterName.includes('萨满')     // 丘丘萨满
                    );

                    // 弓箭武器对弱点魔物造成额外伤害
                    if (isBowWeapon && isWeakToBow) {
                        attackerDamage *= 1.5; // 弓箭对弱点魔物造成1.5倍伤害
                    }
                }

                // 检查元素属性
                const attackerName = draggedCard.dataset.name;
                const isFireAttacker = attackerName.includes('火') || attackerName.includes('可莉') || attackerName.includes('宵宫') || attackerName.includes('迪卢克') || attackerName.includes('胡桃') || attackerName.includes('香菱') || attackerName.includes('班尼特') || attackerName.includes('安柏')|| attackerName.includes('愚人众·债务处理人') || attackerName.includes('攻坚特化型机关') ||attackerName.includes('海乱鬼·炎威')|| attackerName.includes('野伏·火付番') ||attackerName.includes('火斧丘丘暴徒')||attackerName.includes('冲锋丘丘人')|| attackerName.includes('炽热骗骗花');
                const isWaterAttacker = attackerName.includes('水') || attackerName.includes('珊瑚宫心海') || attackerName.includes('神里绫人') || attackerName.includes('达达利亚') || attackerName.includes('芭芭拉')|| attackerName.includes('行秋') || attackerName.includes('莫娜') ||attackerName.includes('水史莱姆')||attackerName.includes('大型水史莱姆')||attackerName.includes('水深渊法师')||attackerName.includes('丘丘水萨满')||attackerName.includes('陆行水本真蕈')||attackerName.includes('愚人众先遣队·水铳重卫士')|| attackerName.includes('愚人众·藏镜仕女')|| attackerName.includes('歼灭特化型机关')  || attackerName.includes('圣骸角鳄') || attackerName.includes('纯水精灵·洛蒂娅') || attackerName.includes('水形幻人');
                const isWindAttacker = attackerName.includes('风') || attackerName.includes('温迪') || attackerName.includes('魈') || attackerName.includes('琴') ||attackerName.includes('砂糖')|| attackerName.includes('魔偶剑鬼') || attackerName.includes('风拳前锋军')||attackerName.includes('丘丘风萨满');
                const isThunderAttacker = attackerName.includes('雷') || attackerName.includes('雷电将军') || attackerName.includes('八重神子') || attackerName.includes('刻晴') || attackerName.includes('达达利亚') || attackerName.includes('菲谢尔') ||attackerName.includes('九条裟罗')|| attackerName.includes('北斗')||attackerName.includes('雷泽')|| attackerName.includes('歼灭特化型机关') ||attackerName.includes('海乱鬼·雷腾')|| attackerName.includes('野伏·机巧番')||attackerName.includes('嗜雷·兽境猎犬')||attackerName.includes('雷深渊法师')||attackerName.includes('雷斧丘丘暴徒')||attackerName.includes('丘丘雷萨满')||attackerName.includes('雷弹丘丘人');
                const isGrassAttacker = attackerName.includes('草') || attackerName.includes('纳西妲') || attackerName.includes('提纳里') ||attackerName.includes('柯莱')|| attackerName.includes('翠翎恐蕈') || attackerName.includes('贪食匿叶龙山王') || attackerName.includes('攻坚特化型机关') ||attackerName.includes('丘丘草萨满');
                const isIceAttacker = attackerName.includes('冰') || attackerName.includes('甘雨') || attackerName.includes('神里凌华') || attackerName.includes('申鹤') || attackerName.includes('优菈') ||attackerName.includes('迪奥娜')||attackerName.includes('重云')||attackerName.includes('凯亚')|| attackerName.includes('魔偶剑鬼') || attackerName.includes('迪奥娜') || attackerName.includes('凯亚')||attackerName.includes('愚人众先遣队·冰铳重卫士')||attackerName.includes('冰盾丘丘暴徒')||attackerName.includes('有翼冰本真蕈')||attackerName.includes('冰深渊法师')||attackerName.includes('冰箭丘丘人')||attackerName.includes('冰史莱姆')||attackerName.includes('大型冰史莱姆')||attackerName.includes('丝柯克')||attackerName.includes('爱可菲');
                const isRockAttacker = attackerName.includes('岩') || attackerName.includes('钟离') ||attackerName.includes('凝光')||attackerName.includes('诺艾尔')||attackerName.includes('丘丘岩萨满')||attackerName.includes('岩盾丘丘暴徒')||attackerName.includes('陆行岩本真蕈')||attackerName.includes('嗜岩·兽境猎犬')|| attackerName.includes('黑蛇骑士·摧岩之钺');

                // 目标元素属性判定
                const isFireTarget = targetName.includes('火') || targetName.includes('可莉') || targetName.includes('宵宫') || targetName.includes('迪卢克') || targetName.includes('胡桃') || targetName.includes('香菱') || targetName.includes('班尼特') || targetName.includes('安柏')|| targetName.includes('愚人众·债务处理人') || targetName.includes('攻坚特化型机关') ||targetName.includes('海乱鬼·炎威')|| targetName.includes('野伏·火付番') ||targetName.includes('火斧丘丘暴徒')||targetName.includes('冲锋丘丘人')|| targetName.includes('炽热骗骗花');
                const isWaterTarget = targetName.includes('水') || targetName.includes('珊瑚宫心海') || targetName.includes('神里绫人') || targetName.includes('达达利亚') || targetName.includes('芭芭拉')|| targetName.includes('行秋') ||targetName.includes('水史莱姆')||targetName.includes('大型水史莱姆')||targetName.includes('水深渊法师')||targetName.includes('丘丘水萨满')||targetName.includes('陆行水本真蕈')||targetName.includes('愚人众先遣队·水铳重卫士')|| targetName.includes('愚人众·藏镜仕女')|| targetName.includes('歼灭特化型机关')  || targetName.includes('圣骸角鳄') || targetName.includes('纯水精灵·洛蒂娅') || targetName.includes('水形幻人');
                const isWindTarget = targetName.includes('风') || targetName.includes('温迪') || targetName.includes('魈') || targetName.includes('琴') ||targetName.includes('砂糖')|| targetName.includes('魔偶剑鬼') || targetName.includes('风拳前锋军')||targetName.includes('丘丘风萨满');
                const isThunderTarget = targetName.includes('雷') || targetName.includes('雷电将军') || targetName.includes('八重神子') || targetName.includes('刻晴') || targetName.includes('达达利亚') || targetName.includes('菲谢尔') ||targetName.includes('九条裟罗')|| targetName.includes('北斗')||targetName.includes('雷泽')|| targetName.includes('歼灭特化型机关') ||targetName.includes('海乱鬼·雷腾')|| targetName.includes('野伏·机巧番')||targetName.includes('嗜雷·兽境猎犬')||targetName.includes('雷深渊法师')||targetName.includes('雷斧丘丘暴徒')||targetName.includes('丘丘雷萨满')||targetName.includes('雷弹丘丘人');
                const isGrassTarget = targetName.includes('草') || targetName.includes('纳西妲') || targetName.includes('提纳里') ||targetName.includes('柯莱')|| targetName.includes('翠翎恐蕈') || targetName.includes('贪食匿叶龙山王') || targetName.includes('攻坚特化型机关') ||targetName.includes('丘丘草萨满');
                const isIceTarget = targetName.includes('冰') || targetName.includes('甘雨') || targetName.includes('神里凌华') || targetName.includes('申鹤') || targetName.includes('优菈') ||targetName.includes('迪奥娜')||targetName.includes('重云')||targetName.includes('凯亚')|| targetName.includes('魔偶剑鬼') || targetName.includes('迪奥娜') || targetName.includes('凯亚')||targetName.includes('愚人众先遣队·冰铳重卫士')||targetName.includes('冰盾丘丘暴徒')||targetName.includes('有翼冰本真蕈')||targetName.includes('冰深渊法师')||targetName.includes('冰箭丘丘人')||targetName.includes('冰史莱姆')||targetName.includes('大型冰史莱姆')||targetName.includes('丝柯克')||targetName.includes('爱可菲');
                const isRockTarget = targetName.includes('岩') || targetName.includes('钟离') ||targetName.includes('凝光')||targetName.includes('诺艾尔')||targetName.includes('丘丘岩萨满')||targetName.includes('岩盾丘丘暴徒')||targetName.includes('陆行岩本真蕈')||targetName.includes('嗜岩·兽境猎犬')|| targetName.includes('黑蛇骑士·摧岩之钺');

                // 深渊法师护盾系统
                let finalDefenderDamage = attackerDamage;
                if (targetType === '魔物' && targetCard.dataset.shield) {
                    let shield = parseInt(targetCard.dataset.shield);
                    const maxShield = parseInt(targetCard.dataset.maxShield);
                    const monsterName = targetCard.dataset.name;

                    // 计算护盾伤害
                    let shieldDamage = attackerDamage;
                    const isWaterMage = monsterName.includes('水');
                    const isFireMage = monsterName.includes('火');
                    const isIceMage = monsterName.includes('冰');
                    const isThunderMage = monsterName.includes('雷');

                    // 检查元素克制（原神护盾克制机制）
                    let isElementalWeakness = false;
                    let shieldBreakMultiplier = 1; // 护盾破坏倍率

                    // 获取护盾元素类型
                    const shieldElement = targetCard.dataset.shieldElement || '';

                    // 检查攻击者是否使用大剑
                    const isClaymoreWeapon = attackerName.includes('大剑') || attackerName.includes('双手剑') || attackerName.includes('优菈') || attackerName.includes('迪卢克') || attackerName.includes('黑蛇骑士·摧岩之钺') || attackerName.includes('诺艾尔') || attackerName.includes('北斗') || attackerName.includes('重云') || attackerName.includes('雷泽') || attackerName.includes('荒泷一斗');

                    // 原神护盾克制关系（正确版本）：
                    // 水克火：水元素攻击火盾（2.5倍）
                    // 雷克水：雷元素攻击水盾（2.5倍）
                    // 冰克雷：冰元素攻击雷盾（2.5倍）
                    // 火克冰：火元素攻击冰盾（2.5倍）
                    // 火克草：火元素攻击草盾（2.5倍）
                    // 草克水：草元素攻击水盾（2.5倍，消耗比率1:2）
                    // 冰克水：冰元素攻击水盾（2.5倍，冻结反应）
                    // 火克风：火元素攻击风盾（2.5倍）
                    // 岩盾：被岩、大剑克制（1.5倍）
                    // 风元素：可以破除除了岩盾和草盾之外的所有元素盾（2.5倍）
                    // 注意：草元素攻击火盾只会消耗草元素，无法破盾（因为盾本身是火）
                    // 注意：水元素攻击冰盾只会消耗水元素，无法破盾（因为盾本身是冰）

                    if (shieldElement === '火' && isWaterAttacker) {
                        // 水克火
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;
                    } else if (shieldElement === '水' && isThunderAttacker) {
                        // 雷克水
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;
                    } else if (shieldElement === '水' && isIceAttacker) {
                        // 冰克水（冻结反应）
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;
                    } else if (shieldElement === '水' && isGrassAttacker) {
                        // 草克水（消耗比率1:2）
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;
                    } else if (shieldElement === '雷' && isIceAttacker) {
                        // 冰克雷
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;
                    } else if (shieldElement === '冰' && (isFireAttacker || isClaymoreWeapon)) {
                        // 火克冰或大剑破冰
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;
                    } else if (shieldElement === '草' && isFireAttacker) {
                        // 火克草
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;
                    } else if (shieldElement === '风' && isFireAttacker) {
                        // 火克风
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;
                    } else if (shieldElement === '岩' && (isRockAttacker || isClaymoreWeapon)) {
                        // 岩克岩或大剑破岩
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 1.5;
                    }
                    // 风元素特殊机制：可以破除除了岩盾和草盾之外的所有元素盾
                    else if (isWindAttacker && shieldElement !== '岩' && shieldElement !== '草' && shieldElement !== '木') {
                        isElementalWeakness = true;
                        shieldBreakMultiplier = 2.5;

                        // 检查场上是否有其他不同元素的护盾魔物（扩散加成）
                        const allCards = getAllCards();
                        const otherShieldElements = new Set();
                        allCards.forEach(otherCard => {
                            if (otherCard !== targetCard && otherCard.dataset.shield && parseInt(otherCard.dataset.shield) > 0) {
                                const otherElement = otherCard.dataset.shieldElement;
                                if (otherElement && otherElement !== shieldElement && otherElement !== '岩' && otherElement !== '草' && otherElement !== '木') {
                                    otherShieldElements.add(otherElement);
                                }
                            }
                        });

                        // 如果场上有其他不同元素的护盾，扩散加成（每多一种元素+0.5倍）
                        if (otherShieldElements.size > 0) {
                            shieldBreakMultiplier += otherShieldElements.size * 0.5;
                        }
                    }

                    // 兼容旧的判断方式（针对没有shieldElement的魔物）
                    if (!shieldElement) {
                        if (isWaterMage && isThunderAttacker) {
                            // 雷克水
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        } else if (isWaterMage && isIceAttacker) {
                            // 冰克水
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        } else if (isWaterMage && isGrassAttacker) {
                            // 草克水
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        } else if (isFireMage && isWaterAttacker) {
                            // 水克火
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        } else if (isIceMage && (isFireAttacker || isClaymoreWeapon)) {
                            // 火克冰或大剑破冰
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        } else if (isThunderMage && isIceAttacker) {
                            // 冰克雷
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        } else if (monsterName.includes('火盾') && monsterName.includes('炽热骗骗花') && isWaterAttacker) {
                            // 水克火
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        } else if (monsterName.includes('木盾') && isFireAttacker) {
                            // 火克草
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        } else if (monsterName.includes('岩盾') && (isRockAttacker || isClaymoreWeapon)) {
                            // 岩克岩或大剑破岩
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 1.5;
                        } else if (monsterName.includes('冰盾') && (isFireAttacker || isClaymoreWeapon)) {
                            // 火克冰或大剑破冰
                            isElementalWeakness = true;
                            shieldBreakMultiplier = 2.5;
                        }
                    }

                    // 元素克制造成高额护盾伤害
                    if (isElementalWeakness) {
                        // 使用克制倍率计算护盾伤害
                        shieldDamage = Math.round(maxShield * shieldBreakMultiplier / 10); // 调整为合理的破盾速度
                        // 确保至少能造成一定伤害
                        if (shieldDamage < maxShield * 0.3) {
                            shieldDamage = Math.round(maxShield * 0.3);
                        }
                    } else {
                        // 非克制元素只能打一点护盾值
                        shieldDamage = 1;
                    }

                    // 更新护盾值
                    shield -= shieldDamage;
                    if (shield < 0) shield = 0;
                    targetCard.dataset.shield = shield;

                    // 更新护盾条
                    updateShieldBar(targetCard);

                    // 只有当护盾被击破后，才对生命值造成伤害
                    if (shield === 0) {
                        // 护盾已击破，造成生命值伤害
                        finalDefenderDamage = attackerDamage;
                        // 删除护盾属性，避免后续攻击继续进入护盾判断
                        delete targetCard.dataset.shield;
                        delete targetCard.dataset.maxShield;
                        delete targetCard.dataset.shieldElement;
                        // 移除护盾条显示
                        const shieldBarContainer = targetCard.querySelector('.shield-bar-container');
                        if (shieldBarContainer) {
                            shieldBarContainer.remove();
                        }
                    } else {
                        // 护盾未击破，只显示护盾伤害
                        finalDefenderDamage = 0;
                        showDamageNumber(targetCard, shieldDamage);
                    }
                }

                // 检查燃烧反应
                if ((isFireAttacker && isGrassTarget) || (isGrassAttacker && isFireTarget)) {
                    // 检查目标是否是深渊法师类魔物，并且护盾是否被击破
                    const isAbyssMage = targetName.includes('深渊法师');
                    const hasShield = targetCard.dataset.shield && parseInt(targetCard.dataset.shield) > 0;

                    // 只有当目标不是深渊法师，或者是深渊法师但护盾已被击破时，才触发燃烧伤害
                    if (!isAbyssMage || !hasShield) {
                        // 显示燃烧反应文字
                        showReactionText(targetCard, '燃烧');

                        // 显示元素图标
                        showElementIcon(targetCard, '火');
                        showElementIcon(targetCard, '草');

                        // 计算燃烧伤害（90级角色基础值）
                        const burnBaseCoefficient = 0.25;
                        const levelCoefficient = 867; // 90级时的等级系数
                        const burnDamage = Math.round(burnBaseCoefficient * levelCoefficient); // 约217点伤害

                        // 触发燃烧反应，显示燃烧伤害
                        showDamageNumber(targetCard, burnDamage);

                        // 更新目标生命值
                        const defenderHealth = parseInt(targetCard.dataset.health) - burnDamage;
                        targetCard.dataset.health = Math.max(0, defenderHealth);
                        updateHealthBar(targetCard);
                        checkCardDeath(targetCard);
                    }
                }

                // 检查绽放反应
                // 原绽放：草+水生成草原核
                if ((isWaterAttacker && isGrassTarget) ||
                    (isGrassAttacker && isWaterTarget)) {
                    // 生成草原核
                    createDendroCore(targetCard, attackerName);
                }

                // 激化反应系统
                // 原激化：雷+草（不分先后）
                if ((isThunderAttacker && isGrassTarget) || (isGrassAttacker && isThunderTarget)) {
                    // 检查目标是否已经处于激化状态
                    if (targetCard.dataset.quickened !== 'true') {
                        // 触发原激化，给目标添加激化状态
                        triggerQuickenReaction(draggedCard, targetCard);
                    } else {
                        // 目标已经处于激化状态
                        if (isThunderAttacker) {
                            // 雷元素触发激化状态 → 超激化
                            triggerAggravateReaction(draggedCard, targetCard);
                        } else if (isGrassAttacker) {
                            // 草元素触发激化状态 → 蔓激化
                            triggerSpreadReaction(draggedCard, targetCard);
                        }
                    }
                }

                // 烈绽放：火元素触发草原核
                if (isFireAttacker) {
                    triggerBurgeon(targetCard, attackerName);
                }

                // 超绽放：雷元素触发草原核
                if (isThunderAttacker) {
                    triggerHyperbloom(targetCard, attackerName);
                }

                // 超导反应：冰+雷
                if ((isIceAttacker && isThunderAttacker) || (isIceAttacker && isThunderTarget) || (isThunderAttacker && isIceTarget)) {
                    triggerSuperconductReaction(draggedCard, targetCard);
                }

                // 扩散反应：风元素攻击触发
                if (isWindAttacker) {
                    triggerSwirlReaction(draggedCard, targetCard);
                }

                // 结晶反应：岩元素攻击触发
                if (isRockAttacker) {
                    triggerCrystallizeReaction(draggedCard, targetCard);
                }

                // 蒸发反应：水+火
                if (isWaterAttacker && isFireTarget) {
                    // 水触发火，倍率2.0
                    triggerVaporizeReaction(draggedCard, targetCard, true);
                } else if (isFireAttacker && isWaterTarget) {
                    // 火触发水，倍率1.5
                    triggerVaporizeReaction(draggedCard, targetCard, false);
                }

                // 融化反应：冰+火
                if (isIceAttacker && isFireTarget) {
                    // 冰触发火，倍率2.0
                    triggerMeltReaction(draggedCard, targetCard, true);
                } else if (isFireAttacker && isIceTarget) {
                    // 火触发冰，倍率1.5
                    triggerMeltReaction(draggedCard, targetCard, false);
                }

                // 超载反应：火+雷
                if ((isFireAttacker && isThunderAttacker) || (isFireAttacker && targetName.includes('雷')) || (isThunderAttacker && targetName.includes('火'))) {
                    triggerOverloadReaction(draggedCard, targetCard);
                }

                // 冻结反应：水+冰（双向反应）
                if ((isWaterAttacker && isIceTarget) || (isIceAttacker && isWaterTarget)) {
                    triggerFreezeReaction(draggedCard, targetCard);
                }

                // 感电反应：水+雷
                if ((isWaterAttacker && isThunderAttacker) || (isWaterAttacker && isThunderTarget) || (isThunderAttacker && isWaterTarget)) {
                    triggerElectroChargedReaction(draggedCard, targetCard);
                }

                // 同元素免疫检查 - 只有有护盾的目标才免疫同元素攻击
                let isSameElement = false;
                const targetHasShield = targetCard.dataset.shield && parseInt(targetCard.dataset.shield) > 0;

                // 只有目标有护盾时才检查同元素免疫
                if (targetHasShield) {
                    if (isFireAttacker && isFireTarget) isSameElement = true;
                    if (isWaterAttacker && isWaterTarget) isSameElement = true;
                    if (isThunderAttacker && targetName.includes('雷')) isSameElement = true;
                    if (isGrassAttacker && isGrassTarget) isSameElement = true;
                    if (isWindAttacker && targetName.includes('风')) isSameElement = true;
                    if (isIceAttacker && isIceTarget) isSameElement = true;
                }

                // 岩元素例外：岩元素可以击破岩元素护盾
                let isRockException = false;
                if (isRockAttacker && targetName.includes('岩')) {
                    isRockException = true;
                }

                // 双方互相造成伤害
                if (!isSameElement || isRockException) {
                    if (finalDefenderDamage > 0) {
                        showDamageNumber(targetCard, finalDefenderDamage);
                    }
                    showDamageNumber(draggedCard, defenderDamage);

                    // 更新生命值
                    let defenderHealth = parseInt(targetCard.dataset.health);
                    let attackerHealth = parseInt(draggedCard.dataset.health);

                    defenderHealth = Math.max(0, defenderHealth - finalDefenderDamage);
                    attackerHealth = Math.max(0, attackerHealth - defenderDamage);

                    targetCard.dataset.health = defenderHealth;
                    draggedCard.dataset.health = attackerHealth;

                    // 更新血条
                    updateHealthBar(targetCard);
                    updateHealthBar(draggedCard);

                    // 检查是否死亡
                    checkCardDeath(targetCard);
                    checkCardDeath(draggedCard);
                } else {
                    // 同元素免疫，显示免疫文字
                    showReactionText(targetCard, '免疫');
                }
            }

            // 隐藏秘典之盒的检测范围
            const secretBox = document.getElementById('secretBox');
            if (secretBox) {
                secretBox.classList.remove('show-range');
            }

            // 检查是否释放到秘典之盒附近
            if (secretBox && window.getComputedStyle(secretBox).display !== 'none') {
                const secretBoxRect = secretBox.getBoundingClientRect();
                const mouseX = e.clientX;
                const mouseY = e.clientY;

                // 计算秘典之盒的检测范围（扩大到周围150px）
                const detectionRange = 15;
                const expandedRect = {
                    left: secretBoxRect.left - detectionRange,
                    right: secretBoxRect.right + detectionRange,
                    top: secretBoxRect.top - detectionRange,
                    bottom: secretBoxRect.bottom + detectionRange
                };

                // 检查鼠标是否在扩大的范围内
                if (mouseX >= expandedRect.left && mouseX <= expandedRect.right &&
                    mouseY >= expandedRect.top && mouseY <= expandedRect.bottom) {
                    // 在秘典之盒附近释放，保护卡牌
                    if (draggedCard) {
                        protectCard(draggedCard);
                        // 清理拖拽状态
                        draggedCard = null;
                        window.draggedCard = null;
                        dragPreview = null;
                        window.dragPreview = null;
                        return; // 提前返回，不执行后续的战斗逻辑
                    }
                }
            }

            draggedCard = null;
            window.draggedCard = null; // 清理全局引用
            dragPreview = null;
            window.dragPreview = null; // 清理全局引用
        }
    };
    document.addEventListener('mouseup', globalMouseUpListener);
}

// 5. 抽卡函数
function gacha(count = 1) {
    currentWishItem.style.display = "none";
    cardBox.innerHTML = "";
    cardBox.style.display = "flex"; // 显示卡片容器

    // 重置本次抽卡获得的星尘和星辉数量
    earnedStarlight = 0;
    earnedStardust = 0;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            // 判断是否是10连抽的第10抽
            const isTenthWish = (count === 10 && i === 9);
            const result = createCard(isTenthWish);
            const newCard = result.card;

            // 标记是否是单抽的卡片
            if (count === 1) {
                newCard.dataset.single = 'true';
            }

            // 累计本次抽卡获得的星尘和星辉数量
            earnedStarlight += result.earnedStarlight;
            earnedStardust += result.earnedStardust;

            cardBox.appendChild(newCard);

            // 如果是角色卡片，创建武器装备槽
            if (newCard.dataset.type === '角色' && typeof window.createWeaponSlot === 'function') {
                window.createWeaponSlot(newCard);
            }

            soundManager.playSound("card");
            if (i === count - 1) {
                newCard.addEventListener('animationend', () => {
                    setTimeout(function () {
                        isGachaEnabled = true;
                        isInGachaResultView = true; // 标记进入抽卡结果界面
                        console.log('last-pity-count', pityCounter);

                        // 初始化卡牌拖拽功能
                        setTimeout(() => {
                            initCardDragAndDrop();
                        }, 500);

                        // 初始化武器装备功能
                        setTimeout(() => {
                            if (typeof window.initWeaponEquip === 'function') {
                                console.log('抽卡完成，初始化武器装备功能');
                                window.initWeaponEquip();
                            }
                        }, 600);

                        // 显示跳过按钮
                        setTimeout(() => {
                            skipBtn.classList.add('show');
                        }, 120);

                        // 更新本次抽卡获得的星尘和星辉数量
                        if (earnedStarlight > 0) {
                            addStarlight(earnedStarlight);
                        }
                        if (earnedStardust > 0) {
                            addStardust(earnedStardust);
                        }

                        // 不再自动显示资源，等待用户回到祈愿主界面时再显示
                    }, 0);
                });
            }

            // 根据稀有度播放特效音
            const rarity = newCard.dataset.rarity;
            setTimeout(() => {
                switch (rarity) {
                    case "ssr":
                        soundManager.playSound("ssrSound");
                        break;
                    case "sr":
                        soundManager.playSound("srSound");
                        break;
                    case "r":
                        soundManager.playSound("rSound");
                        break;
                }
            }, 200);

        }, i * 150);
    }
}

// 6. 绑定按钮函数
function bindButtonEvents() {
    if (singleBtn) {
        singleBtn.addEventListener("click", async () => {
            if (!isGachaEnabled) {
                return;
            }

            // 检查并处理纠缠之缘
            if (!await checkAndConsumeFate(1)) {
                return;
            }

            isGachaEnabled = false;
            if (soundManager) {
                soundManager.playSound("wishClick");
            }
            hideResources();
            gacha(1);
        });
    }

    if (tenBtn) {
        tenBtn.addEventListener("click", async () => {
            if (!isGachaEnabled) {
                return;
            }

            // 检查并处理纠缠之缘
            if (!await checkAndConsumeFate(10)) {
                return;
            }

            isGachaEnabled = false;
            if (soundManager) {
                soundManager.playSound("wishClick");
            }
            hideResources();
            gacha(10);
        });
    }
}

// 检查并消耗纠缠之缘（支持原石和创世结晶补充）
async function checkAndConsumeFate(count) {
    let currentFate = parseInt(fateCount.textContent) || 0;

    // 如果纠缠之缘足够，直接扣除
    if (currentFate >= count) {
        currentFate -= count;
        fateCount.textContent = currentFate;
        saveResourceData();
        return true;
    }

    // 纠缠之缘不足，计算缺少的数量
    const missingFate = count - currentFate;
    const requiredPrimogems = missingFate * 160;
    let currentPrimogems = parseInt(primogemCount.textContent) || 0;

    // 检查原石是否足够
    if (currentPrimogems >= requiredPrimogems) {
        const message = `纠缠之缘不足，需要使用原石兑换`;
        const details = `
            <div style="line-height: 2;">
                需要纠缠之缘：<span class="modal-highlight">${count}</span> 个<br>
                当前拥有：<span class="modal-highlight">${currentFate}</span> 个<br>
                缺少：<span class="modal-error">${missingFate}</span> 个<br>
                <br>
                将消耗 <span class="modal-highlight">${requiredPrimogems}</span> 原石兑换 <span class="modal-highlight">${missingFate}</span> 个纠缠之缘
            </div>
        `;

        const confirmed = await showCustomConfirm({
            title: '纠缠之缘不足',
            message: message,
            details: details
        });

        if (confirmed) {
            // 使用原石兑换纠缠之缘
            currentPrimogems -= requiredPrimogems;
            currentFate = count;

            primogemCount.textContent = currentPrimogems;
            fateCount.textContent = 0; // 全部消耗
            saveResourceData();
            return true;
        }
        return false;
    }

    // 原石不足，检查创世结晶
    const missingPrimogems = requiredPrimogems - currentPrimogems;
    const genesisCrystal = getGenesisCrystalCount();

    if (genesisCrystal >= missingPrimogems) {
        const message = `纠缠之缘和原石都不足，需要使用创世结晶`;
        const details = `
            <div style="line-height: 2;">
                需要纠缠之缘：<span class="modal-highlight">${count}</span> 个<br>
                当前拥有：<span class="modal-highlight">${currentFate}</span> 个<br>
                缺少：<span class="modal-error">${missingFate}</span> 个<br>
                <br>
                需要原石：<span class="modal-highlight">${requiredPrimogems}</span><br>
                缺少原石：<span class="modal-error">${missingPrimogems}</span><br>
                <br>
                将消耗 <span class="modal-highlight">${missingPrimogems}</span> 创世结晶兑换原石<br>
                然后使用 <span class="modal-highlight">${requiredPrimogems}</span> 原石兑换纠缠之缘
            </div>
        `;

        const confirmed = await showCustomConfirm({
            title: '资源不足',
            message: message,
            details: details
        });

        if (confirmed) {
            // 使用创世结晶兑换原石
            if (exchangeGenesisCrystalToPrimogem(missingPrimogems)) {
                // 更新原石数量
                currentPrimogems = parseInt(primogemCount.textContent) || 0;

                // 使用原石兑换纠缠之缘
                currentPrimogems -= requiredPrimogems;
                currentFate = count;

                primogemCount.textContent = currentPrimogems;
                fateCount.textContent = 0; // 全部消耗
                saveResourceData();
                return true;
            }
        }
        return false;
    }

    // 创世结晶也不足
    const totalMissing = missingPrimogems - genesisCrystal;
    const message = `资源不足，无法进行祈愿`;
    const details = `
        <div style="line-height: 2;">
            需要纠缠之缘：<span class="modal-highlight">${count}</span> 个<br>
            缺少：<span class="modal-error">${missingFate}</span> 个<br>
            <br>
            需要原石：<span class="modal-highlight">${requiredPrimogems}</span><br>
            缺少原石：<span class="modal-error">${missingPrimogems}</span><br>
            <br>
            还需要：<span class="modal-error">${totalMissing}</span> 创世结晶（或原石）<br>
            <br>
            <span style="color: #C4B5A0;">请前往商城购买创世结晶</span>
        </div>
    `;

    await showCustomAlert({
        title: '资源不足',
        message: message,
        details: details
    });

    return false;
}



// === 跳过功能 ===

// 存储当前是否正在跳过
let isSkipping = false;

// === 资源管理功能 ===

// 初始化资源显示
function updateResourceDisplay() {
    // 确保资源元素存在
    if (primogemCount && fateCount) {
        // 从localStorage读取保存的数据
        const savedPrimogems = localStorage.getItem('primogems');
        const savedFate = localStorage.getItem('fate');
        const savedStarlight = localStorage.getItem('starlight');
        const savedStardust = localStorage.getItem('stardust');

        if (savedPrimogems !== null) {
            primogemCount.textContent = savedPrimogems;
        }

        if (savedFate !== null) {
            fateCount.textContent = savedFate;
        }

        if (starlightCount && savedStarlight !== null) {
            starlightCount.textContent = savedStarlight;
        }

        if (stardustCount && savedStardust !== null) {
            stardustCount.textContent = savedStardust;
        }

        // 显示资源
        showResources();
    }
}

// 保存资源数据到localStorage
function saveResourceData() {
    if (primogemCount && fateCount) {
        localStorage.setItem('primogems', primogemCount.textContent);
        localStorage.setItem('fate', fateCount.textContent);

        if (starlightCount) {
            localStorage.setItem('starlight', starlightCount.textContent);
        }

        if (stardustCount) {
            localStorage.setItem('stardust', stardustCount.textContent);
        }
    }
}

// 隐藏资源显示
function hideResources() {
    if (resourcesTop) {
        resourcesTop.style.display = 'none';
    }
    if (resourcesBottom) {
        resourcesBottom.style.display = 'none';
    }
}

// 显示资源显示
function showResources() {
    if (resourcesTop) {
        resourcesTop.style.display = 'flex';
    }
    if (resourcesBottom) {
        resourcesBottom.style.display = 'flex';
    }
}

// 添加星辉
function addStarlight(amount) {
    if (starlightCount) {
        let currentStarlight = parseInt(starlightCount.textContent) || 0;
        currentStarlight += amount;
        starlightCount.textContent = currentStarlight;
        saveResourceData();
    }
}

// 添加星尘
function addStardust(amount) {
    if (stardustCount) {
        let currentStardust = parseInt(stardustCount.textContent) || 0;
        currentStardust += amount;
        stardustCount.textContent = currentStardust;
        saveResourceData();
    }
}

// 添加原石（使用创世结晶兑换 - 滑块式）
async function addPrimogems() {
    const genesisCrystal = getGenesisCrystalCount();
    const currentPrimogems = parseInt(primogemCount.textContent) || 0;

    if (genesisCrystal <= 0) {
        await showCustomAlert({
            title: '创世结晶不足',
            message: '创世结晶不足，无法兑换原石！<br><br>请前往商城购买创世结晶。'
        });
        return;
    }

    // 创建滑块兑换界面
    const modal = document.createElement('div');
    modal.className = 'slider-exchange-modal';

    let sliderValue = 0;

    modal.innerHTML = `
        <div class="slider-exchange-content">
            <div class="slider-exchange-header">
                <h3 class="slider-exchange-title">兑换原石</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="slider-exchange-body">
                <div class="slider-info">
                    兑换比例：<span class="modal-highlight">1 创世结晶 = 1 原石</span>
                </div>
                
                <div class="slider-resources-display">
                    <div class="slider-resource-box">
                        <img src="./images/原石.png" class="slider-resource-icon">
                        <div class="slider-resource-name">当前原石</div>
                        <div class="slider-resource-amount">${currentPrimogems}</div>
                    </div>
                    <div class="slider-resource-box">
                        <img src="./images/创世结晶.png" class="slider-resource-icon">
                        <div class="slider-resource-name">当前创世结晶</div>
                        <div class="slider-resource-amount">${genesisCrystal}</div>
                    </div>
                </div>
                
                <div class="slider-container">
                    <div class="slider-label">
                        <span>兑换数量</span>
                        <span class="slider-value">0</span>
                    </div>
                    <input type="range" class="exchange-slider" min="0" max="${genesisCrystal}" value="0" step="1">
                    <div class="slider-quick-buttons">
                        <button class="slider-quick-btn" data-amount="160">160</button>
                        <button class="slider-quick-btn" data-amount="1600">1600</button>
                        <button class="slider-quick-btn" data-amount="3200">3200</button>
                        <button class="slider-quick-btn" data-amount="max">全部</button>
                    </div>
                </div>
                
                <div class="slider-exchange-result">
                    消耗：<span class="modal-highlight">0</span> 创世结晶<br>
                    获得：<span class="modal-highlight">0</span> 原石<br>
                    <br>
                    兑换后：<span class="modal-success">${currentPrimogems}</span> 原石
                </div>
            </div>
            <div class="slider-exchange-footer">
                <button class="modal-btn modal-btn-secondary" data-action="cancel">取消</button>
                <button class="modal-btn modal-btn-primary" data-action="confirm">确认兑换</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    const slider = modal.querySelector('.exchange-slider');
    const sliderValueDisplay = modal.querySelector('.slider-value');
    const resultDiv = modal.querySelector('.slider-exchange-result');
    const confirmBtn = modal.querySelector('[data-action="confirm"]');

    // 更新显示
    const updateDisplay = (value) => {
        sliderValue = parseInt(value);
        sliderValueDisplay.textContent = sliderValue;

        const newPrimogems = currentPrimogems + sliderValue;
        const newGenesisCrystal = genesisCrystal - sliderValue;

        resultDiv.innerHTML = `
            消耗：<span class="modal-highlight">${sliderValue}</span> 创世结晶<br>
            获得：<span class="modal-highlight">${sliderValue}</span> 原石<br>
            <br>
            兑换后：<span class="modal-success">${newPrimogems}</span> 原石 | <span class="modal-highlight">${newGenesisCrystal}</span> 创世结晶
        `;

        // 更新滑块进度条颜色
        const progress = (sliderValue / genesisCrystal) * 100;
        slider.style.setProperty('--slider-progress', `${progress}%`);

        // 禁用/启用确认按钮
        if (sliderValue === 0) {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
        } else {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
        }
    };

    // 滑块事件
    slider.addEventListener('input', (e) => {
        updateDisplay(e.target.value);
    });

    // 快捷按钮事件
    modal.querySelectorAll('.slider-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.dataset.amount;
            let value;

            if (amount === 'max') {
                // 全部
                value = genesisCrystal;
            } else {
                // 固定数量，但不超过拥有的创世结晶
                value = Math.min(parseInt(amount), genesisCrystal);
            }

            slider.value = value;
            updateDisplay(value);
        });
    });

    // 初始化显示
    updateDisplay(0);

    // 确认按钮
    confirmBtn.addEventListener('click', async () => {
        if (sliderValue > 0) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);

            // 执行兑换
            const newGenesisCrystal = genesisCrystal - sliderValue;
            const newPrimogems = currentPrimogems + sliderValue;

            localStorage.setItem('genesisCrystal', newGenesisCrystal);
            primogemCount.textContent = newPrimogems;
            saveResourceData();
            updateResourceDisplay();
            updateGenesisCrystalDisplay();

            // 显示充值成功窗口
            showExchangeSuccess(sliderValue);
        }
    });

    // 取消按钮
    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    // 关闭按钮
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// 显示兑换成功窗口（类似充值成功）
function showExchangeSuccess(amount) {
    // 播放音效
    const audio = new Audio('./audio/I Get It.wav');
    audio.play().catch(error => {
        console.log('播放音效失败:', error);
    });

    // 创建弹出窗口元素
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.zIndex = '9999';
    popup.style.background = 'rgba(0, 0, 0, 0.8)';
    popup.style.backdropFilter = 'blur(5px)';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';

    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';
    contentContainer.style.alignItems = 'center';
    contentContainer.style.justifyContent = 'center';
    contentContainer.style.padding = '60px 0';

    // 创建"已获得"文字
    const obtainedText = document.createElement('div');
    obtainedText.textContent = '已获得';
    obtainedText.style.color = '#BEB99C';
    obtainedText.style.fontSize = '14px';
    obtainedText.style.marginBottom = '15px';
    contentContainer.appendChild(obtainedText);

    // 创建上方分割线
    const topDivider = document.createElement('div');
    topDivider.style.width = '850px';
    topDivider.style.height = '1px';
    topDivider.style.background = '#959187';
    topDivider.style.marginBottom = '15px';
    contentContainer.appendChild(topDivider);

    // 创建"兑换成功"文字
    const bonusTitle = document.createElement('div');
    bonusTitle.textContent = '兑换成功';
    bonusTitle.style.color = '#EDE5D9';
    bonusTitle.style.fontSize = '18px';
    bonusTitle.style.fontWeight = 'bold';
    bonusTitle.style.marginBottom = '20px';
    contentContainer.appendChild(bonusTitle);

    // 创建原石图标容器
    const crystalContainer = document.createElement('div');
    crystalContainer.style.position = 'relative';
    crystalContainer.style.display = 'flex';
    crystalContainer.style.flexDirection = 'column';
    crystalContainer.style.alignItems = 'center';
    crystalContainer.style.marginBottom = '20px';

    // 创建原石图标（带白色底部）
    const crystalIcon = document.createElement('div');
    crystalIcon.style.width = '100px';
    crystalIcon.style.display = 'flex';
    crystalIcon.style.flexDirection = 'column';
    crystalIcon.style.alignItems = 'center';
    crystalIcon.style.borderRadius = '10px';
    crystalIcon.style.overflow = 'hidden';
    crystalIcon.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';

    // 上半部分：图标背景
    const iconTop = document.createElement('div');
    iconTop.style.width = '100%';
    iconTop.style.height = '100px';
    iconTop.style.background = 'url("./images/充值成功背景图.webp") no-repeat center/cover';
    iconTop.style.display = 'flex';
    iconTop.style.alignItems = 'center';
    iconTop.style.justifyContent = 'center';

    // 添加原石图片
    const crystalImage = document.createElement('img');
    crystalImage.src = './images/原石.png';
    crystalImage.style.width = '70px';
    crystalImage.style.height = '70px';
    crystalImage.style.objectFit = 'contain';
    iconTop.appendChild(crystalImage);

    crystalIcon.appendChild(iconTop);

    // 下半部分：白色底部显示数量
    const iconBottom = document.createElement('div');
    iconBottom.style.width = '100%';
    iconBottom.style.background = '#FFFFFF';
    iconBottom.style.padding = '8px 0';
    iconBottom.style.display = 'flex';
    iconBottom.style.alignItems = 'center';
    iconBottom.style.justifyContent = 'center';

    const amountText = document.createElement('div');
    amountText.textContent = amount;
    amountText.style.color = '#3C3C3C';
    amountText.style.fontSize = '18px';
    amountText.style.fontWeight = 'bold';
    iconBottom.appendChild(amountText);

    crystalIcon.appendChild(iconBottom);
    crystalContainer.appendChild(crystalIcon);

    // 创建物品名称标签
    const itemLabel = document.createElement('div');
    itemLabel.textContent = '原石';
    itemLabel.style.color = '#BEB99C';
    itemLabel.style.fontSize = '12px';
    itemLabel.style.marginTop = '8px';
    crystalContainer.appendChild(itemLabel);

    contentContainer.appendChild(crystalContainer);

    // 创建下方分割线
    const bottomDivider = document.createElement('div');
    bottomDivider.style.width = '850px';
    bottomDivider.style.height = '1px';
    bottomDivider.style.background = '#959187';
    bottomDivider.style.marginTop = '15px';
    contentContainer.appendChild(bottomDivider);

    popup.appendChild(contentContainer);
    document.body.appendChild(popup);

    // 点击关闭
    popup.addEventListener('click', () => {
        popup.remove();
    });

    // 3秒后自动关闭
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 3000);
}

// === 尘辉兑换界面功能 ===

// 显示尘辉兑换界面
function showDustExchange() {
    if (dustExchangeContainer) {
        dustExchangeContainer.style.display = 'block';
        // 更新创世结晶数量显示
        updateGenesisCrystalDisplay();
    }
}

// 更新创世结晶数量显示
function updateGenesisCrystalDisplay() {
    const genesisCrystalCount = document.getElementById('genesisCrystalCount');
    if (genesisCrystalCount) {
        const savedGenesisCrystal = localStorage.getItem('genesisCrystal');
        if (savedGenesisCrystal !== null) {
            genesisCrystalCount.textContent = savedGenesisCrystal;
        } else {
            genesisCrystalCount.textContent = '0';
        }
    }
}

// 保存创世结晶数据
function saveGenesisCrystalData(amount) {
    localStorage.setItem('genesisCrystal', amount.toString());
    // 更新显示
    updateGenesisCrystalDisplay();
}

// 初始化双倍系统
function initDoubleBonusSystem() {
    // 检查是否需要重置双倍状态（每月重置）
    checkAndResetDoubleBonus();

    // 更新所有充值项的显示
    updateRechargeItemsDisplay();

    // 绑定充值项点击事件
    bindRechargeItemEvents();
}

// 检查并重置双倍状态（每月重置）
function checkAndResetDoubleBonus() {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

    const lastResetDate = localStorage.getItem(DOUBLE_BONUS_RESET_KEY);

    if (lastResetDate !== currentMonth) {
        // 新的月份，重置所有双倍状态
        const resetStatus = {
            60: true,
            300: true,
            980: true,
            1980: true,
            3280: true,
            6480: true
        };
        localStorage.setItem(DOUBLE_BONUS_KEY, JSON.stringify(resetStatus));
        localStorage.setItem(DOUBLE_BONUS_RESET_KEY, currentMonth);
    }
}

// 获取双倍状态
function getDoubleBonusStatus() {
    const statusStr = localStorage.getItem(DOUBLE_BONUS_KEY);
    if (!statusStr) {
        // 初始化所有档位都有双倍
        const initialStatus = {
            60: true,
            300: true,
            980: true,
            1980: true,
            3280: true,
            6480: true
        };
        localStorage.setItem(DOUBLE_BONUS_KEY, JSON.stringify(initialStatus));
        return initialStatus;
    }
    return JSON.parse(statusStr);
}

// 设置双倍状态
function setDoubleBonusStatus(amount, hasDouble) {
    const status = getDoubleBonusStatus();
    status[amount] = hasDouble;
    localStorage.setItem(DOUBLE_BONUS_KEY, JSON.stringify(status));
    console.log('设置双倍状态:', amount, hasDouble, '完整状态:', status);
}

// 更新充值项显示
function updateRechargeItemsDisplay() {
    const rechargeItems = document.querySelectorAll('.recharge-item');
    const doubleBonusStatus = getDoubleBonusStatus();

    rechargeItems.forEach(item => {
        const amount = parseInt(item.dataset.amount);
        const bonus = parseInt(item.dataset.bonus);
        const hasDouble = doubleBonusStatus[amount];

        const doubleBadgeWrapper = item.querySelector('.double-badge-wrapper');
        const bonusText = item.querySelector('.bonus-text');
        const crystalAmountSpan = item.querySelector('.crystal-amount');

        if (hasDouble) {
            // 显示双倍角标
            if (doubleBadgeWrapper) {
                doubleBadgeWrapper.style.display = 'block';
            }
            // 强制隐藏赠送角标
            if (bonusText) {
                bonusText.style.display = 'none';
                bonusText.style.visibility = 'hidden';
            }
            // 始终显示基础数量，不显示双倍后的数量
            if (crystalAmountSpan) {
                crystalAmountSpan.textContent = amount;
            }
        } else {
            // 隐藏双倍角标
            if (doubleBadgeWrapper) {
                doubleBadgeWrapper.style.display = 'none';
            }

            // 对于60档，不显示赠送角标
            if (amount === 60) {
                if (bonusText) {
                    bonusText.style.display = 'none';
                    bonusText.style.visibility = 'hidden';
                }
                if (crystalAmountSpan) {
                    crystalAmountSpan.textContent = amount;
                }
            } else {
                // 其他档位显示赠送角标
                if (bonusText && bonus > 0) {
                    bonusText.style.display = 'flex';
                    bonusText.style.visibility = 'visible';
                    const bonusAmountSpan = bonusText.querySelector('.bonus-amount');
                    if (bonusAmountSpan) {
                        bonusAmountSpan.textContent = bonus;
                    }
                }
                // 只显示基础数量，不加赠送数量
                if (crystalAmountSpan) {
                    crystalAmountSpan.textContent = amount;
                }
            }
        }
    });
}

// 绑定充值项点击事件
function bindRechargeItemEvents() {
    const rechargeItems = document.querySelectorAll('.recharge-item');

    rechargeItems.forEach(item => {
        item.addEventListener('click', function() {
            const amount = parseInt(this.dataset.amount);
            const price = parseInt(this.dataset.price);
            const imagePath = `./images/${amount}创世结晶.webp`;

            showRechargeWindow(amount, imagePath);
        });
    });
}

// 显示充值窗口
function showRechargeWindow(amount, imagePath) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.7)';
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.style.zIndex = '9998';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    // 创建充值窗口元素
    const rechargeWindow = document.createElement('div');
    rechargeWindow.style.position = 'relative';
    rechargeWindow.style.zIndex = '9999';
    rechargeWindow.style.background = '#FBF6EE url(./images/充值窗口背景.png) no-repeat center/cover';
    rechargeWindow.style.padding = '20px';
    rechargeWindow.style.borderRadius = '15px';
    rechargeWindow.style.display = 'flex';
    rechargeWindow.style.flexDirection = 'column';
    rechargeWindow.style.alignItems = 'center';
    rechargeWindow.style.justifyContent = 'center';
    rechargeWindow.style.width = '320px';
    rechargeWindow.style.height = '400px';
    rechargeWindow.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    rechargeWindow.style.border = '2px solid #E8D5B9';
    rechargeWindow.style.overflow = 'hidden';

    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '<';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.left = '15px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.color = '#8B7355';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.width = '30px';
    closeBtn.style.height = '30px';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.borderRadius = '50%';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    rechargeWindow.appendChild(closeBtn);

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });

    // 创建图片元素
    const image = document.createElement('img');
    image.src = imagePath;
    image.alt = '创世结晶';
    image.style.width = '120px';
    image.style.height = '120px';
    image.style.objectFit = 'contain';
    image.style.marginBottom = '15px';
    rechargeWindow.appendChild(image);

    // 创建金额显示
    const amountText = document.createElement('div');
    amountText.textContent = `创世结晶 ×${amount}`;
    amountText.style.color = '#8B7355';
    amountText.style.fontSize = '18px';
    amountText.style.fontWeight = 'bold';
    amountText.style.marginBottom = '8px';
    rechargeWindow.appendChild(amountText);

    // 创建价格显示
    const price = amount === 60 ? 6 :
                 amount === 300 ? 30 :
                 amount === 980 ? 98 :
                 amount === 1980 ? 198 :
                 amount === 3280 ? 328 :
                 amount === 6480 ? 648 : 0;
    const priceText = document.createElement('div');
    priceText.textContent = `￥${price}.00`;
    priceText.style.color = '#8B7355';
    priceText.style.fontSize = '16px';
    priceText.style.marginBottom = '20px';
    rechargeWindow.appendChild(priceText);

    // 创建支付方式标题
    const paymentTitle = document.createElement('div');
    paymentTitle.textContent = '选择支付方式';
    paymentTitle.style.color = '#8B7355';
    paymentTitle.style.fontSize = '14px';
    paymentTitle.style.fontWeight = 'bold';
    paymentTitle.style.marginBottom = '12px';
    rechargeWindow.appendChild(paymentTitle);

    // 创建支付方式选项
    const paymentMethods = [
        {name: '支付宝', icon: './images/支付宝支付图标.png'},
        {name: '微信支付', icon: './images/微信支付图标.webp'},
        {name: '银行卡', icon: './images/银行卡支付图标.png'}
    ];
    paymentMethods.forEach(method => {
        const methodBtn = document.createElement('button');
        methodBtn.style.width = '160px';
        methodBtn.style.height = '34px';
        methodBtn.style.marginBottom = '8px';
        methodBtn.style.background = 'linear-gradient(135deg, #E8D5B9, #F0E6D2)';
        methodBtn.style.border = '1px solid #D3C0A7';
        methodBtn.style.borderRadius = '17px';
        methodBtn.style.color = '#8B7355';
        methodBtn.style.fontSize = '12px';
        methodBtn.style.fontWeight = 'bold';
        methodBtn.style.cursor = 'pointer';
        methodBtn.style.transition = 'all 0.2s ease';
        methodBtn.style.display = 'flex';
        methodBtn.style.alignItems = 'center';
        methodBtn.style.justifyContent = 'center';
        methodBtn.style.padding = '5px 10px';
        methodBtn.style.textAlign = 'center';
        methodBtn.style.marginLeft = 'auto';
        methodBtn.style.marginRight = 'auto';

        // 创建图标元素
        const icon = document.createElement('img');
        icon.src = method.icon;
        icon.alt = method.name;
        icon.style.width = '16px';
        icon.style.height = '16px';
        icon.style.marginRight = '6px';
        icon.style.verticalAlign = 'middle';
        icon.style.objectFit = 'contain';
        icon.style.display = 'block';

        // 创建文本节点
        const textNode = document.createTextNode(method.name);

        // 添加图标和文本到按钮
        methodBtn.appendChild(icon);
        methodBtn.appendChild(textNode);

        methodBtn.addEventListener('mouseover', () => {
            methodBtn.style.background = 'linear-gradient(135deg, #F0E6D2, #E8D5B9)';
            methodBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        });
        methodBtn.addEventListener('mouseout', () => {
            methodBtn.style.background = 'linear-gradient(135deg, #E8D5B9, #F0E6D2)';
            methodBtn.style.boxShadow = 'none';
        });
        methodBtn.addEventListener('click', () => {
            // 模拟支付成功
            document.body.removeChild(overlay);
            rechargeGenesisCrystals(amount, imagePath);
        });
        rechargeWindow.appendChild(methodBtn);
    });

    // 将弹窗添加到遮罩层
    overlay.appendChild(rechargeWindow);

    // 添加到页面
    document.body.appendChild(overlay);
}

// 充值创世结晶
function rechargeGenesisCrystals(amount, imagePath) {
    const genesisCrystalCount = document.getElementById('genesisCrystalCount');
    if (genesisCrystalCount) {
        let currentGenesisCrystal = parseInt(genesisCrystalCount.textContent) || 0;

        // 获取双倍状态
        const doubleBonusStatus = getDoubleBonusStatus();
        const hasDouble = doubleBonusStatus[amount];
        const config = RECHARGE_CONFIG[amount];

        console.log('充值前双倍状态:', amount, hasDouble, doubleBonusStatus);

        let actualAmount = 0;

        if (hasDouble) {
            // 首次购买，获得双倍
            actualAmount = config.double;
            // 只消耗当前档位的双倍状态（每个档位独立）
            setDoubleBonusStatus(amount, false);
            console.log('消耗双倍后状态:', getDoubleBonusStatus());
        } else {
            // 非首次购买，给基础数量+赠送数量
            actualAmount = config.base + config.bonus;
        }

        currentGenesisCrystal += actualAmount;
        genesisCrystalCount.textContent = currentGenesisCrystal;
        saveGenesisCrystalData(currentGenesisCrystal);

        // 更新充值项显示
        updateRechargeItemsDisplay();

        // 弹出对应价位的创世结晶图片，显示实际获得的数量
        showRechargeSuccess(imagePath, actualAmount);
    }
}

// 显示充值成功图片
function showRechargeSuccess(imagePath, actualAmount) {
    // 播放充值成功音效
    const audio = new Audio('./audio/I Get It.wav');
    audio.play().catch(error => {
        console.log('播放音效失败:', error);
    });

    // 使用传入的实际获得数量
    const bonusAmount = actualAmount;

    // 创建弹出窗口元素
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.zIndex = '9999';
    popup.style.background = 'rgba(0, 0, 0, 0.8)';
    popup.style.backdropFilter = 'blur(5px)';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';

    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';
    contentContainer.style.alignItems = 'center';
    contentContainer.style.justifyContent = 'center';
    contentContainer.style.padding = '60px 0'; // 添加上下内边距，让内容更居中

    // 创建"已获得"文字（最上方，小字）
    const obtainedText = document.createElement('div');
    obtainedText.textContent = '已获得';
    obtainedText.style.color = '#BEB99C';
    obtainedText.style.fontSize = '14px';
    obtainedText.style.marginBottom = '15px';
    contentContainer.appendChild(obtainedText);

    // 创建上方分割线（已获得和额外获得之间）
    const topDivider = document.createElement('div');
    topDivider.style.width = '850px';
    topDivider.style.height = '1px';
    topDivider.style.background = '#959187';
    topDivider.style.marginBottom = '15px';
    contentContainer.appendChild(topDivider);

    // 创建"额外获得"文字（大字）
    const bonusTitle = document.createElement('div');
    bonusTitle.textContent = '额外获得';
    bonusTitle.style.color = '#EDE5D9';
    bonusTitle.style.fontSize = '18px';
    bonusTitle.style.fontWeight = 'bold';
    bonusTitle.style.marginBottom = '20px';
    contentContainer.appendChild(bonusTitle);

    // 创建创世结晶图标容器
    const crystalContainer = document.createElement('div');
    crystalContainer.style.position = 'relative';
    crystalContainer.style.display = 'flex';
    crystalContainer.style.flexDirection = 'column';
    crystalContainer.style.alignItems = 'center';
    crystalContainer.style.marginBottom = '20px';

    // 创建创世结晶图标（不包含白色背景）
    const crystalIcon = document.createElement('div');
    crystalIcon.style.width = '70px';
    crystalIcon.style.height = '70px';
    crystalIcon.style.background = 'url("./images/充值成功背景图.webp") no-repeat center/cover';
    crystalIcon.style.borderRadius = '8px 8px 0 0';
    crystalIcon.style.display = 'flex';
    crystalIcon.style.alignItems = 'center';
    crystalIcon.style.justifyContent = 'center';
    crystalIcon.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.4)';

    // 添加创世结晶图片
    const crystalImage = document.createElement('img');
    crystalImage.src = './images/创世结晶.png';
    crystalImage.alt = '创世结晶';
    crystalImage.style.width = '52px';
    crystalImage.style.height = '52px';
    crystalImage.style.objectFit = 'contain';
    crystalIcon.appendChild(crystalImage);

    // 添加图标到容器
    crystalContainer.appendChild(crystalIcon);

    // 创建白色背景条（贴合在图片下方）
    const whiteBar = document.createElement('div');
    whiteBar.style.width = '70px';
    whiteBar.style.background = '#ffffff';
    whiteBar.style.borderRadius = '0 0 8px 8px';
    whiteBar.style.padding = '4px 8px';
    whiteBar.style.display = 'flex';
    whiteBar.style.alignItems = 'center';
    whiteBar.style.justifyContent = 'center';
    whiteBar.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.25)';
    whiteBar.style.marginTop = '-2px'; // 紧贴图片

    // 创建数量显示（在白色背景上）
    const amountDisplay = document.createElement('div');
    amountDisplay.textContent = bonusAmount;
    amountDisplay.style.color = '#333333';
    amountDisplay.style.fontSize = '18px';
    amountDisplay.style.fontWeight = 'normal';
    whiteBar.appendChild(amountDisplay);

    // 添加白色背景条到容器
    crystalContainer.appendChild(whiteBar);

    // 创建创世结晶文字
    const crystalText = document.createElement('div');
    crystalText.textContent = '创世结晶';
    crystalText.style.color = '#EDE5D9';
    crystalText.style.fontSize = '12px';
    crystalText.style.marginTop = '10px';
    crystalContainer.appendChild(crystalText);

    // 添加到内容容器
    contentContainer.appendChild(crystalContainer);

    // 创建下方分割线
    const bottomDivider = document.createElement('div');
    bottomDivider.style.width = '850px';
    bottomDivider.style.height = '1px';
    bottomDivider.style.background = '#959187';
    bottomDivider.style.marginTop = '20px';
    bottomDivider.style.marginBottom = '15px';
    contentContainer.appendChild(bottomDivider);

    // 创建点击空白区域继续文字
    const clickText = document.createElement('div');
    clickText.textContent = '点击空白区域继续';
    clickText.style.color = '#EDE5D9';
    clickText.style.fontSize = '14px';
    contentContainer.appendChild(clickText);

    // 添加内容容器到弹窗
    popup.appendChild(contentContainer);

    // 添加点击事件，点击空白区域关闭弹窗
    popup.addEventListener('click', () => {
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 500);
    });

    // 添加弹出窗口到文档
    document.body.appendChild(popup);
}

// 用创世结晶兑换原石
function exchangeGenesisCrystalToPrimogem(amount) {
    // 从localStorage获取创世结晶数量
    const savedGenesisCrystal = localStorage.getItem('genesisCrystal');
    let currentGenesisCrystal = savedGenesisCrystal ? parseInt(savedGenesisCrystal) : 0;

    if (primogemCount) {
        let currentPrimogems = parseInt(primogemCount.textContent) || 0;

        if (currentGenesisCrystal >= amount) {
            currentGenesisCrystal -= amount;
            currentPrimogems += amount;

            // 更新localStorage中的创世结晶数量
            saveGenesisCrystalData(currentGenesisCrystal);

            // 更新原石数量
            primogemCount.textContent = currentPrimogems;
            saveResourceData();

            // 如果商城界面是打开的，更新商城中的创世结晶数量显示
            const genesisCrystalCount = document.getElementById('genesisCrystalCount');
            if (genesisCrystalCount) {
                genesisCrystalCount.textContent = currentGenesisCrystal;
            }

            return true;
        } else {
            // 创世结晶数量不足，静默返回false
            return false;
        }
    }
    return false;
}

// 获取创世结晶数量
function getGenesisCrystalCount() {
    const savedGenesisCrystal = localStorage.getItem('genesisCrystal');
    return savedGenesisCrystal ? parseInt(savedGenesisCrystal) : 0;
}

// 隐藏尘辉兑换界面
function closeDustExchange() {
    if (dustExchangeContainer) {
        dustExchangeContainer.style.display = 'none';
    }
}

// 为商店窗口添加拖拽功能
let isDragging = false;
let startX, startY, offsetX, offsetY;

// 切换标签页
function switchTab(tabId) {
    // 移除所有标签页的活动状态
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // 添加当前标签页的活动状态
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(`${tabId}-tab`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

// 兑换1个纠缠之缘
async function exchange1Fate() {
    if (primogemCount && fateCount) {
        let primogems = parseInt(primogemCount.textContent) || 0;
        let fate = parseInt(fateCount.textContent) || 0;

        if (primogems >= 160) {
            const exchangeCount = Math.floor(primogems / 160);
            fate += exchangeCount;
            primogems = primogems % 160;

            primogemCount.textContent = primogems;
            fateCount.textContent = fate;
            saveResourceData();
            updateResourceDisplay();

            await showCustomAlert({
                title: '兑换成功',
                message: `
                    <div style="text-align: center; line-height: 2;">
                        <span class="modal-success">兑换成功！</span><br>
                        <br>
                        获得 <span class="modal-highlight">${exchangeCount}</span> 个纠缠之缘
                    </div>
                `,
                showResources: true
            });
        } else {
            // 原石不足，检查创世结晶
            const missingPrimogems = 160 - primogems;
            const genesisCrystal = getGenesisCrystalCount();

            if (genesisCrystal >= missingPrimogems) {
                const confirmed = await showCustomConfirm({
                    title: '原石不足',
                    message: '原石不足，是否使用创世结晶兑换？',
                    details: `
                        <div style="line-height: 2;">
                            需要原石：<span class="modal-highlight">160</span><br>
                            当前原石：<span class="modal-highlight">${primogems}</span><br>
                            缺少原石：<span class="modal-error">${missingPrimogems}</span><br>
                            <br>
                            将消耗 <span class="modal-highlight">${missingPrimogems}</span> 创世结晶兑换原石<br>
                            然后兑换 <span class="modal-highlight">1</span> 个纠缠之缘
                        </div>
                    `
                });

                if (confirmed) {
                    // 使用创世结晶兑换原石
                    if (exchangeGenesisCrystalToPrimogem(missingPrimogems)) {
                        primogems = parseInt(primogemCount.textContent) || 0;

                        // 兑换纠缠之缘
                        const exchangeCount = Math.floor(primogems / 160);
                        fate += exchangeCount;
                        primogems = primogems % 160;

                        primogemCount.textContent = primogems;
                        fateCount.textContent = fate;
                        saveResourceData();
                        updateResourceDisplay();

                        await showCustomAlert({
                            title: '兑换成功',
                            message: `
                                <div style="text-align: center; line-height: 2;">
                                    <span class="modal-success">兑换成功！</span><br>
                                    <br>
                                    获得 <span class="modal-highlight">${exchangeCount}</span> 个纠缠之缘
                                </div>
                            `
                        });
                    }
                }
            } else {
                await showCustomAlert({
                    title: '资源不足',
                    message: `
                        <div style="line-height: 2;">
                            原石和创世结晶都不足！<br>
                            <br>
                            需要原石：<span class="modal-highlight">160</span><br>
                            当前原石：<span class="modal-highlight">${primogems}</span><br>
                            当前创世结晶：<span class="modal-highlight">${genesisCrystal}</span><br>
                            <br>
                            还需要：<span class="modal-error">${missingPrimogems - genesisCrystal}</span> 创世结晶
                        </div>
                    `
                });
            }
        }
    }
}

// 兑换10个纠缠之缘
async function exchange10Fate() {
    if (primogemCount && fateCount) {
        let primogems = parseInt(primogemCount.textContent) || 0;
        let fate = parseInt(fateCount.textContent) || 0;

        if (primogems >= 1600) {
            const exchangeCount = Math.floor(primogems / 1600) * 10;
            fate += exchangeCount;
            primogems = primogems % 1600;

            primogemCount.textContent = primogems;
            fateCount.textContent = fate;
            saveResourceData();
            updateResourceDisplay();

            await showCustomAlert({
                title: '兑换成功',
                message: `
                    <div style="text-align: center; line-height: 2;">
                        <span class="modal-success">兑换成功！</span><br>
                        <br>
                        获得 <span class="modal-highlight">${exchangeCount}</span> 个纠缠之缘
                    </div>
                `,
                showResources: true
            });
        } else {
            // 原石不足，检查创世结晶
            const missingPrimogems = 1600 - primogems;
            const genesisCrystal = getGenesisCrystalCount();

            if (genesisCrystal >= missingPrimogems) {
                const confirmed = await showCustomConfirm({
                    title: '原石不足',
                    message: '原石不足，是否使用创世结晶兑换？',
                    details: `
                        <div style="line-height: 2;">
                            需要原石：<span class="modal-highlight">1600</span><br>
                            当前原石：<span class="modal-highlight">${primogems}</span><br>
                            缺少原石：<span class="modal-error">${missingPrimogems}</span><br>
                            <br>
                            将消耗 <span class="modal-highlight">${missingPrimogems}</span> 创世结晶兑换原石<br>
                            然后兑换 <span class="modal-highlight">10</span> 个纠缠之缘
                        </div>
                    `
                });

                if (confirmed) {
                    // 使用创世结晶兑换原石
                    if (exchangeGenesisCrystalToPrimogem(missingPrimogems)) {
                        primogems = parseInt(primogemCount.textContent) || 0;

                        // 兑换纠缠之缘
                        const exchangeCount = Math.floor(primogems / 1600) * 10;
                        fate += exchangeCount;
                        primogems = primogems % 1600;

                        primogemCount.textContent = primogems;
                        fateCount.textContent = fate;
                        saveResourceData();
                        updateResourceDisplay();

                        await showCustomAlert({
                            title: '兑换成功',
                            message: `
                                <div style="text-align: center; line-height: 2;">
                                    <span class="modal-success">兑换成功！</span><br>
                                    <br>
                                    获得 <span class="modal-highlight">${exchangeCount}</span> 个纠缠之缘
                                </div>
                            `
                        });
                    }
                }
            } else {
                await showCustomAlert({
                    title: '资源不足',
                    message: `
                        <div style="line-height: 2;">
                            原石和创世结晶都不足！<br>
                            <br>
                            需要原石：<span class="modal-highlight">1600</span><br>
                            当前原石：<span class="modal-highlight">${primogems}</span><br>
                            当前创世结晶：<span class="modal-highlight">${genesisCrystal}</span><br>
                            <br>
                            还需要：<span class="modal-error">${missingPrimogems - genesisCrystal}</span> 创世结晶
                        </div>
                    `
                });
            }
        }
    }
}

// 用星辉兑换纠缠之缘
async function exchangeStarlightForFate() {
    if (starlightCount && fateCount) {
        let currentStarlight = parseInt(starlightCount.textContent) || 0;
        let currentFate = parseInt(fateCount.textContent) || 0;

        if (currentStarlight >= 5) {
            const exchangeCount = Math.floor(currentStarlight / 5);
            currentStarlight -= exchangeCount * 5;
            currentFate += exchangeCount;

            starlightCount.textContent = currentStarlight;
            fateCount.textContent = currentFate;
            saveResourceData();
            updateResourceDisplay();

            await showCustomAlert({
                title: '兑换成功',
                message: `
                    <div style="text-align: center; line-height: 2;">
                        <span class="modal-success">兑换成功！</span><br>
                        <br>
                        获得 <span class="modal-highlight">${exchangeCount}</span> 个纠缠之缘
                    </div>
                `,
                showResources: true
            });
        } else {
            await showCustomAlert({
                title: '星辉不足',
                message: `
                    <div style="line-height: 2;">
                        星辉数量不足！<br>
                        <br>
                        需要星辉：<span class="modal-highlight">5</span><br>
                        当前星辉：<span class="modal-error">${currentStarlight}</span><br>
                        <br>
                        <span style="color: #C4B5A0;">抽取4星或5星角色/武器可获得星辉</span>
                    </div>
                `,
                showResources: true
            });
        }
    }
}

// 用星尘兑换纠缠之缘
async function exchangeStardustForFate() {
    if (stardustCount && fateCount) {
        let currentStardust = parseInt(stardustCount.textContent) || 0;
        let currentFate = parseInt(fateCount.textContent) || 0;

        if (currentStardust >= 75) {
            const exchangeCount = Math.floor(currentStardust / 75);
            currentStardust -= exchangeCount * 75;
            currentFate += exchangeCount;

            stardustCount.textContent = currentStardust;
            fateCount.textContent = currentFate;
            saveResourceData();
            updateResourceDisplay();

            await showCustomAlert({
                title: '兑换成功',
                message: `
                    <div style="text-align: center; line-height: 2;">
                        <span class="modal-success">兑换成功！</span><br>
                        <br>
                        获得 <span class="modal-highlight">${exchangeCount}</span> 个纠缠之缘
                    </div>
                `,
                showResources: true
            });
        } else {
            await showCustomAlert({
                title: '星尘不足',
                message: `
                    <div style="line-height: 2;">
                        星尘数量不足！<br>
                        <br>
                        需要星尘：<span class="modal-highlight">75</span><br>
                        当前星尘：<span class="modal-error">${currentStardust}</span><br>
                        <br>
                        <span style="color: #C4B5A0;">抽取3星武器可获得星尘</span>
                    </div>
                `,
                showResources: true
            });
        }
    }
}

// 绑定其他按钮事件
function bindOtherButtonEvents() {
    // 跳过按钮点击事件
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            if (isSkipping) return; // 防止重复点击

            const allCards = document.querySelectorAll('.card:not(.active)');
            if (allCards.length === 0) return;

            isSkipping = true; // 标记正在跳过

            // 记录需要翻开的卡片数量
            let cardsToFlip = allCards.length;
            let cardsFlipped = 0;

            console.log('开始跳过，需要翻开的卡片数量:', cardsToFlip);

            // 依次翻开所有卡片
            allCards.forEach((card, index) => {
                setTimeout(() => {
                    const subElement = card.firstElementChild;
                    if (subElement && !subElement.classList.contains('animate-roll')) {
                        // 播放翻牌音效
                        const raritySound = card.dataset.sound;
                        if (raritySound && soundManager) {
                            soundManager.playSound(raritySound);
                        }

                        subElement.classList.add("animate-roll");

                        // 使用动画结束事件
                        const onAnimationEnd = () => {
                            card.classList.add('active');
                            cardsFlipped++;

                            console.log('卡片翻完，已翻:', cardsFlipped, '/', cardsToFlip);

                            // 检查是否所有卡片都翻完了
                            if (cardsFlipped === cardsToFlip) {
                                console.log('所有卡牌翻完，隐藏按钮');
                                // 所有卡牌都翻完后才隐藏按钮
                            setTimeout(() => {
                                // 更新本次抽卡获得的星尘和星辉数量
                                if (earnedStarlight > 0) {
                                    addStarlight(earnedStarlight);
                                }
                                if (earnedStardust > 0) {
                                    addStardust(earnedStardust);
                                }

                                skipBtn.classList.remove('show');
                                isSkipping = false; // 重置跳过状态

                                    // 初始化卡牌拖拽功能
                                    initCardDragAndDrop();
                                }, 500); // 额外延迟，确保动画完全结束
                            }
                        };

                        // 确保动画结束事件只绑定一次
                        subElement.addEventListener('animationend', onAnimationEnd, { once: true });
                    } else {
                        // 如果卡片已经翻开了，也计数
                        cardsFlipped++;
                        if (cardsFlipped === cardsToFlip) {
                            console.log('所有卡片已翻开，隐藏按钮');
                            setTimeout(() => {
                                // 更新本次抽卡获得的星尘和星辉数量
                                if (earnedStarlight > 0) {
                                    addStarlight(earnedStarlight);
                                }
                                if (earnedStardust > 0) {
                                    addStardust(earnedStardust);
                                }

                                skipBtn.classList.remove('show');
                                isSkipping = false;
                            }, 500);
                        }
                    }
                }, index * 100); // 增加间隔时间
            });
        });

        // 键盘空格键跳过
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && skipBtn.classList.contains('show') && !isSkipping) {
                event.preventDefault();
                skipBtn.click();
            }
        });
    }

    // 为关闭按钮添加点击事件
    if (closeBtn) {
        closeBtn.addEventListener('click', async function() {
            // 播放点击音效
            if (soundManager) {
                soundManager.playSound('wishClick');
            }

            // 判断当前状态
            if (isInGachaResultView) {
                // 在抽卡结果界面：返回祈愿界面
                returnToWishView();
            } else {
                // 在祈愿界面：清除历史记录
                const confirmed = await showCustomConfirm({
                    title: '清除祈愿记录',
                    message: '确定要清除所有祈愿记录吗？',
                    details: `
                        <div style="line-height: 2; color: #C4B5A0;">
                            此操作将清除所有抽卡历史记录<br>
                            <span class="modal-error">此操作不可恢复！</span>
                        </div>
                    `,
                    showResources: false
                });

                if (confirmed) {
                    // 清除sessionStorage中的祈愿记录
                    sessionStorage.removeItem('RecordWishes');

                    await showCustomAlert({
                        title: '清除成功',
                        message: `
                            <div style="text-align: center; line-height: 2;">
                                <span class="modal-success">祈愿记录已清除！</span>
                            </div>
                        `,
                        showResources: false
                    });
                }
            }
        });
    }

    // 返回祈愿界面函数
    function returnToWishView() {
        // 隐藏卡片容器（不删除卡片，保留存活的卡牌）
        if (cardBox) {
            cardBox.style.display = 'none';
        }

        // 显示祈愿图片
        if (currentWishItem) {
            currentWishItem.style.display = 'block';
        }

        // 显示祈愿按钮
        if (wishContainer) {
            wishContainer.style.display = 'flex';
        }

        // 显示资源显示
        showResources();

        // 重置状态
        isInGachaResultView = false;
        isGachaEnabled = true;

        // 隐藏跳过按钮
        if (skipBtn) {
            skipBtn.classList.remove('show');
        }
    }

    // === 详情界面功能 ===

    // 详情按钮点击事件
    if (detailBtn) {
        detailBtn.addEventListener('click', function() {
            // 播放点击音效（与历史记录按钮相同）
            const clickSound = new Audio('./audio/Click.wav');
            clickSound.volume = 0.5;
            clickSound.play().catch(e => {
                console.log("音效播放失败:", e);
            });

            // 显示详情界面
            if (detailContainer) {
                detailContainer.style.display = 'flex';
                // 触发动画
                setTimeout(() => {
                    detailContainer.classList.add('show');
                }, 10);
            }
        });
    }

    // 关闭详情界面按钮点击事件
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', function() {
            // 播放点击音效
            if (soundManager) {
                soundManager.playSound('wishClick');
            }

            // 隐藏详情界面
            if (detailContainer) {
                detailContainer.classList.remove('show');
                // 等待动画结束后完全隐藏
                setTimeout(() => {
                    detailContainer.style.display = 'none';
                }, 300);
            }
        });
    }

    // 点击详情界面外部关闭（可选）
    if (detailContainer) {
        detailContainer.addEventListener('click', function(e) {
            if (e.target === detailContainer) {
                // 播放点击音效
                if (soundManager) {
                    soundManager.playSound('wishClick');
                }

                // 隐藏详情界面
                detailContainer.classList.remove('show');
                setTimeout(() => {
                    detailContainer.style.display = 'none';
                }, 300);
            }
        });
    }

    // 为加号按钮添加点击事件
    if (addPrimogemBtn) {
        addPrimogemBtn.addEventListener('click', addPrimogems);
    }

    // 为商店窗口添加拖拽功能
    if (dustExchangeContainer) {
        const exchangeHeader = dustExchangeContainer.querySelector('.exchange-header');
        if (exchangeHeader) {
            // 确保头部区域可点击
            exchangeHeader.style.cursor = 'move';
            exchangeHeader.style.userSelect = 'none';

            // 鼠标按下事件
            exchangeHeader.addEventListener('mousedown', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                isDragging = true;

                // 计算鼠标在窗口内的偏移
                const rect = dustExchangeContainer.getBoundingClientRect();
                startX = e.clientX;
                startY = e.clientY;
                offsetX = startX - rect.left;
                offsetY = startY - rect.top;
            });

            // 鼠标移动事件
            document.addEventListener('mousemove', function(e) {
                if (isDragging && dustExchangeContainer) {
                    e.preventDefault(); // 阻止默认行为
                    const x = e.clientX - offsetX;
                    const y = e.clientY - offsetY;

                    // 更新窗口位置
                    dustExchangeContainer.style.left = `${x}px`;
                    dustExchangeContainer.style.top = `${y}px`;
                    dustExchangeContainer.style.transform = 'none';
                }
            });

            // 鼠标释放事件
            document.addEventListener('mouseup', function() {
                isDragging = false;
            });

            // 鼠标离开事件
            document.addEventListener('mouseleave', function() {
                isDragging = false;
            });
        }
    }

    // 为尘辉兑换按钮添加点击事件
    if (dustExchangeBtn) {
        dustExchangeBtn.addEventListener('click', function() {
            // 播放点击音效（与历史记录按钮相同）
            const clickSound = new Audio('./audio/Click.wav');
            clickSound.volume = 0.5;
            clickSound.play().catch(e => {
                console.log("音效播放失败:", e);
            });

            // 显示尘辉兑换界面
            showDustExchange();
        });
    }

    // 为关闭按钮添加点击事件
    if (closeExchangeBtn) {
        closeExchangeBtn.addEventListener('click', closeDustExchange);
    }

    // 为重置双倍按钮添加点击事件（测试用）
    const resetDoubleBtn = document.getElementById('resetDoubleBtn');
    if (resetDoubleBtn) {
        resetDoubleBtn.addEventListener('click', async function() {
            const confirmed = await showCustomConfirm({
                title: '重置双倍奖励',
                message: '确定要重置所有档位的双倍奖励状态吗？',
                details: `
                    <div style="line-height: 2; color: #C4B5A0;">
                        重置后，所有充值档位都可以再次享受双倍奖励<br>
                        <br>
                        <span style="color: #FFD700;">此功能仅供测试使用</span>
                    </div>
                `,
                showResources: false
            });

            if (confirmed) {
                // 重置所有档位的双倍状态
                const resetStatus = {
                    60: true,
                    300: true,
                    980: true,
                    1980: true,
                    3280: true,
                    6480: true
                };
                localStorage.setItem(DOUBLE_BONUS_KEY, JSON.stringify(resetStatus));

                // 更新显示
                updateRechargeItemsDisplay();

                // 提示用户
                await showCustomAlert({
                    title: '重置成功',
                    message: `
                        <div style="text-align: center; line-height: 2;">
                            <span class="modal-success">双倍状态已重置！</span><br>
                            <br>
                            所有档位都可以再次享受双倍奖励
                        </div>
                    `,
                    showResources: false
                });
            }
        });
    }

    // 为标签页按钮添加点击事件
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
    }

    // 为兑换按钮添加点击事件
    if (exchange1Btn) {
        exchange1Btn.addEventListener('click', exchange1Fate);
    }

    if (exchange10Btn) {
        exchange10Btn.addEventListener('click', exchange10Fate);
    }

    if (starlightExchangeFateBtn) {
        starlightExchangeFateBtn.addEventListener('click', exchangeStarlightForFate);
    }

    if (stardustExchangeFateBtn) {
        stardustExchangeFateBtn.addEventListener('click', exchangeStardustForFate);
    }

    // 为创世结晶充值按钮添加点击事件
    if (buy60CrystalBtn) {
        buy60CrystalBtn.addEventListener('click', function() {
            rechargeGenesisCrystals(60, './images/60创世结晶.webp');
        });
    }

    if (buy300CrystalBtn) {
        buy300CrystalBtn.addEventListener('click', function() {
            rechargeGenesisCrystals(300, './images/300创世结晶.webp');
        });
    }

    if (buy980CrystalBtn) {
        buy980CrystalBtn.addEventListener('click', function() {
            rechargeGenesisCrystals(980, './images/980创世结晶.webp');
        });
    }

    if (buy1980CrystalBtn) {
        buy1980CrystalBtn.addEventListener('click', function() {
            rechargeGenesisCrystals(1980, './images/1980创世结晶.webp');
        });
    }

    if (buy3280CrystalBtn) {
        buy3280CrystalBtn.addEventListener('click', function() {
            rechargeGenesisCrystals(3280, './images/3280创世结晶.webp');
        });
    }

    if (buy6480CrystalBtn) {
        buy6480CrystalBtn.addEventListener('click', function() {
            rechargeGenesisCrystals(6480, './images/6480创世结晶.webp');
        });
    }
}

// ==================== 武器装备系统 ====================

// 初始化武器装备系统
function initWeaponEquipSystem() {
    // 装备栏感应范围（像素）
    const DETECTION_RANGE = 50;

    // 监听装备栏的拖放事件（优先级高，在原有系统之前执行）
    document.addEventListener('mouseup', function(e) {
        // 恢复所有装备栏样式
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            slot.style.backgroundColor = '#4A3728';
            slot.style.transform = 'translateY(-50%) scale(1)';
            slot.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.5)';
        });

        // 检查是否有正在拖拽的卡片（来自原有系统）
        if (!window.draggedCard) return;

        const draggedCard = window.draggedCard;

        // 只处理武器卡
        if (draggedCard.dataset.type !== '武器') return;

        // 检查是否释放在装备栏附近（感应范围内）
        const equipmentSlots = document.querySelectorAll('.equipment-slot');

        let closestSlot = null;
        let closestDistance = Infinity;

        equipmentSlots.forEach(slot => {
            const rect = slot.getBoundingClientRect();
            const slotCenterX = rect.left + rect.width / 2;
            const slotCenterY = rect.top + rect.height / 2;

            // 计算鼠标到装备栏中心的距离
            const distance = Math.sqrt(
                Math.pow(e.clientX - slotCenterX, 2) +
                Math.pow(e.clientY - slotCenterY, 2)
            );

            // 如果在感应范围内，且是最近的装备栏
            if (distance <= DETECTION_RANGE && distance < closestDistance) {
                closestDistance = distance;
                closestSlot = slot;
            }
        });

        // 如果找到了最近的装备栏
        if (closestSlot) {
            const characterCard = closestSlot.closest('.card');
            if (characterCard && characterCard.dataset.type === '角色') {
                // 阻止原有系统的处理（通过标记）
                e.equipmentHandled = true;
                tryEquipWeapon(characterCard, draggedCard);
            }
        }
    }, true); // 使用捕获阶段，优先执行

    // 监听鼠标移动，高亮装备栏
    document.addEventListener('mousemove', function(e) {
        if (!window.draggedCard) return;

        const draggedCard = window.draggedCard;
        if (draggedCard.dataset.type !== '武器') return;

        // 检查是否悬停在装备栏附近（感应范围内）
        const equipmentSlots = document.querySelectorAll('.equipment-slot');

        equipmentSlots.forEach(slot => {
            const rect = slot.getBoundingClientRect();
            const slotCenterX = rect.left + rect.width / 2;
            const slotCenterY = rect.top + rect.height / 2;

            // 计算鼠标到装备栏中心的距离
            const distance = Math.sqrt(
                Math.pow(e.clientX - slotCenterX, 2) +
                Math.pow(e.clientY - slotCenterY, 2)
            );

            // 如果在感应范围内，高亮显示
            if (distance <= DETECTION_RANGE) {
                slot.style.backgroundColor = '#6B4E3D';
                slot.style.transform = 'translateY(-50%) scale(1.2)';
                slot.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.8)';
            } else {
                slot.style.backgroundColor = '#4A3728';
                slot.style.transform = 'translateY(-50%) scale(1)';
                slot.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.5)';
            }
        });
    });
}

// 尝试装备武器
function tryEquipWeapon(characterCard, weaponCard) {
    const characterName = characterCard.dataset.name;
    const weaponName = weaponCard.dataset.name;

    // 检查武器类型是否匹配
    const checkResult = window.checkWeaponEquip(characterName, weaponName);

    if (!checkResult.success) {
        // 类型不匹配，显示提示
        showEquipError(characterCard, checkResult.message);
        return;
    }

    // 检查是否已经装备了武器
    const currentWeapon = characterCard.dataset.equippedWeapon;
    if (currentWeapon) {
        // 已经装备了武器，显示提示
        showEquipError(characterCard, `${characterName} 已经装备了武器，请先卸下`);
        return;
    }

    // 装备武器
    equipWeapon(characterCard, weaponCard);
}

// 装备武器到角色
function equipWeapon(characterCard, weaponCard) {
    const characterName = characterCard.dataset.name;
    const weaponName = weaponCard.dataset.name;
    const weaponPath = weaponCard.dataset.path;
    const weaponAttack = parseInt(weaponCard.dataset.attack) || 0;
    const characterAttack = parseInt(characterCard.dataset.attack) || 0;

    // 保存武器信息到角色卡片
    characterCard.dataset.equippedWeapon = weaponName;
    characterCard.dataset.equippedWeaponPath = weaponPath;
    characterCard.dataset.equippedWeaponAttack = weaponAttack;

    // 计算新的总攻击力
    const totalAttack = characterAttack + weaponAttack;
    characterCard.dataset.attack = totalAttack;

    // 在装备栏显示武器图标
    const equipmentSlot = characterCard.querySelector('.equipment-slot');
    if (equipmentSlot) {
        equipmentSlot.innerHTML = `<img src="${weaponPath}" alt="${weaponName}" title="${weaponName}">`;

        // 添加卸下武器的点击事件
        equipmentSlot.addEventListener('click', function(e) {
            e.stopPropagation();
            unequipWeapon(characterCard);
        });
    }

    // 更新角色属性显示
    updateCharacterStats(characterCard);

    // 移除武器卡片
    weaponCard.remove();

    // 显示装备成功提示
    showEquipSuccess(characterCard, `${characterName} 装备了 ${weaponName}，攻击力 +${weaponAttack}`);
}

// 卸下武器
function unequipWeapon(characterCard) {
    const weaponName = characterCard.dataset.equippedWeapon;
    if (!weaponName) return;

    const weaponAttack = parseInt(characterCard.dataset.equippedWeaponAttack) || 0;
    const currentAttack = parseInt(characterCard.dataset.attack) || 0;
    const characterName = characterCard.dataset.name;

    // 恢复角色原始攻击力
    const originalAttack = currentAttack - weaponAttack;
    characterCard.dataset.attack = originalAttack;

    // 清除装备信息
    delete characterCard.dataset.equippedWeapon;
    delete characterCard.dataset.equippedWeaponPath;
    delete characterCard.dataset.equippedWeaponAttack;

    // 清空装备栏
    const equipmentSlot = characterCard.querySelector('.equipment-slot');
    if (equipmentSlot) {
        equipmentSlot.innerHTML = '';
    }

    // 更新角色属性显示
    updateCharacterStats(characterCard);

    // 显示卸下武器提示
    showEquipSuccess(characterCard, `${characterName} 卸下了 ${weaponName}`);
}

// 更新角色属性显示
function updateCharacterStats(characterCard) {
    const level = characterCard.dataset.level || '1';
    const health = characterCard.dataset.health;
    const maxHealth = characterCard.dataset.maxHealth;
    const attack = characterCard.dataset.attack;

    const statsElement = characterCard.querySelector('.card-stats');
    if (statsElement) {
        statsElement.textContent = `Lv.${level} | HP: ${health}/${maxHealth} | ATK: ${attack}`;
    }
}

// 显示装备错误提示
function showEquipError(card, message) {
    const errorText = document.createElement('div');
    errorText.className = 'equip-error-text';
    errorText.textContent = message;
    errorText.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 11px;
        white-space: nowrap;
        z-index: 1000;
        animation: equipErrorFloat 2s ease-out forwards;
    `;

    card.appendChild(errorText);

    setTimeout(() => {
        errorText.remove();
    }, 2000);
}

// 显示装备成功提示
function showEquipSuccess(card, message) {
    const successText = document.createElement('div');
    successText.className = 'equip-success-text';
    successText.textContent = message;
    successText.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 200, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 11px;
        white-space: nowrap;
        z-index: 1000;
        animation: equipSuccessFloat 2s ease-out forwards;
    `;

    card.appendChild(successText);

    setTimeout(() => {
        successText.remove();
    }, 2000);
}

// 在DOM加载完成后初始化装备系统
document.addEventListener('DOMContentLoaded', function() {
    initWeaponEquipSystem();
});


// ==================== 自定义弹窗系统 ====================

// 创建自定义确认弹窗
function showCustomConfirm(options) {
    return new Promise((resolve) => {
        // 创建弹窗容器
        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        // 获取当前资源数量
        const currentPrimogems = parseInt(primogemCount?.textContent) || 0;
        const currentGenesisCrystal = getGenesisCrystalCount();
        const currentFate = parseInt(fateCount?.textContent) || 0;

        // 构建弹窗HTML
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${options.title || '提示'}</h3>
                    <button class="modal-close" onclick="this.closest('.custom-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${options.message ? `<div class="modal-message">${options.message}</div>` : ''}
                    
                    ${options.showResources !== false ? `
                    <div class="modal-resources">
                        <div class="modal-resource-item">
                            <span class="modal-resource-label">
                                <img src="./images/纠缠之缘.webp" class="modal-resource-icon">
                                纠缠之缘
                            </span>
                            <span class="modal-resource-value">${currentFate}</span>
                        </div>
                        <div class="modal-resource-item">
                            <span class="modal-resource-label">
                                <img src="./images/原石.png" class="modal-resource-icon">
                                原石
                            </span>
                            <span class="modal-resource-value">${currentPrimogems}</span>
                        </div>
                        <div class="modal-resource-item">
                            <span class="modal-resource-label">
                                <img src="./images/创世结晶.png" class="modal-resource-icon">
                                创世结晶
                            </span>
                            <span class="modal-resource-value">${currentGenesisCrystal}</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${options.details ? `<div style="margin-top: 15px;">${options.details}</div>` : ''}
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-secondary" data-action="cancel">取消</button>
                    <button class="modal-btn modal-btn-primary" data-action="confirm">确认</button>
                </div>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(modal);

        // 显示弹窗
        setTimeout(() => modal.classList.add('show'), 10);

        // 绑定按钮事件
        modal.querySelectorAll('.modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve(action === 'confirm');
                }, 300);
            });
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve(false);
                }, 300);
            }
        });
    });
}

// 创建自定义提示弹窗
function showCustomAlert(options) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        // 获取当前资源数量
        const currentPrimogems = parseInt(primogemCount?.textContent) || 0;
        const currentGenesisCrystal = getGenesisCrystalCount();
        const currentFate = parseInt(fateCount?.textContent) || 0;

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${options.title || '提示'}</h3>
                    <button class="modal-close" onclick="this.closest('.custom-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${options.message ? `<div class="modal-message">${options.message}</div>` : ''}
                    
                    ${options.showResources !== false ? `
                    <div class="modal-resources">
                        <div class="modal-resource-item">
                            <span class="modal-resource-label">
                                <img src="./images/纠缠之缘.webp" class="modal-resource-icon">
                                纠缠之缘
                            </span>
                            <span class="modal-resource-value">${currentFate}</span>
                        </div>
                        <div class="modal-resource-item">
                            <span class="modal-resource-label">
                                <img src="./images/原石.png" class="modal-resource-icon">
                                原石
                            </span>
                            <span class="modal-resource-value">${currentPrimogems}</span>
                        </div>
                        <div class="modal-resource-item">
                            <span class="modal-resource-label">
                                <img src="./images/创世结晶.png" class="modal-resource-icon">
                                创世结晶
                            </span>
                            <span class="modal-resource-value">${currentGenesisCrystal}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-primary" data-action="ok">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        modal.querySelector('.modal-btn').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                resolve(true);
            }, 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve(true);
                }, 300);
            }
        });
    });
}

// 创建自定义输入弹窗
function showCustomPrompt(options) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        // 获取当前资源数量
        const currentPrimogems = parseInt(primogemCount?.textContent) || 0;
        const currentGenesisCrystal = getGenesisCrystalCount();

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${options.title || '输入'}</h3>
                    <button class="modal-close" onclick="this.closest('.custom-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${options.message ? `<div class="modal-message">${options.message}</div>` : ''}
                    
                    <div class="modal-resources">
                        <div class="modal-resource-item">
                            <span class="modal-resource-label">
                                <img src="./images/原石.png" class="modal-resource-icon">
                                当前原石
                            </span>
                            <span class="modal-resource-value">${currentPrimogems}</span>
                        </div>
                        <div class="modal-resource-item">
                            <span class="modal-resource-label">
                                <img src="./images/创世结晶.png" class="modal-resource-icon">
                                当前创世结晶
                            </span>
                            <span class="modal-resource-value">${currentGenesisCrystal}</span>
                        </div>
                    </div>
                    
                    <input type="number" class="modal-input" placeholder="${options.placeholder || '请输入数量'}" value="${options.defaultValue || ''}" min="0">
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-secondary" data-action="cancel">取消</button>
                    <button class="modal-btn modal-btn-primary" data-action="confirm">确认</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        const input = modal.querySelector('.modal-input');
        input.focus();

        const handleConfirm = () => {
            const value = input.value;
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                resolve(value);
            }, 300);
        };

        const handleCancel = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                resolve(null);
            }, 300);
        };

        modal.querySelector('[data-action="confirm"]').addEventListener('click', handleConfirm);
        modal.querySelector('[data-action="cancel"]').addEventListener('click', handleCancel);

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleConfirm();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        });
    });
}


// 调整装备栏位置（根据卡片位置自动切换左右）
function adjustEquipmentSlotPosition(card) {
    const equipmentSlot = card.querySelector('.equipment-slot');
    if (!equipmentSlot) return;

    // 获取卡片位置
    const cardRect = card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // 计算卡片中心点距离屏幕右边的距离
    const distanceToRight = viewportWidth - cardRect.right;

    // 如果距离右边小于50px，将装备栏放在左边
    if (distanceToRight < 50) {
        equipmentSlot.style.right = 'auto';
        equipmentSlot.style.left = '-38px';
    } else {
        // 否则放在右边（默认）
        equipmentSlot.style.right = '-38px';
        equipmentSlot.style.left = 'auto';
    }
}

// 监听窗口大小变化，重新调整所有装备栏位置
window.addEventListener('resize', () => {
    document.querySelectorAll('.card.active[data-type="角色"]').forEach(card => {
        adjustEquipmentSlotPosition(card);
    });
});


// ==================== 秘典之盒系统 ====================

// 保护的卡牌数组
let protectedCards = [];

// 初始化秘典之盒
function initSecretBox() {
    const secretBox = document.getElementById('secretBox');
    const inventoryModal = document.getElementById('inventoryModal');
    const closeInventoryBtn = document.getElementById('closeInventoryBtn');
    const inventoryGrid = document.getElementById('inventoryGrid');
    const inventoryEmpty = document.getElementById('inventoryEmpty');
    const wishContainer = document.getElementById('wish-container');

    if (!secretBox) return;

    // 从localStorage加载保护的卡牌
    loadProtectedCards();

    // 从localStorage加载秘典之盒位置
    loadSecretBoxPosition();

    // 监听祈愿界面的显示状态
    const observer = new MutationObserver(() => {
        if (wishContainer) {
            const isWishVisible = window.getComputedStyle(wishContainer).display !== 'none';
            secretBox.style.display = isWishVisible ? 'block' : 'none';
        }
    });

    if (wishContainer) {
        observer.observe(wishContainer, {
            attributes: true,
            attributeFilter: ['style']
        });

        // 初始状态检查
        const isWishVisible = window.getComputedStyle(wishContainer).display !== 'none';
        secretBox.style.display = isWishVisible ? 'block' : 'none';
    }

    // 实现秘典之盒拖拽移动功能
    let isDraggingBox = false;
    let boxStartX = 0;
    let boxStartY = 0;
    let boxOffsetX = 0;
    let boxOffsetY = 0;

    secretBox.addEventListener('mousedown', (e) => {
        // 检查是否点击在秘典之盒图片上（不是计数器）
        if (e.target === secretBox || e.target.tagName === 'IMG') {
            isDraggingBox = true;
            boxStartX = e.clientX;
            boxStartY = e.clientY;

            // 获取当前位置
            const rect = secretBox.getBoundingClientRect();
            boxOffsetX = rect.left;
            boxOffsetY = rect.top;

            // 改变光标样式
            secretBox.style.cursor = 'grabbing';

            // 阻止默认行为
            e.preventDefault();
            e.stopPropagation();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDraggingBox) {
            const deltaX = e.clientX - boxStartX;
            const deltaY = e.clientY - boxStartY;

            let newLeft = boxOffsetX + deltaX;
            let newTop = boxOffsetY + deltaY;

            // 限制在窗口范围内
            const maxLeft = window.innerWidth - secretBox.offsetWidth;
            const maxTop = window.innerHeight - secretBox.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            // 更新位置
            secretBox.style.left = newLeft + 'px';
            secretBox.style.top = newTop + 'px';
            secretBox.style.right = 'auto';
            secretBox.style.bottom = 'auto';

            e.preventDefault();
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (isDraggingBox) {
            isDraggingBox = false;
            secretBox.style.cursor = 'pointer';

            // 保存位置到localStorage
            saveSecretBoxPosition();
        }
    });

    // 点击秘典之盒打开背包（只在不是拖拽时触发）
    secretBox.addEventListener('click', (e) => {
        if (!isDraggingBox && Math.abs(e.clientX - boxStartX) < 5 && Math.abs(e.clientY - boxStartY) < 5) {
            openInventory();
        }
    });

    // 关闭背包
    closeInventoryBtn.addEventListener('click', () => {
        closeInventory();
    });

    // 点击背景关闭背包
    inventoryModal.addEventListener('click', (e) => {
        if (e.target === inventoryModal) {
            closeInventory();
        }
    });

    // 设置秘典之盒为拖拽目标（接收卡牌）
    secretBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        secretBox.classList.add('drag-over');
    });

    secretBox.addEventListener('dragleave', () => {
        secretBox.classList.remove('drag-over');
    });

    secretBox.addEventListener('drop', (e) => {
        e.preventDefault();
        secretBox.classList.remove('drag-over');

        // 获取拖拽的卡牌
        if (window.draggedCard) {
            protectCard(window.draggedCard);
        }
    });

    // 更新秘典之盒计数
    updateSecretBoxCount();
}

// 保存秘典之盒位置
function saveSecretBoxPosition() {
    const secretBox = document.getElementById('secretBox');
    if (!secretBox) return;

    const position = {
        left: secretBox.style.left,
        top: secretBox.style.top
    };

    try {
        localStorage.setItem('secretBoxPosition', JSON.stringify(position));
    } catch (e) {
        console.error('保存秘典之盒位置失败:', e);
    }
}

// 加载秘典之盒位置
function loadSecretBoxPosition() {
    const secretBox = document.getElementById('secretBox');
    if (!secretBox) return;

    try {
        const saved = localStorage.getItem('secretBoxPosition');
        if (saved) {
            const position = JSON.parse(saved);
            if (position.left && position.top) {
                secretBox.style.left = position.left;
                secretBox.style.top = position.top;
                secretBox.style.right = 'auto';
                secretBox.style.bottom = 'auto';
            }
        }
    } catch (e) {
        console.error('加载秘典之盒位置失败:', e);
    }
}

// 保护卡牌
function protectCard(card) {
    // 检查卡牌是否已经死亡（武器不检查死亡状态）
    if (card.classList.contains('dead') && card.dataset.type !== '武器') {
        showNotification('无法保护已损坏的卡牌！', 'error');
        return;
    }

    // 检查是否已经保护
    const cardData = extractCardData(card);

    // 对于武器，检查是否已有相同名称和精炼等级的武器
    let existingIndex = -1;
    if (cardData.type === '武器') {
        existingIndex = protectedCards.findIndex(c =>
            c.name === cardData.name &&
            c.type === '武器' &&
            c.refine === cardData.refine
        );
    } else {
        existingIndex = protectedCards.findIndex(c =>
            c.name === cardData.name &&
            c.level === cardData.level &&
            c.health === cardData.health
        );
    }

    if (existingIndex !== -1) {
        showNotification('该卡牌已经被保护！', 'warning');
        return;
    }

    // 添加到保护列表
    protectedCards.push(cardData);

    // 从场上移除卡牌
    if (card.parentNode) {
        card.remove();
    }

    // 保存到localStorage
    saveProtectedCards();

    // 更新计数
    updateSecretBoxCount();

    // 显示通知
    showNotification(`${cardData.name} 已被保护！`, 'success');

    // 播放音效
    soundManager.playSound('cardFlip');
}

// 提取卡牌数据
function extractCardData(card) {
    // 获取图片路径 - 优先从dataset获取
    let imagePath = card.dataset.imagePath || '';

    // 如果dataset中没有，尝试从style中提取
    if (!imagePath) {
        const cardFront = card.querySelector('.card-front');
        if (cardFront) {
            const bgImage = cardFront.style.backgroundImage;
            if (bgImage) {
                // 移除 url("...") 或 url('...') 或 url(...)
                imagePath = bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
            }
        }
    }

    return {
        name: card.dataset.name,
        type: card.dataset.type,
        rarity: card.dataset.rarity,
        level: parseInt(card.dataset.level) || 1,
        health: parseInt(card.dataset.health),
        maxHealth: parseInt(card.dataset.maxHealth),
        attack: parseInt(card.dataset.attack),
        image: imagePath,
        // 武器特殊属性
        refine: card.dataset.refine,
        critRate: card.dataset.critRate,
        elementalMastery: card.dataset.elementalMastery,
        energyRecharge: card.dataset.energyRecharge,
        attackPercent: card.dataset.attackPercent,
        defensePercent: card.dataset.defensePercent,
        weaponName: card.dataset.weaponName,
        // 护盾信息
        shield: card.dataset.shield,
        maxShield: card.dataset.maxShield,
        shieldElement: card.dataset.shieldElement,
        // 装备的武器
        equippedWeapon: card.dataset.equippedWeapon
    };
}

// 打开背包
function openInventory() {
    const inventoryModal = document.getElementById('inventoryModal');
    inventoryModal.style.display = 'flex';
    renderInventory();
}

// 关闭背包
function closeInventory() {
    const inventoryModal = document.getElementById('inventoryModal');
    inventoryModal.style.display = 'none';
}

// 渲染背包
function renderInventory() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    const inventoryEmpty = document.getElementById('inventoryEmpty');

    if (protectedCards.length === 0) {
        inventoryGrid.style.display = 'none';
        inventoryEmpty.style.display = 'block';
        return;
    }

    inventoryGrid.style.display = 'grid';
    inventoryEmpty.style.display = 'none';
    inventoryGrid.innerHTML = '';

    protectedCards.forEach((cardData, index) => {
        const cardElement = createInventoryCard(cardData, index);
        inventoryGrid.appendChild(cardElement);
    });
}

// 创建背包中的卡牌元素
function createInventoryCard(cardData, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'inventory-card';

    // 添加稀有度边框
    if (cardData.rarity === 'ssr') {
        cardDiv.style.border = '3px solid #BD6932';
        cardDiv.style.boxShadow = '0 0 15px rgba(189, 105, 50, 0.6)';
    } else if (cardData.rarity === 'sr') {
        cardDiv.style.border = '3px solid #A256E1';
        cardDiv.style.boxShadow = '0 0 15px rgba(162, 86, 225, 0.6)';
    } else {
        cardDiv.style.border = '3px solid #19a0ea';
        cardDiv.style.boxShadow = '0 0 15px rgba(25, 160, 234, 0.6)';
    }

    // 创建卡牌正面容器
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.style.position = 'relative';
    cardFront.style.width = '100%';
    cardFront.style.height = '100%';

    // 使用img标签显示图片
    if (cardData.image && cardData.image.trim() !== '') {
        const img = document.createElement('img');
        img.src = cardData.image;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
        img.onerror = function() {
            console.error('图片加载失败:', cardData.image);
            // 图片加载失败时显示灰色背景
            cardFront.style.backgroundColor = '#2c3e50';
            img.style.display = 'none';
        };
        cardFront.appendChild(img);
    } else {
        // 没有图片路径时显示灰色背景
        cardFront.style.backgroundColor = '#2c3e50';
    }

    // 始终在顶部显示卡牌名称标签
    const nameLabel = document.createElement('div');
    nameLabel.style.cssText = `
        position: absolute;
        top: 5px;
        left: 5px;
        right: 5px;
        color: white;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        padding: 5px;
        border-radius: 5px;
        z-index: 10;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;
    nameLabel.textContent = cardData.name || '未知卡牌';
    cardFront.appendChild(nameLabel);

    // 添加血条
    if (cardData.type === '角色' || cardData.type === '魔物') {
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar-container';
        const percentage = (cardData.health / cardData.maxHealth) * 100;
        healthBar.innerHTML = `
            <div class="health-bar" style="width: ${percentage}%"></div>
            <div class="health-text">${cardData.health}/${cardData.maxHealth}</div>
        `;
        cardFront.appendChild(healthBar);

        // 添加属性显示
        const statsElement = document.createElement('div');
        statsElement.className = 'card-stats';
        statsElement.textContent = `Lv.${cardData.level} | HP: ${cardData.health}/${cardData.maxHealth} | ATK: ${cardData.attack}`;
        cardFront.appendChild(statsElement);
    }

    // 武器卡显示
    if (cardData.type === '武器') {
        const statsElement = document.createElement('div');
        statsElement.className = 'weapon-stats';

        if (cardData.weaponName && cardData.refine) {
            // 根据武器名称显示特殊属性
            if (cardData.critRate) {
                statsElement.textContent = `精炼 ${cardData.refine}/5 | 攻击: ${cardData.attack} | 暴击率: ${cardData.critRate}%`;
            } else if (cardData.elementalMastery) {
                statsElement.textContent = `精炼 ${cardData.refine}/5 | 攻击: ${cardData.attack} | 元素精通: ${cardData.elementalMastery}`;
            } else if (cardData.energyRecharge) {
                statsElement.textContent = `精炼 ${cardData.refine}/5 | 攻击: ${cardData.attack} | 充能效率: ${cardData.energyRecharge}%`;
            } else if (cardData.attackPercent) {
                statsElement.textContent = `精炼 ${cardData.refine}/5 | 攻击: ${cardData.attack} | 攻击力: ${cardData.attackPercent}%`;
            } else if (cardData.defensePercent) {
                statsElement.textContent = `精炼 ${cardData.refine}/5 | 攻击: ${cardData.attack} | 防御力: ${cardData.defensePercent}%`;
            } else {
                statsElement.textContent = `精炼 ${cardData.refine}/5 | 攻击: ${cardData.attack}`;
            }
        } else {
            statsElement.textContent = `攻击: ${cardData.attack}`;
        }

        cardFront.appendChild(statsElement);
    }

    cardDiv.appendChild(cardFront);

    // 添加操作按钮
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'inventory-card-actions';

    // 升级/精炼按钮
    if (cardData.type === '角色' || cardData.type === '魔物') {
        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'inventory-action-btn upgrade-btn';
        upgradeBtn.textContent = '升级';
        upgradeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            upgradeProtectedCard(index);
        });
        actionsDiv.appendChild(upgradeBtn);
    } else if (cardData.type === '武器') {
        const refineBtn = document.createElement('button');
        refineBtn.className = 'inventory-action-btn upgrade-btn';
        const currentRefine = parseInt(cardData.refine) || 1;
        if (currentRefine >= 5) {
            refineBtn.textContent = '已满精';
            refineBtn.disabled = true;
            refineBtn.style.opacity = '0.5';
            refineBtn.style.cursor = 'not-allowed';
        } else {
            refineBtn.textContent = '精炼';
            refineBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                refineProtectedWeapon(index);
            });
        }
        actionsDiv.appendChild(refineBtn);
    }

    // 移除按钮
    const removeBtn = document.createElement('button');
    removeBtn.className = 'inventory-action-btn remove-btn';
    removeBtn.textContent = '取出';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeProtectedCard(index);
    });
    actionsDiv.appendChild(removeBtn);

    cardDiv.appendChild(actionsDiv);

    return cardDiv;
}

// 升级保护的卡牌
function upgradeProtectedCard(index) {
    const cardData = protectedCards[index];

    // 升级逻辑
    const newLevel = cardData.level + 1;
    const healthIncrease = Math.floor(cardData.maxHealth * 0.1);
    const attackIncrease = Math.floor(cardData.attack * 0.1);

    cardData.level = newLevel;
    cardData.maxHealth += healthIncrease;
    cardData.health += healthIncrease;
    cardData.attack += attackIncrease;

    // 保存更新
    saveProtectedCards();

    // 重新渲染
    renderInventory();

    // 显示通知
    showNotification(`${cardData.name} 升级到 Lv.${newLevel}！`, 'success');

    // 播放音效
    soundManager.playSound('cardFlip');
}

// 精炼保护的武器
function refineProtectedWeapon(index) {
    const cardData = protectedCards[index];

    // 检查是否已达到最大精炼等级
    const currentRefine = parseInt(cardData.refine) || 1;
    if (currentRefine >= 5) {
        showNotification('该武器已达到最大精炼等级！', 'warning');
        return;
    }

    // 精炼逻辑（每次精炼提升8%的攻击力）
    const nextRefine = currentRefine + 1;
    const nextAttack = Math.floor(cardData.attack * 1.08);

    cardData.refine = nextRefine;
    cardData.attack = nextAttack;

    // 如果有暴击率，也提升1%
    if (cardData.critRate) {
        cardData.critRate = parseFloat((parseFloat(cardData.critRate) + 1).toFixed(1));
    }

    // 如果有元素精通，提升8%
    if (cardData.elementalMastery) {
        cardData.elementalMastery = Math.floor(cardData.elementalMastery * 1.08);
    }

    // 如果有充能效率，提升8%
    if (cardData.energyRecharge) {
        cardData.energyRecharge = parseFloat((parseFloat(cardData.energyRecharge) * 1.08).toFixed(1));
    }

    // 如果有攻击力%，提升8%
    if (cardData.attackPercent) {
        cardData.attackPercent = parseFloat((parseFloat(cardData.attackPercent) * 1.08).toFixed(1));
    }

    // 如果有防御力%，提升8%
    if (cardData.defensePercent) {
        cardData.defensePercent = parseFloat((parseFloat(cardData.defensePercent) * 1.08).toFixed(1));
    }

    // 保存更新
    saveProtectedCards();

    // 重新渲染
    renderInventory();

    // 显示通知
    showNotification(`${cardData.name} 精炼到 ${nextRefine}/5！`, 'success');

    // 播放音效
    soundManager.playSound('cardFlip');
}

// 移除保护的卡牌
function removeProtectedCard(index) {
    const cardData = protectedCards[index];

    // 从数组中移除
    protectedCards.splice(index, 1);

    // 保存更新
    saveProtectedCards();

    // 更新计数
    updateSecretBoxCount();

    // 重新渲染
    renderInventory();

    // 显示通知
    showNotification(`${cardData.name} 已取出！`, 'info');

    // 播放音效
    soundManager.playSound('cardFlip');
}

// 更新秘典之盒计数
function updateSecretBoxCount() {
    const countElement = document.querySelector('.secret-box-count');
    if (countElement) {
        countElement.textContent = protectedCards.length;
    }
}

// 保存保护的卡牌到localStorage
function saveProtectedCards() {
    try {
        localStorage.setItem('protectedCards', JSON.stringify(protectedCards));
    } catch (e) {
        console.error('保存保护卡牌失败:', e);
    }
}

// 从localStorage加载保护的卡牌
function loadProtectedCards() {
    try {
        const saved = localStorage.getItem('protectedCards');
        if (saved) {
            protectedCards = JSON.parse(saved);
            updateSecretBoxCount();
        }
    } catch (e) {
        console.error('加载保护卡牌失败:', e);
        protectedCards = [];
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        animation: slideDown 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    // 根据类型设置颜色
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f44336, #da190b)';
            notification.style.color = 'white';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
            notification.style.color = 'white';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
            notification.style.color = 'white';
    }

    document.body.appendChild(notification);

    // 3秒后移除
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 页面加载时初始化秘典之盒
document.addEventListener('DOMContentLoaded', () => {
    initSecretBox();
});
