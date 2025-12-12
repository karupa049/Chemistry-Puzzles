// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start';
let menuOpen = false;
let gameAreaWidth;
let clickStartedInGameArea = false;

// --- 周期表・タワー関連 ---
let periodicTableElements = [];
let placedGameElements = [];
let draggingElement = null;

// ★追加: 最後に操作したユニットの情報（パネル表示用）
let lastSelectedUnit = null; 
// ★追加: 最後にヒントを表示した対象（レシピヒント固定用）
let lastHintTarget = null; 

// --- 敵・基地・弾丸・障害物関連 ---
let enemies = [];
let mainTower;
let bullets = [];
let shockwaves = [];      
let gameObstacles = [];
let lastSpawnTime = 0;
const SPAWN_INTERVAL = 1000;
let enemiesSpawned = 0;       
let enemiesDefeated = 0;      
const TOTAL_ENEMIES_TO_SPAWN = 100; 

// --- エネルギー（コスト）関連 ---
let currentEnergy = 100;
let maxEnergy = 1000;
let energyRegenPerSecond = 5;
let enemyKillReward = 15;

// --- 元素ごとのコスト定義 ---
let elementCosts = {};

// --- ステージエディター関連 ---
let editorState = 'path';
let obstacles = [];
let pathNodes = [];
let placementAreas = [];
let draggingNode = null;

// 定数
const MENU_BUTTON_Y = 8;
const MENU_BUTTON_SIZE = 40;
const REACTION_DISTANCE = 80; 
const OBSTACLE_SIZE = 40;
const PATH_NODE_SIZE = 20;

// ===================================
// 2. 合成レシピの定義
// ===================================
const recipes = [
    { name: 'NO2', ingredients: { 'N': 1, 'O': 2 }, core: 'N', color: '#A0522D', range: 220, rate: 200, baseHp: 170 },
    { name: 'HCl', ingredients: { 'H': 1, 'Cl': 1 }, core: 'Cl', color: '#FFFFE0', range: 160, rate: 300, baseHp: 120 },
    { name: 'H2S', ingredients: { 'H': 2, 'S': 1 }, core: 'S', color: '#FFFF00', range: 190, rate: 400, baseHp: 130 },
    { name: 'NH3', ingredients: { 'N': 1, 'H': 3 }, core: 'N', color: '#4169E1', range: 180, rate: 500, baseHp: 160 },
    { name: 'NaCl', ingredients: { 'Na': 1, 'Cl': 1 }, core: 'Na', color: '#F0F8FF', range: 170, rate: 800, baseHp: 140 },
    { name: 'H2O', ingredients: { 'H': 2, 'O': 1 }, core: 'O', color: '#ADD8E6', range: 200, rate: 1000, baseHp: 150 },
    { name: 'CO2', ingredients: { 'C': 1, 'O': 2 }, core: 'C', color: '#A9A9A9', range: 180, rate: 1200, baseHp: 180 },
    { name: 'CuO', ingredients: { 'Cu': 1, 'O': 1 }, core: 'Cu', color: '#333333', range: 200, rate: 1500, baseHp: 250 },
    { name: 'FeS', ingredients: { 'Fe': 1, 'S': 1 }, core: 'Fe', color: '#8B4513', range: 150, rate: 900, baseHp: 300 }
];
// ===================================
// 3. setup / 周期表データ
// ===================================
const elementData = [
    { symbol: 'H', row: 1, col: 1 },  { symbol: 'He', row: 1, col: 18 },
    { symbol: 'Li', row: 2, col: 1 }, { symbol: 'Be', row: 2, col: 2 },
    { symbol: 'B', row: 2, col: 13 }, { symbol: 'C', row: 2, col: 14 }, { symbol: 'N', row: 2, col: 15 }, { symbol: 'O', row: 2, col: 16 }, { symbol: 'F', row: 2, col: 17 }, { symbol: 'Ne', row: 2, col: 18 },
    { symbol: 'Na', row: 3, col: 1 }, { symbol: 'Mg', row: 3, col: 2 },
    { symbol: 'Al', row: 3, col: 13 }, { symbol: 'Si', row: 3, col: 14 }, { symbol: 'P', row: 3, col: 15 }, { symbol: 'S', row: 3, col: 16 }, { symbol: 'Cl', row: 3, col: 17 }, { symbol: 'Ar', row: 3, col: 18 },
    { symbol: 'K', row: 4, col: 1 }, { symbol: 'Ca', row: 4, col: 2 }, { symbol: 'Sc', row: 4, col: 3 }, { symbol: 'Ti', row: 4, col: 4 }, { symbol: 'V', row: 4, col: 5 }, { symbol: 'Cr', row: 4, col: 6 }, { symbol: 'Mn', row: 4, col: 7 }, { symbol: 'Fe', row: 4, col: 8 }, { symbol: 'Co', row: 4, col: 9 }, { symbol: 'Ni', row: 4, col: 10 }, { symbol: 'Cu', row: 4, col: 11 }, { symbol: 'Zn', row: 4, col: 12 },
    { symbol: 'Ga', row: 4, col: 13 }, { symbol: 'Ge', row: 4, col: 14 }, { symbol: 'As', row: 4, col: 15 }, { symbol: 'Se', row: 4, col: 16 }, { symbol: 'Br', row: 4, col: 17 }, { symbol: 'Kr', row: 4, col: 18 },
    { symbol: 'Rb', row: 5, col: 1 }, { symbol: 'Sr', row: 5, col: 2 }, { symbol: 'Y', row: 5, col: 3 }, { symbol: 'Zr', row: 5, col: 4 }, { symbol: 'Nb', row: 5, col: 5 }, { symbol: 'Mo', row: 5, col: 6 }, { symbol: 'Tc', row: 5, col: 7 }, { symbol: 'Ru', row: 5, col: 8 }, { symbol: 'Rh', row: 5, col: 9 }, { symbol: 'Pd', row: 5, col: 10 }, { symbol: 'Ag', row: 5, col: 11 }, { symbol: 'Cd', row: 5, col: 12 },
    { symbol: 'In', row: 5, col: 13 }, { symbol: 'Sn', row: 5, col: 14 }, { symbol: 'Sb', row: 5, col: 15 }, { symbol: 'Te', row: 5, col: 16 }, { symbol: 'I', row: 5, col: 17 }, { symbol: 'Xe', row: 5, col: 18 },
    { symbol: 'Cs', row: 6, col: 1 }, { symbol: 'Ba', row: 6, col: 2 }, { symbol: 'La', row: 6, col: 3 }, { symbol: 'Hf', row: 6, col: 4 }, { symbol: 'Ta', row: 6, col: 5 }, { symbol: 'W', row: 6, col: 6 }, { symbol: 'Re', row: 6, col: 7 }, { symbol: 'Os', row: 6, col: 8 }, { symbol: 'Ir', row: 6, col: 9 }, { symbol: 'Pt', row: 6, col: 10 }, { symbol: 'Au', row: 6, col: 11 }, { symbol: 'Hg', row: 6, col: 12 },
    { symbol: 'Tl', row: 6, col: 13 }, { symbol: 'Pb', row: 6, col: 14 }, { symbol: 'Bi', row: 6, col: 15 }, { symbol: 'Po', row: 6, col: 16 }, { symbol: 'At', row: 6, col: 17 }, { symbol: 'Rn', row: 6, col: 18 },
    { symbol: 'Fr', row: 7, col: 1 }, { symbol: 'Ra', row: 7, col: 2 }, { symbol: 'Ac', row: 7, col: 3 }, { symbol: 'Rf', row: 7, col: 4 }, { symbol: 'Db', row: 7, col: 5 }, { symbol: 'Sg', row: 7, col: 6 }, { symbol: 'Bh', row: 7, col: 7 }, { symbol: 'Hs', row: 7, col: 8 }, { symbol: 'Mt', row: 7, col: 9 }, { symbol: 'Ds', row: 7, col: 10 }, { symbol: 'Rg', row: 7, col: 11 }, { symbol: 'Cn', row: 7, col: 12 },
    { symbol: 'Nh', row: 7, col: 13 }, { symbol: 'Fl', row: 7, col: 14 }, { symbol: 'Mc', row: 7, col: 15 }, { symbol: 'Lv', row: 7, col: 16 }, { symbol: 'Ts', row: 7, col: 17 }, { symbol: 'Og', row: 7, col: 18 }
];

const recipeElements = new Set(recipes.flatMap(r => Object.keys(r.ingredients)));
const activeElements = Array.from(recipeElements).filter(symbol => elementData.some(e => e.symbol === symbol));
activeElements.push('H', 'O', 'C', 'N', 'Cl', 'Cu', 'Fe', 'S', 'Na');

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block'); 
    
    gameAreaWidth = width / 2;

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault(); 
    });

    for (let el of elementData) {
        elementCosts[el.symbol] = 5 + (el.row * 10);
    }
    
    setupPeriodicTable();
}

