// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start';
let menuOpen = false;
let gameAreaWidth;

// --- 周期表・タワー関連 ---
let periodicTableElements = [];
let placedGameElements = [];
let draggingElement = null;
let combinationHints = [];

// --- 敵・基地・弾丸・障害物関連 ---
let enemies = [];
let mainTower;
let bullets = [];
let gameObstacles = [];
let lastSpawnTime = 0;
const SPAWN_INTERVAL = 1000;

// --- エネルギー（コスト）関連 ---
let currentEnergy = 100;
let maxEnergy = 1000;
let energyRegenPerSecond = 5;
let enemyKillReward = 15;

// --- 元素ごとのコスト定義 (setupで自動計算) ---
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
const REACTION_DISTANCE = 80; // 反応する最大距離
const OBSTACLE_SIZE = 40;
const PATH_NODE_SIZE = 20;

// ===================================
// ★合成レシピの定義
// ===================================
const recipes = [
    {
        name: 'H2O',
        ingredients: { 'H': 2, 'O': 1 },
        core: 'O',
        color: '#ADD8E6', // 水色
        range: 200,
        rate: 500
    },
    {
        name: 'CO2',
        ingredients: { 'C': 1, 'O': 2 },
        core: 'C',
        color: '#A9A9A9', // ダークグレー
        range: 180,
        rate: 800
    },
    {
        name: 'HCl',
        ingredients: { 'H': 1, 'Cl': 1 },
        core: 'Cl',
        color: '#FFFFE0', // ライトイエロー
        range: 160,
        rate: 400 
    },
    {
        name: 'CuO',
        ingredients: { 'Cu': 1, 'O': 1 },
        core: 'Cu',
        color: '#333333', // 黒っぽい
        range: 150,
        rate: 1000
    },
    {
        name: 'FeS',
        ingredients: { 'Fe': 1, 'S': 1 },
        core: 'Fe',
        color: '#8B4513', // 茶色
        range: 150,
        rate: 1200 
    },
    {
        name: 'NaCl',
        ingredients: { 'Na': 1, 'Cl': 1 },
        core: 'Na',
        color: '#F0F8FF', // アリスブルー
        range: 170,
        rate: 600
    },
    {
        name: 'H2S',
        ingredients: { 'H': 2, 'S': 1 },
        core: 'S',
        color: '#FFFF00', // 黄色
        range: 190,
        rate: 700
    }
];


