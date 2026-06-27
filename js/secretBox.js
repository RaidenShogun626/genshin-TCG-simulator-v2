// 秘典之盒系统 - Secret Box System
// 负责卡牌保护、背包管理、命之座和武器精炼系统
// 保护的卡牌数组

// 初始化秘典之盒
function initSecretBox() {
    const secretBox = document.getElementById('secretBox');
    const inventoryModal = document.getElementById('inventoryModal');
    const closeInventoryBtn = document.getElementById('closeInventoryBtn');
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
        if (e.target === secretBox || e.target.tagName === 'IMG') {
            isDraggingBox = true;
            boxStartX = e.clientX;
            boxStartY = e.clientY;
            
            const rect = secretBox.getBoundingClientRect();
            boxOffsetX = rect.left;
            boxOffsetY = rect.top;
            
            secretBox.style.cursor = 'grabbing';
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
            
            const maxLeft = window.innerWidth - secretBox.offsetWidth;
            const maxTop = window.innerHeight - secretBox.offsetHeight;
            
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            
            secretBox.style.left = newLeft + 'px';
            secretBox.style.top = newTop + 'px';
            secretBox.style.right = 'auto';
            secretBox.style.bottom = 'auto';
            
            e.preventDefault();
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isDraggingBox) {
            isDraggingBox = false;
            secretBox.style.cursor = 'pointer';
            saveSecretBoxPosition();
        }
    });
    
    // 点击秘典之盒打开背包
    secretBox.addEventListener('click', (e) => {
        if (!isDraggingBox && Math.abs(e.clientX - boxStartX) < 5 && Math.abs(e.clientY - boxStartY) < 5) {
            openInventory();
        }
    });
    
    // 关闭背包
    if (closeInventoryBtn) {
        closeInventoryBtn.addEventListener('click', () => {
            closeInventory();
        });
    }
    
    // 点击背景关闭背包
    if (inventoryModal) {
        inventoryModal.addEventListener('click', (e) => {
            if (e.target === inventoryModal) {
                closeInventory();
            }
        });
    }
    
    // 设置秘典之盒为拖拽目标
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
        
        if (window.draggedCard) {
            protectCard(window.draggedCard);
        }
    });
    
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