function setupPeriodicTable() {
    periodicTableElements = [];
    let gridMargin = 2; 
    let availableWidth = (width - gameAreaWidth) - 20; 
    let gridCellSize = (availableWidth / 18) - gridMargin;
    gridCellSize = max(gridCellSize, 20); 
    
    let totalCellSize = gridCellSize + gridMargin;
    let gridStartX = gameAreaWidth + 10; 
    let gridStartY = 60; 
    
    for (const elData of elementData) {
        let x = gridStartX + (elData.col - 1) * totalCellSize;
        let y = gridStartY + (elData.row - 1) * totalCellSize;
        let isActive = activeElements.includes(elData.symbol);
        periodicTableElements.push(
            new PeriodicElement(elData.symbol, x, y, gridCellSize, isActive)
        );
    }
}


// ===================================
// 4. draw()関数
// ===================================
function draw() {
    if (gameState === 'start') {
        drawStartScreen();

    } else if (gameState === 'stage' || gameState === 'gameover' || gameState === 'win') {
        background(100, 150, 100);

        drawGrid();
        drawAreas();

        for (let el of periodicTableElements) { el.draw(); }
        drawCostTooltip();

        drawPlacementAreas(); 
        for (let bar of gameObstacles) { bar.draw(); }
        drawPathNodes(); 

        if (mainTower) { mainTower.draw(); }
        for (let el of placedGameElements) { el.draw(); }
        // drawCombinationHints(); // ★削除: マウス付近のヒントは廃止
        for (let b of bullets) { b.draw(); }
        drawShockwaves(); 
        for (let e of enemies) { e.draw(); }
        
        if (draggingElement) {
            fill(draggingElement.color);
            stroke(0);
            strokeWeight(2);
            ellipse(mouseX, mouseY, draggingElement.size, draggingElement.size);
            
            let c = color(draggingElement.color);
            let brightness = red(c) * 0.299 + green(c) * 0.587 + blue(c) * 0.114;
            fill(brightness > 128 ? 0 : 255);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(draggingElement.size * 0.6);
            text(draggingElement.name, mouseX, mouseY);
        }

        if (!menuOpen && gameState === 'stage') {
            updateGameLogic();
        }

        // UI描画
        drawUnitInfoPanel(); // 左パネル
        drawRecipeHintPanel(); // 右パネル(旧ログ)
        drawEnergyBar();
        drawDefeatedCount();
        
        drawMenuOverlay();

        if (gameState === 'gameover') {
            drawGameOverScreen();
        } else if (gameState === 'win') {
            drawWinScreen();
        }

    } else if (gameState === 'editor') {
        drawEditorScreen();
    }
}

function drawAreas() {
    fill(200);
    noStroke();
    rect(gameAreaWidth, 0, width - gameAreaWidth, height);
    stroke(0);
    strokeWeight(4);
    line(gameAreaWidth, 0, gameAreaWidth, height);
    noStroke();
    fill(100);
    textAlign(LEFT, TOP);
    textSize(16);
    text("■ ゲームエリア", 10, 10);
    text("■ 周期表エリア", gameAreaWidth + 10, 10);
}


// ===================================
// 5. マウス操作
// ===================================
function mousePressed() {
    if (gameState === 'start') {
        if (mouseY < height / 2 + 100 && mouseY > height / 2) {
            gameState = 'stage';
            initializeStage();
            return;
        }
        if (mouseY > height / 2 + 150 && mouseY < height / 2 + 200) {
            gameState = 'editor';
            initializeEditor();
            return;
        }
        return;
    }

    if (gameState === 'stage') {
        if (mouseX < gameAreaWidth) {
            clickStartedInGameArea = true;
        } else {
            clickStartedInGameArea = false;
        }

        let buttonX = width - MENU_BUTTON_SIZE - 8;
        if (mouseX > buttonX && mouseX < buttonX + MENU_BUTTON_SIZE &&
            mouseY > MENU_BUTTON_Y && mouseY < MENU_BUTTON_Y + MENU_BUTTON_SIZE) {
            menuOpen = !menuOpen;
            return;
        }

        if (menuOpen) {
            const BUTTON_W = 200;
            const BUTTON_H = 50;
            let centerX = width / 2;
            let centerY = height / 2;
            let btnX = centerX - BUTTON_W / 2;
            let btnY = centerY - BUTTON_H / 2;

            if (mouseX > btnX && mouseX < btnX + BUTTON_W &&
                mouseY > btnY && mouseY < btnY + BUTTON_H) {
                gameState = 'start'; 
                menuOpen = false;    
            }
            return;
        }

        if (!menuOpen) {
            if (mouseX < gameAreaWidth) {
                for(let el of placedGameElements) {
                    if (dist(mouseX, mouseY, el.x, el.y) < el.size / 2) {
                        updateInfoPanelFromUnit(el);
                        // ★追加: ヒントパネル用ターゲットも更新
                        if(!el.reacted) lastHintTarget = el;
                    }
                }
            }

            for (let el of periodicTableElements) {
                if (el.isMouseOver()) {
                    draggingElement = {
                        name: el.name,
                        color: el.color,
                        size: el.size + 10
                    };
                    updateInfoPanelFromElement(el.name);
                    return;
                }
            }
            
            if (mouseX < gameAreaWidth && draggingElement) {
                if (mouseButton === LEFT || mouseButton === RIGHT) { 
                    let isPlaced = performElementPlacement(draggingElement.name, mouseX, mouseY, draggingElement.size);
                    if (isPlaced) {
                        draggingElement = null;
                    }
                    return;
                }
            }
        }
        return;
    }

    if (gameState === 'editor') {
        handleEditorMousePressed();
        return;
    }

    if (gameState === 'gameover' || gameState === 'win') {
        const BUTTON_W = 200;
        const BUTTON_H = 50;
        let centerX = width / 2;
        let centerY = height / 2;
        let restartX = centerX - BUTTON_W / 2;
        let restartY = centerY;
        let titleX = centerX - BUTTON_W / 2;
        let titleY = centerY + BUTTON_H + 20;
        
        if (mouseX > restartX && mouseX < restartX + BUTTON_W &&
            mouseY > restartY && mouseY < restartY + BUTTON_H) {
            if (gameState === 'win') {
                gameState = 'start';
            } else {
                initializeStage();
                gameState = 'stage';
            }
            return;
        }
        
        if (gameState === 'gameover' && mouseX > titleX && mouseX < titleX + BUTTON_W &&
            mouseY > titleY && mouseY < titleY + BUTTON_H) {
            gameState = 'start';
            return;
        }
    }
}

function mouseReleased() {
    if (gameState === 'stage' && draggingElement) {
        if (!clickStartedInGameArea && mouseX < gameAreaWidth) {
            performElementPlacement(draggingElement.name, mouseX, mouseY, draggingElement.size);
            draggingElement = null; 
        } 
        return;
    }

    if (gameState === 'editor') {
        if (editorState === 'placement' && draggingNode && draggingNode.isStart && draggingNode.endX !== undefined) {
            let x1 = draggingNode.x;
            let y1 = draggingNode.y;
            let x2 = draggingNode.endX;
            let y2 = draggingNode.endY;

            let newArea = {
                x: min(x1, x2),
                y: min(y1, y2),
                w: abs(x1 - x2),
                h: abs(y1 - y2)
            };
            if (newArea.w > 10 && newArea.h > 10) {
                placementAreas.push(newArea);
            }
        }
        draggingNode = null;
    }
}

function mouseDragged() {
    if (gameState === 'editor' && mouseX < gameAreaWidth) {
        if (editorState === 'path' && draggingNode) {
            draggingNode.x = mouseX;
            draggingNode.y = mouseY;
        } else if (editorState === 'placement' && draggingNode && draggingNode.isStart) { 
            draggingNode.endX = mouseX;
            draggingNode.endY = mouseY;
        }
    }
}


// ===================================
// 6. ロジック更新・初期化
// ===================================

