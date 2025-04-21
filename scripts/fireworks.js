function startFirework(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    let particles = [];
    let launchIntervalId = null;
  
    class Particle {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.radius = 2; this.color = color;
        this.speed = Math.random() * 4 + 1;
        this.angle = Math.random() * 2 * Math.PI;
        this.gravity = 0.05; this.life = 100;
      }
      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.life--;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
  
    function launchFirework() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height / 2;
      const colors = ['red','orange','yellow','white','blue','purple'];
      for (let i = 0; i < 40; i++) {
        particles.push(new Particle(x, y, colors[Math.floor(Math.random()*colors.length)]));
      }
    }
  
    function animate() {
      // 清除畫布，不蓋住背景
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(i, 1);
      }
      requestAnimationFrame(animate);
    }
  
    // 啟動或停止煙火
    function startInterval() {
      if (!launchIntervalId) {
        launchIntervalId = setInterval(launchFirework, 1000);
      }
    }
    function stopInterval() {
      clearInterval(launchIntervalId);
      launchIntervalId = null;
      particles = [];  // 清掉所有殘留粒子
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  
    // 偵測頁面顯示狀態
    function handleVisibility() {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
  
    // 初始啟動
    startInterval();
    animate();
  }
  