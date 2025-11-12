// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start'; // ゲームの状態: 'start', 'stage', 'gameover'
let menuOpen = false;    // メニューの開閉状態
let gameAreaWidth; // ゲームエリアの幅（X座標の境界線）

// --- 周期表・タワー関連 ---
let periodicTableElements = []; // 周期表の元素（ドラッグ元）
let placedGameElements = []; // ゲーム画面に配置された元素（防衛ユニット, H2O含む）
let draggingElement = null; // 現在ドラッグ中の元素データ

// ★ 修正 ★ combinedElements は placedGameElements に統合
let combinationHints = []; // 合成ヒントの描画用配列

// --- 敵・基地・弾丸関連 ---
let enemies = []; // 敵を管理する配列
let mainTower; // メインタワー（基地）
let bullets = []; // 弾丸を管理する配列

// メニューボタンの定数
const MENU_BUTTON_X = 1635;
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
    { symbol: 'H', row: 1, col: 1 },  { symbol: 'He', row: 1, col: 18 },
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

// 周期表のボタンを（再）配置する関数 (変更なし)
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
// ★ 修正 ★ drawGrid() を追加
function draw() {
    if (gameState === 'start') {
        drawStartScreen();
        
    } else if (gameState === 'stage' || gameState === 'gameover') {
        // 'stage' と 'gameover' 共通の描画（ゲーム画面）
        background(100, 150, 100); 
        
        drawGrid(); // ★ グリッドを描画 ★
        
        drawAreas();
        for (let el of periodicTableElements) { el.draw(); }
        
        // --- ゲームエリア内の描画 ---
        if (mainTower) { mainTower.draw(); }
        
        // 1. 配置された元素 (タワー, H2O含む)
        for (let el of placedGameElements) { el.draw(); }
        
        // 2. 合成ヒント
        drawCombinationHints();

        // 3. 弾丸
        for (let b of bullets) { b.draw(); } 
        
        // 4. 敵
        for (let e of enemies) { e.draw(); }

        // 5. ドラッグ中の描画 (最前面)
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
    }
}