function updateGameLogic() {
    if (currentEnergy < maxEnergy) {
        let recoveryAmount = energyRegenPerSecond * (deltaTime / 1000);
        currentEnergy += recoveryAmount;
        currentEnergy = min(currentEnergy, maxEnergy);
    }

    // --- 敵の生成ロジック ---
    let currentInterval;
    if (enemiesSpawned < 5) {
        currentInterval = 4000;
    } else if (enemiesSpawned < 15) {
        currentInterval = 2000;
    } else if (enemiesSpawned < 30) {
        currentInterval = 1200;
    } else {
        currentInterval = 800;
    }

    if (millis() - lastSpawnTime > currentInterval) {
        if (enemiesSpawned < TOTAL_ENEMIES_TO_SPAWN) {
            
            let enemyType = 'normal';
            if (enemiesSpawned > 0 && enemiesSpawned % 10 === 0) {
                enemyType = 'tank'; 
            } else if (enemiesSpawned > 0 && enemiesSpawned % 4 === 0) {
                enemyType = 'erratic';
            }

            if (pathNodes.length > 0) {
                enemies.push(new Enemy(pathNodes[0].x, pathNodes[0].y, pathNodes, enemyType));
            } else if (100 < gameAreaWidth) {
                enemies.push(new Enemy(100, 100, [], enemyType));
            }
            
            enemiesSpawned++;
            lastSpawnTime = millis();
        }
    }

    // ★追加: 最初に全タワーのステータスをリセット（バフの重複防止のため）
    for (let tower of placedGameElements) {
        tower.resetStats();
    }

    // ★変更: タワーの更新処理 (引数に placedGameElements を渡して他タワーを参照可能にする)
    for (let tower of placedGameElements) {
        if (tower.isDead()) continue;
        tower.update(placedGameElements); // ← 引数を追加
        tower.findTargetAndAttack(enemies, bullets);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.update();
        let hitEnemy = bullet.hitscan(enemies);
        
        if (hitEnemy) {
            // ★変更: 弾丸のタイプによる分岐
            if (bullet.isExplosive) {
                // FeSの爆発処理
                
                // 1. 直撃ダメージ（100%）を即座に与える
                // ※これがないと、爆風ダメージが下がった分、直撃した敵へのダメージも減ってしまいます
                hitEnemy.takeDamage(bullet.damage * 0.7);
                // 2. 爆風を生成（ダメージを 0.3倍 に設定）
                // これにより周囲（および直撃した敵への追加ダメージ）が30%になります
                shockwaves.push(new Shockwave(hitEnemy.x, hitEnemy.y, 100, bullet.damage * 0.3, enemies));
                
            } else if (bullet.isPoison) {
                // H2Sの毒付与
                hitEnemy.takeDamage(bullet.damage * 0.2);
                hitEnemy.applyPoison(bullet.damage * 0.1, 20000); 
            } else {
                // 通常弾
                hitEnemy.takeDamage(bullet.damage);
            }
            
            bullets.splice(i, 1);
            continue;
        }
        // ... (画面外判定はそのまま) ...
        if (bullet.x < 0 || bullet.x > gameAreaWidth || bullet.y < 0 || bullet.y > height) {
            bullets.splice(i, 1);
        }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        e.updateStatus(); // ★追加: 毒などの状態異常更新

        e.isCollidingWithTower = false;
        if (mainTower && mainTower.isAlive()) {
            let distance = dist(e.x, e.y, mainTower.x, mainTower.y);
            if (distance < e.radius + mainTower.radius) {
                e.isCollidingWithTower = true;
                mainTower.takeDamage(1);
            }
        }

        e.followPath(gameObstacles); 
        e.findTargetAndAttack(placedGameElements, shockwaves);

        if (e.isDead() || e.x < 0 || e.y < 0 || e.x > width || e.y > height) {
            if (e.isDead()) {
                let reward = 0;
                if (e.type === 'tank') {
                    reward = enemyKillReward * 5; 
                } else if (e.type === 'erratic') {
                    reward = enemyKillReward * 2; 
                } else {
                    reward = enemyKillReward / 2; 
                }

                currentEnergy += reward;
                currentEnergy = min(currentEnergy, maxEnergy);
                enemiesDefeated++;
            }
            enemies.splice(i, 1);
        }
    }
    
    placedGameElements = placedGameElements.filter(el => !el.isDead());

    for (let i = gameObstacles.length - 1; i >= 0; i--) {
        if (gameObstacles[i].isBroken()) {
            gameObstacles.splice(i, 1);
        }
    }
    
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        if (shockwaves[i].isFinished()) {
            shockwaves.splice(i, 1);
        } else {
            shockwaves[i].update();
        }
    }

    // findCombinationHints(); // ★削除: マウス付近のヒント計算は不要
    checkAndPerformReactions();

    if (mainTower && !mainTower.isAlive()) {
        gameState = 'gameover';
    } else if (enemiesDefeated === TOTAL_ENEMIES_TO_SPAWN && enemies.length === 0 && enemiesSpawned === TOTAL_ENEMIES_TO_SPAWN) {
        gameState = 'win';
    }
}

function initializeStage() {
    console.log("ステージ初期化完了");
    menuOpen = false;
    enemies = [];
    placedGameElements = [];
    bullets = [];
    shockwaves = [];
    combinationHints = [];
    lastSpawnTime = millis();
    lastSelectedUnit = null; 
    lastHintTarget = null; // ★リセット

    gameObstacles = [];
    for(let obs of obstacles) {
        gameObstacles.push(new Barricade(obs.x, obs.y, obs.size)); 
    }

    let towerX, towerY;
    if (pathNodes.length > 0) {
        towerX = pathNodes[pathNodes.length - 1].x;
        towerY = pathNodes[pathNodes.length - 1].y;
    } else {
        towerX = gameAreaWidth - 50;
        towerY = height / 2;
    }

    mainTower = new MainTower(towerX, towerY, 60);
    currentEnergy = 100;
    enemiesSpawned = 0; 
    enemiesDefeated = 0;
    loop();
}

function initializeEditor() {
    console.log("エディター初期化完了");
    editorState = 'path';
    if (pathNodes.length === 0) {
        pathNodes.push({ x: 50, y: height / 4, radius: 20, isStart: true });
        pathNodes.push({ x: gameAreaWidth - 50, y: height / 2, radius: 20, isStart: false });
    }
}


function performElementPlacement(elementName, x, y, size) {
    let cost = elementCosts[elementName] || 0;
    
    let isOverlapping = false;
    for(let obs of gameObstacles) {
        if(dist(x, y, obs.x, obs.y) < obs.size/2 + size/2) {
            isOverlapping = true;
            break;
        }
    }
    
    let isInPlacementArea = false;
    if (placementAreas.length === 0) {
        isInPlacementArea = true;
    } else {
        for (let area of placementAreas) {
            if (x > area.x && x < area.x + area.w &&
                y > area.y && y < area.y + area.h) {
                isInPlacementArea = true;
                break;
            }
        }
    }

    if (!isOverlapping && isInPlacementArea) {
        if (currentEnergy >= cost) {
            currentEnergy -= cost;
            let newEl = new PlacedElement(
                elementName,
                x,
                y,
                size,
                cost
            );
            placedGameElements.push(newEl);
            
            updateInfoPanelFromUnit(newEl);
            // ★追加: 配置した元素をヒント対象にする
            if(!newEl.reacted) lastHintTarget = newEl;

            console.log(elementName + "を配置しました。残エネルギー: " + currentEnergy);
            return true;
        } else {
            console.log("エネルギー不足！");
            return false;
        }
    }
    return false;
}


// ===================================
// 7. UIの描画
// ===================================

function drawStartScreen() {
    background(50, 50, 100);
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text('タワーディフェンス', width / 2, height / 2 - 50);

    fill(50, 200, 50);
    rect(width / 2 - 100, height / 2, 200, 50, 5);
    fill(255);
    textSize(24);
    text('ゲーム開始', width / 2, height / 2 + 25);

    fill(50, 50, 200);
    rect(width / 2 - 100, height / 2 + 150, 200, 50, 5);
    fill(255);
    textSize(24);
    text('エディター', width / 2, height / 2 + 175);
}

function drawEditorScreen() {
    background(100, 150, 100);
    drawGrid();
    drawAreas();

    drawObstacles(); 
    drawPathNodes();
    drawPlacementAreas(); 
    drawPlacementPreview(); 
    
    for (let el of placedGameElements) { 
        push();
        drawingContext.globalAlpha = 0.5;
        el.draw(); 
        pop();
    }

    push();
    rectMode(CORNER);
    fill(200, 200, 255, 180);
    rect(gameAreaWidth + 10, height - 120, width - gameAreaWidth - 20, 110, 5);
    fill(0);
    textSize(20);
    textAlign(LEFT, TOP);
    text("■ エディターモード", gameAreaWidth + 20, height - 110);
    text("現在のモード: " + editorState, gameAreaWidth + 20, height - 80);
    pop(); 

    drawEditorButtons();
}

function drawEditorButtons() {
    const BUTTON_W = 100;
    const BUTTON_H = 30;
    const START_X = gameAreaWidth + 20;
    const START_Y = height - 50;
    const MARGIN = 10;
    let x = START_X;

    let buttons = [
        { mode: 'path', label: '経路設定', color: [255, 100, 100] },
        { mode: 'obstacle', label: '障害物', color: [100, 100, 100] },
        { mode: 'placement', label: '設置エリア', color: [100, 255, 100] },
    ];

    for (let i = 0; i < buttons.length; i++) {
        let btn = buttons[i];
        let isSelected = btn.mode === editorState;
        if (isSelected) {
            fill(btn.color[0], btn.color[1], btn.color[2], 255);
        } else if (mouseX > x && mouseX < x + BUTTON_W && mouseY > START_Y && mouseY < START_Y + BUTTON_H) {
            fill(btn.color[0], btn.color[1], btn.color[2], 180);
        } else {
            fill(btn.color[0], btn.color[1], btn.color[2], 100);
        }
        rect(x, START_Y, BUTTON_W, BUTTON_H, 5);
        fill(255);
        textSize(14);
        textAlign(CENTER, CENTER);
        text(btn.label, x + BUTTON_W / 2, START_Y + BUTTON_H / 2);
        x += BUTTON_W + MARGIN;
    }

    const BACK_BUTTON_W = 150;
    let backX = width - BACK_BUTTON_W - 10;
    let backY = height - 50;
    if (mouseX > backX && mouseX < backX + BACK_BUTTON_W && mouseY > backY && mouseY < backY + BUTTON_H) {
        fill(255, 50, 50);
    } else {
        fill(200, 50, 50);
    }
    rect(backX, backY, BACK_BUTTON_W, BUTTON_H, 5);
    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);
    text('タイトルに戻る', backX + BACK_BUTTON_W / 2, backY + BUTTON_H / 2);
}

