// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start'; // ゲームの状態: 'start' または 'stage'
let menuOpen = false;    // メニューの開閉状態: false（閉）または true（開）
let gameAreaWidth; // ゲームエリアの幅（X座標の境界線）
let periodicTableElements = []; // 周期表の元素（ドラッグ元）
let placedGameElements = []; // ゲーム画面に配置された元素（タワー）
let combinedElements = []; // 化学反応で合成された元素 (H2Oなど)
let combinationHints = []; // ★新規追加★ 合成ヒントの描画用配列
let draggingElement = null; // 現在ドラッグ中の元素データ

// ★ 統合 ★ (teppeiEnemy.js の enemyindex の代わり)
let enemies = []; // 敵を管理する配列

// メニューボタンの定数
const MENU_BUTTON_X = 20;
const MENU_BUTTON_Y = 20;
const MENU_BUTTON_SIZE = 40;

// ★追加★ 化学反応の定数
const REACTION_DISTANCE = 80; // HとOが反応する最大距離

// 色の定義
const colors = {
    'H': '#FFFFFF', // 水素 (白)
    'O': '#FF4136', // 酸素 (赤)
    'C': '#555555', // 炭素 (黒)
    'N': '#3388FF', // 窒素 (青)
    'H2O': '#ADD8E6' // ★追加★ 水 (ライトブルー)
};

function setup() {
    createCanvas(windowWidth, windowHeight); 
    gameAreaWidth = width / 2; 
    setupPeriodicTable();
}

/**
 * 周期表のデータ
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
    
    // 周期表グリッドの設定
    let gridCellSize = 35; // 元素ひとつのマスサイズ
    let gridMargin = 4;    // マス同士の間隔
    
    // 画面の幅や高さに基づいて、セルサイズを動的に調整する
    let availableWidth = (width - gameAreaWidth) - 60; 
    gridCellSize = (availableWidth / 18) - gridMargin;
    gridCellSize = max(gridCellSize, 15); 
    
    let totalCellSize = gridCellSize + gridMargin; 
    
    let gridStartX = gameAreaWidth + 30; 
    let gridStartY = 50; 

    // 周期表データに基づいて元素を配置
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
    } else if (gameState === 'stage') {
        // ステージ画面での背景クリア
        background(100, 150, 100); 

        drawAreas(); // 周期表エリアの背景と境界線を描画
        
        // 2. 周期表の全元素を描画
        for (let el of periodicTableElements) {
            el.draw();
        }
        
        // 3. ゲームエリアに配置された元素を描画 (緑の円はここで描画)
        for (let el of placedGameElements) {
            el.draw();
        }

        // ★新規追加★ 元素の組み合わせヒントを描画
        drawCombinationHints();

        // 4. 合成された元素を描画
        for (let el of combinedElements) {
            el.draw();
        }

        // 5. 敵を描画
        for (let e of enemies) {
            e.draw();
        }
        
        // 6. ドラッグ中の元素を描画
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
        
        // 7. ゲームロジックの更新 (メニューが開いていなければ)
        if (!menuOpen) {
            updateGameLogic();
        }
        // 8. メニューを最前面に描画
        drawMenuOverlay(); 
    }
}

function drawAreas() {
    // 周期表エリアの背景 (右半分)
    fill(200);
    noStroke();
    rect(gameAreaWidth, 0, width - gameAreaWidth, height); 
    
    // 境界線 (縦線)
    stroke(0);
    strokeWeight(4);
    line(gameAreaWidth, 0, gameAreaWidth, height);
    
    // エリアのラベル
    noStroke();
    fill(100);
    textAlign(LEFT, TOP);
    textSize(16);
    text("■ ゲームエリア", 10, 10);
    text("■ 周期表エリア", gameAreaWidth + 10, 10);
}

// ===================================
// 3. mousePressed() / mouseReleased()
// ===================================
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
        
        // C. 元素のドラッグ開始
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
}

function mouseReleased() {
    // ドラッグ中の元素を配置
    if (draggingElement) {
        // ゲームエリア（左半分）か？
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
        // ドラッグ状態を解除
        draggingElement = null;
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
    textSize(24);
    text('クリックでゲーム開始', width / 2, height / 2 + 50);
}

// --- 4-3. ゲームロジックの更新 ---
function updateGameLogic() {
    
    // 1. 敵の生成
    if (frameCount % 60 == 0) {
        if (100 < gameAreaWidth) { 
             enemies.push(new Enemy(100, 100));
        }
    }
    
    // 2. 敵の移動
    for (let e of enemies) {
        e.move1(gameAreaWidth, height); 
    }
    
    // 3. ★新規追加★ 合成ヒントを検索 (反応チェックの前に実行)
    findCombinationHints();
    
    // 4. 化学反応のチェックと実行
    checkAndPerformReactions();
}

// --- 4-4. ステージ開始時の初期化 ---
function initializeStage() {
    console.log("ステージ初期化完了");
    menuOpen = false;
    
    enemies = [];
    placedGameElements = [];
    combinedElements = []; 
    combinationHints = []; // ★新規追加★ ヒントもリセット
}

// ===================================
// 5. メニュー機能の描画
// ===================================

function drawMenuOverlay() {
    // メニューボタン
    drawMenuButton(MENU_BUTTON_X, MENU_BUTTON_Y, MENU_BUTTON_SIZE, menuOpen);

    // メニューパネル
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

    if (!isOpen) { // ハンバーガー
        rect(x + offset / 2, y + offset, w, h);
        rect(x + offset / 2, y + size / 2 - h / 2, w, h);
        rect(x + offset / 2, y + size - offset - h, w, h);
    } else { // Xマーク
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
    // パネル背景
    fill(0, 0, 0, 200); 
    rect(width / 2 - 150, height / 2 - 100, 300, 200, 10); 

    // 「スタートに戻る」ボタン
    drawBackButton(width / 2, height / 2);
}

function drawBackButton(centerX, centerY) {
    const BUTTON_W = 200;
    const BUTTON_H = 50;

    let x = centerX - BUTTON_W / 2;
    let y = centerY - BUTTON_H / 2;

    // ホバー判定
    if (mouseX > x && mouseX < x + BUTTON_W && mouseY > y && mouseY < y + BUTTON_H && menuOpen) {
        fill(255, 100, 100); 
    } else {
        fill(255, 50, 50);
    }
    rect(x, y, BUTTON_W, BUTTON_H, 5);

    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('スタート画面に戻る', centerX, centerY);
}

// ===================================
// 6. クラス定義
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
        // 周期表の元素には反応範囲の円は描画しない
        strokeWeight(2);
        
        if (this.isActive && this.isMouseOver()) {
            stroke(255, 204, 0); 
        } else {
            stroke(0); 
        }
        
        fill(this.color); 
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

/**
 * ゲームエリアに配置された元素（タワー）のためのクラス
 */
