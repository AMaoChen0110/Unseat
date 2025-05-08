// === fscreen@1.0.1.js 內容 ===
(function (global) {
  'use strict';
  var key = {
    fullscreenEnabled: 0,
    fullscreenElement: 1,
    requestFullscreen: 2,
    exitFullscreen: 3,
    fullscreenchange: 4,
    fullscreenerror: 5
  };
  var webkit = ['webkitFullscreenEnabled', 'webkitFullscreenElement', 'webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitfullscreenchange', 'webkitfullscreenerror'];
  var moz = ['mozFullScreenEnabled', 'mozFullScreenElement', 'mozRequestFullScreen', 'mozCancelFullScreen', 'mozfullscreenchange', 'mozfullscreenerror'];
  var ms = ['msFullscreenEnabled', 'msFullscreenElement', 'msRequestFullscreen', 'msExitFullscreen', 'MSFullscreenChange', 'MSFullscreenError'];
  var doc = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
  var vendor = 'fullscreenEnabled' in doc && Object.keys(key) || webkit[0] in doc && webkit || moz[0] in doc && moz || ms[0] in doc && ms || [];
  var fscreen = {
    requestFullscreen: function requestFullscreen(element) {
      return element[vendor[key.requestFullscreen]]();
    },
    requestFullscreenFunction: function requestFullscreenFunction(element) {
      return element[vendor[key.requestFullscreen]];
    },
    get exitFullscreen() {
      return doc[vendor[key.exitFullscreen]].bind(doc);
    },
    addEventListener: function addEventListener(type, handler, options) {
      return doc.addEventListener(vendor[key[type]], handler, options);
    },
    removeEventListener: function removeEventListener(type, handler) {
      return doc.removeEventListener(vendor[key[type]], handler);
    },
    get fullscreenEnabled() {
      return Boolean(doc[vendor[key.fullscreenEnabled]]);
    },
    set fullscreenEnabled(val) { },
    get fullscreenElement() {
      return doc[vendor[key.fullscreenElement]];
    },
    set fullscreenElement(val) { },
    get onfullscreenchange() {
      return doc[('on' + vendor[key.fullscreenchange]).toLowerCase()];
    },
    set onfullscreenchange(handler) {
      return doc[('on' + vendor[key.fullscreenchange]).toLowerCase()] = handler;
    },
    get onfullscreenerror() {
      return doc[('on' + vendor[key.fullscreenerror]).toLowerCase()];
    },
    set onfullscreenerror(handler) {
      return doc[('on' + vendor[key.fullscreenerror]).toLowerCase()] = handler;
    }
  };
  global.fscreen = fscreen;
})(window);

// === CalMath.js 內容 ===
const CalMath = (function CalMathFactory(Math) {
  const CalMath = {};
  CalMath.toDeg = 180 / Math.PI;
  CalMath.toRad = Math.PI / 180;
  CalMath.halfPI = Math.PI / 2;
  CalMath.twoPI = Math.PI * 2;
  CalMath.dist = (width, height) => Math.sqrt(width * width + height * height);
  CalMath.pointDist = (x1, y1, x2, y2) => {
    const distX = x2 - x1;
    const distY = y2 - y1;
    return Math.sqrt(distX * distX + distY * distY);
  };
  CalMath.angle = (width, height) => (CalMath.halfPI + Math.atan2(height, width));
  CalMath.pointAngle = (x1, y1, x2, y2) => (CalMath.halfPI + Math.atan2(y2 - y1, x2 - x1));
  CalMath.splitVector = (speed, angle) => ({ x: Math.sin(angle) * speed, y: -Math.cos(angle) * speed });
  CalMath.random = (min, max) => Math.random() * (max - min) + min;
  CalMath.randomInt = (min, max) => ((Math.random() * (max - min + 1)) | 0) + min;
  CalMath.randomChoice = function randomChoice(choices) {
    if (arguments.length === 1 && Array.isArray(choices)) {
      return choices[(Math.random() * choices.length) | 0];
    }
    return arguments[(Math.random() * arguments.length) | 0];
  };
  CalMath.clamp = function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  };
  return CalMath;
})(Math);