// Energyバー
function drawEnergyBar() {
    let barWidth = (width - gameAreaWidth) - 60; 
    let barHeight = 25;
    let barX = gameAreaWidth + 30; 
    let barY = height - 20 - barHeight; 

    fill(50);
    noStroke();
    rectMode(CORNER);
    rect(barX, barY, barWidth, barHeight, 5);

    let currentBarWidth = map(currentEnergy, 0, maxEnergy, 0, barWidth);
    fill(50, 150, 255);
    rect(barX, barY, currentBarWidth, barHeight, 5);

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    let energyText = `${floor(currentEnergy)} / ${maxEnergy}`;
    text(energyText, barX + barWidth / 2, barY + barHeight / 2);

    fill(0);
    textAlign(LEFT, BOTTOM);
    textSize(14);
    text("ENERGY", barX, barY - 5);
}

// Defeatedバー
function drawDefeatedCount() {
    let barWidth = (width - gameAreaWidth) - 60;
    let barHeight = 25;
    let barX = gameAreaWidth + 30;
    let barY = height - 45 - 25 - 40; 

    fill(50);
    noStroke();
    rectMode(CORNER);
    rect(barX, barY, barWidth, barHeight, 5);

    let progressRatio = map(enemiesDefeated, 0, TOTAL_ENEMIES_TO_SPAWN, 0, 1);
    let currentBarWidth = barWidth * progressRatio;
    fill(255, 165, 0); 
    rect(barX, barY, currentBarWidth, barHeight, 5);

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    let countText = `ENEMIES: ${enemiesDefeated} / ${TOTAL_ENEMIES_TO_SPAWN}`;
    text(countText, barX + barWidth / 2, barY + barHeight / 2);

    fill(0);
    textAlign(LEFT, BOTTOM);
    textSize(14);
    text("DEFEATED", barX, barY - 5);
}

