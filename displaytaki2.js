// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start'; // ゲームの状態: 'start' または 'stage'
let menuOpen = false;    // メニューの開閉状態: false（閉）または true（開）
let gameAreaWidth; // ゲームエリアの幅（X座標の境界線）
let periodicTableElements = []; // 周期表の元素（ドラッグ元）
let placedGameElements = []; // ゲーム画面に配置された元素（タワー）
let draggingElement = null; // 現在ドラッグ中の元素データ

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
 * 周期表のデータ
 * 18族までの(行, 列)で定義
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

// 周期表のボタンを（再）配置する関数
function setupPeriodicTable() {
    periodicTableElements = []; 
    
    // 周期表グリッドの設定
    let gridCellSize = 35; // 元素ひとつのマスサイズ
    let gridMargin = 4;    // マス同士の間隔
    
    // 画面の幅や高さに基づいて、セルサイズを動的に調整する
    // (右半分の幅 / 18列) - マージン
    let availableWidth = (width - gameAreaWidth) - 60; // 左右マージン(30*2)
    gridCellSize = (availableWidth / 18) - gridMargin;
    // 小さくなりすぎないよう最小サイズを設定
    gridCellSize = max(gridCellSize, 15); 
    
    let totalCellSize = gridCellSize + gridMargin; // 1マスが占める合計サイズ
    
    // 周期表グリッドの描画開始位置
    let gridStartX = gameAreaWidth + 30; // 周期表エリアの左端から30px
    let gridStartY = 50;                 // 上から50px

    // 周期表データに基づいて元素を配置
    for (const elData of elementData) {
        // グリッド座標 (row, col) からピクセル座標 (x, y) を計算
        // (col - 1) で 0-index に変換
        let x = gridStartX + (elData.col - 1) * totalCellSize;
        let y = gridStartY + (elData.row - 1) * totalCellSize;
        
        // この元素がアクティブかどうかを判定
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
        // ★修正点1: ステージ画面での背景クリアを追加
        // これにより、前フレームの描画（スタート画面の残像、ドラッグ中の要素の残像）を消去します。
        background(100, 150, 100); 

        drawAreas(); // 周期表エリアの背景と境界線を描画
        
        // 2. 周期表の全元素を描画
        for (let el of periodicTableElements) {
            el.draw();
        }
        
        // 3. ゲームエリアに配置された元素を描画
        for (let el of placedGameElements) {
            el.draw();
        }
        
        // 4. ドラッグ中の元素を描画 (マウスに追従)
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
        
        // メニューが開いているときはゲームロジックを停止 (一時停止機能)
        if (!menuOpen) {
            updateGameLogic();
        }
        drawMenuOverlay(); // メニューボタンと開閉パネルは最前面に描画
    }
}

function drawAreas() {
    // 周期表エリアの背景 (右半分)
    fill(200);
    noStroke();
    // (gameAreaWidth, 0) から (width, height) までを描画
    rect(gameAreaWidth, 0, width - gameAreaWidth, height); 
    
    // 境界線 (縦線)
    stroke(0);
    strokeWeight(4);
    line(gameAreaWidth, 0, gameAreaWidth, height); // 縦線に変更
    
    // エリアのラベル
    noStroke();
    fill(100);
    textAlign(LEFT, TOP);
    textSize(16);
    text("■ ゲームエリア", 10, 10);
    text("■ 周期表エリア", gameAreaWidth + 10, 10); // 右エリアの左上に配置
}
// ===================================
// 3. mousePressed()関数: クリックによる状態遷移
// ===================================
function mousePressed() {
    // A. スタート画面からステージ画面への遷移
    if (gameState === 'start') {
        gameState = 'stage'; 
        initializeStage(); 
        return;
    }


    
    // B. ステージ画面での操作
    if (gameState === 'stage') {
        // 1. メニューボタン（左上）のクリック判定
        if (mouseX > MENU_BUTTON_X && mouseX < MENU_BUTTON_X + MENU_BUTTON_SIZE &&
            mouseY > MENU_BUTTON_Y && mouseY < MENU_BUTTON_Y + MENU_BUTTON_SIZE) {
            menuOpen = !menuOpen; // メニュー開閉状態を反転
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
                // 「スタートに戻る」ボタンがクリックされた
                gameState = 'start'; // スタート画面へ戻る
                menuOpen = false;    // メニューを閉じる
                return;
            }
        }
        
        // C. メニューが閉じていれば、通常のゲーム操作処理をここに記述
    }
    for (let el of periodicTableElements) {
        // isMouseOver() が (isActiveな要素のみtrueを返すように変更したため)
        if (el.isMouseOver()) {
            draggingElement = {
                name: el.name,
                color: el.color,
                // 配置後のサイズ (少し大きくする)
                size: el.size + 10 
            };
            break; 
        }
    }
}

