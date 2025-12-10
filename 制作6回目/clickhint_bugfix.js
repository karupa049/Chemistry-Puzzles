// ===================================
// 1. 状態管理変数 (sketch_addgenso.js + game.js の統合)
// ===================================
let gameState = 'start';
let menuOpen = false;
let gameAreaWidth;
let clickStartedInGameArea = false; // ★追加: クリックがゲームエリア内で始まったかどうかのフラグ

// --- 周期表・タワー関連 ---
let periodicTableElements = [];
let placedGameElements = [];
let draggingElement = null;
let combinationHints = [];

// --- 敵・基地・弾丸・障害物関連 ---
let enemies = [];
let mainTower;
let bullets = [];
let shockwaves = [];      // 敵攻撃の衝撃波
let gameObstacles = [];
let lastSpawnTime = 0;
const SPAWN_INTERVAL = 1000;
let enemiesSpawned = 0;       // 出現させた敵の総数
let enemiesDefeated = 0;      // 撃破した敵の総数
const TOTAL_ENEMIES_TO_SPAWN = 100; // ステージで出現させる敵の総数

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
// 2. 合成レシピの定義 (sketch_addgenso.jsから引き継ぎ)
// ===================================
const recipes = [
    {
        name: 'H2O',
        ingredients: { 'H': 2, 'O': 1 },
        core: 'O',
        color: '#ADD8E6', // 水色
        range: 200,
        rate: 500,
        baseHp: 150 // 化合物独自のHP
    },
    {
        name: 'CO2',
        ingredients: { 'C': 1, 'O': 2 },
        core: 'C',
        color: '#A9A9A9', // ダークグレー
        range: 180,
        rate: 800,
        baseHp: 180
    },
    {
        name: 'HCl',
        ingredients: { 'H': 1, 'Cl': 1 },
        core: 'Cl',
        color: '#FFFFE0', // ライトイエロー
        range: 160,
        rate: 400,
        baseHp: 120 
    },
    {
        name: 'CuO',
        ingredients: { 'Cu': 1, 'O': 1 },
        core: 'Cu',
        color: '#333333', // 黒っぽい
        range: 150,
        rate: 1000,
        baseHp: 250
    },
    {
        name: 'FeS',
        ingredients: { 'Fe': 1, 'S': 1 },
        core: 'Fe',
        color: '#8B4513', // 茶色
        range: 150,
        rate: 1200,
        baseHp: 300 
    },
    {
        name: 'NaCl',
        ingredients: { 'Na': 1, 'Cl': 1 },
        core: 'Na',
        color: '#F0F8FF', // アリスブルー
        range: 170,
        rate: 600,
        baseHp: 140
    },
    {
        name: 'H2S',
        ingredients: { 'H': 2, 'S': 1 },
        core: 'S',
        color: '#FFFF00', // 黄色
        range: 190,
        rate: 700,
        baseHp: 130
    }
];


// ===================================
// 3. setup / 周期表データ (sketch_addgenso.jsから引き継ぎ)
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

// レシピに含まれる元素と、ゲームバランス上有効にしたい元素のみをアクティブにする
const recipeElements = new Set(recipes.flatMap(r => Object.keys(r.ingredients)));
const activeElements = Array.from(recipeElements).filter(symbol => elementData.some(e => e.symbol === symbol));
// ゲームで使用する元素も追加
activeElements.push('H', 'O', 'C', 'N', 'Cl', 'Cu', 'Fe', 'S', 'Na'); // これら全てがレシピに使われているはずですが、念のため