// ===================================
// 2. setup / 周期表データ
// ===================================
const elementData = [
    // Period 1
    { symbol: 'H', row: 1, col: 1 },  { symbol: 'He', row: 1, col: 18 },
    // Period 2
    { symbol: 'Li', row: 2, col: 1 }, { symbol: 'Be', row: 2, col: 2 },
    { symbol: 'B', row: 2, col: 13 }, { symbol: 'C', row: 2, col: 14 }, { symbol: 'N', row: 2, col: 15 }, { symbol: 'O', row: 2, col: 16 }, { symbol: 'F', row: 2, col: 17 }, { symbol: 'Ne', row: 2, col: 18 },
    // Period 3
    { symbol: 'Na', row: 3, col: 1 }, { symbol: 'Mg', row: 3, col: 2 },
    { symbol: 'Al', row: 3, col: 13 }, { symbol: 'Si', row: 3, col: 14 }, { symbol: 'P', row: 3, col: 15 }, { symbol: 'S', row: 3, col: 16 }, { symbol: 'Cl', row: 3, col: 17 }, { symbol: 'Ar', row: 3, col: 18 },
    // Period 4
    { symbol: 'K', row: 4, col: 1 }, { symbol: 'Ca', row: 4, col: 2 }, { symbol: 'Sc', row: 4, col: 3 }, { symbol: 'Ti', row: 4, col: 4 }, { symbol: 'V', row: 4, col: 5 }, { symbol: 'Cr', row: 4, col: 6 }, { symbol: 'Mn', row: 4, col: 7 }, { symbol: 'Fe', row: 4, col: 8 }, { symbol: 'Co', row: 4, col: 9 }, { symbol: 'Ni', row: 4, col: 10 }, { symbol: 'Cu', row: 4, col: 11 }, { symbol: 'Zn', row: 4, col: 12 },
    { symbol: 'Ga', row: 4, col: 13 }, { symbol: 'Ge', row: 4, col: 14 }, { symbol: 'As', row: 4, col: 15 }, { symbol: 'Se', row: 4, col: 16 }, { symbol: 'Br', row: 4, col: 17 }, { symbol: 'Kr', row: 4, col: 18 },
    // Period 5
    { symbol: 'Rb', row: 5, col: 1 }, { symbol: 'Sr', row: 5, col: 2 }, { symbol: 'Y', row: 5, col: 3 }, { symbol: 'Zr', row: 5, col: 4 }, { symbol: 'Nb', row: 5, col: 5 }, { symbol: 'Mo', row: 5, col: 6 }, { symbol: 'Tc', row: 5, col: 7 }, { symbol: 'Ru', row: 5, col: 8 }, { symbol: 'Rh', row: 5, col: 9 }, { symbol: 'Pd', row: 5, col: 10 }, { symbol: 'Ag', row: 5, col: 11 }, { symbol: 'Cd', row: 5, col: 12 },
    { symbol: 'In', row: 5, col: 13 }, { symbol: 'Sn', row: 5, col: 14 }, { symbol: 'Sb', row: 5, col: 15 }, { symbol: 'Te', row: 5, col: 16 }, { symbol: 'I', row: 5, col: 17 }, { symbol: 'Xe', row: 5, col: 18 },
    // Period 6
    { symbol: 'Cs', row: 6, col: 1 }, { symbol: 'Ba', row: 6, col: 2 }, { symbol: 'La', row: 6, col: 3 }, { symbol: 'Hf', row: 6, col: 4 }, { symbol: 'Ta', row: 6, col: 5 }, { symbol: 'W', row: 6, col: 6 }, { symbol: 'Re', row: 6, col: 7 }, { symbol: 'Os', row: 6, col: 8 }, { symbol: 'Ir', row: 6, col: 9 }, { symbol: 'Pt', row: 6, col: 10 }, { symbol: 'Au', row: 6, col: 11 }, { symbol: 'Hg', row: 6, col: 12 },
    { symbol: 'Tl', row: 6, col: 13 }, { symbol: 'Pb', row: 6, col: 14 }, { symbol: 'Bi', row: 6, col: 15 }, { symbol: 'Po', row: 6, col: 16 }, { symbol: 'At', row: 6, col: 17 }, { symbol: 'Rn', row: 6, col: 18 },
    // Period 7
    { symbol: 'Fr', row: 7, col: 1 }, { symbol: 'Ra', row: 7, col: 2 }, { symbol: 'Ac', row: 7, col: 3 }, { symbol: 'Rf', row: 7, col: 4 }, { symbol: 'Db', row: 7, col: 5 }, { symbol: 'Sg', row: 7, col: 6 }, { symbol: 'Bh', row: 7, col: 7 }, { symbol: 'Hs', row: 7, col: 8 }, { symbol: 'Mt', row: 7, col: 9 }, { symbol: 'Ds', row: 7, col: 10 }, { symbol: 'Rg', row: 7, col: 11 }, { symbol: 'Cn', row: 7, col: 12 },
    { symbol: 'Nh', row: 7, col: 13 }, { symbol: 'Fl', row: 7, col: 14 }, { symbol: 'Mc', row: 7, col: 15 }, { symbol: 'Lv', row: 7, col: 16 }, { symbol: 'Ts', row: 7, col: 17 }, { symbol: 'Og', row: 7, col: 18 }
];

const activeElements = elementData.map(data => data.symbol); 

function setup() {
    createCanvas(windowWidth, windowHeight);
    gameAreaWidth = width / 2;

    // コストの自動計算: 基本コスト(5) + 周期(row) * 10
    for (let el of elementData) {
        elementCosts[el.symbol] = 5 + (el.row * 10);
    }

    setupPeriodicTable();
}

