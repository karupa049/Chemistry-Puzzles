// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start'; // ゲームの状態: 'start', 'stage', 'gameover'
let menuOpen = false;    // メニューの開閉状態: false（閉）または true（開）
let gameAreaWidth; // ゲームエリアの幅（X座標の境界線）
let periodicTableElements = []; // 周期表の元素（ドラッグ元）
let placedGameElements = []; // ゲーム画面に配置された元素（防衛ユニット）
let draggingElement = null; // 現在ドラッグ中の元素データ

let enemies = []; // 敵を管理する配列
let mainTower; // メインタワー（基地）

// メニューボタンの定数
const MENU_BUTTON_X = 20;
const MENU_BUTTON_Y = 20;
const MENU_BUTTON_SIZE = 40;
// 色の定義
const colors = {
    'H': '#FFFFFF', // 水素 (白)
    'O': '#FF4136', // 酸素 (赤)
    'C': '#555555', // 炭素 (黒)
    'N': '#3388FF', // 窒素 (青)
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
// ★変更★ 'gameover' 状態でもステージを描画し、その上にオーバーレイを描画する
function draw() {
    if (gameState === 'start') {
        drawStartScreen();
        
    } else if (gameState === 'stage' || gameState === 'gameover') {
        // 'stage' と 'gameover' 共通の描画（ゲーム画面）
        background(100, 150, 100); 
        drawAreas();
        for (let el of periodicTableElements) { el.draw(); }
        if (mainTower) { mainTower.draw(); }
        for (let el of placedGameElements) { el.draw(); }
        for (let e of enemies) { e.draw(); }

        // ドラッグ中の描画（'gameover'中はドラッグできないので実質 'stage' のみ）
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
        
        // ★変更★ ゲームロジックの更新は 'stage' の時だけ
        if (!menuOpen && gameState === 'stage') {
            updateGameLogic();
        }
        
        // メニュー描画
        drawMenuOverlay(); 
        
        // ★変更★ ゲームオーバー画面のオーバーレイ
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
// ★変更★ gameState ごとに処理を明確に分岐
function mousePressed() {
    
    // A. スタート画面
    if (gameState === 'start') {
        gameState = 'stage'; 
        initializeStage(); 
        return;
    }
    
    // B. ステージ画面
    if (gameState === 'stage') {
        // 1. メニューボタン（左上）のクリック判定
        if (mouseX > MENU_BUTTON_X && mouseX < MENU_BUTTON_X + MENU_BUTTON_SIZE &&
            mouseY > MENU_BUTTON_Y && mouseY < MENU_BUTTON_Y + MENU_BUTTON_SIZE) {
            menuOpen = !menuOpen;
            return;
        }

        // 2. メニューが開いている場合の「スタートに戻る」ボタン判定
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
        
        // 3. メニューが閉じていれば、周期表要素のドラッグ開始判定
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
        return; // 'stage' の処理はここまで
    }
    
    // C. ★新規★ ゲームオーバー画面
    if (gameState === 'gameover') {
        const BUTTON_W = 200;
        const BUTTON_H = 50;
        let centerX = width / 2;
        let centerY = height / 2;
        
        let restartX = centerX - BUTTON_W / 2;
        let restartY = centerY;
        let titleX = centerX - BUTTON_W / 2;
        let titleY = centerY + BUTTON_H + 20;

        // 1. リスタートボタン判定
        if (mouseX > restartX && mouseX < restartX + BUTTON_W &&
            mouseY > restartY && mouseY < restartY + BUTTON_H) {
            initializeStage(); // ステージをリセット
            gameState = 'stage';   // ステージ状態に戻す
            return;
        }

        // 2. タイトルに戻るボタン判定
        if (mouseX > titleX && mouseX < titleX + BUTTON_W &&
            mouseY > titleY && mouseY < titleY + BUTTON_H) {
            gameState = 'start'; // スタート画面に戻す
            return;
        }
    }
}

// mouseReleased() 関数 (変更なし)
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

// --- 4-3. ゲームロジックの更新 ---
function updateGameLogic() {
    
    // 1. 敵の生成 (変更なし)
    if (frameCount % 60 == 0) {
        if (100 < gameAreaWidth) { 
             enemies.push(new Enemy(100, 100));
        }
    }
    
    // 2. 衝突判定 (敵 と メインタワー) (変更なし)
    for (let e of enemies) { 
        e.isCollidingWithTower = false;
        
        if (mainTower && mainTower.isAlive()) {
            let distance = dist(e.x, e.y, mainTower.x, mainTower.y);
            let collisionThreshold = e.radius + mainTower.radius;
            
            if (distance < collisionThreshold) {
                e.isCollidingWithTower = true;
                mainTower.takeDamage(1); 
            }
        }
    } 
    
    // 3. 敵の移動 (変更なし)
    for (let e of enemies) {
        e.move1(gameAreaWidth, height); 
    }
    
    // 4. ★変更★ メインタワーのHPが0になったらゲームオーバー状態に遷移
    if (mainTower && !mainTower.isAlive()) {
        console.log("GAME OVER");
        gameState = 'gameover'; // ★ noLoop() から変更
    }
}

// --- 4-4. ステージ開始時の初期化 ---
function initializeStage() {
    console.log("ステージ初期化完了");
    menuOpen = false;
    
    enemies = [];
    placedGameElements = [];
    
    let towerX = gameAreaWidth - 50; 
    let towerY = height / 2;
    mainTower = new MainTower(towerX, towerY, 60);
    
    loop(); // noLoop() 対策
}

// ===================================
// 5. メニュー機能の描画
// ===================================

function drawMenuOverlay() {
    // メニューボタンはゲームオーバー画面では非表示にする
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

// --- 5-X. ★新規★ ゲームオーバー画面の描画 ---
function drawGameOverScreen() {
    // 1. 半透明のオーバーレイ
    fill(0, 0, 0, 180); // 濃い半透明の黒
    rectMode(CORNER);
    rect(0, 0, width, height);
    
    // 2. "GAME OVER" テキスト
    fill(255, 0, 0); // 赤
    textSize(64);
    textAlign(CENTER, CENTER);
    text('GAME OVER', width / 2, height / 2 - 100);
    
    // 3. ボタンの描画
    const BUTTON_W = 200;
    const BUTTON_H = 50;
    let centerX = width / 2;
    let centerY = height / 2;
    
    // ボタン1: リスタート (中央)
    let restartX = centerX - BUTTON_W / 2;
    let restartY = centerY;
    
    // ボタン2: タイトルに戻る (その下)
    let titleX = centerX - BUTTON_W / 2;
    let titleY = centerY + BUTTON_H + 20; // 20px のマージン

    // --- リスタートボタン描画 ---
    // マウスオーバー判定
    if (mouseX > restartX && mouseX < restartX + BUTTON_W &&
        mouseY > restartY && mouseY < restartY + BUTTON_H) {
        fill(100, 255, 100); // ホバー時 (明るい緑)
    } else {
        fill(50, 200, 50); // 通常時 (緑)
    }
    rectMode(CORNER);
    rect(restartX, restartY, BUTTON_W, BUTTON_H, 5);
    
    fill(0); // テキストは黒
    textSize(20);
    textAlign(CENTER, CENTER);
    text('リスタート', centerX, restartY + BUTTON_H / 2);

    // --- タイトルに戻るボタン描画 ---
    // マウスオーバー判定
    if (mouseX > titleX && mouseX < titleX + BUTTON_W &&
        mouseY > titleY && mouseY < titleY + BUTTON_H) {
        fill(100, 100, 255); // ホバー時 (明るい青)
    } else {
        fill(50, 50, 200); // 通常時 (青)
    }
    rectMode(CORNER);
    rect(titleX, titleY, BUTTON_W, BUTTON_H, 5);
    
    fill(255); // テキストは白
    textSize(20);
    textAlign(CENTER, CENTER);
    text('タイトルに戻る', centerX, titleY + BUTTON_H / 2);
}


// ===================================
// 6. クラス定義 (このセクションは変更なし)
// ===================================

// --- 周期表の元素クラス ---
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
class PlacedElement {
    constructor(name, x, y, size) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size; 
        this.radius = this.size / 2;
        this.color = colors[name] || '#AAAAAA';
    }
    
    draw() {
        strokeWeight(2);
        stroke(0);
        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);
        
        fill(this.name === 'H' ? 0 : 255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.size * 0.6);
        text(this.name, this.x, this.y);
    }
}

// --- メインタワー（基地）クラス ---
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


// --- 敵クラス ---
class Enemy{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.size = 30;
    this.radius = this.size / 2;
    this.isCollidingWithTower = false;
  }
  
  draw() {
    fill(255, 0, 0); 
    stroke(0);
    strokeWeight(1);
    ellipse(this.x, this.y, this.size, this.size);
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