// 1. 準備：canvas要素を取得し、2D描画コンテキストを取得する
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 2. キャンバスのサイズを画面全体に広げる
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 3. ボールの設定
const ball = {
    x: 100,      // 初期位置 (X座標)
    y: 100,      // 初期位置 (Y座標)
    vx: 5,       // X方向の速度
    vy: 2,       // Y方向の速度
    radius: 25,  // 半径
    color: 'royalblue' // 色
};

// 4. 描画するメインの関数
function draw() {
    // 5. 画面を毎回クリアする
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 6. ボールを描画する
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();

    // 7. ボールの位置を更新する
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 8. 壁での跳ね返り処理
    // 左右の壁
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.vx *= -1;
    }
    // 上下の壁
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.vy *= -1;
    }

    // 9. この関数をブラウザの描画タイミングで繰り返し呼び出す
    requestAnimationFrame(draw);
}

// 10. 最初の描画を開始する
draw();

// ウィンドウサイズが変更されたときに、canvasのサイズも追従させる
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});