// 保护卡牌（支持命之座和武器精炼）
function protectCard(card) {
    if (card.classList.contains('dead') && card.dataset.type !== '武器') {
        showNotification('无法保护已损坏的卡牌！', 'error');
        return;
    }
    
    const cardData = extractCardData(card);
    
    // 武器精炼系统
    if (cardData.type === '武器') {
        const existingWeaponIndex = protectedCards.findIndex(c => 
            c.name === cardData.name && c.type === '武器'
        );
        
        if (existingWeaponIndex !== -1) {
            const existingWeapon = protectedCards[existingWeaponIndex];
            const currentRefine = parseInt(existingWeapon.refine) || 1;
            
            if (currentRefine >= 5) {
                showNotification(`${cardData.name} 已达到最大精炼等级（5/5）！`, 'warning');
                return;
            }
            
            existingWeapon.refine = currentRefine + 1;
            existingWeapon.attack = Math.floor(existingWeapon.attack * 1.08);
            
            if (existingWeapon.critRate) {
                existingWeapon.critRate = (parseFloat(existingWeapon.critRate) * 1.08).toFixed(1);
            }
            if (existingWeapon.elementalMastery) {
                existingWeapon.elementalMastery = (parseFloat(existingWeapon.elementalMastery) * 1.08).toFixed(1);
            }
            if (existingWeapon.energyRecharge) {
                existingWeapon.energyRecharge = (parseFloat(existingWeapon.energyRecharge) * 1.08).toFixed(1);
            }
            if (existingWeapon.attackPercent) {
                existingWeapon.attackPercent = (parseFloat(existingWeapon.attackPercent) * 1.08).toFixed(1);
            }
            if (existingWeapon.defensePercent) {
                existingWeapon.defensePercent = (parseFloat(existingWeapon.defensePercent) * 1.08).toFixed(1);
            }
            
            if (card.parentNode) card.remove();
            saveProtectedCards();
            renderInventory();
            showNotification(`${cardData.name} 精炼至 ${existingWeapon.refine}/5！`, 'success');
            if (typeof soundManager !== 'undefined') soundManager.playSound('cardFlip');
            return;
        }
    }
    
    // 命之座系统
    if (cardData.type === '角色' || cardData.type === '魔物') {
        const existingCharIndex = protectedCards.findIndex(c => 
            c.name === cardData.name && (c.type === '角色' || c.type === '魔物')
        );
        
        if (existingCharIndex !== -1) {
            const existingChar = protectedCards[existingCharIndex];
            const currentConstellation = existingChar.constellation || 0;
            
            if (currentConstellation >= 6) {
                showNotification(`${cardData.name} 命之座已满（C6），已放入秘典之盒！`, 'info');
                if (!cardData.constellation) cardData.constellation = 0;
                protectedCards.push(cardData);
                if (card.parentNode) card.remove();
                saveProtectedCards();
                updateSecretBoxCount();
                if (typeof soundManager !== 'undefined') soundManager.playSound('cardFlip');
                return;
            }
            
            existingChar.constellation = currentConstellation + 1;
            const hpBonus = Math.floor(existingChar.maxHealth * 0.05);
            const atkBonus = Math.floor(existingChar.attack * 0.05);
            
            existingChar.maxHealth += hpBonus;
            existingChar.health += hpBonus;
            existingChar.attack += atkBonus;
            
            if (card.parentNode) card.remove();
            saveProtectedCards();
            renderInventory();
            
            const constellationText = existingChar.constellation === 6 ? 'C6（满命）' : `C${existingChar.constellation}`;
            showNotification(`${cardData.name} 命之座提升至 ${constellationText}！`, 'success');
            if (typeof soundManager !== 'undefined') soundManager.playSound('cardFlip');
            return;
        }
    }
    
    // 初始化新卡牌
    if ((cardData.type === '角色' || cardData.type === '魔物') && !cardData.constellation) {
        cardData.constellation = 0;
    }
    if (cardData.type === '武器' && !cardData.refine) {
        cardData.refine = 1;
    }
    
    protectedCards.push(cardData);
    if (card.parentNode) card.remove();
    saveProtectedCards();
    updateSecretBoxCount();
    showNotification(`${cardData.name} 已被保护！`, 'success');
    if (typeof soundManager !== 'undefined') soundManager.playSound('cardFlip');
}