class PlacedElement {
    constructor(name, x, y, size) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size; 
        this.radius = this.size / 2;
        this.color = colors[name] || '#AAAAAA';
        this.reacted = false; 
    }
    
    // 描画 (こちらは円形にする)
    draw() {
        // ★変更★ 
        // 1. 結合範囲の円を描画 (緑)
        if (!this.reacted) { // 反応前の元素のみ
            noFill();
            stroke(0, 200, 0, 80); // 半透明の緑
            strokeWeight(1);
            ellipse(this.x, this.y, REACTION_DISTANCE * 2, REACTION_DISTANCE * 2);
            
            // ★削除★ 古いヒント描画 (drawReactionHints) は削除
        }

        // 2. 元素本体を描画 (円)
        strokeWeight(2);
        stroke(0);
        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);
        
        // 3. 元素のテキスト
        fill(this.name === 'H' ? 0 : 255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.size * 0.6);
        text(this.name, this.x, this.y);
    }
}


/**
 * 合成された元素 (H2Oなど) のためのクラス
 */
class CombinedElement {
    constructor(name, x, y, size) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size * 1.2; 
        this.color = colors[name] || '#AAAAAA';
    }

    draw() {
        // H2Oにはヒントや反応範囲は表示されない
        strokeWeight(3); 
        stroke(0, 0, 200); 
        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);

        fill(0); 
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.size * 0.5);
        text(this.name, this.x, this.y);
    }
}


/**
 * 敵 (Enemy) クラス
 */
class Enemy{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.size = 30; // 敵のサイズ
  }
  
  draw() {
    fill(255, 0, 0); // 敵は赤色
    stroke(0);
    strokeWeight(1);
    ellipse(this.x, this.y, this.size, this.size);
  }

  move1(gameAreaWidth, gameAreaHeight){
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
                combinedElements.push(new CombinedElement('H2O', avgX, avgY, newSize));

                // 反応した元素を placedGameElements から削除
                placedGameElements = placedGameElements.filter(el => !el.reacted);
                
                break; 
            }
        }
    }
}

// ===================================
// 7. 合成ヒント機能 (新規追加セクション)
// ===================================

/**
 * 組み合わせが可能な元素のペアを探し、ヒント配列を更新する
 */
function findCombinationHints() {
    combinationHints = []; // 毎フレームリセット
    let unreacted = placedGameElements.filter(el => !el.reacted);

    // 全てのユニークなペアをチェック (O(n^2))
    for (let i = 0; i < unreacted.length; i++) {
        for (let j = i + 1; j < unreacted.length; j++) {
            let el1 = unreacted[i];
            let el2 = unreacted[j];

            let d = dist(el1.x, el1.y, el2.x, el2.y);

            // 2つの元素が反応距離内にあるかチェック
            // (元の反応ロジック 'd < REACTION_DISTANCE' に合わせる)
            if (d < REACTION_DISTANCE) { 
                // ヒントを表示する中間地点
                let midX = (el1.x + el2.x) / 2;
                let midY = (el1.y + el2.y) / 2;
                
                // シナリオ1: H と O のペアが見つかった
                if ((el1.name === 'H' && el2.name === 'O') || (el1.name === 'O' && el2.name === 'H')) {
                    // あと1つの 'H' が必要
                    combinationHints.push({ x: midX, y: midY, name: 'H' });
                } 
                // シナリオ2: H と H のペアが見つかった
                else if (el1.name === 'H' && el2.name === 'H') {
                    // 'O' が必要
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
        // sin() は -1 から 1 の範囲。 (sin() + 1) / 2 で 0 から 1 の範囲に正規化
        let pulseAlpha = (sin(frameCount * 0.1) + 1) / 2 * 100 + 50; // 50-150の透明度
        let hintColor = color(255, 255, 0, pulseAlpha); 
        
        noStroke();
        fill(hintColor);
        ellipse(hint.x, hint.y, 40, 40); // 40pxのハイライト

        // 2. 必要な元素の文字
        let textColor = color(0, 0, 0, 150); // 少し濃いめの文字
        fill(textColor);
        textSize(30);
        textAlign(CENTER, CENTER);
        text(hint.name, hint.x, hint.y);
    }
}