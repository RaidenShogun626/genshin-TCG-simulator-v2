// 手动加载武器装备功能
function loadWeaponEquip() {
    // 检查 weapon-equip.js 是否已经加载
    if (typeof initWeaponEquip === 'function') {
        console.log('武器装备功能已加载，正在初始化...');
        initWeaponEquip();
        return;
    }
    
    // 动态加载 weapon-equip.js 文件
    const script = document.createElement('script');
    script.src = './js/weapon-equip.js';
    script.onload = function() {
        console.log('weapon-equip.js 加载成功，正在初始化...');
        if (typeof initWeaponEquip === 'function') {
            initWeaponEquip();
        } else {
            console.error('weapon-equip.js 加载成功，但未找到 initWeaponEquip 函数');
        }
    };
    script.onerror = function() {
        console.error('weapon-equip.js 加载失败');
    };
    document.head.appendChild(script);
}

// 当页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWeaponEquip);
} else {
    loadWeaponEquip();
}

// 导出函数，方便在控制台手动调用
if (typeof window !== 'undefined') {
    window.loadWeaponEquip = loadWeaponEquip;
}
