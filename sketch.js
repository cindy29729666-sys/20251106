let questionsTable;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'start'; // 'start', 'quiz', 'result'
let selectedAnswer = null;
let answerChecked = false;
let feedback = '';

let particles = [];
let selectionEffects = []; 

function preload() {
  questionsTable = loadTable('assets/questions.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(16);
  
  // 解析 CSV 資料
  for (let row of questionsTable.getRows()) {
    questions.push({
      question: row.getString('question'),
      options: {
        A: row.getString('optionA'),
        B: row.getString('optionB'),
        C: row.getString('optionC'),
        D: row.getString('optionD'),
      },
      correctAnswer: row.getString('correctAnswer'),
      explanation: row.getString('explanation') // 讀取新的說明欄位
    });
  }
}

function draw() {
  background(240, 245, 255);

  drawCursorEffect();

  switch (gameState) {
    case 'start':
      displayStartScreen();
      break;
    case 'quiz':
      displayQuizScreen();
      break;
    case 'result':
      displayResultScreen();
      break;
  }

  drawSelectionEffects();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function displayStartScreen() {
  fill(0);
  textSize(60);
  text('p5.js 小測驗', width / 2, height / 2 - 40);
  textSize(40);
  text('點擊開始', width / 2, height / 2 + 20);
}

function displayQuizScreen() {
  if (currentQuestionIndex < questions.length) {
    let q = questions[currentQuestionIndex];
    let textMargin = width * 0.1;

    // 顯示問題
    textSize(45); // 稍微縮小問題字體
    fill(0);
    // 增加寬度限制讓文字可以自動換行
    text(q.question, textMargin, height * 0.1, width - textMargin * 2);

    // 顯示選項
    textSize(30);
    let options = Object.keys(q.options);

    // --- 動態佈局計算 ---
    let topMargin = height * 0.2; // 1. 選項區上移：減少頂部邊距
    let bottomMargin = height * 0.35; // 2. 回饋區下移：增加底部邊距
    let drawableHeight = height - topMargin - bottomMargin; // 選項可繪製的總高度
    
    // 根據選項數量和可用高度，計算每個按鈕的高度和間距
    let totalSpacing = (options.length - 1) * 15; // 總間距 (假設每個間距15px)
    let optionHeight = (drawableHeight - totalSpacing) / options.length;
    if (optionHeight > 90) optionHeight = 90; // 限制最大高度
    // --- 動態佈局計算結束 ---

    for (let i = 0; i < options.length; i++) {
      let key = options[i];
      let y = topMargin + i * (optionHeight + 15) + optionHeight / 2;
      let optionWidth = width * 0.7;
      
      // 檢查滑鼠是否懸停
      if (mouseX > (width - optionWidth) / 2 && mouseX < (width + optionWidth) / 2 && mouseY > y - optionHeight / 2 && mouseY < y + optionHeight / 2) {
        fill(200, 220, 255);
      } else {
        fill(255);
      }

      // 檢查答案後，高亮顯示選項
      if (answerChecked) {
        if (key === q.correctAnswer) {
          // 無論選對選錯，都高亮正確答案
          fill(150, 255, 150); // 正確答案顯示綠色
        } else if (key === selectedAnswer) {
          // 如果這個是選錯的選項，顯示紅色
          fill(255, 150, 150); // 錯誤答案顯示紅色
        }
      } else if (selectedAnswer === key) {
        // 尚未檢查，但已選擇的答案
        fill(255, 255, 150); // 選擇但未確認的答案顯示黃色
      }

      stroke(100);
      rect((width - optionWidth) / 2, y - optionHeight / 2, optionWidth, optionHeight, 10);
      
      fill(0);
      noStroke();
      // 為選項文字增加寬度限制，使其能自動換行
      text(`${key}: ${q.options[key]}`, textMargin * 2, y - optionHeight/2, width - textMargin * 4, optionHeight);
    }

    // 顯示回饋訊息
    if (answerChecked) {
      textSize(40);
      if (feedback === '正確！') {
        fill(0, 150, 0);
      } else {
        fill(200, 0, 0);
      }
      text(feedback, width / 2, height * 0.7); // 3. 使用比例定位回饋文字

      // 顯示答案說明 (如果有的話)
      if (q.explanation) {
        textSize(30);
        fill(0, 102, 153); // 使用中性顏色顯示說明
        text(q.explanation, width / 2, height * 0.78); // 3. 使用比例定位說明文字
      }

      // 顯示 "下一題" 按鈕
      let buttonW = 200;
      let buttonH = 50;
      let buttonX = width / 2 - buttonW / 2;
      let buttonY = height * 0.9 - buttonH / 2; // 3. 使用比例定位按鈕
      let buttonText = (currentQuestionIndex === questions.length - 1) ? '看結果' : '下一題';

      // 懸停效果
      if (mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
        fill(100, 180, 255);
      } else {
        fill(100, 150, 255);
      }
      rect(buttonX, buttonY, buttonW, buttonH, 10);
      fill(255);
      textSize(30);
      text(buttonText, width / 2, buttonY + buttonH / 2);
    }
  }
}

function displayResultScreen() {
  let percentage = (score / questions.length) * 100;
  
  // 檢查是否全部答對
  if (score === questions.length) {
    drawPraiseAnimation();
    textSize(60);
    fill(255, 215, 0);
    strokeWeight(2);
    stroke(0);
    text('太棒了！', width / 2, height / 2 - 80);
    
    // 顯示笑臉 emoji
    textSize(80);
    text('😄', width / 2, height / 2 + 20);
  } else {
    drawEncouragementAnimation();
    textSize(60);
    fill(0, 102, 153);
    strokeWeight(2);
    stroke(255);
    text('再接再厲！', width / 2, height / 2 - 80);
    
    // 顯示思考 emoji
    textSize(80);
    text('🤔', width / 2, height / 2 + 20);
  }

  noStroke();
  fill(0);
  textSize(40); // 分數文字大小
  text(`你的分數: ${score} / ${questions.length}`, width / 2, height - 100);
  textSize(30); // 重新開始文字大小
  text('點擊重新開始', width / 2, height - 50);
}

function mousePressed() {
  if (gameState === 'start') {
    gameState = 'quiz';
  } else if (gameState === 'quiz') {
    // 如果答案已經被檢查，則處理 "下一題" 按鈕的點擊
    if (answerChecked) {
      let buttonW = 200;
      let buttonH = 50;
      let buttonX = width / 2 - buttonW / 2;
      let buttonY = height * 0.9 - buttonH / 2; // 保持與 displayQuizScreen 一致

      if (mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
        currentQuestionIndex++;
        if (currentQuestionIndex >= questions.length) {
          gameState = 'result';
        }
        answerChecked = false;
        selectedAnswer = null;
        feedback = '';
      }
    } else { // 如果答案尚未檢查，則處理選項的點擊
      let q = questions[currentQuestionIndex];      
      if (!q) return; // 如果題目不存在，直接返回
      
      // --- 動態佈局計算 (與 displayQuizScreen 保持一致) ---
      let options = Object.keys(q.options);
      let topMargin = height * 0.2;
      let bottomMargin = height * 0.35;
      let drawableHeight = height - topMargin - bottomMargin;
      let totalSpacing = (options.length - 1) * 15;
      let optionHeight = (drawableHeight - totalSpacing) / options.length;
      if (optionHeight > 90) optionHeight = 90;
      // --- 動態佈局計算結束 ---

      let optionWidth = width * 0.7;

      for (let i = 0; i < options.length; i++) {
        let key = options[i];
        let y = topMargin + i * (optionHeight + 15) + optionHeight / 2;
        if (mouseX > (width - optionWidth) / 2 && mouseX < (width + optionWidth) / 2 && mouseY > y - optionHeight / 2 && mouseY < y + optionHeight / 2) {
          selectedAnswer = key;
          createSelectionEffect(width / 2, y);
          checkAnswer(key);
          break;
        }
      }
    }
  } else if (gameState === 'result') {
    restartQuiz();
  }
}

function checkAnswer(selected) {
  answerChecked = true;
  let q = questions[currentQuestionIndex];
  if (selected === q.correctAnswer) {
    score++;
    feedback = '正確！';
  } else {
    feedback = `錯誤！正確答案是 ${q.correctAnswer}`;
  }
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  gameState = 'start';
  particles = []; // 清除結果動畫的粒子
}

// --- 特效和動畫 ---

function drawCursorEffect() {
  push(); // 隔離繪圖狀態
  particles.push({ type: 'cursor', x: mouseX, y: mouseY, size: random(5, 15), life: 255 });

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    // 必須先檢查類型，再進行繪圖操作
    if (p.type !== 'cursor') {
      continue;
    }

    noStroke();
    fill(random(100, 255), random(100, 255), 255, p.life);
    ellipse(p.x, p.y, p.size);
    p.life -= 5;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
  pop(); // 恢復繪圖狀態
}

function createSelectionEffect(x, y) {
  for (let i = 0; i < 20; i++) {
    selectionEffects.push({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      size: random(3, 8),
      life: 100
    });
  }
}

function drawSelectionEffects() {
  push(); // 隔離繪圖狀態
  for (let i = selectionEffects.length - 1; i >= 0; i--) {
    let e = selectionEffects[i];
    noStroke();
    fill(255, 223, 0, e.life * 2.5);
    ellipse(e.x, e.y, e.size);
    e.x += e.vx;
    e.y += e.vy;
    e.life -= 4;
    if (e.life <= 0) {
      selectionEffects.splice(i, 1);
    }
  } 
  pop(); // 恢復繪圖狀態
}

function drawPraiseAnimation() {
  push(); // 隔離繪圖狀態
  // 煙火/彩紙效果
  if (frameCount % 5 === 0) {
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: random(width),
        y: random(height),
        vx: random(-2, 2),
        vy: random(-5, -1),
        size: random(5, 10),
        life: 255,
        type: 'praise',
        color: color(random(255), random(255), random(255))
      });
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    noStroke();
    // 檢查粒子是否有顏色屬性，若無則跳過或給予預設顏色
    if (p.type === 'praise' && p.color) {
      fill(p.color); // 這裡使用 color 物件
    } else {
      continue; // 如果這個粒子不是煙火粒子，就跳過不繪製
    }
    ellipse(p.x, p.y, p.size);
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // 重力
    p.life -= 2;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
  pop(); // 恢復繪圖狀態
}

function drawEncouragementAnimation() {
  push(); // 隔離繪圖狀態
  // 溫和的雨滴效果
  if (frameCount % 2 === 0) {
    particles.push({
      x: random(width),
      y: 0,
      vy: random(2, 5),
      type: 'rain',
      life: 255
    });
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    // 必須先檢查類型，再進行繪圖操作
    if (p.type !== 'rain') {
      continue;
    }

    stroke(100, 150, 255, p.life);
    strokeWeight(2);
    line(p.x, p.y, p.x, p.y + 10);
    p.y += p.vy;
    p.life -= 1.5;
    if (p.y > height || p.life <= 0) {
      particles.splice(i, 1);
    }
  }
  pop(); // 恢復繪圖狀態
}