// UNIT INFO: 左半分
function drawUnitInfoPanel() {
    let sideBarW = width - gameAreaWidth;
    let tableAvailableW = sideBarW - 20;
    let gridCellSize = (tableAvailableW / 18) - 2;
    gridCellSize = max(gridCellSize, 20);
    let totalCellSize = gridCellSize + 2;
    let tableBottomY = 60 + (7 * totalCellSize);

    let footerTopY = height - 160; 

    let spaceX = gameAreaWidth + 10;
    let spaceY = tableBottomY + 10; 
    let spaceW = sideBarW - 20;
    let spaceH = footerTopY - spaceY - 10; 

    if (spaceH < 50) return;

    let panelX = spaceX;
    let panelY = spaceY;
    let gap = 10;
    let panelW = (spaceW - gap) / 2; 
    let panelH = spaceH;

    fill(0, 0, 0, 150);
    stroke(255);
    strokeWeight(2);
    rectMode(CORNER);
    rect(panelX, panelY, panelW, panelH, 10);

    let textSizeRatio = min(panelW, panelH) * 0.15;
    textSizeRatio = constrain(textSizeRatio, 18, 36);
    
    noStroke();
    fill(255);
    textSize(textSizeRatio); 
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text("UNIT INFO", panelX + 10, panelY + 10);

    if (lastSelectedUnit) {
        let circleSize = min(panelW * 0.4, panelH * 0.6);
        let circleX = panelX + panelW * 0.25;
        let circleY = panelY + panelH * 0.55;

        stroke(0);
        strokeWeight(2);
        fill(lastSelectedUnit.color);
        ellipse(circleX, circleY, circleSize, circleSize);

        fill(lastSelectedUnit.textColor || 0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(circleSize * 0.6); 
        textStyle(NORMAL);
        text(lastSelectedUnit.name, circleX, circleY);

        let textX = panelX + panelW * 0.48;
        let startTextY = panelY + panelH * 0.2;
        
        let infoTextSize = min(panelW * 0.08, panelH * 0.08); 
        infoTextSize = constrain(infoTextSize, 12, 22); 
        let lineHeight = infoTextSize * 1.5;

        fill(255);
        textAlign(LEFT, TOP);
        textSize(infoTextSize); 

        text(`Name: ${lastSelectedUnit.name}`, textX, startTextY);
        text(`HP: ${lastSelectedUnit.hpStr}`, textX, startTextY + lineHeight);
        text(`Atk: ${lastSelectedUnit.attack}`, textX, startTextY + lineHeight * 2);
        text(`Rng: ${lastSelectedUnit.range}`, textX, startTextY + lineHeight * 3);
        // ★修正: Rateの表示
        if (lastSelectedUnit.isBuffed) {
            fill(0, 255, 100); // 緑色
            // 元のレートを表示し、1.5倍速であることを明記
            // ※内部的には間隔が短くなっていますが、表示上は「元の値 (1.5倍)」とすることで強化感を出す
            text(`Rate: ${Math.floor(lastSelectedUnit.baseRate)} (x1.5)`, textX, startTextY + lineHeight * 4);
        } else {
            fill(255); // 通常色
            text(`Rate: ${lastSelectedUnit.rate}`, textX, startTextY + lineHeight * 4);
        }
    } else {
        fill(200);
        textAlign(CENTER, CENTER);
        textSize(textSizeRatio);
        text("No Select", panelX + panelW / 2, panelY + panelH / 2);
    }
}

// ★修正: レシピヒントパネル（右半分）- ログの代わりに表示
function drawRecipeHintPanel() {
    let sideBarW = width - gameAreaWidth;
    let tableAvailableW = sideBarW - 20;
    let gridCellSize = (tableAvailableW / 18) - 2;
    gridCellSize = max(gridCellSize, 20);
    let totalCellSize = gridCellSize + 2;
    let tableBottomY = 60 + (7 * totalCellSize);
    let footerTopY = height - 160; 

    let spaceX = gameAreaWidth + 10;
    let spaceY = tableBottomY + 10; 
    let spaceW = sideBarW - 20;
    let spaceH = footerTopY - spaceY - 10; 

    if (spaceH < 50) return;

    let gap = 10;
    let halfW = (spaceW - gap) / 2; 
    let panelX = spaceX + halfW + gap;
    let panelY = spaceY;
    let panelW = halfW;
    let panelH = spaceH;

    // 背景
    fill(0, 0, 0, 150);
    stroke(255);
    strokeWeight(2);
    rectMode(CORNER);
    rect(panelX, panelY, panelW, panelH, 10);

    // タイトル
    let textSizeRatio = min(panelW, panelH) * 0.15;
    textSizeRatio = constrain(textSizeRatio, 18, 36);

    noStroke();
    fill(255);
    textSize(textSizeRatio);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text("RECIPE HINT", panelX + 10, panelY + 10);

    // ★修正: lastHintTarget を使用して、マウスが離れてもヒントを表示し続ける
    if (!lastHintTarget) {
        fill(200);
        textAlign(CENTER, CENTER);
        // テキストサイズ調整
        textSize(textSizeRatio * 0.6);
        text("Select Unit", panelX + panelW / 2, panelY + panelH / 2);
        return;
    }

    // 表示設定
    let contentTextSize = min(panelW * 0.08, panelH * 0.08);
    contentTextSize = constrain(contentTextSize, 12, 22);
    textSize(contentTextSize);
    textStyle(NORMAL);
    let lineHeight = contentTextSize * 1.5;
    let startY = panelY + panelH * 0.2; // タイトルの下から

    // レシピ検索と表示
    textAlign(LEFT, TOP);
    let guideList = [];

    // lastHintTarget についてのレシピを検索
    for (let recipe of recipes) {
        if (!recipe.ingredients[lastHintTarget.name]) continue;

        let needed = { ...recipe.ingredients };
        needed[lastHintTarget.name]--;

        // 現在の周囲の状況に基づいて不足分を計算
        // (注意: lastHintTargetが破壊されている可能性もあるが、座標情報が残っていれば計算可能)
        let neighbors = placedGameElements.filter(el => 
            el !== lastHintTarget && 
            !el.reacted && 
            !el.isDead() &&
            dist(lastHintTarget.x, lastHintTarget.y, el.x, el.y) < REACTION_DISTANCE
        );
        
        for (let n of neighbors) {
            if (needed[n.name] > 0) {
                needed[n.name]--;
            }
        }

        let missingParts = [];
        for (let key in needed) {
            if (needed[key] > 0) {
                missingParts.push(`${key}x${needed[key]}`);
            }
        }

        if (missingParts.length > 0) {
            guideList.push({
                name: recipe.name,
                missing: missingParts.join(', '), 
                color: recipe.color
            });
        }
    }

    // 表示ループ
    if (guideList.length === 0) {
        fill(200);
        text("No recipes available.", panelX + 10, startY);
    } else {
        let currentY = startY;
        for (let guide of guideList) {
            // レシピ名 (色付き)
            fill(guide.color);
            textStyle(BOLD);
            text(`★ ${guide.name}`, panelX + 10, currentY);
            
            // 足りない素材
            fill(255);
            textStyle(NORMAL);
            text(`   Need: ${guide.missing}`, panelX + 10, currentY + lineHeight);
            
            currentY += lineHeight * 2.2; // 次のレシピへ
            
            if (currentY > panelY + panelH - 10) break;
        }
    }
}

// パネル情報更新ヘルパー
function updateInfoPanelFromElement(elementName) {
    let colorVal = '#CCCCCC';
    let textColor = 0;
    
    let myData = elementData.find(e => e.symbol === elementName);
    if (myData) {
        colorMode(HSB, 360, 100, 100);
        let h = map(myData.col, 1, 18, 0, 330);
        let s = map(myData.row, 1, 7, 30, 90);  
        let b = map(myData.row, 1, 7, 100, 40); 
        colorVal = color(h, s, b);
        textColor = (b > 70 ? 0 : 255);
        colorMode(RGB); 
    }

    let cost = elementCosts[elementName] || 0;

    lastSelectedUnit = {
        name: elementName,
        color: colorVal,
        textColor: textColor,
        hpStr: "100/100", 
        attack: cost, 
        range: 150,
        rate: 1000
    };
}

// パネル情報更新ヘルパー
function updateInfoPanelFromUnit(unitObj) {
    let c = color(unitObj.color);
    let brightnessVal = red(c) * 0.299 + green(c) * 0.587 + blue(c) * 0.114;
    let textColor = (brightnessVal > 128 ? 0 : 255);

    // ★追加: 攻撃力の表示用テキストを作成
    let attackDisplay = floor(unitObj.attackDamage); // デフォルト

    if (unitObj.name === 'H2S') {
        // H2Sの場合: 直撃(20%) + 毒アイコン的なテキスト
        // もし直撃を1倍に戻した場合は * 0.2 を消してください
        let directDmg = floor(unitObj.attackDamage * 0.2); 
        attackDisplay = `${directDmg} + Poison`; 
    } 
    else if (unitObj.name === 'FeS') {
        // FeSの場合: 爆発であることを明記
        attackDisplay = `${floor(unitObj.attackDamage)} (Area)`;
    }

    lastSelectedUnit = {
        name: unitObj.name,
        color: unitObj.color,
        textColor: textColor,
        hpStr: `${floor(unitObj.hp)}/${unitObj.maxHp}`,
        attack: attackDisplay,
        range: unitObj.range,
        rate: unitObj.fireRate,
        baseRate: unitObj.baseFireRate, // ★追加: 元のレート情報を渡す
        isBuffed: unitObj.isBuffed // ★追加: バフ状態を渡す
    };
}


function drawCostTooltip() {
    let hoveredEl = periodicTableElements.find(el => el.isMouseOver() && el.isActive);
    if (hoveredEl) {
        let cost = elementCosts[hoveredEl.name];
        if (cost !== undefined) {
            let tooltipW = 60;
            let tooltipH = 30;
            let x = mouseX + 15;
            let y = mouseY + 15;
            if (x + tooltipW > width) x = mouseX - tooltipW - 15;
            if (y + tooltipH > height) y = mouseY - tooltipH - 15;
            fill(0, 0, 0, 200);
            noStroke();
            rectMode(CORNER);
            rect(x, y, tooltipW, tooltipH, 5);
            fill(255);
            textSize(14);
            textAlign(LEFT, CENTER);
            text(`Cost: ${cost}`, x + 8, y + tooltipH / 2);
        }
    }
}

function drawMenuOverlay() {
    let buttonX = width - MENU_BUTTON_SIZE - 8;
    if (gameState !== 'gameover' && gameState !== 'win') {
        drawMenuButton(buttonX, MENU_BUTTON_Y, MENU_BUTTON_SIZE, menuOpen);
    }
    if (menuOpen) {
        drawMenuPanel();
    }
}

function drawMenuButton(x, y, size, isOpen) {
    noStroke();
    fill(0, 0, 0, 150);
    rect(x, y, size, size, 5);
    fill(255);
    let h = size * 0.1;
    let w = size * 0.6;
    let offset = size * 0.25;

    if (!isOpen) {
        rect(x + offset / 2, y + offset, w, h);
        rect(x + offset / 2, y + size / 2 - h / 2, w, h);
        rect(x + offset / 2, y + size - offset - h, w, h);
    } else {
        push();
        translate(x + size / 2, y + size / 2);
        rectMode(CENTER);
        rotate(PI / 4);
        rect(0, 0, w, h);
        rotate(PI / 2);
        rect(0, 0, w, h);
        pop();
    }
}

function drawMenuPanel() {
    fill(0, 0, 0, 200);
    rectMode(CORNER);
    rect(width / 2 - 150, height / 2 - 100, 300, 200, 10);
    drawBackButton(width / 2, height / 2);
}

function drawBackButton(centerX, centerY) {
    const BUTTON_W = 200;
    const BUTTON_H = 50;
    let x = centerX - BUTTON_W / 2;
    let y = centerY - BUTTON_H / 2;

    if (mouseX > x && mouseX < x + BUTTON_W && mouseY > y && mouseY < y + BUTTON_H && menuOpen) {
        fill(255, 100, 100);
    } else {
        fill(255, 50, 50);
    }
    rectMode(CORNER);
    rect(x, y, BUTTON_W, BUTTON_H, 5);
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('スタート画面に戻る', centerX, centerY);
}

function drawGameOverScreen() {
    fill(0, 0, 0, 180);
    rectMode(CORNER);
    rect(0, 0, width, height);

    fill(255, 0, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text('GAME OVER', width / 2, height / 2 - 100);

    const BUTTON_W = 200;
    const BUTTON_H = 50;
    let centerX = width / 2;
    let centerY = height / 2;
    let restartX = centerX - BUTTON_W / 2;
    let restartY = centerY;
    let titleX = centerX - BUTTON_W / 2;
    let titleY = centerY + BUTTON_H + 20;

    if (mouseX > restartX && mouseX < restartX + BUTTON_W &&
        mouseY > restartY && mouseY < restartY + BUTTON_H) {
        fill(100, 255, 100);
    } else {
        fill(50, 200, 50);
    }
    rectMode(CORNER);
    rect(restartX, restartY, BUTTON_W, BUTTON_H, 5);
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('リスタート', centerX, restartY + BUTTON_H / 2);

    if (mouseX > titleX && mouseX < titleX + BUTTON_W &&
        mouseY > titleY && mouseY < titleY + BUTTON_H) {
        fill(100, 100, 255);
    } else {
        fill(50, 50, 200);
    }
    rectMode(CORNER);
    rect(titleX, titleY, BUTTON_W, BUTTON_H, 5);
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('タイトルに戻る', centerX, titleY + BUTTON_H / 2);
}

function drawWinScreen() {
    fill(0, 0, 0, 180);
    rectMode(CORNER);
    rect(0, 0, width, height);

    fill(0, 255, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text('STAGE CLEAR!', width / 2, height / 2 - 100);

    const BUTTON_W = 200;
    const BUTTON_H = 50;
    let centerX = width / 2;
    let centerY = height / 2;
    let restartX = centerX - BUTTON_W / 2;
    let restartY = centerY;

    if (mouseX > restartX && mouseX < restartX + BUTTON_W &&
        mouseY > restartY && mouseY < restartY + BUTTON_H && gameState === 'win') {
        fill(100, 100, 255);
    } else {
        fill(50, 50, 200);
    }
    rectMode(CORNER);
    rect(restartX, restartY, BUTTON_W, BUTTON_H, 5);
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('タイトルに戻る', centerX, restartY + BUTTON_H / 2);
}

function drawShockwaves() {
    for (let sw of shockwaves) {
        sw.draw();
    }
}


// ===================================
// 8. 合成・反応ロジック
// ===================================

function checkAndPerformReactions() {
    let unreactedElements = placedGameElements.filter(el => !el.reacted && !el.isDead());
    
    for (let recipe of recipes) {
        let coreName = recipe.core;
        
        let coreCandidates = unreactedElements.filter(el => el.name === coreName);
        
        for (let coreEl of coreCandidates) {
            if (coreEl.reacted || coreEl.isDead()) continue; 

            let requiredIngredients = { ...recipe.ingredients };
            
            if (requiredIngredients[coreName] > 0) {
                requiredIngredients[coreName]--;
            }

            let foundIngredients = [];
            let allIngredientsFound = true;
            let totalCost = elementCosts[coreName]; 

            for (let ingName in requiredIngredients) {
                let countNeeded = requiredIngredients[ingName];
                
                if (countNeeded <= 0) continue;

                let neighbors = unreactedElements.filter(el => 
                    el !== coreEl && 
                    !el.reacted && 
                    !el.isDead() &&
                    !foundIngredients.includes(el) && 
                    el.name === ingName && 
                    dist(coreEl.x, coreEl.y, el.x, el.y) < REACTION_DISTANCE
                );

                if (neighbors.length >= countNeeded) {
                    for(let i=0; i<countNeeded; i++) {
                        foundIngredients.push(neighbors[i]);
                        totalCost += elementCosts[ingName]; 
                    }
                } else {
                    allIngredientsFound = false;
                    break;
                }
            }

            if (allIngredientsFound) {
                console.log(recipe.name + " 反応成功！");
                
                let sumX = coreEl.x;
                let sumY = coreEl.y;
                let sumSize = coreEl.size;
                
                let consumedElements = [coreEl, ...foundIngredients];

                for(let ing of foundIngredients) {
                    sumX += ing.x;
                    sumY += ing.y;
                    sumSize += ing.size;
                }

                let count = consumedElements.length;
                let avgX = sumX / count;
                let avgY = sumY / count;
                let newSize = sumSize / count;

                let calculatedDamage = totalCost * 2;
                
                placedGameElements = placedGameElements.filter(el => !consumedElements.includes(el));

                let newMolecule = new PlacedElement(
                    recipe.name, 
                    avgX, 
                    avgY, 
                    newSize, 
                    calculatedDamage,
                    recipe.baseHp
                );
                placedGameElements.push(newMolecule);

                updateInfoPanelFromUnit(newMolecule);
                // ★追加: 合成時もヒント対象を更新（もし必要なら）
                
                return; 
            }
        }
    }
}

// ※ findCombinationHints / drawCombinationHints は削除しました

// ===================================
// 9. クラス定義 (PeriodicElementなど)
// ===================================

class PeriodicElement {
    constructor(name, x, y, size, isActive) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.isActive = isActive;
        
        if (this.isActive) {
            let myData = elementData.find(e => e.symbol === name);
            if (myData) {
                colorMode(HSB, 360, 100, 100);
                let h = map(myData.col, 1, 18, 0, 330);
                let s = map(myData.row, 1, 7, 30, 90);  
                let b = map(myData.row, 1, 7, 100, 40); 
                
                this.color = color(h, s, b);
                this.brightnessVal = b; 
                colorMode(RGB); 
            } else {
                this.color = '#AAAAAA';
                this.brightnessVal = 50;
            }
        } else {
            this.color = '#BBBBBB';
            this.brightnessVal = 50;
        }
    }

    draw() {
        strokeWeight(2);
        if (this.isActive && this.isMouseOver()) {
            stroke(255, 204, 0);
        } else {
            stroke(0);
        }
        fill(this.color);
        rectMode(CORNER);
        rect(this.x, this.y, this.size, this.size, 5);

        let textColor;
        if (this.isActive) {
            textColor = (this.brightnessVal > 70 ? 0 : 255);
        } else {
            textColor = '#777777';
        }

        fill(textColor);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.size * 0.5);
        text(this.name, this.x + this.size / 2, this.y + this.size / 2);
    }

    isMouseOver() {
        if (!this.isActive) return false;
        return mouseX > this.x && mouseX < this.x + this.size &&
            mouseY > this.y && mouseY < this.y + this.size;
    }
}

class PlacedElement {
    constructor(name, x, y, size, baseCostOrDamage, baseHp = 100) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = this.size / 2;
        this.reacted = false;
        this.lastAttackTime = 0;
        
        this.baseHp = baseHp; 
        this.maxHp = this.baseHp; 
        this.hp = this.maxHp;

        let recipe = recipes.find(r => r.name === name);
        
        if (recipe) {
            this.reacted = true;
            this.color = recipe.color;
            // FeSは少し明るく、大きく
            if (this.name === 'FeS') {
                this.brightnessVal = 90; 
                this.size *= 1.2;
                this.radius = this.size / 2;
            } else {
                this.brightnessVal = 90; 
                this.size *= 1.2;
                this.radius = this.size / 2;
            }
            
            this.attackDamage = baseCostOrDamage;
            this.range = recipe.range;
            this.fireRate = recipe.rate;

            // ★追加: バフ計算用の基本パラメータ
            this.baseFireRate = this.fireRate; // 本来の攻撃間隔を保存
            this.buffTarget = null;            // CuOが支援している相手
            this.isBuffed = false;             // バフを受けているか
            // ★追加: 毎フレーム呼び出してステータスを元に戻す
            this.maxHp = recipe.baseHp;
            this.hp = this.maxHp;

        } else {
            let myData = elementData.find(e => e.symbol === name);
            if (myData) {
                colorMode(HSB, 360, 100, 100);
                let h = map(myData.col, 1, 18, 0, 330);
                let s = map(myData.row, 1, 7, 30, 90);
                let b = map(myData.row, 1, 7, 100, 40);
                this.color = color(h, s, b);
                this.brightnessVal = b;
                colorMode(RGB);
            } else {
                this.color = '#AAAAAA';
                this.brightnessVal = 50;
            }
            
            this.attackDamage = baseCostOrDamage;
            this.range = 150;
            this.fireRate = 1000;
            // ★追加: 以下の行を追加してください！
            this.baseFireRate = this.fireRate;
            this.maxHp = baseHp;
            this.hp = this.maxHp;
        }
    }

    resetStats() {
        this.fireRate = this.baseFireRate;
        this.isBuffed = false;
        // CuOの場合、ターゲット情報はupdateで再取得するので一旦クリアしても良いが、
        // 描画のチラつき防止のため buffTarget はここではクリアせず update で更新する
    }

    // ★変更: updateメソッド (引数 allElements を追加)
    update(allElements) {
        // 1. FeSの自壊処理 (既存)
        if (this.name === 'FeS') {
            let burnDamage = this.maxHp * 0.03 * (deltaTime / 1000);
            this.takeDamage(burnDamage);
        }

        // 2. CuOの触媒効果 (新規)
        if (this.name === 'CuO') {
            let closest = null;
            let minDist = Infinity;

            // 自分以外の最も近いタワーを探す
            for (let other of allElements) {
                // ★修正: 自分、死んでいる敵、および「CuO」自体は対象外
                if (other === this || other.isDead() || other.name === 'CuO') continue;
                
                let d = dist(this.x, this.y, other.x, other.y);
                
                // ★修正: 自分の射程(range)外なら無視
                if (d > this.range) continue; 
                
                if (d < minDist) {
                    minDist = d;
                    closest = other;
                }
            }

            this.buffTarget = closest;

            if (closest) {
                // 攻撃速度1.5倍 = 攻撃間隔(fireRate)を 1/1.5 にする
                closest.fireRate = closest.baseFireRate / 1.5;
                closest.isBuffed = true;
            }
        }
    }

    draw() {
        // --- 1. FeS用の燃焼エフェクト（本体の後ろに描画） ---
        if (this.name === 'FeS') {
            noStroke();
            // 赤〜黄色のランダムな炎
            for(let i=0; i<3; i++) {
                fill(255, random(50, 200), 0, 150);
                let flameSize = this.size * random(0.8, 1.4);
                ellipse(this.x + random(-5, 5), this.y + random(-5, 5), flameSize, flameSize);
            }
        }

        // ★追加: CuOの触媒リンク演出 (自分から対象へエネルギーを送るライン)
        if (this.name === 'CuO' && this.buffTarget && !this.buffTarget.isDead()) {
            let t = this.buffTarget;
            
            // パルスのようなラインを描画
            strokeWeight(3);
            // 時間経過で色が流れる演出
            let phase = (millis() / 50) % 20; 
            for(let i=0; i<5; i++) {
                let interPos = map((phase + i*4)%20, 0, 20, 0, 1);
                let lx = lerp(this.x, t.x, interPos);
                let ly = lerp(this.y, t.y, interPos);
                
                noStroke();
                fill(0, 255, 255, 200 - i*30); // 水色発光
                ellipse(lx, ly, 6, 6);
            }
            
            // つなぐ薄い線
            stroke(0, 200, 200, 100);
            strokeWeight(1);
            line(this.x, this.y, t.x, t.y);
        }

        // --- 2. 未反応時の範囲リング ---
        if (!this.reacted) {
            noFill(); // ★ここで色が消えるので、後で必ずfillし直す必要がある
            stroke(0, 200, 0, 80);
            strokeWeight(1);
            ellipse(this.x, this.y, REACTION_DISTANCE * 2, REACTION_DISTANCE * 2);
        }

        // --- 3. 本体の枠線 ---
        if (this.reacted) {
            strokeWeight(3);
            stroke(0, 0, 200);
        } else {
            strokeWeight(2);
            stroke(0);
        }

        // --- 4. 本体の色（ここで確実に色を塗る） ---
        if (this.name === 'FeS') {
            fill(100, 50, 0); // FeSは燃えカスのような核の色
        } else {
            fill(this.color); // 通常の色
        }

        // --- 5. 本体描画 ---
        ellipse(this.x, this.y, this.size, this.size);

        // ★追加: 加速バフを受けているユニットの演出 (本体描画の後に追加)
        if (this.isBuffed) {
            noFill();
            stroke(0, 255, 100, 200); // 緑色の発光
            strokeWeight(2);
            
            // 高速回転するリング
            let angle = millis() * 0.01;
            arc(this.x, this.y, this.size + 10, this.size + 10, angle, angle + PI);
            arc(this.x, this.y, this.size + 14, this.size + 14, -angle, -angle + PI/2);

            // "UP" の文字エフェクト（なくても良いが分かりやすさのため）
            if (frameCount % 60 < 30) {
                fill(0, 255, 0);
                noStroke();
                textSize(10);
                textAlign(CENTER);
                text("SPEED UP", this.x, this.y - this.size/2 - 15);
            }
        }

        // --- 6. テキストとHPバー ---
        let textColor = (this.brightnessVal > 70 ? 0 : 255);
        fill(textColor);
        noStroke();
        textAlign(CENTER, CENTER);
        
        let label = this.name;
        let textSizeRatio = (this.reacted ? 0.5 : 0.6);
        textSize(this.size * textSizeRatio);
        text(label, this.x, this.y);
        
        let hpBarWidth = this.size;
        let hpBarHeight = 5;
        let hpRatio = this.hp / this.maxHp;
        
        rectMode(CORNER);
        // 背景（赤）
        fill(255, 0, 0, 200);
        rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth, hpBarHeight);
        // 残量（緑）
        fill(0, 255, 0, 200);
        rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth * hpRatio, hpBarHeight);
        
        // 攻撃力表示
        textSize(10);
        fill(0);
        text("ATK:" + Math.floor(this.attackDamage), this.x, this.y + this.size/2 + 10);
    }

    findTargetAndAttack(enemiesArray, bulletsArray) {
        if (millis() - this.lastAttackTime < this.fireRate) { return; }

        let target = null;
        let closestDist = Infinity;
        for (let enemy of enemiesArray) {
            if (!enemy.isDead()) {
                let d = dist(this.x, this.y, enemy.x, enemy.y);
                if (d < this.range && d < closestDist) {
                    closestDist = d;
                    target = enemy;
                }
            }
        }

        if (target) {
            // 弾の設定
            let bulletColor = this.color;
            let isExplosive = false;

            if (this.name === 'FeS') {
                bulletColor = color(255, 100, 0); // 火の玉カラー
                isExplosive = true;
            }

            let b = new Particle(this.x, this.y, target, this.attackDamage, bulletColor);
            
            if (isExplosive) {
                b.isExplosive = true; 
                b.size = 15; 
            }
            
            bulletsArray.push(b);
            this.lastAttackTime = millis();
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }
    
    isDead() {
        return this.hp <= 0;
    }

    findTargetAndAttack(enemiesArray, bulletsArray) {
        if (millis() - this.lastAttackTime < this.fireRate) { return; }

        let target = null;
        let closestDist = Infinity;
        for (let enemy of enemiesArray) {
            if (!enemy.isDead()) {
                let d = dist(this.x, this.y, enemy.x, enemy.y);
                if (d < this.range && d < closestDist) {
                    closestDist = d;
                    target = enemy;
                }
            }
        }

        if (target) {
            // 弾の設定
            let bulletColor = this.color;
            let isExplosive = false;
            let isPoison = false; // ★追加

            if (this.name === 'FeS') {
                bulletColor = color(255, 100, 0); 
                isExplosive = true;
            } else if (this.name === 'H2S') { // ★追加: H2Sの設定
                bulletColor = color(180, 0, 180); // 紫色の毒弾
                isPoison = true;
            }

            let b = new Particle(this.x, this.y, target, this.attackDamage, bulletColor);
            
            if (isExplosive) {
                b.isExplosive = true; 
                b.size = 15; 
            }
            if (isPoison) { // ★追加
                b.isPoison = true;
            }
            
            bulletsArray.push(b);
            this.lastAttackTime = millis();
        }
    }
}