// 提取卡牌数据
function extractCardData(card) {
    let imagePath = card.dataset.imagePath || '';
    
    if (!imagePath) {
        const cardFront = card.querySelector('.card-front');
        if (cardFront) {
            const bgImage = cardFront.style.backgroundImage;
            if (bgImage) {
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
        refine: card.dataset.refine,
        critRate: card.dataset.critRate,
        elementalMastery: card.dataset.elementalMastery,
        energyRecharge: card.dataset.energyRecharge,
        attackPercent: card.dataset.attackPercent,
        defensePercent: card.dataset.defensePercent,
        weaponName: card.dataset.weaponName,
        shield: card.dataset.shield,
        maxShield: card.dataset.maxShield,
        shieldElement: card.dataset.shieldElement,
        equippedWeapon: card.dataset.equippedWeapon,
        constellation: parseInt(card.dataset.constellation) || 0
    };
}

// 打开背包
function openInventory() {
    const inventoryModal = document.getElementById('inventoryModal');
    if (inventoryModal) {
        inventoryModal.style.display = 'flex';
        renderInventory();
    }
}

// 关闭背包
function closeInventory() {
    const inventoryModal = document.getElementById('inventoryModal');
    if (inventoryModal) {
        inventoryModal.style.display = 'none';
    }
}

// 渲染背包
function renderInventory() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    const inventoryEmpty = document.getElementById('inventoryEmpty');
    
    if (!inventoryGrid || !inventoryEmpty) return;
    
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
    
    // 添加拖拽功能（角色/魔物用于命之座，武器用于装备）
    if (cardData.type === '角色' || cardData.type === '魔物' || cardData.type === '武器') {
        cardDiv.draggable = true;
        
        cardDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('cardName', cardData.name);
            e.dataTransfer.setData('cardType', cardData.type);
            e.dataTransfer.setData('sourceIndex', index);
            
            // 创建自定义拖拽预览（完全不透明）
            const dragImage = cardDiv.cloneNode(true);
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.opacity = '1';
            dragImage.style.transform = 'scale(0.95)';
            dragImage.style.pointerEvents = 'none';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 75, 100);
            
            // 延迟删除预览元素
            setTimeout(() => dragImage.remove(), 0);
            
            // 原卡牌变半透明
            cardDiv.style.opacity = '0.4';
        });
        
        cardDiv.addEventListener('dragend', (e) => {
            cardDiv.style.opacity = '1';
        });
        
        // 接收拖拽（用于命之座叠加或武器装备）
        cardDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            cardDiv.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
            cardDiv.style.transform = 'scale(1.05)';
        });
        
        cardDiv.addEventListener('dragleave', (e) => {
            cardDiv.style.boxShadow = '';
            cardDiv.style.transform = '';
        });
        
        cardDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            cardDiv.style.boxShadow = '';
            cardDiv.style.transform = '';
            
            const draggedName = e.dataTransfer.getData('cardName');
            const draggedType = e.dataTransfer.getData('cardType');
            const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'));
            
            // 武器拖到角色上 → 装备武器
            if (draggedType === '武器' && cardData.type === '角色') {
                equipWeaponInInventory(index, sourceIndex);
            }
            // 同名角色拖到一起 → 叠加命之座
            else if (draggedName === cardData.name && draggedType === cardData.type && (cardData.type === '角色' || cardData.type === '魔物')) {
                mergeConstellation(sourceIndex, index);
            } else {
                showNotification('只能将同名角色拖到一起叠加命之座，或将武器拖到角色上装备！', 'warning');
            }
        });
    }
    
    // 稀有度边框
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
    
    // 卡牌正面
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.style.cssText = 'position: relative; width: 100%; height: 100%;';
    
    // 图片
    if (cardData.image && cardData.image.trim() !== '') {
        const img = document.createElement('img');
        img.src = cardData.image;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
        img.onerror = function() {
            cardFront.style.backgroundColor = '#2c3e50';
            img.style.display = 'none';
        };
        cardFront.appendChild(img);
    } else {
        cardFront.style.backgroundColor = '#2c3e50';
    }
    
    // 名称标签（显示命之座）
    const nameLabel = document.createElement('div');
    nameLabel.style.cssText = `
        position: absolute; top: 5px; left: 5px; right: 5px;
        color: white; font-size: 12px; font-weight: bold;
        text-align: center; padding: 5px; border-radius: 5px;
        z-index: 10; white-space: nowrap; overflow: hidden;
        text-overflow: ellipsis;
    `;
    
    if ((cardData.type === '角色' || cardData.type === '魔物') && cardData.constellation > 0) {
        nameLabel.textContent = `${cardData.name} C${cardData.constellation}`;
    } else {
        nameLabel.textContent = cardData.name || '未知卡牌';
    }
    cardFront.appendChild(nameLabel);
    
    // 血条（角色/魔物）
    if (cardData.type === '角色' || cardData.type === '魔物') {
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar-container';
        const percentage = (cardData.health / cardData.maxHealth) * 100;
        healthBar.innerHTML = `
            <div class="health-bar" style="width: ${percentage}%"></div>
            <div class="health-text">${cardData.health}/${cardData.maxHealth}</div>
        `;
        cardFront.appendChild(healthBar);
        
        const statsElement = document.createElement('div');
        statsElement.className = 'card-stats';
        statsElement.textContent = `Lv.${cardData.level} | HP: ${cardData.health}/${cardData.maxHealth} | ATK: ${cardData.attack}`;
        cardFront.appendChild(statsElement);
        
        // 为角色添加装备栏
        if (cardData.type === '角色') {
            const equipmentSlot = document.createElement('div');
            equipmentSlot.className = 'equipment-slot';
            equipmentSlot.style.cssText = `
                position: absolute;
                right: -30px;
                top: 50%;
                transform: translateY(-50%);
                width: 40px;
                height: 40px;
                background-color: #4A3728;
                border: 2px solid #8B6F47;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                z-index: 10;
            `;
            equipmentSlot.title = '装备栏';
            
            // 如果已装备武器，显示武器图标
            if (cardData.equippedWeapon) {
                const weaponImg = document.createElement('img');
                weaponImg.src = `../images/${cardData.equippedWeapon}.png`;
                weaponImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
                weaponImg.onerror = function() {
                    this.src = `../images/3star/Traverler_Sword.png`;
                };
                equipmentSlot.appendChild(weaponImg);
                
                // 点击卸下武器
                equipmentSlot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    unequipWeaponInInventory(index);
                });
            }
            
            cardFront.appendChild(equipmentSlot);
        }
    }
    
    // 武器属性
    if (cardData.type === '武器') {
        const statsElement = document.createElement('div');
        statsElement.className = 'weapon-stats';
        
        if (cardData.weaponName && cardData.refine) {
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
    
    // 操作按钮
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'inventory-card-actions';
    
    // 升级按钮
    if (cardData.type === '角色' || cardData.type === '魔物') {
        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'inventory-action-btn upgrade-btn';
        
        const maxLevel = (cardData.constellation > 0) ? 100 : 90;
        const currentLevel = parseInt(cardData.level) || 1;
        
        if (currentLevel >= maxLevel) {
            upgradeBtn.textContent = '已满级';
            upgradeBtn.disabled = true;
            upgradeBtn.style.opacity = '0.5';
            upgradeBtn.style.cursor = 'not-allowed';
        } else {
            upgradeBtn.textContent = `升级 (${currentLevel}/${maxLevel})`;
            
            // 长按升级功能
            let pressTimer = null;
            let upgradeInterval = null;
            
            upgradeBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                
                // 单击升级1级
                upgradeProtectedCard(index);
                
                // 500ms后开始连续升级
                pressTimer = setTimeout(() => {
                    upgradeInterval = setInterval(() => {
                        const card = protectedCards[index];
                        if (!card) {
                            clearInterval(upgradeInterval);
                            return;
                        }
                        
                        const currentMaxLevel = (card.constellation > 0) ? 100 : 90;
                        if (card.level >= currentMaxLevel) {
                            clearInterval(upgradeInterval);
                            return;
                        }
                        
                        upgradeProtectedCard(index, true); // silent模式
                    }, 100); // 每100ms升1级
                }, 500);
            });

            upgradeBtn.addEventListener('mouseleave', (e) => {
                if (pressTimer) clearTimeout(pressTimer);
                if (upgradeInterval) {
                    clearInterval(upgradeInterval);
                    // 长按结束后重新渲染背包并显示通知
                    renderInventory();
                    const card = protectedCards[index];
                    if (card) {
                        showNotification(`${card.name} 当前等级 Lv.${card.level}`, 'success');
                        if (typeof soundManager !== 'undefined') {
                            soundManager.playSound('expUp');
                        }
                    }
                }
            });
        }
        actionsDiv.appendChild(upgradeBtn);
    }
    
    // 取出按钮
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
function upgradeProtectedCard(index, silent = false) {
    const cardData = protectedCards[index];
    
    // 确保level是数字类型
    cardData.level = parseInt(cardData.level) || 1;
    cardData.constellation = parseInt(cardData.constellation) || 0;
    
    const maxLevel = (cardData.constellation > 0) ? 90 : 100;

    if (cardData.level >= maxLevel) {
        if (!silent) {
            const message = (cardData.constellation > 0)
                ? `${cardData.name} 已达到最大等级（Lv.${maxLevel}）！`
                : `${cardData.name} 已达到最大等级（Lv.90）！解锁命之座后可升至Lv.100`;
            showNotification(message, 'warning');
        }
        return;
    }
    
    const newLevel = cardData.level + 1;
    
    // 确保不超过上限
    if (newLevel > maxLevel) {
        cardData.level = maxLevel;
        if (!silent) {
            showNotification(`${cardData.name} 已达到最大等级（Lv.${maxLevel}）！`, 'warning');
        }
        return;
    }
    
    const healthIncrease = Math.floor(cardData.maxHealth * 0.1);
    const attackIncrease = Math.floor(cardData.attack * 0.1);

    cardData.level = newLevel;
    cardData.maxHealth += healthIncrease;
    cardData.health += healthIncrease;
    cardData.attack += attackIncrease;
    
    saveProtectedCards();
    
    if (!silent) {
        renderInventory();
        showNotification(`${cardData.name} 升级到 Lv.${newLevel}！`, 'success');
        
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('expUp');
        }
    }
}

