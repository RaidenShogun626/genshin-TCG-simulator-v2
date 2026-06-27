// 武器装备属性检查功能
function initWeaponEquip() {
    // 武器类型映射
    const weaponTypes = {
        'bow': '弓',
        'claymore': '双手剑',
        'sword': '单手剑',
        'catalyst': '法器',
        'polearm': '长枪'
    };

    // 角色武器类型映射
    const characterWeaponType = {
        '温迪': 'bow',
        '钟离': 'polearm',
        '雷电将军': 'polearm',
        '纳西妲': 'catalyst',
        '可莉': 'catalyst',
        '琴': 'sword',
        '迪卢克': 'claymore',
        '优菈': 'claymore',
        '莫娜': 'catalyst',
        '达达利亚': 'bow',
        '荒泷一斗': 'claymore',
        '魈': 'polearm',
        '申鹤': 'polearm',
        '胡桃': 'polearm',
        '刻晴': 'sword',
        '甘雨': 'bow',
        '提纳里': 'bow',
        '赛诺': 'polearm',
        '八重神子': 'catalyst',
        '神里绫华': 'sword',
        '神里绫人': 'sword',
        '宵宫': 'bow',
        '珊瑚宫心海': 'catalyst',
        '凯亚': 'sword',
        '安柏': 'bow',
        '芭芭拉': 'catalyst',
        '诺艾尔': 'claymore',
        '迪奥娜': 'bow',
        '菲谢尔': 'bow',
        '砂糖': 'catalyst',
        '雷泽': 'claymore',
        '班尼特': 'sword',
        '凝光': 'catalyst',
        '北斗': 'claymore',
        '行秋': 'sword',
        '重云': 'claymore',
        '香菱': 'polearm',
        '丝柯克': 'sword',
        '爱可菲': 'polearm',
        '柯莱': 'bow',
        '九条裟罗': 'bow'
    };

    // 武器名称到类型的映射
    const weaponNameToType = {
        '阿莫斯之弓': 'bow',
        '千夜浮梦': 'catalyst',
        '薙草之稻光': 'polearm',
        '天空之卷': 'catalyst',
        '天空之翼': 'bow',
        '天空之脊': 'polearm',
        '狼的末路': 'claymore',
        '祭礼剑': 'sword',
        '祭礼残章': 'catalyst',
        '祭礼大剑': 'claymore',
        '祭礼弓': 'bow',
        '千岩长枪': 'polearm',
        '鸦羽弓': 'bow',
        '白铁大剑': 'claymore',
        '魔导绪论': 'catalyst',
        '旅行剑': 'sword',
        '白缨枪': 'polearm'
    };

    // 检查角色和武器装备功能
    window.checkWeaponEquip = function(characterName, weaponName) {
        const charType = characterWeaponType[characterName];
        const weaponType = weaponNameToType[weaponName];

        if (!charType) {
            return { success: false, message: `未找到角色 ${characterName} 的武器类型信息` };
        }

        if (!weaponType) {
            return { success: false, message: `未找到武器 ${weaponName} 的类型信息` };
        }

        if (charType === weaponType) {
            return { 
                success: true, 
                message: `${characterName} 可以装备 ${weaponName}（${weaponTypes[weaponType]}）` 
            };
        } else {
            return { 
                success: false, 
                message: `${characterName} 使用 ${weaponTypes[charType]}，无法装备 ${weaponName}（${weaponTypes[weaponType]}）` 
            };
        }
    };
}

// 自动初始化
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWeaponEquip);
    } else {
        initWeaponEquip();
    }
}
