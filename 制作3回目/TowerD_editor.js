// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start'; // ゲームの状態: 'start', 'stage', 'gameover', 'editor'
let menuOpen = false;    // メニューの開閉状態
let gameAreaWidth; // ゲームエリアの幅（X座標の境界線）

// --- 周期表・タワー関連 ---
let periodicTableElements = []; // 周期表の元素（ドラッグ元）
let placedGameElements = []; // ゲーム画面に配置された元素（防衛ユニット, H2O含む）
let draggingElement = null; // 現在ドラッグ中の元素データ
let combinationHints = []; // 合成ヒントの描画用配列

// --- 敵・基地・弾丸関連 ---
let enemies = []; // 敵を管理する配列
let mainTower; // メインタワー（基地）
let bullets = []; // 弾丸を管理する配列
let lastSpawnTime = 0; // 最後に敵を生成した時間
const SPAWN_INTERVAL = 1000; // 敵を生成する間隔 (ms)

// ★ 追加 ★ ステージエディター関連
let editorState = 'path'; // エディターのサブ状態: 'path', 'obstacle', 'placement'
let obstacles = []; // 障害物の配列 (エディターで配置)
let pathNodes = []; // 敵の進行経路ノード
let placementAreas = []; // 味方ユニット設置可能エリア
let draggingNode = null; // ドラッグ中の経路ノード
let draggingArea = null; // ドラッグ中の設置エリアの頂点

// メニューボタンの定数
const MENU_BUTTON_Y = 8;
const MENU_BUTTON_SIZE = 40;

// 合成の定数
const REACTION_DISTANCE = 80; // HとOが反応する最大距離

// 色の定義
const colors = {
    'H': '#FFFFFF', // 水素 (白)
    'O': '#FF4136', // 酸素 (赤)
    'C': '#555555', // 炭素 (黒)
    'N': '#3388FF', // 窒素 (青)
    'H2O': '#ADD8E6' // 水 (ライトブルー)
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    gameAreaWidth = width / 2;
    setupPeriodicTable();
}

/**
 * 周期表のデータ (中略)
 */