// 取出卡牌到场上
function removeProtectedCard(index) {
    const cardData = protectedCards[index];
    
    protectedCards.splice(index, 1);
    saveProtectedCards();
    updateSecretBoxCount();
    
    // 创建卡牌DOM元素
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.name = cardData.name;
    card.dataset.type = cardData.type;
    card.dataset.rarity = cardData.rarity;
    card.dataset.level = cardData.level;
    card.dataset.health = cardData.health;
    card.dataset.maxHealth = cardData.maxHealth;
    card.dataset.attack = cardData.attack;
    card.dataset.imagePath = cardData.image;
    
    if (cardData.constellation) card.dataset.constellation = cardData.constellation;
    
    if (cardData.type === '武器') {
        if (cardData.refine) card.dataset.refine = cardData.refine;
        if (cardData.critRate) card.dataset.critRate = cardData.critRate;
        if (cardData.elementalMastery) card.dataset.elementalMastery = cardData.elementalMastery;
        if (cardData.energyRecharge) card.dataset.energyRecharge = cardData.energyRecharge;
        if (cardData.attackPercent) card.dataset.attackPercent = cardData.attackPercent;
        if (cardData.defensePercent) card.dataset.defensePercent = cardData.defensePercent;
        if (cardData.weaponName) card.dataset.weaponName = cardData.weaponName;
    }
    
    if (cardData.shield) card.dataset.shield = cardData.shield;
    if (cardData.maxShield) card.dataset.maxShield = cardData.maxShield;
    if (cardData.shieldElement) card.dataset.shieldElement = cardData.shieldElement;
    if (cardData.equippedWeapon) card.dataset.equippedWeapon = cardData.equippedWeapon;
    
    let cardBackClass;
    switch (cardData.rarity) {
        case "ssr": cardBackClass = "ssr-card-back"; break;
        case "sr": cardBackClass = "sr-card-back"; break;
        default: cardBackClass = "r-card-back";
    }
    
    card.innerHTML = `
        <div class="${cardBackClass}"></div>
        <div class="card-front" style="background-image: url(${cardData.image})"></div>
    `;
    
    const cardBox = document.querySelector('.card-box');
    if (cardBox) cardBox.appendChild(card);
    
    renderInventory();
    closeInventory();
    showNotification(`${cardData.name} 已取出到场上！`, 'info');
    if (typeof soundManager !== 'undefined') soundManager.playSound('cardFlip');
}