function mouseReleased() {
    // 何かをドラッグしていた場合
    if (draggingElement) {
        
        // ゲームエリア（左半分）でマウスを離したかチェック
        if (mouseX < gameAreaWidth) {
            placedGameElements.push(
                new PlacedElement(
                    draggingElement.name,
                    mouseX,
                    mouseY,
                    draggingElement.size // mousePressedで設定したサイズ
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

// --- 4-2. ステージ画面の描画 ---
// draw() 関数で background(100, 150, 100); を実行したため、ここではコメントアウトのまま
// function drawStageScreen() {
//   background(100, 150, 100); // フィールドの背景
//   fill(150, 100, 50); 
//   rect(100, 100, 600, 50); // 通路の例
// }

// --- 4-3. ゲームロジックの更新 ---
function updateGameLogic() {
    // 敵の移動、タワーの攻撃、ゲームオーバー判定などのロジックをここに追加
}

// --- 4-4. ステージ開始時の初期化 ---
function initializeStage() {
    // ステージごとの敵の配置や資金のリセットなど
    console.log("ステージ初期化完了");
    menuOpen = false;
}

// ===================================
// 5. メニュー機能の描画
// ===================================

function drawMenuOverlay() {
    // ★常に左上に「メニューボタン」を描画
    drawMenuButton(MENU_BUTTON_X, MENU_BUTTON_Y, MENU_BUTTON_SIZE, menuOpen);

    // ★ menuOpenがtrueの場合のみ、メニューパネルとボタンを描画
    if (menuOpen) {
        drawMenuPanel();
    }
}

// メニューボタン（ハンバーガーアイコン風/Xマーク）を描画する関数
function drawMenuButton(x, y, size, isOpen) {
    noStroke();
    fill(0, 0, 0, 150); // 半透明の黒
    rect(x, y, size, size, 5); // 背景

    fill(255); // アイコン色：白
    let h = size * 0.1; // 線の高さ
    let w = size * 0.6; // 線の幅
    let offset = size * 0.25;

    if (!isOpen) { // 閉じる状態：ハンバーガーアイコン
        rect(x + offset / 2, y + offset, w, h);
        rect(x + offset / 2, y + size / 2 - h / 2, w, h);
        rect(x + offset / 2, y + size - offset - h, w, h);
    } else { // 開いている状態：Xマーク
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
    // メニューパネルの描画
    fill(0, 0, 0, 200); // 濃い半透明の黒
    rect(width / 2 - 150, height / 2 - 100, 300, 200, 10); // 画面中央にパネル

    // 「スタートに戻る」ボタンを描画
    drawBackButton(width / 2, height / 2);
}

// 「スタートに戻る」ボタンを描画する関数
function drawBackButton(centerX, centerY) {
    const BUTTON_W = 200;
    const BUTTON_H = 50;

    let x = centerX - BUTTON_W / 2;
    let y = centerY - BUTTON_H / 2;

    // マウスオーバー判定
    if (mouseX > x && mouseX < x + BUTTON_W && mouseY > y && mouseY < y + BUTTON_H && menuOpen) {
        fill(255, 100, 100); // ホバー時の色
    } else {
        fill(255, 50, 50); // 通常の色
    }
    rect(x, y, BUTTON_W, BUTTON_H, 5);

    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('スタート画面に戻る', centerX, centerY);
}

class PeriodicElement {
    // 5番目の引数として isActive を受け取る
    constructor(name, x, y, size, isActive) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.isActive = isActive; // アクティブかどうか
        
        // 色の決定
        if (this.isActive) {
            this.color = colors[name] || '#AAAAAA'; // アクティブなら定義色
        } else {
            this.color = '#BBBBBB'; // 非アクティブならグレー
        }
    }
    
    draw() {
        strokeWeight(2);
        
        // アクティブな要素がマウスオーバーされている時だけハイライト
        if (this.isActive && this.isMouseOver()) {
            stroke(255, 204, 0); // 黄色い枠
        } else {
            stroke(0); // 黒い枠
        }
        
        fill(this.color); // constructorで設定した色
        rect(this.x, this.y, this.size, this.size, 5); 
        
        // テキストの色
        let textColor;
        if (this.isActive) {
            // H (白背景) だけ文字を黒に
            textColor = (this.name === 'H' ? 0 : 255); 
        } else {
            textColor = '#777777'; // 非アクティブなら濃いグレーの文字
        }
        
        fill(textColor);
        noStroke();
        textAlign(CENTER, CENTER);
        // セルサイズに合わせて文字サイズを調整
        textSize(this.size * 0.5); 
        text(this.name, this.x + this.size / 2, this.y + this.size / 2);
    }
    
    // マウスがこの要素の上にあるか判定
    isMouseOver() {
        // そもそも非アクティブなら、falseを返す
        if (!this.isActive) {
            return false;
        }
        
        // アクティブな場合のみ、通常の判定を行う
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
        this.size = size; // mousePressedで渡されたサイズをそのまま使用
        this.radius = this.size / 2;
        this.color = colors[name] || '#AAAAAA';
    }
    
    // 描画 (こちらは円形にする)
    draw() {
        strokeWeight(2);
        stroke(0);
        fill(this.color);
        ellipse(this.x, this.y, this.size, this.size);
        
        // テキスト
        fill(this.name === 'H' ? 0 : 255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.size * 0.6);
        text(this.name, this.x, this.y);
    }
}