const elementData = [
    // Period 1 (第1周期)
    { symbol: 'H', row: 1, col: 1 },  { symbol: 'He', row: 1, col: 18 },
    // Period 2 (第2周期)
    { symbol: 'Li', row: 2, col: 1 }, { symbol: 'Be', row: 2, col: 2 },
    { symbol: 'B', row: 2, col: 13 }, { symbol: 'C', row: 2, col: 14 }, { symbol: 'N', row: 2, col: 15 }, { symbol: 'O', row: 2, col: 16 }, { symbol: 'F', row: 2, col: 17 }, { symbol: 'Ne', row: 2, col: 18 },
    // Period 3 (第3周期)
    { symbol: 'Na', row: 3, col: 1 }, { symbol: 'Mg', row: 3, col: 2 },
    { symbol: 'Al', row: 3, col: 13 }, { symbol: 'Si', row: 3, col: 14 }, { symbol: 'P', row: 3, col: 15 }, { symbol: 'S', row: 3, col: 16 }, { symbol: 'Cl', row: 3, col: 17 }, { symbol: 'Ar', row: 3, col: 18 },
    // Period 4 (第4周期)
    { symbol: 'K', row: 4, col: 1 }, { symbol: 'Ca', row: 4, col: 2 }, { symbol: 'Sc', row: 4, col: 3 }, { symbol: 'Ti', row: 4, col: 4 }, { symbol: 'V', row: 4, col: 5 }, { symbol: 'Cr', row: 4, col: 6 }, { symbol: 'Mn', row: 4, col: 7 }, { symbol: 'Fe', row: 4, col: 8 }, { symbol: 'Co', row: 4, col: 9 }, { symbol: 'Ni', row: 4, col: 10 }, { symbol: 'Cu', row: 4, col: 11 }, { symbol: 'Zn', row: 4, col: 12 },
    { symbol: 'Ga', row: 4, col: 13 }, { symbol: 'Ge', row: 4, col: 14 }, { symbol: 'As', row: 4, col: 15 }, { symbol: 'Se', row: 4, col: 16 }, { symbol: 'Br', row: 4, col: 17 }, { symbol: 'Kr', row: 4, col: 18 },
    // Period 5 (第5周期)
    { symbol: 'Rb', row: 5, col: 1 }, { symbol: 'Sr', row: 5, col: 2 }, { symbol: 'Y', row: 5, col: 3 }, { symbol: 'Zr', row: 5, col: 4 }, { symbol: 'Nb', row: 5, col: 5 }, { symbol: 'Mo', row: 5, col: 6 }, { symbol: 'Tc', row: 5, col: 7 }, { symbol: 'Ru', row: 5, col: 8 }, { symbol: 'Rh', row: 5, col: 9 }, { symbol: 'Pd', row: 5, col: 10 }, { symbol: 'Ag', row: 5, col: 11 }, { symbol: 'Cd', row: 5, col: 12 },
    { symbol: 'In', row: 5, col: 13 }, { symbol: 'Sn', row: 5, col: 14 }, { symbol: 'Sb', row: 5, col: 15 }, { symbol: 'Te', row: 5, col: 16 }, { symbol: 'I', row: 5, col: 17 }, { symbol: 'Xe', row: 5, col: 18 },
    // Period 6 (第6周期)
    { symbol: 'Cs', row: 6, col: 1 }, { symbol: 'Ba', row: 6, col: 2 }, { symbol: 'La', row: 6, col: 3 }, /* ランタノイド */ { symbol: 'Hf', row: 6, col: 4 }, { symbol: 'Ta', row: 6, col: 5 }, { symbol: 'W', row: 6, col: 6 }, { symbol: 'Re', row: 6, col: 7 }, { symbol: 'Os', row: 6, col: 8 }, { symbol: 'Ir', row: 6, col: 9 }, { symbol: 'Pt', row: 6, col: 10 }, { symbol: 'Au', row: 6, col: 11 }, { symbol: 'Hg', row: 6, col: 12 },
    { symbol: 'Tl', row: 6, col: 13 }, { symbol: 'Pb', row: 6, col: 14 }, { symbol: 'Bi', row: 6, col: 15 }, { symbol: 'Po', row: 6, col: 16 }, { symbol: 'At', row: 6, col: 17 }, { symbol: 'Rn', row: 6, col: 18 },
    // Period 7 (第7周期)
    { symbol: 'Fr', row: 7, col: 1 }, { symbol: 'Ra', row: 7, col: 2 }, { symbol: 'Ac', row: 7, col: 3 }, /* アクチノイド */ { symbol: 'Rf', row: 7, col: 4 }, { symbol: 'Db', row: 7, col: 5 }, { symbol: 'Sg', row: 7, col: 6 }, { symbol: 'Bh', row: 7, col: 7 }, { symbol: 'Hs', row: 7, col: 8 }, { symbol: 'Mt', row: 7, col: 9 }, { symbol: 'Ds', row: 7, col: 10 }, { symbol: 'Rg', row: 7, col: 11 }, { symbol: 'Cn', row: 7, col: 12 },
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
// 2. draw()関数: 状態による処理の分岐
// ===================================
function draw() {
    if (gameState === 'start') {
        drawStartScreen();
       
    } else if (gameState === 'stage' || gameState === 'gameover') {
        // 'stage' と 'gameover' 共通の描画（ゲーム画面）
        background(100, 150, 100);
       
        drawGrid(); // グリッドを描画
       
        // 描画ロジックの呼び出し
        drawGameElements();

        // ゲームロジックの更新は 'stage' の時だけ
        if (!menuOpen && gameState === 'stage') {
            updateGameLogic();
        }
       
        // メニュー描画
        drawMenuOverlay();
       
        // ゲームオーバー画面のオーバーレイ
        if (gameState === 'gameover') {
            drawGameOverScreen();
        }
    } else if (gameState === 'editor') {
        drawEditorScreen();
    }
}

// ゲーム要素の描画（stage/gameover/editor で共通利用可能）
function drawGameElements() {
    drawAreas();
    for (let el of periodicTableElements) { el.draw(); }
    
    // --- ゲームエリア内の描画 ---
    
    // 0. 設置可能エリア (ステージとエディターで描画)
    drawPlacementAreas();

    // 1. 障害物 (ステージとエディターで描画)
    drawObstacles();

    // 2. 経路 (ステージとエディターで描画)
    drawPathNodes();
    
    if (mainTower) { mainTower.draw(); }
    
    // 3. 配置された元素 (タワー, H2O含む)
    for (let el of placedGameElements) { el.draw(); }
    
    // 4. 合成ヒント
    drawCombinationHints();

    // 5. 弾丸
    for (let b of bullets) { b.draw(); }
    
    // 6. 敵
    for (let e of enemies) { e.draw(); }

    // 7. ドラッグ中の描画 (最前面)
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
}

// drawAreas() 関数
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
// 3. マウス操作関数
// ===================================
function mousePressed() {
   
    // A. スタート画面
    if (gameState === 'start') {
        // 1. ゲーム開始ボタン
        if (mouseY < height / 2 + 100 && mouseY > height / 2) {
            gameState = 'stage';
            initializeStage();
            return;
        }
        // 2. エディター開始ボタン
        if (mouseY > height / 2 + 150 && mouseY < height / 2 + 200) {
            gameState = 'editor';
            initializeEditor();
            return;
        }
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

        // 1. リスタート
        if (mouseX > restartX && mouseX < restartX + BUTTON_W &&
            mouseY > restartY && mouseY < restartY + BUTTON_H) {
            initializeStage();
            gameState = 'stage';  
            return;
        }

        // 2. タイトルに戻る
        if (mouseX > titleX && mouseX < titleX + BUTTON_W &&
            mouseY > titleY && mouseY < titleY + BUTTON_H) {
            gameState = 'start';
            return;
        }
    }
}

// mouseReleased()
function mouseReleased() {
    if (gameState === 'stage' && draggingElement) {
        if (mouseX < gameAreaWidth) {
            // TODO: 設置可能エリアのチェックを追加する
            placedGameElements.push(
                new PlacedElement(
                    draggingElement.name,
                    mouseX,
                    mouseY,
                    draggingElement.size
                )
            );
        }
        draggingElement = null;
        return;
    }

    if (gameState === 'editor') {
        draggingNode = null;
        draggingArea = null;
    }
}


// ===================================
// 4. 描画・ロジック関数
// ===================================

// --- 4-1. スタート画面の描画 ---
function drawStartScreen() {
    background(50, 50, 100);
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text('タワーディフェンス', width / 2, height / 2 - 50);
    
    // ゲーム開始ボタン
    fill(50, 200, 50);
    rect(width / 2 - 100, height / 2, 200, 50, 5);
    fill(255);
    textSize(24);
    text('ゲーム開始', width / 2, height / 2 + 25);
    
    // エディター開始ボタン
    fill(50, 50, 200);
    rect(width / 2 - 100, height / 2 + 150, 200, 50, 5);
    fill(255);
    textSize(24);
    text('エディター', width / 2, height / 2 + 175);
}

// --- 4-2. エディター画面の描画 ---
function drawEditorScreen() {
    background(100, 150, 100);
    drawGrid();
    drawGameElements();

    // エディターUI
    fill(200, 200, 255, 180);
    rect(gameAreaWidth + 10, height - 120, width - gameAreaWidth - 20, 110, 5);
    
    fill(0);
    textSize(20);
    textAlign(LEFT, TOP);
    text("■ エディターモード", gameAreaWidth + 20, height - 110);
    text("現在のモード: " + editorState, gameAreaWidth + 20, height - 80);

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
        { mode: 'save', label: 'ステージ保存', color: [50, 50, 200] }
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
        
        if (i < buttons.length - 1) {
            x += BUTTON_W + MARGIN;
        }
    }
    
    // タイトルに戻るボタン
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

// --- 4-3. ゲームロジックの更新 ---
function updateGameLogic() {
   
    // 1. 敵の生成 (時間ベースの生成)
    if (millis() - lastSpawnTime > SPAWN_INTERVAL) {
        // 経路の最初のノードの近くに敵を生成
        if (pathNodes.length > 0) {
            enemies.push(new Enemy(pathNodes[0].x, pathNodes[0].y, pathNodes));
        } else if (100 < gameAreaWidth) {
            // 経路がない場合はデフォルト位置に生成
            enemies.push(new Enemy(100, 100, pathNodes));
        }
        lastSpawnTime = millis(); // タイマーをリセット
    }
   
    // 2. タワーの攻撃 (H2O含む)
    for (let tower of placedGameElements) {
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

        if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
            bullets.splice(i, 1);
        }
    }
   
    // 4. 敵の移動と基地への衝突
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        // 4-a. メインタワーとの衝突
        e.isCollidingWithTower = false;
        if (mainTower && mainTower.isAlive()) {
            let distance = dist(e.x, e.y, mainTower.x, mainTower.y);
            let collisionThreshold = e.radius + mainTower.radius;
           
            if (distance < collisionThreshold) {
                e.isCollidingWithTower = true;
                mainTower.takeDamage(1);
            }
        }

        // 4-b. 敵の移動
        // e.move1(gameAreaWidth, height); // デフォルトの移動をコメントアウト
        e.followPath(); // 経路追従の移動に切り替え
   
        // 4-c. 敵の死亡判定
        if (e.isDead() || e.x < 0 || e.y < 0 || e.x > width || e.y > height) {
            enemies.splice(i, 1);
        }
    }
   
    // 5. 合成ヒントの検索
    findCombinationHints();
   
    // 6. 化学反応のチェック
    checkAndPerformReactions();

    // 7. ゲームオーバー判定
    if (mainTower && !mainTower.isAlive()) {
        console.log("GAME OVER");
        gameState = 'gameover';
    }
}

