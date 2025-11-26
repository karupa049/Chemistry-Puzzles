// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start'; // ゲームの状態: 'start', 'stage', 'gameover', 'editor'
let menuOpen = false;    // メニューの開閉状態
let gameAreaWidth;       // ゲームエリアの幅（X座標の境界線）

// --- 周期表・タワー関連 ---
let periodicTableElements = []; // 周期表の元素（ドラッグ元）
let placedGameElements = [];    // ゲーム画面に配置された元素（防衛ユニット, H2O含む）
let draggingElement = null;     // 現在ドラッグ中の元素データ
let combinationHints = [];      // 合成ヒントの描画用配列

// --- 敵・基地・弾丸・障害物関連 ---
let enemies = [];         // 敵を管理する配列
let mainTower;            // メインタワー（基地）
let bullets = [];         // 弾丸を管理する配列
let shockwaves = [];      // ★衝撃波を管理する配列（新規追加）
let gameObstacles = [];   // ゲームプレイ中の「防衛壁（Barricade）」 (syougai.js機能)
let lastSpawnTime = 0;        // 最後に敵を生成した時間
const SPAWN_INTERVAL = 1000;  // 敵を生成する間隔 (ms)

// --- エネルギー（コスト）関連 ---
let currentEnergy = 100;      // 現在のエネルギー
let maxEnergy = 1000;         // 最大エネルギー
let energyRegenPerSecond = 5; // 毎秒のエネルギー回復量
let enemyKillReward = 15;     // 敵を倒したときの報酬

// --- 元素ごとのコスト定義 ---
const elementCosts = {
    'H': 10,
    'O': 25,
    'C': 20,
    'N': 20
};

// --- ステージエディター関連 ---
let editorState = 'path'; // エディターのサブ状態: 'path', 'obstacle', 'placement'
let obstacles = [];       // 障害物の配列（エディター用データ） (syougai.js機能)
let pathNodes = [];       // 敵の進行経路ノード
let placementAreas = [];  // 味方ユニット設置可能エリア (sketch_area.js機能)
let draggingNode = null;  // ドラッグ中の経路ノード/設置エリア

// 定数
const MENU_BUTTON_Y = 8;
const MENU_BUTTON_SIZE = 40;
const REACTION_DISTANCE = 80; // HとOが反応する最大距離
const OBSTACLE_SIZE = 40;     // 障害物のサイズ
const PATH_NODE_SIZE = 20;    // 経路ノードのサイズ

// 色の定義
const colors = {
    'H': '#FFFFFF',  // 水素 (白)
    'O': '#FF4136',  // 酸素 (赤)
    'C': '#555555',  // 炭素 (黒)
    'N': '#3388FF',  // 窒素 (青)
    'H2O': '#ADD8E6' // 水 (ライトブルー)
};

// ===================================
// 2. setup / 周期表データ
// ===================================
function setup() {
    createCanvas(windowWidth, windowHeight);
    gameAreaWidth = width / 2;
    setupPeriodicTable();
}

/**
 * 周期表のデータ (共通)
 */
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
const activeElements = ['H', 'O', 'C', 'N'];

