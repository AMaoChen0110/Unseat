// 建立進場動畫卡片（一次性顯示）
function showIntroCards() {
    const introCards = [
        {
            date: '4/12',
            weekday: '(六)',
            title: '花蓮市場掃街',
            location: '花蓮市重慶市場',
            time: '07:30~08:30'
        },
        {
            date: '4/12',
            weekday: '(六)',
            title: '汐止罷免宣講',
            location: '汐止區水返腳公園',
            time: '14:00~14:15'
        },
        {
            date: '4/12',
            weekday: '(六)',
            title: '人民是頭家新竹場',
            location: '新竹市香山指澤宮廟埕',
            time: '16:15~16:30'
        },
        {
            date: '4/12',
            weekday: '(六)',
            title: '人民是頭家北屯場',
            location: '台中舊社南興宮',
            time: '19:00~19:30'
        },
        {
            date: '4/13',
            weekday: '(日)',
            title: '苗栗罷免宣講',
            location: '頭份市建國國小旁',
            time: '10:30~10:45'
        },
        {
            date: '4/13',
            weekday: '(日)',
            title: '板橋罷免宣講',
            location: '永豐公園活動中心',
            time: '13:30~14:00'
        },
        {
            date: '4/13',
            weekday: '(日)',
            title: '文山罷免宣講',
            location: '文山興隆公園',
            time: '15:00~15:30'
        },
        {
            date: '4/13',
            weekday: '(日)',
            title: '雙和罷免宣講',
            location: '仁愛公園仁愛永貞路口',
            time: '16:00~16:30'
        }
    ];

    const wrapper = document.createElement('div');
    wrapper.id = 'entry-animation-wrapper';

    // 新增標題容器
    const titleContainer = document.createElement('div');
    titleContainer.className = 'popup-title-container';
    titleContainer.innerHTML = '<h2>Puma沈伯洋週末宣講行程</h2>';
    wrapper.appendChild(titleContainer);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    wrapper.appendChild(cardsContainer);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-entry-wrapper';
    closeBtn.innerHTML = '&times;';

    const closeWrapper = () => {
        wrapper.remove();
        closeBtn.remove();
        document.body.classList.remove('modal-open');
    }

    closeBtn.addEventListener('click', closeWrapper);

    wrapper.addEventListener('click', (e) => {
        if (e.target.id === 'entry-animation-wrapper' || e.target === cardsContainer) {
            closeWrapper();
        }
    });

    document.body.appendChild(wrapper);
    document.body.appendChild(closeBtn);
    document.body.classList.add('modal-open');

    introCards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'event-card';
        div.style.animationDelay = `${index * 0.1}s`; // 稍微加快動畫
        div.innerHTML = `
            <div class="event-header">
                <div class="event-date">${card.date}</div>
                <div class="event-weekday">${card.weekday}</div>
                <div class="event-title">${card.title}</div>
            </div>
            <div class="event-location">${card.location}</div>
            <div class="event-time">${card.time}</div>
        `;
        cardsContainer.appendChild(div);
    });
}
document.addEventListener('DOMContentLoaded', showIntroCards);