// === Stage@0.1.4.js 內容 ===
const Ticker = (function TickerFactory(window) {
  const Ticker = {};
  Ticker.addListener = function addListener(callback) {
    if (typeof callback !== 'function') throw ('Ticker.addListener() requires a function reference passed for a callback.');
    listeners.push(callback);
    if (!started) {
      started = true;
      queueFrame();
    }
  };
  let started = false;
  let lastTimestamp = 0;
  let listeners = [];
  function queueFrame() {
    if (window.requestAnimationFrame) {
      requestAnimationFrame(frameHandler);
    } else {
      webkitRequestAnimationFrame(frameHandler);
    }
  }
  function frameHandler(timestamp) {
    let frameTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    if (frameTime < 0) {
      frameTime = 17;
    } else if (frameTime > 68) {
      frameTime = 68;
    }
    listeners.forEach(listener => listener.call(window, frameTime, frameTime / 16.6667));
    queueFrame();
  }
  return Ticker;
})(window);

const Stage = (function StageFactory(window, document, Ticker) {
  let lastTouchTimestamp = 0;
  function Stage(canvas) {
    if (typeof canvas === 'string') canvas = document.getElementById(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.style.touchAction = 'none';
    this.speed = 1;
    this.dpr = Stage.disableHighDPI ? 1 : ((window.devicePixelRatio || 1) / (this.ctx.backingStorePixelRatio || 1));
    this.width = canvas.width;
    this.height = canvas.height;
    this.naturalWidth = this.width * this.dpr;
    this.naturalHeight = this.height * this.dpr;
    if (this.width !== this.naturalWidth) {
      this.canvas.width = this.naturalWidth;
      this.canvas.height = this.naturalHeight;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
    }
    Stage.stages.push(this);
    this._listeners = {
      resize: [],
      pointerstart: [],
      pointermove: [],
      pointerend: [],
      lastPointerPos: { x: 0, y: 0 }
    };
  }
  Stage.stages = [];
  Stage.disableHighDPI = false;
  Stage.prototype.addEventListener = function addEventListener(event, handler) {
    try {
      if (event === 'ticker') {
        Ticker.addListener(handler);
      } else {
        this._listeners[event].push(handler);
      }
    }
    catch (e) {
      throw ('Invalid Event')
    }
  };
  Stage.prototype.dispatchEvent = function dispatchEvent(event, val) {
    const listeners = this._listeners[event];
    if (listeners) {
      listeners.forEach(listener => listener.call(this, val));
    } else {
      throw ('Invalid Event');
    }
  };
  Stage.prototype.resize = function resize(w, h) {
    this.width = w;
    this.height = h;
    this.naturalWidth = w * this.dpr;
    this.naturalHeight = h * this.dpr;
    this.canvas.width = this.naturalWidth;
    this.canvas.height = this.naturalHeight;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.dispatchEvent('resize');
  };
  Stage.windowToCanvas = function windowToCanvas(canvas, x, y) {
    const bbox = canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (canvas.width / bbox.width),
      y: (y - bbox.top) * (canvas.height / bbox.height)
    };
  };
  Stage.mouseHandler = function mouseHandler(evt) {
    if (Date.now() - lastTouchTimestamp < 500) {
      return;
    }
    let type = 'start';
    if (evt.type === 'mousemove') {
      type = 'move';
    } else if (evt.type === 'mouseup') {
      type = 'end';
    }
    Stage.stages.forEach(stage => {
      const pos = Stage.windowToCanvas(stage.canvas, evt.clientX, evt.clientY);
      stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
    });
  };
  Stage.touchHandler = function touchHandler(evt) {
    lastTouchTimestamp = Date.now();
    let type = 'start';
    if (evt.type === 'touchmove') {
      type = 'move';
    } else if (evt.type === 'touchend') {
      type = 'end';
    }
    Stage.stages.forEach(stage => {
      for (let touch of Array.from(evt.changedTouches)) {
        let pos;
        if (type !== 'end') {
          pos = Stage.windowToCanvas(stage.canvas, touch.clientX, touch.clientY);
          stage._listeners.lastPointerPos = pos;
          if (type === 'start') stage.pointerEvent('move', pos.x / stage.dpr, pos.y / stage.dpr);
        } else {
          pos = stage._listeners.lastPointerPos;
        }
        stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
      }
    });
  };
  Stage.prototype.pointerEvent = function pointerEvent(type, x, y) {
    const evt = {
      type: type,
      x: x,
      y: y
    };
    evt.onCanvas = (x >= 0 && x <= this.width && y >= 0 && y <= this.height);
    this.dispatchEvent('pointer' + type, evt);
  };
  document.addEventListener('mousedown', Stage.mouseHandler);
  document.addEventListener('mousemove', Stage.mouseHandler);
  document.addEventListener('mouseup', Stage.mouseHandler);
  document.addEventListener('touchstart', Stage.touchHandler);
  document.addEventListener('touchmove', Stage.touchHandler);
  document.addEventListener('touchend', Stage.touchHandler);
  return Stage;
})(window, document, Ticker);