// drawAreas() 関数 (変更なし)
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
// mousePressed() (変更なし)
function mousePressed() {
    
    // A. スタート画面
    if (gameState === 'start') {
        gameState = 'stage'; 
        initializeStage(); 
        return;
    }
    
    // B. ステージ画面
    if (gameState === 'stage') {
        // 1. メニューボタン
        if (mouseX > MENU_BUTTON_X && mouseX < MENU_BUTTON_X + MENU_BUTTON_SIZE &&
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
    
    // C. ゲームオーバー画面
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

// mouseReleased() (変更なし)
function mouseReleased() {
    if (draggingElement) {
        if (mouseX < gameAreaWidth) {
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
    }
}

// ===================================
// 4. 描画・ロジック関数
// ===================================

// --- 4-1. スタート画面の描画 --- (変更なし)
function drawStartScreen() {
    background(50, 50, 100);
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text('タワーディフェンス', width / 2, height / 2 - 50);
    textSize(24);
    text('クリックでゲーム開始', width / 2, height / 2 + 50);
}

// --- 4-3. ゲームロジックの更新 --- (変更なし)
function updateGameLogic() {
    
    // 1. 敵の生成
    if (frameCount % 60 == 0) {
        if (100 < gameAreaWidth) { 
             enemies.push(new Enemy(100, 100));
        }
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
        e.move1(gameAreaWidth, height); 
    
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

// --- 4-4. ステージ開始時の初期化 --- (変更なし)
function initializeStage() {
    console.log("ステージ初期化完了");
    menuOpen = false;
    
    // 全ての状態をリセット
    enemies = [];
    placedGameElements = [];
    bullets = []; 
    combinationHints = []; 
    
    let towerX = gameAreaWidth - 50; 
    let towerY = height / 2;
    mainTower = new MainTower(towerX, towerY, 60);
    
    loop(); 
}

// ===================================
// 5. メニュー機能の描画 (変更なし)
// ===================================

function drawMenuOverlay() {
    if (gameState !== 'gameover') {
         drawMenuButton(MENU_BUTTON_X, MENU_BUTTON_Y, MENU_BUTTON_SIZE, menuOpen);
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

// --- 5-X. ゲームオーバー画面の描画 --- (変更なし)
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
// 6. クラス定義 (変更なし)
// ===================================

// --- 周期表の元素クラス --- (変更なし)
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

// --- ゲームエリアに配置された元素（防衛ユニット）クラス ---
// (H, O, H2O などを全てこのクラスで管理)
class PlacedElement {
    constructor(name, x, y, size) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = this.size / 2;
        this.color = colors[name] || '#AAAAAA';
        
        // --- 共通プロパティ ---
        this.reacted = false; // 合成に使われたか
        this.lastAttackTime = 0;

        // ★★★ 名前によってステータスを変更 ★★★
        if (this.name === 'H2O') {
            this.size *= 1.2; // H2Oは少し大きく
            this.radius = this.size / 2;

            // H2O専用の攻撃ステータス (より強く、より遅く)
            this.range = 200;           // 射程UP
            this.attackDamage = 30;     // 攻撃力UP
            this.fireRate = 500;        // 0.5秒に1回発射
            this.reacted = true;        // H2Oはこれ以上合成しない
            
        } else {
            // H, O などの基本元素のステータス
            this.range = 150; 
            this.attackDamage = 10;
            // ユーザーが設定した「1000msごと」の連射
            this.fireRate = 1000; // 1000ミリ秒 (1秒) に1回
        }
    }
    
    draw() {
        // 1. 合成範囲の円を描画
        // (H2Oではなく、まだ合成されていない元素のみ)
        if (this.name !== 'H2O' && !this.reacted) {
            noFill();
            stroke(0, 200, 0, 80); // 半透明の緑
            strokeWeight(1);
            ellipse(this.x, this.y, REACTION_DISTANCE * 2, REACTION_DISTANCE * 2);
        }

        // 2. 元素本体の描画 (H2Oだけ特別なスタイル)
        if (this.name === 'H2O') {
            strokeWeight(3); 
            stroke(0, 0, 200); // H2Oは青い枠
        } else {
            strokeWeight(2);
            stroke(0); // その他は黒い枠
        }
        
        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);
        
        // 3. テキストの描画
        let textColor;
        if (this.name === 'H') {
            textColor = 0; // H (白背景)
        } else if (this.name === 'H2O') {
            textColor = 0; // H2O (水色背景)
        } else {
            textColor = 255; // O, C, N など
        }
        
        fill(textColor);
        noStroke();
        textAlign(CENTER, CENTER);
        
        // H2Oは文字が長いため、少し小さく
        let textSizeRatio = (this.name === 'H2O' ? 0.5 : 0.6);
        textSize(this.size * textSizeRatio);
        text(this.name, this.x, this.y);
    }

    // 攻撃メソッド (H2Oもこのメソッドを使う)
    findTargetAndAttack(enemiesArray, bulletsArray) {
        
        // ★ 修正 ★ 合成済みのタワー(H, O)は攻撃しない
        if (this.reacted && this.name !== 'H2O') {
             // (H2O自身は reacted=true だが、攻撃を許可する)
            return;
        }
        
        // クールダウン計算 (ミリ秒ベース)
        if (millis() - this.lastAttackTime < this.fireRate) {
            return; // まだクールダウン中
        }

        let target = null;
        let closestDist = Infinity;

        // 最も近い敵を探す
        for (let enemy of enemiesArray) {
            if (!enemy.isDead()) {
                let d = dist(this.x, this.y, enemy.x, enemy.y);
                if (d < this.range && d < closestDist) {
                    closestDist = d;
                    target = enemy;
                }
            }
        }

        // ターゲットがいれば攻撃
        if (target) {
            // H2Oの弾は色を変える (オプション)
            let bulletColor = (this.name === 'H2O') ? this.color : this.color;
            bullets.push(new Particle(this.x, this.y, target, this.attackDamage, bulletColor));
            this.lastAttackTime = millis(); // 攻撃時刻を更新
        }
    }
}


// --- メインタワー（基地）クラス --- (変更なし)
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
        
        // HPバー
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


// --- 敵クラス --- (変更なし)
class Enemy{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.size = 30;
    this.radius = this.size / 2;
    this.health = 100; 
    this.isCollidingWithTower = false; 
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

  move1(gameAreaWidth, gameAreaHeight){
    if (this.isCollidingWithTower) {
        return; 
    }
    
    let turningPointX = gameAreaWidth - 50; 
    let turningPointY = gameAreaHeight / 2; 

    if(this.x <= turningPointX){
      if(abs(this.y - turningPointY) < 2){ 
        this.x = this.x - 2;
      }
      this.x = this.x + 1;
    } else if (this.y <= turningPointY){
      this.y = this.y + 2;
    }
  }
}

// --- 弾丸 (パーティクル) クラス --- (変更なし)
class Particle {
    constructor(startX, startY, targetEnemy, damage, color) {
        this.x = startX;
        this.y = startY;
        this.target = targetEnemy; 
        this.damage = damage;
        this.color = color;
        this.speed = 5; 
        this.size = 10; 

        this.vx = 0;
        this.vy = 0;
        this.hasTarget = true; 
    }

    update() {
        if (this.hasTarget) {
            if (!this.target || this.target.isDead()) {
                this.hasTarget = false;
                
                let angle = atan2(this.target.y - this.y, this.target.x - this.x);
                this.vx = cos(angle) * this.speed;
                this.vy = sin(angle) * this.speed;
                
            } else {
                let angle = atan2(this.target.y - this.y, this.target.x - this.x);
                this.x += cos(angle) * this.speed;
                this.y += sin(angle) * this.speed;
                return; 
            }
        }
        
        this.x += this.vx;
        this.y += this.vy;
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
// 7. 合成機能 (★ バグ修正済み ★)
// ===================================

/**
 * 化学反応をチェックし、実行する関数
 */
function checkAndPerformReactions() {
    // 未反応のHとOをフィルタリング
    let unreactedHs = placedGameElements.filter(el => el.name === 'H' && !el.reacted);
    let unreactedOs = placedGameElements.filter(el => el.name === 'O' && !el.reacted);

    // H2O (H2 + O) の反応
    if (unreactedHs.length >= 2 && unreactedOs.length >= 1) {
        // Oを中心にHを探す
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

            // Oの近くに2つ以上のHがあれば反応成立
            if (nearbyHs.length >= 2) {
                console.log("H2O反応！");
                // 反応に使われる元素をマーク
                oxygen.reacted = true;
                nearbyHs[0].reacted = true;
                nearbyHs[1].reacted = true;

                // H2Oを生成 (反応した元素の中心に配置)
                let avgX = (oxygen.x + nearbyHs[0].x + nearbyHs[1].x) / 3;
                let avgY = (oxygen.y + nearbyHs[0].y + nearbyHs[1].y) / 3;
                let newSize = (oxygen.size + nearbyHs[0].size + nearbyHs[1].size) / 3;
                
                // ★★★ バグ修正 ★★★
                // 1. 先に素材(H, O)を削除する
                // H2O (name === 'H2O') は削除しないようにフィルタリングを強化
                placedGameElements = placedGameElements.filter(el => {
                    if (el.reacted && el.name !== 'H2O') {
                        return false; // reactedフラグがtrueのHとOは削除
                    }
                    return true; // それ以外(H2O含む)は残す
                });

                // 2. その後に H2O を追加する
                placedGameElements.push(new PlacedElement('H2O', avgX, avgY, newSize));
                
                break; // 1フレームで1反応まで
            }
        }
    }
}


/**
 * 組み合わせが可能な元素のペアを探し、ヒント配列を更新する
 */
function findCombinationHints() {
    combinationHints = []; // 毎フレームリセット
    let unreacted = placedGameElements.filter(el => !el.reacted);

    // 全てのユニークなペアをチェック
    for (let i = 0; i < unreacted.length; i++) {
        for (let j = i + 1; j < unreacted.length; j++) {
            let el1 = unreacted[i];
            let el2 = unreacted[j];

            let d = dist(el1.x, el1.y, el2.x, el2.y);

            if (d < REACTION_DISTANCE) { 
                let midX = (el1.x + el2.x) / 2;
                let midY = (el1.y + el2.y) / 2;
                
                // シナリオ1: H と O のペア (あとHが1つ必要)
                if ((el1.name === 'H' && el2.name === 'O') || (el1.name === 'O' && el2.name === 'H')) {
                    combinationHints.push({ x: midX, y: midY, name: 'H' });
                } 
                // シナリオ2: H と H のペア (あとOが1つ必要)
                else if (el1.name === 'H' && el2.name === 'H') {
                    combinationHints.push({ x: midX, y: midY, name: 'O' });
                }
            }
        }
    }
}

/**
 * combinationHints 配列に基づいて、ヒントを画面に描画する
 */
function drawCombinationHints() {
    for (let hint of combinationHints) {
        // 1. ハイライト (点滅する黄色の円)
        let pulseAlpha = (sin(frameCount * 0.1) + 1) / 2 * 100 + 50; 
        let hintColor = color(255, 255, 0, pulseAlpha); 
        
        noStroke();
        fill(hintColor);
        ellipse(hint.x, hint.y, 40, 40);

        // 2. 必要な元素の文字
        let textColor = color(0, 0, 0, 150); 
        fill(textColor);
        textSize(30);
        textAlign(CENTER, CENTER);
        text(hint.name, hint.x, hint.y);
    }
}

// ===================================
// 8. ★ 新規追加 ★ グリッド描画関数
// ===================================

/**
 * 背景にグリッド（格子）を描画する関数
 */
function drawGrid() {
    let gridSize = 40; // 40ピクセル間隔の格子

    // グリッドの色と太さ
    stroke(0, 0, 0, 50); // 薄い黒 (透明度50)
    strokeWeight(1);

    // 1. 垂直線 (縦線) を描画
    // gameAreaWidth（ゲームエリアの右端）まで線を引く
    for (let x = 0; x < gameAreaWidth; x += gridSize) {
        line(x, 0, x, height);
    }
    
    // 2. 水平線 (横線) を描画
    for (let y = 0; y < height; y += gridSize) {
        line(0, y, gameAreaWidth, y);
    }
}