class MainTower {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = size / 2;
        this.maxHp = 500;
        this.hp = this.maxHp;
    }

    draw() {
        rectMode(CENTER);
        strokeWeight(2);
        stroke(0);
        fill(150);
        rect(this.x, this.y, this.size, this.size);

        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(20);
        text('BASE', this.x, this.y);

        noStroke();
        fill(255, 0, 0);
        rectMode(CORNER);
        rect(this.x - this.radius, this.y + this.radius + 5, this.size, 10);

        let hpWidth = (this.hp / this.maxHp) * this.size;
        fill(0, 255, 0);
        rect(this.x - this.radius, this.y + this.radius + 5, hpWidth, 10);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }

    isAlive() {
        return this.hp > 0;
    }
}

class Barricade {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.maxHp = 300; 
        this.hp = this.maxHp;
    }

    draw() {
        rectMode(CENTER);
        stroke(0);
        strokeWeight(2);
        
        let hpRatio = this.hp / this.maxHp;
        fill(139 * hpRatio, 69 * hpRatio, 19); 
        
        rect(this.x, this.y, this.size, this.size, 5);

        fill(255, 0, 0);
        noStroke();
        rectMode(CORNER);
        rect(this.x - this.size/2, this.y - this.size/2 - 8, this.size, 5);
        fill(0, 255, 0);
        rect(this.x - this.size/2, this.y - this.size/2 - 8, this.size * hpRatio, 5);
        
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(10);
        text(floor(this.hp), this.x, this.y);
    }

    takeDamage(amount) {
        this.hp -= amount;
    }

    isBroken() {
        return this.hp <= 0;
    }
}