function setup() {
    createCanvas(windowWidth, windowHeight);
    gameAreaWidth = width / 2;

    // 【★修正箇所: document全体でブラウザのコンテキストメニューを無効化する】
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault(); 
    });

    // コストの自動計算: 基本コスト(5) + 周期(row) * 10
    for (let el of elementData) {
        elementCosts[el.symbol] = 5 + (el.row * 10);
    }
    // H, O, C, N の基本コストは一旦上書きせず、周期表から自動計算されたものを使用
    
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
// 4. draw()関数 (game.jsをベースにwin判定追加)
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

        // --- ゲームエリア内の描画 ---
        drawPlacementAreas(); 
        
        for (let bar of gameObstacles) { bar.draw(); }

        drawPathNodes(); 

        if (mainTower) { mainTower.draw(); }
        for (let el of placedGameElements) { el.draw(); }
        drawCombinationHints();
        for (let b of bullets) { b.draw(); }
        drawShockwaves(); // 敵の攻撃描画
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
        drawDefeatedCount(); // 撃破数表示
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
// 5. マウス操作 (両ファイルの統合ロジック)
// ===================================
function mousePressed() {
    if (gameState === 'start') {
        // 「ゲーム開始」ボタンの判定
        if (mouseY < height / 2 + 100 && mouseY > height / 2) {
            gameState = 'stage';
            initializeStage();
            return;
        }
        // 「エディター」ボタンの判定
        if (mouseY > height / 2 + 150 && mouseY < height / 2 + 200) {
            gameState = 'editor';
            initializeEditor();
            return;
        }
        return;
    }

    if (gameState === 'stage') {
        // ★追加: クリックがどこで開始されたかを記録
        if (mouseX < gameAreaWidth) {
            clickStartedInGameArea = true;
        } else {
            clickStartedInGameArea = false;
        }

        let buttonX = width - MENU_BUTTON_SIZE - 8;
        // メニューボタン（右上のハンバーガーアイコン）
        if (mouseX > buttonX && mouseX < buttonX + MENU_BUTTON_SIZE &&
            mouseY > MENU_BUTTON_Y && mouseY < MENU_BUTTON_Y + MENU_BUTTON_SIZE) {
            menuOpen = !menuOpen;
            return;
        }

        // ▼▼▼▼▼▼▼▼▼▼ 修正箇所ここから ▼▼▼▼▼▼▼▼▼▼
        if (menuOpen) {
            // メニューが開いている場合、「スタート画面に戻る」ボタンの判定を行う
            const BUTTON_W = 200;
            const BUTTON_H = 50;
            let centerX = width / 2;
            let centerY = height / 2;
            let btnX = centerX - BUTTON_W / 2;
            let btnY = centerY - BUTTON_H / 2;

            if (mouseX > btnX && mouseX < btnX + BUTTON_W &&
                mouseY > btnY && mouseY < btnY + BUTTON_H) {
                gameState = 'start'; // タイトルへ戻る
                menuOpen = false;    // メニューを閉じる状態に戻しておく
            }
            // メニューが開いているときは、これ以降のゲーム内操作（元素配置など）を行わないためreturnする
            return;
        }
        // ▲▲▲▲▲▲▲▲▲▲ 修正箇所ここまで ▲▲▲▲▲▲▲▲▲▲

        if (!menuOpen) {
            // 周期表エリアでのクリック (ドラッグ/選択開始)
            for (let el of periodicTableElements) {
                if (el.isMouseOver()) {
                    draggingElement = {
                        name: el.name,
                        color: el.color,
                        size: el.size + 10
                    };
                    return;
                }
            }
            
            // ゲームエリア内でのクリック (配置アクション)
            if (mouseX < gameAreaWidth && draggingElement) {
                // 左クリックまたは右クリックで配置を試みる
                if (mouseButton === LEFT || mouseButton === RIGHT) { 
                    // ★修正: 配置が成功したかどうかを変数で受け取る
                    let isPlaced = performElementPlacement(draggingElement.name, mouseX, mouseY, draggingElement.size);
                    
                    // ★修正: 配置に成功したら、持っている元素を解除する (これでマウスについてこなくなります)
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
        
        // リスタート/タイトルへ (Win時はタイトルへ)
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
        
        // タイトルに戻る (GameOver時のみ)
        if (gameState === 'gameover' && mouseX > titleX && mouseX < titleX + BUTTON_W &&
            mouseY > titleY && mouseY < titleY + BUTTON_H) {
            gameState = 'start';
            return;
        }
    }
}

function mouseReleased() {
    if (gameState === 'stage' && draggingElement) {
        
        // ★修正: 「メニューからドラッグしてきた場合（!clickStartedInGameArea）」のみ配置を実行
        // ゲームエリア内でクリックした場合は mousePressed ですでに配置済みなので何もしない
        if (!clickStartedInGameArea && mouseX < gameAreaWidth) {
            // ドラッグ＆ドロップによる配置
            performElementPlacement(draggingElement.name, mouseX, mouseY, draggingElement.size);
            // ドラッグ完了時は draggingElement を解除
            draggingElement = null; 
        } 
        
        // 周期表エリアで離した場合（次の元素選択待ち）は、draggingElementを解除しない。
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
// 6. ロジック更新・初期化 (両ファイルの統合ロジック)
// ===================================

function updateGameLogic() {
    // 1. エネルギー回復
    if (currentEnergy < maxEnergy) {
        let recoveryAmount = energyRegenPerSecond * (deltaTime / 1000);
        currentEnergy += recoveryAmount;
        currentEnergy = min(currentEnergy, maxEnergy);
    }

    // 2. 敵の生成
    if (millis() - lastSpawnTime > SPAWN_INTERVAL) {
        if (enemiesSpawned < TOTAL_ENEMIES_TO_SPAWN) {
            if (pathNodes.length > 0) {
                enemies.push(new Enemy(pathNodes[0].x, pathNodes[0].y, pathNodes));
            } else if (100 < gameAreaWidth) {
                enemies.push(new Enemy(100, 100, []));
            }
            enemiesSpawned++;
            lastSpawnTime = millis();
        }
    }

    // 3. タワーの攻撃
    for (let tower of placedGameElements) {
        if (tower.isDead()) continue;
        tower.findTargetAndAttack(enemies, bullets);
    }

    // 4. 弾丸の移動と衝突
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

    // 5. 敵の移動・攻撃・死亡判定
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];

        // 基地への衝突判定
        e.isCollidingWithTower = false;
        if (mainTower && mainTower.isAlive()) {
            let distance = dist(e.x, e.y, mainTower.x, mainTower.y);
            if (distance < e.radius + mainTower.radius) {
                e.isCollidingWithTower = true;
                mainTower.takeDamage(1);
            }
        }

        e.followPath(gameObstacles); 
        e.findTargetAndAttack(placedGameElements, shockwaves); // ユニットへの攻撃

        if (e.isDead() || e.x < 0 || e.y < 0 || e.x > width || e.y > height) {
            if (e.isDead()) {
                currentEnergy += enemyKillReward;
                currentEnergy = min(currentEnergy, maxEnergy);
                enemiesDefeated++;
            }
            enemies.splice(i, 1);
        }
    }
    
    // 6. ユニット/バリケード/衝撃波の更新・削除
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

    // 7. 化学反応
    findCombinationHints();
    checkAndPerformReactions();

    // 8. ゲーム状態の判定
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


/**
 * 元素をゲームエリアに配置する共通ロジック
 * @param {string} elementName 配置する元素記号
 * @param {number} x 配置するX座標
 * @param {number} y 配置するY座標
 * @param {number} size 元素のサイズ
 */
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
            // PlacedElementにコスト（ダメージ計算用）を渡す
            placedGameElements.push(
                new PlacedElement(
                    elementName,
                    x,
                    y,
                    size,
                    cost
                )
            );
            console.log(elementName + "を配置しました。残エネルギー: " + currentEnergy);
            return true;
        } else {
            console.log("エネルギー不足！");
            return false;
        }
    }
    // エリア外や重複による配置失敗
    return false;
}


// ===================================
// 7. UIの描画 (両ファイルの統合ロジック)
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

function drawDefeatedCount() {
    let barWidth = (width - gameAreaWidth) - 60;
    let barHeight = 25;
    let barX = gameAreaWidth + 30;
    let barY = height - 40 - barHeight * 2 - 15; 

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
// 8. 合成・反応ロジック (sketch_addgenso.jsの汎用ロジックをベースに死亡判定を追加)
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

                // 攻撃力計算 (合計コスト * 2)
                let calculatedDamage = totalCost * 2;
                
                // 消費した元素を削除
                placedGameElements = placedGameElements.filter(el => !consumedElements.includes(el));

                // 新しい化合物を追加
                placedGameElements.push(new PlacedElement(
                    recipe.name, 
                    avgX, 
                    avgY, 
                    newSize, 
                    calculatedDamage,
                    recipe.baseHp // 化合物独自のHPを設定
                ));
                
                // 配列が変更されたので、外側のループをやり直す
                return; 
            }
        }
    }
}