// 周期表のボタンを（再）配置する関数
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
// 3. draw()関数: 状態による処理の分岐
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

        // --- ゲームエリア内の描画 ---
        drawPlacementAreas(); // 設置エリアの描画
        
        // ★バリケードの描画 (ゲームプレイ中のBarricadeクラス)
        for (let bar of gameObstacles) {
            bar.draw();
        }

        drawPathNodes(); 

        if (mainTower) { mainTower.draw(); }
        for (let el of placedGameElements) { el.draw(); }
        drawCombinationHints();
        for (let b of bullets) { b.draw(); }
        for (let e of enemies) { e.draw(); }
        drawShockwaves(); // ★衝撃波の描画 (新規追加)

        if (draggingElement) {
            fill(draggingElement.color);
            stroke(0);
            strokeWeight(2);
            ellipse(mouseX, mouseY, draggingElement.size, draggingElement.size);
            fill(0);
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
// 4. マウス操作関数
// ===================================
function mousePressed() {
    // A. スタート画面
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

    // B. ステージ画面
    if (gameState === 'stage') {
        let buttonX = width - MENU_BUTTON_SIZE - 8;

        // 1. メニューボタン
        if (mouseX > buttonX && mouseX < buttonX + MENU_BUTTON_SIZE &&
            mouseY > MENU_BUTTON_Y && mouseY < MENU_BUTTON_Y + MENU_BUTTON_SIZE) {
            menuOpen = !menuOpen;
            return;
        }

        // 2. メニュー内のボタン
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

        // 3. 元素のドラッグ開始
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

    // C. エディター画面
    if (gameState === 'editor') {
        handleEditorMousePressed();
        return;
    }

    // D. ゲームオーバー画面
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
    // --- ステージモード：ユニット配置 ---
    if (gameState === 'stage' && draggingElement) {
        if (mouseX < gameAreaWidth) {
            
            let cost = elementCosts[draggingElement.name] || 0;
            
            // 障害物(バリケード)との重なりチェック
            let isOverlapping = false;
            for(let obs of gameObstacles) { // ★ゲーム中のBarricade配列をチェック
                if(dist(mouseX, mouseY, obs.x, obs.y) < obs.size/2 + draggingElement.size/2) {
                    isOverlapping = true;
                    break;
                }
            }
            
            // 設置エリアのチェック
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
            } else if (!isInPlacementArea) {
                console.log("設置エリア外には置けません");
            } else if (isOverlapping) {
                console.log("障害物の上には置けません");
            }
        }
        draggingElement = null;
        return;
    }

    // --- エディターモード：ドラッグ解除（設置エリアの確定） ---
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
// 5. 描画・ロジック関数 (抜粋)
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

    drawObstacles(); // エディター用障害物描画
    drawPathNodes();
    drawPlacementAreas(); // 確定した設置エリア
    drawPlacementPreview(); // ドラッグ中の設置エリアプレビュー
    
    // 配置済みのタワーも参考表示（透過）
    for (let el of placedGameElements) { 
        push();
        drawingContext.globalAlpha = 0.5;
        el.draw(); 
        pop();
    }

    // エディターUI
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
    // エネルギー回復
    if (currentEnergy < maxEnergy) {
        let recoveryAmount = energyRegenPerSecond * (deltaTime / 1000);
        currentEnergy += recoveryAmount;
        currentEnergy = min(currentEnergy, maxEnergy);
    }

    // 1. 敵の生成
    if (millis() - lastSpawnTime > SPAWN_INTERVAL) {
        if (pathNodes.length > 0) {
            enemies.push(new Enemy(pathNodes[0].x, pathNodes[0].y, pathNodes));
        } else if (100 < gameAreaWidth) {
            enemies.push(new Enemy(100, 100, []));
        }
        lastSpawnTime = millis();
    }

    // 2. タワーの攻撃
    for (let tower of placedGameElements) {
        if (tower.isDead()) continue;
        tower.findTargetAndAttack(enemies, bullets);
    }

    // 3. 弾丸の移動と衝突
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
    
    // 4. 敵の移動・バリケード攻撃・基地衝突・**味方攻撃** (変更点)
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        // 基地攻撃
        e.isCollidingWithTower = false;
        if (mainTower && mainTower.isAlive()) {
            let distance = dist(e.x, e.y, mainTower.x, mainTower.y);
            if (distance < e.radius + mainTower.radius) {
                e.isCollidingWithTower = true;
                mainTower.takeDamage(1);
            }
        }

        // 敵の移動（バリケード情報を渡す）
        e.followPath(gameObstacles); 
        
        // ★敵ユニットの攻撃 (新規追加)
        e.findTargetAndAttack(placedGameElements, shockwaves);

        // 死亡判定
        if (e.isDead() || e.x < 0 || e.y < 0 || e.x > width || e.y > height) {
            if (e.isDead()) {
                currentEnergy += enemyKillReward;
                currentEnergy = min(currentEnergy, maxEnergy);
            }
            enemies.splice(i, 1);
        }
    }

    // ★味方ユニットの削除 (新規追加)
    placedGameElements = placedGameElements.filter(el => !el.isDead());

    // ★バリケードの状態更新（壊れたら削除）
    for (let i = gameObstacles.length - 1; i >= 0; i--) {
        if (gameObstacles[i].isBroken()) {
            gameObstacles.splice(i, 1);
        }
    }
    
    // ★衝撃波の更新 (新規追加)
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        if (shockwaves[i].isFinished()) {
            shockwaves.splice(i, 1);
        } else {
            shockwaves[i].update();
        }
    }


    // 5. 化学反応
    findCombinationHints();
    checkAndPerformReactions();

    // 6. ゲームオーバー判定
    if (mainTower && !mainTower.isAlive()) {
        console.log("GAME OVER");
        gameState = 'gameover';
    }
}

