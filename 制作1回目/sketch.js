// setup関数は最初に一度だけ実行される
function setup() {
  // 600x400ピクセルのキャンバスを作成
  createCanvas(600, 400);
}

// draw関数はフレームごとに繰り返し実行される
function draw() {
  // 背景を薄い灰色に塗りつぶす
  background(220);
  // マウスの位置に円を描画
  ellipse(mouseX, mouseY, 50, 50);
}