// --- 4-4. ステージ開始時の初期化 ---
function initializeStage() {
    console.log("ステージ初期化完了");
    menuOpen = false;
   
    // 全ての状態をリセット
    enemies = [];
    placedGameElements = [];
    bullets = [];
    combinationHints = [];
    lastSpawnTime = millis(); // 敵生成タイマーをリセット
   
    // 基地の位置は最後の経路ノード（またはデフォルト）
    let towerX, towerY;
    if (pathNodes.length > 0) {
        towerX = pathNodes[pathNodes.length - 1].x;
        towerY = pathNodes[pathNodes.length - 1].y;
    } else {
        towerX = gameAreaWidth - 50;
        towerY = height / 2;
    }

    mainTower = new MainTower(towerX, towerY, 60);
   
    loop();
}

// --- 4-5. エディター開始時の初期化 ---
function initializeEditor() {
    console.log("エディター初期化完了");
    editorState = 'path';
    // 初期経路ノードがない場合、デフォルトのノードを追加
    if (pathNodes.length === 0) {
        pathNodes.push({ x: 50, y: height / 4, radius: 10, isStart: true });
        pathNodes.push({ x: gameAreaWidth - 50, y: height / 2, radius: 10, isStart: false });
    }
}


// ===================================
// 5. メニュー機能の描画
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

