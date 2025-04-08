const data = [];
let imgAry = [];

async function init() {
  const res = await fetch('personData.json');
  const json = await res.json();
  const grouped = {};

  json.forEach(person => {
    const match = person.name.match(/^(.*?[市縣])(.+)$/);
    if (!match) return;
    const area = match[1];
    const name = match[2];
    if (!grouped[area]) grouped[area] = [];
    grouped[area].push({ name, fullName: person.name });
  });

  const cardsContainer = document.getElementById('cards');

  for (const area in grouped) {
    const title = document.createElement('h2');
    title.textContent = '💡' + area;
    title.style.marginTop = '1em';
    title.style.gridColumn = '1 / -1';
    cardsContainer.appendChild(title);

    grouped[area].forEach((p, index) => {
      const card = document.createElement('div');
      card.className = 'card';

      const h2 = document.createElement('h2');
      h2.textContent = p.name;
      card.appendChild(h2);

      const row = document.createElement('div');
      row.className = 'counter-row';

      const minusBtn = document.createElement('button');
      minusBtn.textContent = '-';
      const input = document.createElement('input');
      input.type = 'number';
      input.value = 1;
      input.min = 0;
      input.id = p.fullName;
      const plusBtn = document.createElement('button');
      plusBtn.textContent = '+';

      minusBtn.onclick = () => {
        input.value = Math.max(0, parseInt(input.value) - 1);
      };
      plusBtn.onclick = () => {
        input.value = parseInt(input.value) + 1;
      };

      row.appendChild(minusBtn);
      row.appendChild(input);
      row.appendChild(plusBtn);

      card.appendChild(row);
      cardsContainer.appendChild(card);
    });
  }
}

function getImageArray() {
  return fetch('images/ComplimentSquad/images.json')
  .then(res => res.json())
  .then(images => {
    imgAry = images;
  });
}

function toggleDialog() {
  const reportDialog = document.getElementsByClassName('report-dialog')[0];
  reportDialog.classList.toggle('active');
}

async function generateReport() {
  // get img array
  await getImageArray();

  const reportContent = document.getElementsByClassName('report-content')[0];
  const imgContent = document.getElementsByClassName('img-content')[0];
  const inputs = document.querySelectorAll('input');
  const result = {};

  inputs.forEach(input => {
    const count = parseInt(input.value);
    if (count > 0) {
      const match = input.id.match(/^(.*?[市縣])(.+)$/);
      if (!match) return;
      const area = match[1];
      const name = match[2];
      if (!result[area]) result[area] = [];
      result[area].push(`${name} + ${count} 份`);
    }
  });

  // reset report content
  reportContent.innerHTML = '';
  imgContent.innerHTML = '';

  for (const area in result) {
    const p = document.createElement('p');
    p.innerHTML = '<div class="city">▫️' + area + '</div><div class="count">' + result[area].join('<br>') + '</div>';
    reportContent.appendChild(p);
  }

  // reportDiv.appendChild(reportContent);

  // 隨機插入一張圖片
  const randomIndex = Math.floor(Math.random() * imgAry.length);
  const img = document.createElement('img');
  img.src = imgAry[randomIndex];
  img.alt = '誇誇部隊加油圖';
  imgContent.appendChild(img);


  // 渲染前端
  toggleDialog();
}

init();