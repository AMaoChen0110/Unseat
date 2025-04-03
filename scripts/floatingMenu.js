document.addEventListener('DOMContentLoaded', function () {
  const button = document.getElementById('floating-menu');
  const panel = document.getElementById('floating-panel');

  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let hasMoved = false;

  // 滑鼠事件處理
  button.addEventListener('mousedown', (e) => {
    isDragging = true;
    hasMoved = false;
    offsetX = e.clientX - button.getBoundingClientRect().left;
    offsetY = e.clientY - button.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    hasMoved = true;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    button.style.transition = 'none';
    panel.style.transition = 'none';
    button.style.left = x + 'px';
    button.style.top = y + 'px';
    button.style.right = 'auto';
    button.style.bottom = 'auto';
    panel.style.top = y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = '';
    button.style.transition = '';
    panel.style.transition = '';

    const winWidth = window.innerWidth;
    const btnRect = button.getBoundingClientRect();
    const btnHalf = btnRect.width / 2;
    const left = btnRect.left;

    if (left + btnHalf < winWidth / 2) {
      button.style.left = '0';
      button.style.right = 'auto';
      panel.style.left = '70px';
      panel.style.right = 'auto';
    } else {
      button.style.left = 'auto';
      button.style.right = '0';
      panel.style.right = '70px';
      panel.style.left = 'auto';
    }
  });


  // touchstart、touchmove、touchend（手機用）

  button.addEventListener('touchstart', (e) => {
    isDragging = true;
    hasMoved = false;
    const touch = e.touches[0];
    offsetX = touch.clientX - button.getBoundingClientRect().left;
    offsetY = touch.clientY - button.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    hasMoved = true;
    const touch = e.touches[0];
    const x = touch.clientX - offsetX;
    const y = touch.clientY - offsetY;
    button.style.transition = 'none';
    panel.style.transition = 'none';
    button.style.left = x + 'px';
    button.style.top = y + 'px';
    button.style.right = 'auto';
    button.style.bottom = 'auto';
    panel.style.top = y + 'px';
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = '';
    button.style.transition = '';
    panel.style.transition = '';

    const winWidth = window.innerWidth;
    const btnRect = button.getBoundingClientRect();
    const btnHalf = btnRect.width / 2;
    const left = btnRect.left;

    if (left + btnHalf < winWidth / 2) {
      button.style.left = '0';
      button.style.right = 'auto';
      panel.style.left = '70px';
      panel.style.right = 'auto';
    } else {
      button.style.left = 'auto';
      button.style.right = '0';
      panel.style.right = '70px';
      panel.style.left = 'auto';
    }
  });

  // 點擊展開/收起選單
  button.addEventListener('click', () => {
    if (hasMoved) return;
    panel.classList.toggle('show');
  });
});