function setupPeriodicTable() {
    periodicTableElements = [];
    let gridCellSize = 35;
    let gridMargin = 4;
    let availableWidth = (width - gameAreaWidth) - 60;
    gridCellSize = (availableWidth / 18) - gridMargin;
    gridCellSize = max(gridCellSize, 15);
    let totalCellSize = gridCellSize + gridMargin;
    let gridStartX = gameAreaWidth + 30;
    let gridStartY = 50;
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
// 3. draw()関数
// ===================================
function draw() {
    if (gameState === 'start') {
        drawStartScreen();

    } else if (gameState === 'stage' || gameState === 'gameover') {
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
        drawCombinationHints();
        for (let b of bullets) { b.draw(); }
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

        drawEnergyBar();
        drawMenuOverlay();

        if (gameState === 'gameover') {
            drawGameOverScreen();
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
// 4. マウス操作
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
            let x = centerX - BUTTON_W / 2;
            let y = centerY - BUTTON_H / 2;
            if (mouseX > x && mouseX < x + BUTTON_W && mouseY > y && mouseY < y + BUTTON_H) {
                gameState = 'start';
                menuOpen = false;
                return;
            }
        }

        if (!menuOpen) {
            for (let el of periodicTableElements) {
                if (el.isMouseOver()) {
                    draggingElement = {
                        name: el.name,
                        color: el.color,
                        size: el.size + 10
                    };
                    break;
                }
            }
        }
        return;
    }

    if (gameState === 'editor') {
        handleEditorMousePressed();
        return;
    }

    if (gameState === 'gameover') {
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
            initializeStage();
            gameState = 'stage';
            return;
        }
        if (mouseX > titleX && mouseX < titleX + BUTTON_W &&
            mouseY > titleY && mouseY < titleY + BUTTON_H) {
            gameState = 'start';
            return;
        }
    }
}