// 更新秘典之盒计数
function updateSecretBoxCount() {
    const countElement = document.querySelector('.secret-box-count');
    if (countElement) {
        countElement.textContent = protectedCards.length;
    }
}

// 保存到localStorage
function saveProtectedCards() {
    try {
        localStorage.setItem('protectedCards', JSON.stringify(protectedCards));
    } catch (e) {
        console.error('保存保护卡牌失败:', e);
    }
}

// 从localStorage加载
function loadProtectedCards() {
    try {
        const saved = localStorage.getItem('protectedCards');
        if (saved) {
            protectedCards = JSON.parse(saved);
            
            // 确保所有数值字段都是数字类型
            protectedCards.forEach(card => {
                card.level = parseInt(card.level) || 1;
                card.constellation = parseInt(card.constellation) || 0;
                card.health = parseInt(card.health) || 0;
                card.maxHealth = parseInt(card.maxHealth) || 0;
                card.attack = parseInt(card.attack) || 0;
                
                // 确保等级不超过上限
                const maxLevel = (card.constellation > 0) ? 100 : 90;
                if (card.level > maxLevel) {
                    card.level = maxLevel;
                }
            });
            
            updateSecretBoxCount();
        }
    } catch (e) {
        console.error('加载保护卡牌失败:', e);
        protectedCards = [];
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    initSecretBox();
});