// --- 5-X. ゲームオーバー画面の描画 ---
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

    // --- リスタートボタン ---
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

    // --- タイトルに戻るボタン ---
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
// 6. クラス定義
// ===================================
// (PeriodicElement, PlacedElement, MainTower, Particle の定義は省略。変更なし)

// --- 敵クラス --- (★ 修正 ★ 経路追従に対応)
class Enemy{
  constructor(x, y, path){
    this.x = x;
    this.y = y;
    this.size = 30;
    this.radius = this.size / 2;
    this.health = 100;
    this.isCollidingWithTower = false;
   
    this.speed = 80; // 毎秒Xピクセル
    
    // ★ 経路追従用の追加プロパティ
    this.path = path;
    this.currentPathIndex = 0;
  }
 
  draw() {
    fill(255, 0, 0);
    stroke(0);
    strokeWeight(1);
    ellipse(this.x, this.y, this.size, this.size);

    // HPバー
    let hpBarWidth = this.size * 0.8;
    let hpBarHeight = 5;
    let hpRatio = this.health / 100;
    fill(0, 255, 0);
    noStroke();
    rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth * hpRatio, hpBarHeight);
    stroke(0);
    noFill();
    rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth, hpBarHeight);
  }

  takeDamage(amount) {
      this.health -= amount;
      if (this.health < 0) {
          this.health = 0;
      }
  }

  isDead() {
      return this.health <= 0;
  }

  // 経路追従の移動
  followPath() {
    if (this.isCollidingWithTower || this.currentPathIndex >= this.path.length) {
        return;
    }
   
    let targetNode = this.path[this.currentPathIndex];
    let dt = deltaTime / 1000;
    let moveAmount = this.speed * dt;
   
    let angle = atan2(targetNode.y - this.y, targetNode.x - this.x);
   
    let dx = cos(angle) * moveAmount;
    let dy = sin(angle) * moveAmount;
   
    let currentDist = dist(this.x, this.y, targetNode.x, targetNode.y);
   
    if (currentDist <= moveAmount) {
        // ノードに到達したら、次のノードへ
        this.x = targetNode.x;
        this.y = targetNode.y;
        this.currentPathIndex++;
    } else {
        // ノードに向かって移動
        this.x += dx;
        this.y += dy;
    }
  }
}