// ===================================
// 修正箇所: ヒント描画ロジック
// ===================================

// ===================================
// 修正箇所: 厳密な個数チェックを行うヒント判定
// ===================================

function findCombinationHints() {
    combinationHints = [];

    // ドラッグ中でなければ処理しない
    if (!draggingElement) return;

    // 全てのレシピをチェック
    for (let recipe of recipes) {
        
        // 1. そもそもドラッグ中の元素が、このレシピに含まれているか？
        // 含まれていなければスキップ (例: Hを持っていて、FeSのレシピは見ない)
        if (!recipe.ingredients[draggingElement.name]) continue;

        // 2. 必要な材料リスト（残数管理用）をコピーして作成
        // 例: H2Oなら requiredCounts = { 'H': 2, 'O': 1 }
        let requiredCounts = { ...recipe.ingredients };

        // 3. 今手に持っている（ドラッグ中の）元素分を必要数から減らす
        requiredCounts[draggingElement.name]--;

        // 4. マウス周辺にある配置済み元素を探す
        let neighbors = placedGameElements.filter(el => 
            !el.reacted && 
            !el.isDead() &&
            dist(mouseX, mouseY, el.x, el.y) < REACTION_DISTANCE
        );

        // 5. 周辺の元素が必要な材料であれば、必要数から減らしていく
        for (let neighbor of neighbors) {
            if (requiredCounts[neighbor.name] > 0) {
                requiredCounts[neighbor.name]--;
            }
        }

        // 6. すべての材料が揃ったか判定（すべての必要数が0以下になっているか）
        let isComplete = true;
        for (let ingName in requiredCounts) {
            if (requiredCounts[ingName] > 0) {
                isComplete = false;
                break;
            }
        }

        // 7. 完成する場合のみヒントを追加
        if (isComplete) {
            combinationHints.push({
                x: mouseX,      // ドラッグしている場所（マウス位置）に表示
                y: mouseY - 40, // 少し上にずらす
                name: recipe.name,
                color: recipe.color
            });
            
            // 1つの場所で複数のレシピが成立することは稀なので、
            // 最初に見つかった確定レシピを表示して終了（重複表示防止）
            return;
        }
    }
}