// 显示通知
function showNotification(message, type = 'info') {
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
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 添加通知动画CSS
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(notificationStyle);


// 合并命之座（拖拽背包中的同名角色）
function mergeConstellation(sourceIndex, targetIndex) {
    // 重新查找卡牌（因为索引可能已经变化）
    const draggedCard = protectedCards[sourceIndex];
    const targetCard = protectedCards[targetIndex];
    
    if (!draggedCard || !targetCard) {
        console.error('卡牌未找到', sourceIndex, targetIndex);
        return;
    }
    
    // 不能拖到自己身上
    if (sourceIndex === targetIndex) return;
    
    // 检查是否是同名角色/魔物
    if (draggedCard.name !== targetCard.name) {
        showNotification('只能将同名角色拖到一起叠加命之座！', 'warning');
        return;
    }
    
    // 获取目标卡的命之座
    const targetConstellation = parseInt(targetCard.constellation) || 0;
    
    // 检查是否已经满命
    if (targetConstellation >= 6) {
        showNotification(`${targetCard.name} 命之座已满（C6）！`, 'warning');
        return;
    }
    
    // 提升命之座（每次+1）
    targetCard.constellation = targetConstellation + 1;
    
    // 增加5% HP和ATK
    const hpBonus = Math.floor(targetCard.maxHealth * 0.05);
    const atkBonus = Math.floor(targetCard.attack * 0.05);
    
    targetCard.maxHealth += hpBonus;
    targetCard.health += hpBonus;
    targetCard.attack += atkBonus;
    
    // 删除被拖拽的卡牌（注意：如果sourceIndex > targetIndex，删除后索引不变）
    protectedCards.splice(sourceIndex, 1);
    
    // 保存并重新渲染
    saveProtectedCards();
    updateSecretBoxCount();
    renderInventory();
    
    const constellationText = targetCard.constellation === 6 ? 'C6（满命）' : `C${targetCard.constellation}`;
    showNotification(`${targetCard.name} 命之座提升至 ${constellationText}！`, 'success');
    
    if (typeof soundManager !== 'undefined') {
        soundManager.playSound('cardFlip');
    }
}


// 卸下背包中角色的武器
function unequipWeaponInInventory(characterIndex) {
    const character = protectedCards[characterIndex];
    if (!character || !character.equippedWeapon) return;
    
    const weaponName = character.equippedWeapon;
    const weaponAttack = parseInt(character.equippedWeaponAttack) || 0;
    
    // 恢复角色攻击力
    character.attack -= weaponAttack;
    delete character.equippedWeapon;
    delete character.equippedWeaponAttack;
    
    // 保存并重新渲染
    saveProtectedCards();
    renderInventory();
    
    showNotification(`已卸下 ${weaponName}`, 'info');
    if (typeof soundManager !== 'undefined') {
        soundManager.playSound('cardFlip');
    }
}

// 装备武器到背包中的角色
function equipWeaponInInventory(characterIndex, weaponIndex) {
    const character = protectedCards[characterIndex];
    const weapon = protectedCards[weaponIndex];
    
    if (!character || !weapon) return;
    if (character.type !== '角色') return;
    if (weapon.type !== '武器') return;
    
    // 如果已装备武器，先卸下
    // if (character.equippedWeapon) {
    //     const oldWeaponAttack = parseInt(character.equippedWeaponAttack) || 0;
    //     character.attack -= oldWeaponAttack;
    // }
    //
    // 装备新武器
    const weaponAttack = parseInt(weapon.attack) || 0;
    character.equippedWeapon = weapon.name;
    character.equippedWeaponAttack = weaponAttack;
    character.attack += weaponAttack;
    
    // 删除武器卡牌
    protectedCards.splice(weaponIndex, 1);
    
    // 保存并重新渲染
    saveProtectedCards();
    updateSecretBoxCount();
    renderInventory();
    
    showNotification(`${character.name} 装备了 ${weapon.name}！`, 'success');
    if (typeof soundManager !== 'undefined') {
        soundManager.playSound('cardFlip');
    }
}