function mouseReleased() {
    if (gameState === 'stage' && draggingElement) {
        if (mouseX < gameAreaWidth) {
            let cost = elementCosts[draggingElement.name] || 0;
            let isOverlapping = false;
            for(let obs of gameObstacles) {
                if(dist(mouseX, mouseY, obs.x, obs.y) < obs.size/2 + draggingElement.size/2) {
                    isOverlapping = true;
                    break;
                }
            }
            
            let isInPlacementArea = false;
            if (placementAreas.length === 0) {
                isInPlacementArea = true;
            } else {
                for (let area of placementAreas) {
                    if (mouseX > area.x && mouseX < area.x + area.w &&
                        mouseY > area.y && mouseY < area.y + area.h) {
                        isInPlacementArea = true;
                        break;
                    }
                }
            }

            if (!isOverlapping && isInPlacementArea) {
                if (currentEnergy >= cost) {
                    currentEnergy -= cost;
                    placedGameElements.push(
                        new PlacedElement(
                            draggingElement.name,
                            mouseX,
                            mouseY,
                            draggingElement.size
                        )
                    );
                } else {
                    console.log("エネルギー不足！");
                }
            }
        }
        draggingElement = null;
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


// ===================================
// 5. 描画・ロジック
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


function updateGameLogic() {
    if (currentEnergy < maxEnergy) {
        let recoveryAmount = energyRegenPerSecond * (deltaTime / 1000);
        currentEnergy += recoveryAmount;
        currentEnergy = min(currentEnergy, maxEnergy);
    }

    if (millis() - lastSpawnTime > SPAWN_INTERVAL) {
        if (pathNodes.length > 0) {
            enemies.push(new Enemy(pathNodes[0].x, pathNodes[0].y, pathNodes));
        } else if (100 < gameAreaWidth) {
            enemies.push(new Enemy(100, 100, []));
        }
        lastSpawnTime = millis();
    }

    for (let tower of placedGameElements) {
        tower.findTargetAndAttack(enemies, bullets);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.update();
        let hitEnemy = bullet.hitscan(enemies);
        if (hitEnemy) {
            hitEnemy.takeDamage(bullet.damage);
            bullets.splice(i, 1);
            continue;
        }
        if (bullet.x < 0 || bullet.x > gameAreaWidth || bullet.y < 0 || bullet.y > height) {
            bullets.splice(i, 1);
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.isCollidingWithTower = false;
        if (mainTower && mainTower.isAlive()) {
            let distance = dist(e.x, e.y, mainTower.x, mainTower.y);
            if (distance < e.radius + mainTower.radius) {
                e.isCollidingWithTower = true;
                mainTower.takeDamage(1);
            }
        }
        e.followPath(gameObstacles); 

        if (e.isDead() || e.x < 0 || e.y < 0 || e.x > width || e.y > height) {
            if (e.isDead()) {
                currentEnergy += enemyKillReward;
                currentEnergy = min(currentEnergy, maxEnergy);
            }
            enemies.splice(i, 1);
        }
    }

    for (let i = gameObstacles.length - 1; i >= 0; i--) {
        if (gameObstacles[i].isBroken()) {
            gameObstacles.splice(i, 1);
        }
    }

    findCombinationHints();
    checkAndPerformReactions();

    if (mainTower && !mainTower.isAlive()) {
        gameState = 'gameover';
    }
}

function initializeStage() {
    console.log("ステージ初期化完了");
    menuOpen = false;
    enemies = [];
    placedGameElements = [];
    bullets = [];
    combinationHints = [];
    lastSpawnTime = millis();

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


// ===================================
// 6. UIの描画
// ===================================

function drawEnergyBar() {
    let barWidth = (width - gameAreaWidth) - 60;
    let barHeight = 25;
    let barX = gameAreaWidth + 30;
    let barY = height - 40 - barHeight;

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
    if (gameState !== 'gameover') {
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


// ===================================
// 7. クラス定義
// ===================================

class PeriodicElement {
    constructor(name, x, y, size, isActive) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.isActive = isActive;
        
        // 色の決定ロジック (HSBで計算)
        if (this.isActive) {
            let myData = elementData.find(e => e.symbol === name);
            if (myData) {
                colorMode(HSB, 360, 100, 100);
                // 横変化: 族(col)に応じて色相(Hue)を変化 (0-330)
                let h = map(myData.col, 1, 18, 0, 330);
                
                // 縦変化: 周期(row)に応じて彩度・明度を変化
                // 上(row 1) -> 白っぽい (明度高, 彩度低)
                // 下(row 7) -> 黒っぽい (明度低, 彩度はある程度保つ)
                let s = map(myData.row, 1, 7, 30, 90);  
                let b = map(myData.row, 1, 7, 100, 40); 
                
                this.color = color(h, s, b);
                this.brightnessVal = b; // HSBのBrightness
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
    constructor(name, x, y, size, damage = 10, range = 150, rate = 1000, colorOverride = null) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = this.size / 2;
        this.reacted = false;
        
        // 合成された化合物かどうかでパラメータを分岐
        let recipe = recipes.find(r => r.name === name);
        
        if (recipe) {
            // 化合物の場合
            this.reacted = true;
            this.color = recipe.color;
            this.brightnessVal = 90; // 仮
            this.size *= 1.2;
            this.radius = this.size / 2;
            
            // 引数で受け取った（コスト計算済みの）ダメージを使用
            this.attackDamage = damage; 
            this.range = recipe.range;
            this.fireRate = recipe.rate;
        } else {
            // 単体元素の場合
            // 色の決定 (PeriodicElementと同様)
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
            
            this.attackDamage = 10;
            this.range = 150;
            this.fireRate = 1000;
        }

        this.lastAttackTime = 0;
    }

    draw() {
        if (!this.reacted) {
            noFill();
            stroke(0, 200, 0, 80);
            strokeWeight(1);
            ellipse(this.x, this.y, REACTION_DISTANCE * 2, REACTION_DISTANCE * 2);
        }

        if (this.reacted) {
            strokeWeight(3);
            stroke(0, 0, 200);
        } else {
            strokeWeight(2);
            stroke(0);
        }

        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);

        let textColor = (this.brightnessVal > 70 ? 0 : 255);
        fill(textColor);
        noStroke();
        textAlign(CENTER, CENTER);
        
        let label = this.name;
        // 化合物なら少し文字サイズ調整
        let textSizeRatio = (this.reacted ? 0.5 : 0.6);
        textSize(this.size * textSizeRatio);
        text(label, this.x, this.y);
        
        // 攻撃力を小さく表示（デバッグ・確認用）
        if(this.reacted) {
            textSize(10);
            fill(0);
            text("ATK:" + Math.floor(this.attackDamage), this.x, this.y + this.size/2 + 10);
        }
    }

    findTargetAndAttack(enemiesArray, bulletsArray) {
        // ★修正点: 未反応でも攻撃するように guard clause を削除
        // if (!this.reacted) { return; } 
        
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
            bulletsArray.push(new Particle(this.x, this.y, target, this.attackDamage, this.color));
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
    constructor(x, y, path) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.radius = this.size / 2;
        
        this.health = 600; 
        
        this.damageToWall = 0.5; 
        this.speed = 80;
        
        this.path = path;
        this.currentPathIndex = 0;
        this.isBlocked = false; 
        this.isCollidingWithTower = false;
    }

    draw() {
        fill(255, 0, 0);
        stroke(0);
        strokeWeight(1);
        ellipse(this.x, this.y, this.size, this.size);

        // HPバー (最大値を600として比率計算)
        let hpBarWidth = this.size * 0.8;
        let hpBarHeight = 5;
        let hpRatio = this.health / 600; // ベースHPに応じて変更
        fill(0, 255, 0);
        noStroke();
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
            let moveAmount = this.speed * dt; 

            let angle = atan2(targetNode.y - this.y, targetNode.x - this.x);
            let dx = cos(angle) * moveAmount;
            let dy = sin(angle) * moveAmount;

            let currentDist = dist(this.x, this.y, targetNode.x, targetNode.y);

            if (currentDist <= moveAmount) {
                this.x = targetNode.x;
                this.y = targetNode.y;
                this.currentPathIndex++;
            } else {
                this.x += dx;
                this.y += dy;
            }
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


// ===================================
// 8. 合成・反応ロジック (汎用化・修正版)
// ===================================

function checkAndPerformReactions() {
    let unreactedElements = placedGameElements.filter(el => !el.reacted);
    
    // 定義されたレシピを順番にチェック
    for (let recipe of recipes) {
        let coreName = recipe.core;
        
        // 中心元素候補を探す
        let coreCandidates = unreactedElements.filter(el => el.name === coreName);
        
        for (let coreEl of coreCandidates) {
            if (coreEl.reacted) continue; 

            let requiredIngredients = { ...recipe.ingredients };
            
            // 中心元素自身の分を減算
            if (requiredIngredients[coreName] > 0) {
                requiredIngredients[coreName]--;
            }

            let foundIngredients = [];
            let allIngredientsFound = true;
            let totalCost = elementCosts[coreName]; 

            // 周囲の必要な元素を探す
            for (let ingName in requiredIngredients) {
                let countNeeded = requiredIngredients[ingName];
                
                if (countNeeded <= 0) continue;

                let neighbors = unreactedElements.filter(el => 
                    el !== coreEl && 
                    !el.reacted && 
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

            // 合成成功！
            if (allIngredientsFound) {
                console.log(recipe.name + " 反応成功！");
                
                let sumX = coreEl.x;
                let sumY = coreEl.y;
                let sumSize = coreEl.size;
                
                // 今回使用した元素をリストアップ
                let consumedElements = [coreEl, ...foundIngredients];

                // 位置とサイズの計算
                for(let ing of foundIngredients) {
                    sumX += ing.x;
                    sumY += ing.y;
                    sumSize += ing.size;
                }

                let count = consumedElements.length;
                let avgX = sumX / count;
                let avgY = sumY / count;
                let newSize = sumSize / count;

                let calculatedDamage = totalCost * 1.2;

                // ★修正点: 全体の配列から、今回使った素材だけを取り除く
                // (以前は reacted フラグがついているものを全て削除していたため、過去の化合物も消えていた)
                placedGameElements = placedGameElements.filter(el => !consumedElements.includes(el));

                // 新しい化合物を追加
                placedGameElements.push(new PlacedElement(
                    recipe.name, 
                    avgX, 
                    avgY, 
                    newSize, 
                    calculatedDamage
                ));
                
                return; // 配列操作したので一度ループを抜ける
            }
        }
    }
}

function findCombinationHints() {
    combinationHints = [];
    let unreacted = placedGameElements.filter(el => !el.reacted);
    
    for (let i = 0; i < unreacted.length; i++) {
        for (let j = i + 1; j < unreacted.length; j++) {
            let el1 = unreacted[i];
            let el2 = unreacted[j];
            let d = dist(el1.x, el1.y, el2.x, el2.y);
            if (d < REACTION_DISTANCE) {
                let midX = (el1.x + el2.x) / 2;
                let midY = (el1.y + el2.y) / 2;
                combinationHints.push({ x: midX, y: midY, name: '!' });
            }
        }
    }
}

function drawCombinationHints() {
    for (let hint of combinationHints) {
        let pulseAlpha = (sin(millis() * 0.006) + 1) / 2 * 100 + 50;
        let hintColor = color(255, 255, 0, pulseAlpha);
        noStroke();
        fill(hintColor);
        ellipse(hint.x, hint.y, 20, 20);
    }
}


// ===================================
// 9. グリッド・リサイズ
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