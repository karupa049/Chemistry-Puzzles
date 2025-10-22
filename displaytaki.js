// ===================================
// 1. 状態管理変数
// ===================================
let gameState = 'start'; // ゲームの状態: 'start' または 'stage'
let menuOpen = false;    // メニューの開閉状態: false（閉）または true（開）

// メニューボタンの定数
const MENU_BUTTON_X = 20;
const MENU_BUTTON_Y = 20;
const MENU_BUTTON_SIZE = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

// ===================================
// 2. draw()関数: 状態による処理の分岐
// ===================================
function draw() {
  if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'stage') {
    drawStageScreen();
    // メニューが開いているときはゲームロジックを停止 (一時停止機能)
    if (!menuOpen) {
      updateGameLogic();
    }
    drawMenuOverlay(); // メニューボタンと開閉パネルは最前面に描画
  }
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
function drawStageScreen() {
  background(100, 150, 100); // フィールドの背景
  fill(150, 100, 50); 
  rect(100, 100, 600, 50); // 通路の例
  // drawTowers(), drawEnemies(), drawUI() などのゲーム要素描画をここに追加
}

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