// main.js
// 封裝煙火效果於 FireworkCard，並可套用於任意 DOM 元素

// === 新版煙火效果，獨立管理每個 canvas 狀態 ===
const FIREWORK_COLORS = {
  Red: '#ff0043',
  Green: '#14fc56',
  Blue: '#1e7fff',
  Purple: '#e60aff',
  Gold: '#ffbf36',
  White: '#ffffff'
};
const TWO_PI = Math.PI * 2;

class FireworkEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    // canvas 寬高與 CSS 一致
    const rect = canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    canvas.width = this.width;
    canvas.height = this.height;
    // 拖尾效果
    this.trailCanvas = document.createElement('canvas');
    this.trailCanvas.width = this.width;
    this.trailCanvas.height = this.height;
    this.trailCanvas.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;`;
    canvas.parentElement.appendChild(this.trailCanvas);
    this.trailCtx = this.trailCanvas.getContext('2d', { alpha: true });
    // 粒子、火箭、計時器
    this.particles = [];
    this.rockets = [];
    this.frameCount = 0;
    this.launchTimer = null;
    this.running = true;
    this.scale = (this.height || 130) / 130;
    this.animate = this.animate.bind(this);
    this.scheduleLaunch = this.scheduleLaunch.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.scheduleLaunch();
    this.animate();
  }
  randomColor() {
    const colors = Object.values(FIREWORK_COLORS);
    if (Math.random() < 0.8) {
      const nonWhite = colors.filter(c => c !== FIREWORK_COLORS.White);
      return nonWhite[Math.floor(Math.random() * nonWhite.length)];
    }
    return colors[Math.floor(Math.random() * colors.length)];
  }
  scheduleLaunch() {
    if (!this.running) return;
    this.launchRocket();
    const min = 1500, max = 3000;
    this.launchTimer = setTimeout(this.scheduleLaunch, Math.random() * (max - min) + min);
  }
  stopLaunch() {
    clearTimeout(this.launchTimer);
    clearInterval(this.memoryCleanTimer);
  }
  handleVisibility() {
    if (document.hidden) {
      this.stopLaunch();
      this.rockets = [];
      this.particles = [];
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.trailCtx.clearRect(0, 0, this.width, this.height);
    } else {
      this.running = true;
      this.scheduleLaunch();
    }
  }
  launchRocket() {
    this.rockets.push(new Rocket(this));
  }
  animate() {
    if (!this.running) return;
    // 拖尾效果
    this.trailCtx.globalCompositeOperation = 'destination-out';
    this.trailCtx.fillStyle = 'rgba(0,0,0,0.12)';
    this.trailCtx.fillRect(0, 0, this.width, this.height);
    this.trailCtx.globalCompositeOperation = 'lighter';
    // 清主畫布
    this.ctx.clearRect(0, 0, this.width, this.height);
    // 更新火箭
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.update();
      r.draw(this.ctx);
      if (r.exploded) this.rockets.splice(i, 1);
    }
    // 減少記憶體消耗
    // if (this.particles.length > 150) { // 例如最多150顆
    //   this.particles.splice(0, this.particles.length - 150);
    // }
    // 更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      } else {
        p.draw(this.trailCtx);
      }
    }
    requestAnimationFrame(this.animate);
  }
  burst(x, y, color) {
    // 新版爆炸特效
    const starCount = 120;
    const baseAngle = Math.random() * TWO_PI;
    const burstType = Math.random();
    if (burstType < 0.3) {
      // 環狀煙火
      const radius = 10 * this.scale;
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * TWO_PI + baseAngle;
        this.particles.push(new Particle(
          x + Math.cos(angle) * radius,
          y + Math.sin(angle) * radius,
          angle,
          (1.2 + Math.random() * 2) * this.scale,
          color,
          (800 + Math.random() * 300) * this.scale
        ));
        if (i % 2 === 0) {
          this.particles.push(new Particle(
            x + Math.cos(angle) * (radius * 0.5),
            y + Math.sin(angle) * (radius * 0.5),
            angle,
            (0.8 + Math.random() * 2) * this.scale,
            this.getSimilarColor(color),
            (600 + Math.random() * 300) * this.scale
          ));
        }
      }
    } else {
      // 球形爆炸
      const spreadSize = 200 * this.scale;
      const speed = spreadSize / 90;
      const starLife = 1000 * this.scale;
      const starLifeVariation = 0.25;
      const R = 0.5 * Math.sqrt(starCount / Math.PI);
      const C = 2 * R * Math.PI;
      const C_HALF = C / 2;
      for (let i = 0; i <= C_HALF; i++) {
        const ringAngle = i / C_HALF * Math.PI / 2;
        const ringSize = Math.cos(ringAngle);
        const partsPerFullRing = C * ringSize;
        const angleInc = TWO_PI / partsPerFullRing;
        const angleOffset = Math.random() * angleInc + baseAngle;
        for (let j = 0; j < partsPerFullRing; j++) {
          const angle = angleInc * j + angleOffset;
          const finalSpeed = speed * (0.8 + Math.random() * 0.3);
          this.particles.push(new Particle(
            x,
            y,
            angle,
            finalSpeed,
            color,
            starLife * (0.8 + Math.random() * starLifeVariation)
          ));
        }
      }
      if (Math.random() < 0.3) {
        const innerColor = this.getSimilarColor(color);
        const innerSpeed = speed * 0.6;
        for (let i = 0; i <= C_HALF / 2; i++) {
          const ringAngle = i / (C_HALF / 2) * Math.PI / 2;
          const ringSize = Math.cos(ringAngle);
          const partsPerFullRing = (C * ringSize) / 2;
          const angleInc = TWO_PI / partsPerFullRing;
          const angleOffset = baseAngle;
          for (let j = 0; j < partsPerFullRing; j++) {
            const angle = angleInc * j + angleOffset;
            this.particles.push(new Particle(
              x,
              y,
              angle,
              innerSpeed * (0.9 + Math.random() * 0.2),
              innerColor,
              starLife * 0.7 * (0.8 + Math.random() * starLifeVariation)
            ));
          }
        }
      }
    }
  }
  getSimilarColor(baseColor) {
    const colors = Object.values(FIREWORK_COLORS);
    const currentIndex = colors.indexOf(baseColor);
    const range = 2;
    const start = Math.max(0, currentIndex - range);
    const end = Math.min(colors.length, currentIndex + range + 1);
    const availableColors = colors.slice(start, end);
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }
}

class Rocket {
  constructor(effect) {
    this.effect = effect;
    this.x = Math.random() * effect.width * 0.8 + effect.width * 0.1;
    this.y = effect.height;
    this.targetY = Math.random() * effect.height * 0.3 + effect.height * 0.4;
    this.speed = 8 * effect.scale;
    this.color = effect.randomColor();
    this.exploded = false;
  }
  update() {
    if (this.y <= this.targetY) {
      this.exploded = true;
      this.effect.burst(this.x, this.y, this.color);
    } else {
      this.y -= this.speed;
      // 火箭拖尾效果：每幀在火箭尾端噴出與火箭顏色相同的粒子
      for (let i = 0; i < 2; i++) {
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.4; // 向下微擴散
        const speed = 1 + Math.random() * 0.5;
        this.effect.particles.push(new Particle(
          this.x,
          this.y + 2,
          angle,
          speed * this.effect.scale,
          this.color,
          200 * this.effect.scale // 壽命短
        ));
      }
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, angle, speed, color, life) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.angle = angle;
    this.speed = speed;
    this.color = color;
    this.life = life;
    this.fullLife = life;
    this.alpha = 1;
    this.gravity = 0.09;
    this.friction = 0.98;
    this.radius = 1.5 + Math.random();
  }
  update() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.life -= 16;
    this.alpha = Math.max(0, this.life / this.fullLife);
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.moveTo(this.prevX, this.prevY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

window.startFirework = function (canvas) {
  return new FireworkEffect(canvas);
};