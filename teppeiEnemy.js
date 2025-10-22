// setup関数は最初に一度だけ実行される
function setup() {
  // 600x400ピクセルのキャンバスを作成
  createCanvas(600, 400);
  frameRate(60);
}

let enemyindex = [];

// draw関数はフレームごとに繰り返し実行される
function draw() {
  // 背景を薄い灰色に塗りつぶす
  background(220);
  // マウスの位置に円を描画]
  if(frameCount%60==0){
    enemyindex.push(new Enemy(100, 100));
  }
  for (let e of enemyindex) {
    // enemy は配列aから取り出されたEnemyオブジェクト
    ellipse(e.x, e.y, 30, 30); // 1体ずつ描画
    // 将来的にmove1メソッドもここで呼び出す
    e.move1(); 
  }
}

class Enemy{
  constructor(x, y){
    this.x=x;
    this.y=y;
  }
  move1(){
    if(this.x<=500){
      if(this.y==300){
        this.x = this.x - 2;
      }
      this.x = this.x + 1;
    }else if(this.y<=300){
      this.y = this.y + 1;
    }
  }
}