// ===================================
// 修正箇所: ヒント描画 (マウス追従用に微調整)
// ===================================

function drawCombinationHints() {
    for (let hint of combinationHints) {
        // ふわふわさせるアニメーション
        let floatOffset = sin(millis() * 0.01) * 3;
        
        push();
        translate(hint.x, hint.y + floatOffset);
        
        // 吹き出しの背景
        noStroke();
        fill(255, 255, 255, 220); // 少し透明度を下げる
        rectMode(CENTER);
        // 文字数に合わせて幅を少し調整
        let w = textWidth(hint.name) + 40; 
        rect(0, 0, max(60, w), 30, 10);
        
        // 三角形のしっぽ
        fill(255, 255, 255, 220);
        triangle(-6, 15, 6, 15, 0, 22);

        // テキスト表示
        // 化合物のテーマカラーで文字を書くか、黒にする
        fill(0); 
        textAlign(CENTER, CENTER);
        textSize(16);
        textStyle(BOLD);
        text(hint.name + "!", 0, 0); // 完成するので "!" を付ける
        
        pop();
    }
}



// ===================================
// 9. クラス定義 (統合)
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
    // baseCostOrDamage: 元素の場合はコスト（ダメージ計算用）、化合物の場合は計算済みダメージ
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

        // 合成された化合物かどうかでパラメータを分岐
        let recipe = recipes.find(r => r.name === name);
        
        if (recipe) {
            // 化合物の場合
            this.reacted = true;
            this.color = recipe.color;
            this.brightnessVal = 90; // 仮
            this.size *= 1.2;
            this.radius = this.size / 2;
            
            this.attackDamage = baseCostOrDamage; // 計算済みダメージ
            this.range = recipe.range;
            this.fireRate = recipe.rate;
            this.maxHp = recipe.baseHp;
            this.hp = this.maxHp;

        } else {
            // 単体元素の場合
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
            
            this.attackDamage = baseCostOrDamage; // コストをそのまま攻撃力とする
            this.range = 150;
            this.fireRate = 1000;
            this.maxHp = baseHp;
            this.hp = this.maxHp;
        }
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
        let textSizeRatio = (this.reacted ? 0.5 : 0.6);
        textSize(this.size * textSizeRatio);
        text(label, this.x, this.y);
        
        // HPバーの描画
        let hpBarWidth = this.size;
        let hpBarHeight = 5;
        let hpRatio = this.hp / this.maxHp;
        
        rectMode(CORNER);
        fill(255, 0, 0, 200);
        rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth, hpBarHeight);
        fill(0, 255, 0, 200);
        rect(this.x - hpBarWidth / 2, this.y - this.size / 2 - hpBarHeight - 5, hpBarWidth * hpRatio, hpBarHeight);
        
        // 攻撃力を小さく表示（デバッグ・確認用）
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
            bulletsArray.push(new Particle(this.x, this.y, target, this.attackDamage, this.color));
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
        
        this.health = 500; // sketch_addgenso.js の値を採用
        
        this.damageToWall = 0.5; 
        this.speed = 80;
        
        this.path = path;
        this.currentPathIndex = 0;
        this.isBlocked = false; 
        this.isCollidingWithTower = false;
        
        this.attackRange = 70;      
        this.attackDamage = 15;     
        this.attackRate = 1500;     
        this.lastAttackTime = 0;    
    }

    draw() {
        fill(255, 0, 0);
        stroke(0);
        strokeWeight(1);
        ellipse(this.x, this.y, this.size, this.size);

        let hpBarWidth = this.size * 0.8;
        let hpBarHeight = 5;
        let hpRatio = this.health / 500; // 最大値500で計算
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
            // エディターモードでの右クリックは削除機能
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

// contextmenu関数はsetup内のDOM操作に置き換えられたため、削除済み