// ★衝撃波の描画関数 (新規追加)
function drawShockwaves() {
    for (let sw of shockwaves) {
        sw.draw();
    }
}

// --- ステージ開始時の初期化 ---
function initializeStage() {
    console.log("ステージ初期化完了");
    menuOpen = false;
    enemies = [];
    placedGameElements = [];
    bullets = [];
    shockwaves = []; // ★初期化に追加
    combinationHints = [];
    lastSpawnTime = millis();

    // ★エディタで作った障害物データを、ゲーム用のバリケード(Barricade)に変換
    gameObstacles = [];
    for(let obs of obstacles) {
        // Barricadeクラスは下部で定義
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

// --- エディター開始時の初期化 ---
function initializeEditor() {
    console.log("エディター初期化完了");
    editorState = 'path';
    if (pathNodes.length === 0) {
        pathNodes.push({ x: 50, y: height / 4, radius: 20, isStart: true });
        pathNodes.push({ x: gameAreaWidth - 50, y: height / 2, radius: 20, isStart: false });
    }
}


// ===================================
// 6. UIの描画 (抜粋)
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

// 他のUI描画関数（drawMenuOverlay, drawMenuButton, drawMenuPanel, drawBackButton, drawGameOverScreen）は省略。


// ===================================
// 7. クラス定義 (統合)
// ===================================

class PeriodicElement {
    constructor(name, x, y, size, isActive) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.isActive = isActive;
        if (this.isActive) {
            this.color = colors[name] || '#AAAAAA';
        } else {
            this.color = '#BBBBBB';
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
            textColor = (this.name === 'H' ? 0 : 255);
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
    constructor(name, x, y, size) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = this.size / 2;
        this.color = colors[name] || '#AAAAAA';
        this.reacted = false;
        this.lastAttackTime = 0;
        
        // ★HPの追加 (新規追加)
        this.maxHp = 100; 
        this.hp = this.maxHp;

        if (this.name === 'H2O') {
            this.size *= 1.2;
            this.radius = this.size / 2;
            this.range = 200;
            this.attackDamage = 30;
            this.fireRate = 500;
            this.reacted = true;
            this.maxHp = 150; 
            this.hp = this.maxHp;
        } else {
            this.range = 150;
            this.attackDamage = 10;
            this.fireRate = 1000;
        }
    }

    draw() {
        if (this.name !== 'H2O' && !this.reacted) {
            noFill();
            stroke(0, 200, 0, 80);
            strokeWeight(1);
            ellipse(this.x, this.y, REACTION_DISTANCE * 2, REACTION_DISTANCE * 2);
        }

        if (this.name === 'H2O') {
            strokeWeight(3);
            stroke(0, 0, 200);
        } else {
            strokeWeight(2);
            stroke(0);
        }

        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);

        let textColor = (this.name === 'H' || this.name === 'H2O') ? 0 : 255;
        fill(textColor);
        noStroke();
        textAlign(CENTER, CENTER);
        let textSizeRatio = (this.name === 'H2O' ? 0.5 : 0.6);
        textSize(this.size * textSizeRatio);
        text(this.name, this.x, this.y);
        
        // ★HPバーの描画 (新規追加)
        let hpBarWidth = this.size;
        let hpBarHeight = 5;
        let hpRatio = this.hp / this.maxHp;
        
        rectMode(CORNER);
        fill(255, 0, 0, 200);
        rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth, hpBarHeight);
        fill(0, 255, 0, 200);
        rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth * hpRatio, hpBarHeight);
    }

    findTargetAndAttack(enemiesArray, bulletsArray) {
        if (this.reacted && this.name !== 'H2O') { return; }
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
    
    // ★ダメージを受ける (新規追加)
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }
    
    // ★生存判定 (新規追加)
    isDead() {
        return this.hp <= 0;
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


// ★Barricadeクラス (syougai.jsから統合)
class Barricade {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.maxHp = 300; // 壁の体力
        this.hp = this.maxHp;
    }

    draw() {
        rectMode(CENTER);
        stroke(0);
        strokeWeight(2);
        
        let hpRatio = this.hp / this.maxHp;
        fill(139 * hpRatio, 69 * hpRatio, 19); // HPに応じて色を暗く
        
        rect(this.x, this.y, this.size, this.size, 5);

        // HPバー表示
        fill(255, 0, 0);
        noStroke();
        rectMode(CORNER);
        rect(this.x - this.size/2, this.y - this.size/2 - 8, this.size, 5);
        fill(0, 255, 0);
        rect(this.x - this.size/2, this.y - this.size/2 - 8, this.size * hpRatio, 5);
        
        // 文字
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


// ★Enemyクラス (syougai.jsのバリケード対応版を統合)
class Enemy {
    constructor(x, y, path) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.radius = this.size / 2;
        this.health = 100;
        this.damageToWall = 0.5; // 壁への攻撃力
        this.speed = 80;
        
        this.path = path;
        this.currentPathIndex = 0;
        this.isBlocked = false; 
        this.isCollidingWithTower = false; // 基地への衝突フラグも追加
        
        // ★攻撃能力の追加 (新規追加)
        this.attackRange = 70;      // 攻撃射程
        this.attackDamage = 15;     // 攻撃ダメージ
        this.attackRate = 1500;     // 攻撃間隔 (ms)
        this.lastAttackTime = 0;    // 最後の攻撃時間
    }

    draw() {
        fill(255, 0, 0);
        stroke(0);
        strokeWeight(1);
        ellipse(this.x, this.y, this.size, this.size);

        let hpBarWidth = this.size * 0.8;
        let hpBarHeight = 5;
        let hpRatio = this.health / 100;
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

    // ★バリケード対応のfollowPath
    followPath(obstaclesArray) { 
        if (this.isCollidingWithTower || !this.path || this.currentPathIndex >= this.path.length) return;

        // 1. 目の前にバリケードがあるかチェック
        this.isBlocked = false;
        if (obstaclesArray) {
            for (let wall of obstaclesArray) {
                let d = dist(this.x, this.y, wall.x, wall.y);
                if (d < this.radius + wall.size/2 + 5) {
                    this.isBlocked = true;
                    // 壁を攻撃
                    wall.takeDamage(this.damageToWall);
                    break; 
                }
            }
        }

        // 2. ブロックされていなければ移動
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
    
    // ★味方ユニットへの攻撃ロジック (新規追加)
    findTargetAndAttack(placedElementsArray, shockwavesArray) {
        if (this.isDead()) { return; }
        if (millis() - this.lastAttackTime < this.attackRate) { return; }

        let target = null;
        let closestDist = Infinity;
        
        // 攻撃対象は「死んでいない味方ユニット」
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
            // 攻撃開始
            shockwavesArray.push(new Shockwave(this.x, this.y, this.attackRange, this.attackDamage, placedElementsArray));
            this.lastAttackTime = millis();
        }
    }
}

// Particleクラスは省略（両ファイルでほぼ同じため）
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

// ★Shockwaveクラス (新規追加)
class Shockwave {
    constructor(x, y, range, damage, placedElementsArray) {
        this.x = x;
        this.y = y;
        this.maxRange = range;
        this.damage = damage;
        this.placedElements = placedElementsArray;
        this.startTime = millis();
        this.duration = 200; // 衝撃波の表示時間 (ms)
        this.currentRadius = 0;
        this.hit = false;
    }

    update() {
        let elapsed = millis() - this.startTime;
        if (elapsed > this.duration) {
            this.currentRadius = this.maxRange;
            return;
        }

        // 範囲を拡大
        this.currentRadius = map(elapsed, 0, this.duration, 0, this.maxRange);
        
        // ダメージ判定は一度だけ
        if (!this.hit && elapsed > this.duration / 3) {
            this.hit = true;
            for (let unit of this.placedElements) {
                if (!unit.isDead()) {
                    let d = dist(this.x, this.y, unit.x, unit.y);
                    if (d < this.maxRange) { // 判定は最大射程で
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
// 8. 合成機能・描画 (省略)
// ===================================

function checkAndPerformReactions() {
    let unreactedHs = placedGameElements.filter(el => el.name === 'H' && !el.reacted);
    let unreactedOs = placedGameElements.filter(el => el.name === 'O' && !el.reacted);

    if (unreactedHs.length >= 2 && unreactedOs.length >= 1) {
        for (let i = 0; i < unreactedOs.length; i++) {
            let oxygen = unreactedOs[i];
            let nearbyHs = [];
            for (let j = 0; j < unreactedHs.length; j++) {
                let hydrogen = unreactedHs[j];
                if (hydrogen.reacted) continue;
                let d = dist(oxygen.x, oxygen.y, hydrogen.x, hydrogen.y);
                if (d < REACTION_DISTANCE) nearbyHs.push(hydrogen);
            }

            if (nearbyHs.length >= 2) {
                console.log("H2O反応！");
                oxygen.reacted = true;
                nearbyHs[0].reacted = true;
                nearbyHs[1].reacted = true;

                let avgX = (oxygen.x + nearbyHs[0].x + nearbyHs[1].x) / 3;
                let avgY = (oxygen.y + nearbyHs[0].y + nearbyHs[1].y) / 3;
                let newSize = (oxygen.size + nearbyHs[0].size + nearbyHs[1].size) / 3;

                placedGameElements = placedGameElements.filter(el => {
                    if (el.reacted && el.name !== 'H2O') return false;
                    // ★isDead()も考慮
                    if (el.isDead()) return false; 
                    return true;
                });
                placedGameElements.push(new PlacedElement('H2O', avgX, avgY, newSize));
                break;
            }
        }
    }
}

function findCombinationHints() {
    combinationHints = [];
    let unreacted = placedGameElements.filter(el => !el.reacted && !el.isDead()); // ★isDead()も考慮
    for (let i = 0; i < unreacted.length; i++) {
        for (let j = i + 1; j < unreacted.length; j++) {
            let el1 = unreacted[i];
            let el2 = unreacted[j];
            let d = dist(el1.x, el1.y, el2.x, el2.y);
            if (d < REACTION_DISTANCE) {
                let midX = (el1.x + el2.x) / 2;
                let midY = (el1.y + el2.y) / 2;
                if ((el1.name === 'H' && el2.name === 'O') || (el1.name === 'O' && el2.name === 'H')) {
                    combinationHints.push({ x: midX, y: midY, name: 'H' });
                } else if (el1.name === 'H' && el2.name === 'H') {
                    combinationHints.push({ x: midX, y: midY, name: 'O' });
                }
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
        ellipse(hint.x, hint.y, 40, 40);
        let textColor = color(0, 0, 0, 150);
        fill(textColor);
        textSize(30);
        textAlign(CENTER, CENTER);
        text(hint.name, hint.x, hint.y);
    }
}


// ===================================
// 9. グリッド描画・リサイズ・エディター操作 (統合)
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
        fill(100, 255, 100, 100); // 半透明の緑
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

        fill(255, 255, 0, 80); // 半透明の黄色でプレビュー
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
                // 重ね置き防止チェック (syougai.js機能)
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
                // 設置エリアのドラッグ開始
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
                // 設置エリアの削除
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
            // 設置エリアのプレビュー更新
            draggingNode.endX = mouseX;
            draggingNode.endY = mouseY;
        }
    }
}

// ----------------------------------------------------
// その他の関数（drawMenuOverlay, drawMenuButton, drawMenuPanel, drawBackButton, drawGameOverScreen）は割愛しています。
// ----------------------------------------------------

// ===================================
// その他のUI描画関数（省略されていた部分）
// ===================================

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