// (PeriodicElement, PlacedElement, MainTower, Particle の定義を補完 - 長大になるため、実際のコードでは省略せず含めてください)

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
        if (!this.isActive) {
            return false;
        }
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

        if (this.name === 'H2O') {
            this.size *= 1.2;
            this.radius = this.size / 2;
            this.range = 200;          
            this.attackDamage = 30;    
            this.fireRate = 500;        
            this.reacted = true;        
           
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
       
        let textColor;
        if (this.name === 'H' || this.name === 'H2O') {
            textColor = 0;
        } else {
            textColor = 255;
        }
       
        fill(textColor);
        noStroke();
        textAlign(CENTER, CENTER);
       
        let textSizeRatio = (this.name === 'H2O' ? 0.5 : 0.6);
        textSize(this.size * textSizeRatio);
        text(this.name, this.x, this.y);
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
            let bulletColor = (this.name === 'H2O') ? this.color : this.color;
            bulletsArray.push(new Particle(this.x, this.y, target, this.attackDamage, bulletColor));
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
        if (this.hp < 0) {
            this.hp = 0;
        }
    }
   
    isAlive() {
        return this.hp > 0;
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
                let angle = atan2(this.y - this.y, this.x - this.x); // ダミー計算
                if (this.target) {
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
// 7. 合成機能
// ===================================
// (checkAndPerformReactions, findCombinationHints, drawCombinationHints の定義は省略。変更なし)

// ===================================
// 8. グリッド描画関数
// ===================================
function drawGrid() {
    let gridSize = 40;

    stroke(0, 0, 0, 50);
    strokeWeight(1);

    // 垂直線
    for (let x = 0; x < gameAreaWidth; x += gridSize) {
        line(x, 0, x, height);
    }
   
    // 水平線
    for (let y = 0; y < height; y += gridSize) {
        line(0, y, gameAreaWidth, y);
    }
}

// ===================================
// 9. ウィンドウリサイズ対応
// ===================================
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    gameAreaWidth = width / 2;
    setupPeriodicTable();
}

// ===================================
// 10. ★ 新規追加 ★ エディター機能
// ===================================

const OBSTACLE_SIZE = 40;
const PATH_NODE_SIZE = 20;

/**
 * エディター画面でのマウス操作を処理
 */
function handleEditorMousePressed() {
    // UIボタンのクリック処理
    const BUTTON_W = 100;
    const BUTTON_H = 30;
    const START_X = gameAreaWidth + 20;
    const START_Y = height - 50;
    const MARGIN = 10;
    let x = START_X;
    
    // モード切り替えボタン
    let modes = ['path', 'obstacle', 'placement'];
    for (let mode of modes) {
        if (mouseX > x && mouseX < x + BUTTON_W && mouseY > START_Y && mouseY < START_Y + BUTTON_H) {
            editorState = mode;
            return;
        }
        x += BUTTON_W + MARGIN;
    }

    // タイトルに戻るボタン
    const BACK_BUTTON_W = 150;
    let backX = width - BACK_BUTTON_W - 10;
    let backY = height - 50;
    if (mouseX > backX && mouseX < backX + BACK_BUTTON_W && mouseY > backY && mouseY < backY + BUTTON_H) {
        gameState = 'start';
        return;
    }
    
    // 保存ボタン（ダミー）
    let saveX = START_X + 3 * (BUTTON_W + MARGIN);
    if (mouseX > saveX && mouseX < saveX + BUTTON_W && mouseY > START_Y && mouseY < START_Y + BUTTON_H) {
        console.log("ステージデータ保存 (未実装)");
        return;
    }

    // ゲームエリア内での操作
    if (mouseX < gameAreaWidth) {
        if (mouseButton === LEFT) {
            if (editorState === 'obstacle') {
                obstacles.push({ x: mouseX, y: mouseY, size: OBSTACLE_SIZE });
            } else if (editorState === 'path') {
                // 既存ノードのドラッグ開始
                for (let node of pathNodes) {
                    if (dist(mouseX, mouseY, node.x, node.y) < node.radius + 5) {
                        draggingNode = node;
                        return;
                    }
                }
                // 新しいノードの追加
                pathNodes.push({ x: mouseX, y: mouseY, radius: PATH_NODE_SIZE, isStart: false });
            } else if (editorState === 'placement') {
                // 新しいエリアの作成 (初期矩形)
                placementAreas.push(new PlacementArea(mouseX, mouseY, 50, 50));
            }
        } else if (mouseButton === RIGHT) {
            // 右クリックで削除（ここでは障害物のみ実装）
            if (editorState === 'obstacle') {
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    if (dist(mouseX, mouseY, obstacles[i].x, obstacles[i].y) < obstacles[i].size / 2) {
                        obstacles.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
}

/**
 * エディターモードでのマウスドラッグ処理
 */
function mouseDragged() {
    if (gameState === 'editor' && mouseX < gameAreaWidth) {
        if (editorState === 'path' && draggingNode) {
            draggingNode.x = mouseX;
            draggingNode.y = mouseY;
        }
        // TODO: placementAreaのサイズ変更・移動ロジックを追加
    }
}


/**
 * 障害物の描画
 */
function drawObstacles() {
    for (let obs of obstacles) {
        fill(50, 50, 50);
        strokeWeight(2);
        stroke(0);
        rectMode(CENTER);
        rect(obs.x, obs.y, obs.size, obs.size, 5);
    }
}

/**
 * 敵の進行経路の描画
 */
function drawPathNodes() {
    if (pathNodes.length === 0) return;

    // 経路線
    noFill();
    stroke(255, 0, 0, 150);
    strokeWeight(3);
    beginShape();
    for (let node of pathNodes) {
        vertex(node.x, node.y);
    }
    endShape();

    // ノード
    for (let i = 0; i < pathNodes.length; i++) {
        let node = pathNodes[i];
        
        strokeWeight(2);
        stroke(0);

        if (i === 0) {
            fill(0, 255, 0); // 開始点
        } else if (i === pathNodes.length - 1) {
            fill(0, 0, 255); // 終点（基地）
        } else {
            fill(255, 255, 0); // 中間点
        }
        
        ellipse(node.x, node.y, PATH_NODE_SIZE, PATH_NODE_SIZE);
        
        fill(0);
        textSize(10);
        textAlign(CENTER, CENTER);
        text(i, node.x, node.y);
    }
}

/**
 * 味方ユニットの設置可能エリアの描画
 */
function drawPlacementAreas() {
    for (let area of placementAreas) {
        noStroke();
        fill(0, 255, 0, 80);
        rectMode(CORNER);
        rect(area.x, area.y, area.w, area.h);
        
        if (gameState === 'editor') {
            strokeWeight(2);
            stroke(0, 100, 0);
            noFill();
            rect(area.x, area.y, area.w, area.h);
        }
    }
}

// 設置可能エリアクラス (簡易実装)
class PlacementArea {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

// ===================================
// 7. 合成機能 (補完)
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
                if (d < REACTION_DISTANCE) {
                    nearbyHs.push(hydrogen);
                }
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
                    if (el.reacted && el.name !== 'H2O') {
                        return false;
                    }
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
    let unreacted = placedGameElements.filter(el => !el.reacted);

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
                }
                else if (el1.name === 'H' && el2.name === 'H') {
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