class Enemy {
    constructor(x, y, path, type = 'normal') {
        this.x = x;
        this.y = y;
        this.path = path;
        this.type = type;
        this.currentPathIndex = 0;
        
        this.isBlocked = false; 
        this.isCollidingWithTower = false;
        
        this.lastAttackTime = 0;
        this.damageToWall = 0.5;

        // ★追加: 毒（Poison）関連の状態変数
        this.poisoned = false;
        this.poisonTimer = 0;      // 毒の残り時間(ms)
        this.poisonDamagePerSec = 0; // 1秒あたりのダメージ

        if (this.type === 'tank') {
            this.size = 50;
            this.health = 2000; 
            this.speed = 40; 
            this.color = color(70, 0, 150); 
            this.attackRange = 120; 
            this.attackDamage = 30;
            this.attackRate = 2000;
        } else if (this.type === 'erratic') {
            this.size = 25;
            this.health = 250; 
            this.speed = 120; 
            this.color = color(220, 180, 0); 
            this.attackRange = 160;
            this.attackDamage = 10;
            this.attackRate = 1000;
            this.wobbleOffset = random(1000); 
        } else {
            this.size = 30;
            this.health = 500; 
            this.speed = 80;
            this.color = color(255, 0, 0);
            this.attackRange = 70;
            this.attackDamage = 15;
            this.attackRate = 1500;
        }
        this.radius = this.size / 2;
    }

    // ★追加: 毒状態を付与するメソッド
    applyPoison(dps, duration) {
        this.poisoned = true;
        // ダメージは上書き、または強い方を優先などのロジック（今回は単純上書き）
        this.poisonDamagePerSec = dps;
        this.poisonTimer = duration;
    }

    // ★追加: 毎フレームの状態異常更新（updateGameLogicから呼ぶ）
    updateStatus() {
        if (this.poisoned) {
            // 時間経過でダメージ
            let damage = this.poisonDamagePerSec * (deltaTime / 1000);
            this.takeDamage(damage);

            // タイマー減少
            this.poisonTimer -= deltaTime;
            if (this.poisonTimer <= 0) {
                this.poisoned = false;
                this.poisonTimer = 0;
            }
        }
    }

    draw() {
        fill(this.color);
        stroke(0);
        strokeWeight(1);
        
        if (this.type === 'erratic') {
            push();
            translate(this.x, this.y);
            rotate(millis() * 0.01); 
            triangle(
                0, -this.radius, 
                -this.radius, this.radius, 
                this.radius, this.radius
            );
            pop();
        } else {
            ellipse(this.x, this.y, this.size, this.size);
        }

        // ★追加: 毒状態の演出（緑色の泡が浮かぶエフェクト）
        if (this.poisoned) {
            noStroke();
            fill(0, 255, 0, 150); // 半透明の緑
            // ランダムに泡を表示
            let bubbleSize = this.size * 0.3;
            let bx = this.x + random(-this.size/2, this.size/2);
            let by = this.y - this.size/2 - random(0, 10);
            ellipse(bx, by, bubbleSize, bubbleSize);
        }

        let hpBarWidth = this.size * 0.8;
        let hpBarHeight = 5;
        let maxHp = (this.type === 'tank') ? 2000 : (this.type === 'erratic' ? 250 : 500);
        let hpRatio = this.health / maxHp;
        
        fill(0, 255, 0);
        noStroke();
        rectMode(CORNER);
        rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth * hpRatio, hpBarHeight);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    isDead() {
        return this.health <= 0;
    }

    followPath(obstaclesArray) { 
        if (this.isCollidingWithTower || !this.path || this.currentPathIndex >= this.path.length) return;

        this.isBlocked = false;
        if (obstaclesArray) {
            for (let wall of obstaclesArray) {
                let d = dist(this.x, this.y, wall.x, wall.y);
                if (d < this.radius + wall.size/2 + 5) {
                    this.isBlocked = true;
                    wall.takeDamage(this.damageToWall);
                    break; 
                }
            }
        }

        if (!this.isBlocked) {
            let targetNode = this.path[this.currentPathIndex];
            let dt = deltaTime / 1000;
            
            let currentSpeed = this.speed;
            
            if (this.type === 'erratic') {
                let noiseVal = sin(millis() * 0.01 + this.wobbleOffset);
                currentSpeed = this.speed * (0.8 + 0.7 * abs(noiseVal)); 
            }

            let moveAmount = currentSpeed * dt; 
            let angle = atan2(targetNode.y - this.y, targetNode.x - this.x);
            
            if (this.type === 'erratic') {
                 let wobble = cos(millis() * 0.02 + this.wobbleOffset) * 2; 
                 angle += wobble * 0.1; 
            }

            let dx = cos(angle) * moveAmount;
            let dy = sin(angle) * moveAmount;

            let currentDist = dist(this.x, this.y, targetNode.x, targetNode.y);

            if (currentDist <= moveAmount * 1.5) {
                this.x = targetNode.x;
                this.y = targetNode.y;
                this.currentPathIndex++;
            } else {
                this.x += dx;
                this.y += dy;
            }
        }
    }
    
    findTargetAndAttack(placedElementsArray, shockwavesArray) {
        if (this.isDead() || this.isBlocked || this.isCollidingWithTower) { return; }
        if (millis() - this.lastAttackTime < this.attackRate) { return; }

        let target = null;
        let closestDist = Infinity;
        
        for (let unit of placedElementsArray) {
            if (!unit.isDead()) { 
                let d = dist(this.x, this.y, unit.x, unit.y);
                if (d < this.attackRange && d < closestDist) {
                    closestDist = d;
                    target = unit;
                }
            }
        }

        if (target) {
            shockwavesArray.push(new Shockwave(this.x, this.y, this.attackRange, this.attackDamage, placedElementsArray));
            this.lastAttackTime = millis();
        }
    }
}

class Particle {
    constructor(startX, startY, targetEnemy, damage, color) {
        this.x = startX;
        this.y = startY;
        this.target = targetEnemy;
        this.damage = damage;
        this.color = color;
        this.size = 10;
        this.speed = 400;
        this.vx = 0;
        this.vy = 0;
        this.hasTarget = true;
    }

    update() {
        let dt = deltaTime / 1000;
        let moveAmount = this.speed * dt;

        if (this.hasTarget) {
            if (!this.target || this.target.isDead()) {
                this.hasTarget = false;
                let angle = 0;
                if(this.target) {
                    angle = atan2(this.target.y - this.y, this.target.x - this.x);
                }
                this.vx = cos(angle) * this.speed;
                this.vy = sin(angle) * this.speed;
            } else {
                let angle = atan2(this.target.y - this.y, this.target.x - this.x);
                this.x += cos(angle) * moveAmount;
                this.y += sin(angle) * moveAmount;
                return;
            }
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw() {
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size, this.size);
    }

    hitscan(enemiesArray) {
        if (this.target && !this.target.isDead()) {
            for (let enemy of enemiesArray) {
                if (enemy === this.target && dist(this.x, this.y, enemy.x, enemy.y) < this.size / 2 + enemy.size / 2) {
                    return enemy;
                }
            }
        }
        return null;
    }
}

class Shockwave {
    constructor(x, y, range, damage, placedElementsArray) {
        this.x = x;
        this.y = y;
        this.maxRange = range;
        this.damage = damage;
        this.placedElements = placedElementsArray;
        this.startTime = millis();
        this.duration = 200; 
        this.currentRadius = 0;
        this.hit = false;
    }

    update() {
        let elapsed = millis() - this.startTime;
        if (elapsed > this.duration) {
            this.currentRadius = this.maxRange;
            return;
        }

        this.currentRadius = map(elapsed, 0, this.duration, 0, this.maxRange);
        
        if (!this.hit && elapsed > this.duration / 3) {
            this.hit = true;
            for (let unit of this.placedElements) {
                if (!unit.isDead()) {
                    let d = dist(this.x, this.y, unit.x, unit.y);
                    if (d < this.maxRange) { 
                        unit.takeDamage(this.damage);
                    }
                }
            }
        }
    }

    draw() {
        let alpha = map(this.currentRadius, 0, this.maxRange, 150, 0);
        noFill();
        stroke(255, 0, 0, alpha);
        strokeWeight(3);
        ellipse(this.x, this.y, this.currentRadius * 2, this.currentRadius * 2);
    }

    isFinished() {
        return millis() - this.startTime > this.duration;
    }
}

// ===================================
// 10. グリッド描画・リサイズ・エディター操作 (統合)
// ===================================
function drawGrid() {
    let gridSize = 40;
    stroke(0, 0, 0, 50);
    strokeWeight(1);
    for (let x = 0; x < gameAreaWidth; x += gridSize) line(x, 0, x, height);
    for (let y = 0; y < height; y += gridSize) line(0, y, gameAreaWidth, y);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    gameAreaWidth = width / 2;
    setupPeriodicTable();
}


// --- エディター関連 ---

function drawObstacles() {
    push();
    rectMode(CENTER);
    for (let obs of obstacles) {
        fill(50, 50, 50);
        strokeWeight(2);
        stroke(0);
        rect(obs.x, obs.y, obs.size, obs.size, 5);
    }
    pop();
}

function drawPathNodes() {
    if (pathNodes.length === 0) return;
    noFill();
    stroke(255, 0, 0, 150);
    strokeWeight(3);
    beginShape();
    for (let node of pathNodes) vertex(node.x, node.y);
    endShape();

    for (let i = 0; i < pathNodes.length; i++) {
        let node = pathNodes[i];
        strokeWeight(2);
        stroke(0);
        if (i === 0) fill(0, 255, 0);
        else if (i === pathNodes.length - 1) fill(0, 0, 255);
        else fill(255, 255, 0);
        ellipse(node.x, node.y, PATH_NODE_SIZE, PATH_NODE_SIZE);
        fill(0);
        textSize(10);
        textAlign(CENTER, CENTER);
        text(i, node.x, node.y);
    }
}

function drawPlacementAreas() {
    for (let area of placementAreas) {
        noStroke();
        fill(100, 255, 100, 100); 
        rectMode(CORNER);
        rect(area.x, area.y, area.w, area.h);
        
        stroke(100, 255, 100, 200);
        strokeWeight(2);
        noFill();
        rect(area.x, area.y, area.w, area.h);
    }
}

function drawPlacementPreview() {
    if (gameState === 'editor' && editorState === 'placement' && draggingNode && draggingNode.isStart && draggingNode.endX !== undefined) {
        let x1 = draggingNode.x;
        let y1 = draggingNode.y;
        let x2 = draggingNode.endX;
        let y2 = draggingNode.endY;
        
        let x = min(x1, x2);
        let y = min(y1, y2);
        let w = abs(x1 - x2);
        let h = abs(y1 - y2);

        fill(255, 255, 0, 80); 
        stroke(255, 255, 0, 180);
        strokeWeight(2);
        rectMode(CORNER);
        rect(x, y, w, h);
    }
}


function handleEditorMousePressed() {
    const BUTTON_W = 100;
    const BUTTON_H = 30;
    const START_X = gameAreaWidth + 20;
    const START_Y = height - 50;
    const MARGIN = 10;
    let x = START_X;

    let modes = ['path', 'obstacle', 'placement']; 
    for (let mode of modes) {
        if (mouseX > x && mouseX < x + BUTTON_W && mouseY > START_Y && mouseY < START_Y + BUTTON_H) {
            editorState = mode;
            return;
        }
        x += BUTTON_W + MARGIN;
    }

    const BACK_BUTTON_W = 150;
    let backX = width - BACK_BUTTON_W - 10;
    let backY = height - 50;
    if (mouseX > backX && mouseX < backX + BACK_BUTTON_W && mouseY > backY && mouseY < backY + BUTTON_H) {
        gameState = 'start';
        return;
    }

    if (mouseX < gameAreaWidth) {
        if (mouseButton === LEFT) {
            if (editorState === 'obstacle') {
                let canPlace = true;
                for(let obs of obstacles) {
                    if(dist(mouseX, mouseY, obs.x, obs.y) < OBSTACLE_SIZE) {
                        canPlace = false;
                        break;
                    }
                }
                if(canPlace) {
                    obstacles.push({ x: mouseX, y: mouseY, size: OBSTACLE_SIZE });
                }

            } else if (editorState === 'path') {
                for (let node of pathNodes) {
                    if (dist(mouseX, mouseY, node.x, node.y) < node.radius + 5) {
                        draggingNode = node;
                        return;
                    }
                }
                pathNodes.push({ x: mouseX, y: mouseY, radius: PATH_NODE_SIZE, isStart: false });
            } else if (editorState === 'placement') { 
                draggingNode = { x: mouseX, y: mouseY, isStart: true };
            }
        } else if (mouseButton === RIGHT) {
            if (editorState === 'obstacle') {
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    if (dist(mouseX, mouseY, obstacles[i].x, obstacles[i].y) < obstacles[i].size / 2) {
                        obstacles.splice(i, 1);
                        break;
                    }
                }
            }
            if (editorState === 'path') {
                for (let i = pathNodes.length - 1; i >= 0; i--) {
                    if (dist(mouseX, mouseY, pathNodes[i].x, pathNodes[i].y) < pathNodes[i].radius / 2) {
                        pathNodes.splice(i, 1);
                        break;
                    }
                }
            }
            if (editorState === 'placement') { 
                for (let i = placementAreas.length - 1; i >= 0; i--) {
                    let area = placementAreas[i];
                    if (mouseX > area.x && mouseX < area.x + area.w && 
                        mouseY > area.y && mouseY < area.y + area.h) {
                        placementAreas.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
}