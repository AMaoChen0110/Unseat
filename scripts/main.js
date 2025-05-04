document.addEventListener('DOMContentLoaded', function () {
    // Get current date when the page loads
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Format the current date for display
    const formattedDate = `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`;

    // Update the title with current date
    document.getElementById('current-date-title').innerHTML =
        `${formattedDate} 全台大罷免第二階段連署時間條 <span class="hourglass">⌛</span>`;

    // Calculate days difference (current day is day 1, next day is day 2, etc.)
    const calculateDayDifference = (person) => {
        // If hasn't started yet
        if (person.status === '還未開始') {
            return { day: person.status, progress: 0 };
        }

        // 使用 Math.abs() 確保不會有負數
        const diffTime = Math.abs(currentDate - new Date(person.startDate));

        // 使用 Math.ceil() 並加1，確保換日即算一天
        const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Ensure we don't exceed 40 days
        const finalDay = Math.min(currentDay, person.totalDays);

        return {
            day: `第${currentDay}天`,
            progress: (finalDay / person.totalDays) * 100
        };
    };

    // data
    let originalPersonData = []
    let personData = []
    let dayOverMessage = null;

    // 使用 fetch 讀取 personData.json
    fetch('personData.json')
        .then(response => response.json())
        .then(data => {
            personData = data;
            fetchCountData();
        });

    fetch('dayOverMessage.json')
        .then(res => res.json())
        .then(data => {
            dayOverMessage = data;
        })
        .catch(err => {
            console.error("載入 dayOverMessage.json 發生錯誤：", err);
        });

    function fetchCountData() {
        fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1vJG_0a6Dl0UoEwjMBjJkfzHKjlVhu-gajL-RRTYP4rw9ocZiXT7xQAXy97Hv78xi5-2YYlZikpyM/pub?gid=0&single=true&output=csv')
            .then(response => response.text())
            .then(csvData => {
                const rows = csvData.split('\n').map(row => row.split(',').map(cell => cell.trim()));

                const nameToCountMap = {};
                for (let i = 0; i < rows.length; i++) {
                    const [name, count] = rows[i];
                    if (name && count) {
                        nameToCountMap[name] = count;
                    }
                }

                // 更新 personData 裡的每一筆資料，加上 count 欄位
                personData.forEach(person => {
                    person.count = nameToCountMap[person.name] || null;
                });

                // 將 personData 複製一份
                originalPersonData = JSON.parse(JSON.stringify(personData));

                // 呼叫你原本顯示畫面邏輯
                renderPersonList();
            });
    }

    function renderPersonList() {
        // Generate the person list HTML
        const personListElement = document.getElementById('person-list');
        personListElement.innerHTML = ''; // 清空前次渲染
        personData.forEach(person => {
            // Calculate the current day and progress for this person
            const { day, progress } = calculateDayDifference(person);

            // Create the person item element
            const personItem = document.createElement('div');
            personItem.className = 'person-item';

            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = '點擊查看連署詳情';
            personItem.appendChild(tooltip);

            if (person.url) {
                personItem.style.cursor = 'pointer';
                personItem.addEventListener('click', () => {
                    tagGAEvent(person.name.substring(3), '卡片');
                    window.open(person.url, '_blank');
                });
            }

            // Create the person name element
            const personName = document.createElement('div');
            personName.className = 'person-name';

            const nameGroup = document.createElement('div');
            nameGroup.className = 'name-text-group';

            // 區域
            const firstPart = document.createElement('span');
            firstPart.textContent = person.name.substring(0, 3);
            firstPart.className = 'person-name-area';

            // 姓名
            const secondPart = document.createElement('span');
            secondPart.textContent = person.name.substring(3);
            secondPart.className = 'person-name-fullname';

            nameGroup.appendChild(firstPart);
            nameGroup.appendChild(secondPart);

            personName.appendChild(nameGroup);
            //start

            // 建立 icon container
            const iconContainer = document.createElement('div');
            iconContainer.className = 'icon-container';

            // 當點擊 iconContainer 時阻止事件冒泡
            iconContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // 定義 icon 資訊 (依需求替換 URL 與圖片來源)
            const icons = [
                { href: person.url, src: 'images/link.png', alt: '官方' },
                { href: person.facebook, src: 'images/facebook.png', alt: 'FB' },
                { href: person.instagram, src: 'images/instagram.png', alt: 'Instagram' },
                { href: person.threads, src: 'images/threads.png', alt: 'Threads' },
                { href: person.line, src: 'images/line.png', alt: 'Line' },
                { href: person.x, src: 'images/twitter.png', alt: 'X' },
                { href: person.youtube, src: 'images/youtube.png', alt: 'Youtube' }
            ];

            icons.forEach(iconData => {
                if (iconData.href == "") {
                    return;
                }
                const a = document.createElement('a');
                a.href = iconData.href;
                a.target = '_blank';
                a.className = 'icon-link';

                a.addEventListener('click', () => {
                    tagGAEvent(person.name.substring(3), `Icon-${iconData.alt}`);
                });

                const img = document.createElement('img');
                img.src = iconData.src;
                img.alt = iconData.alt;
                img.className = 'icon-image';

                a.appendChild(img);
                iconContainer.appendChild(a);
            });

            // 將 iconContainer 加入 personItem（右上角由 CSS 控制定位）
            personName.appendChild(iconContainer);

            //end

            if (person.threshold && person.target) {
                const goalInfo = document.createElement('div');
                goalInfo.className = 'goal-info';

                // 建立綠色的目前收件 span
                const countSpan = document.createElement('span');
                countSpan.className = 'count-info';

                if (person.count) {
                    const countNum = parseInt(person.count.replace(/,/g, '')); // 去除千分位
                    person.countNum = countNum; // 儲存目前收件數

                    if (!isNaN(countNum) && countNum > 0) {
                        let current = 0;
                        const duration = 800; // 動畫總長度 (ms)
                        const frameRate = 30; // 幾毫秒更新一次
                        const step = Math.ceil(countNum / (duration / frameRate));

                        const interval = setInterval(() => {
                            current += step;
                            if (current >= countNum) {
                                current = countNum;
                                clearInterval(interval);
                            }
                            countSpan.textContent = `目前收件：${current.toLocaleString()}+　`;
                        }, frameRate);
                    } else {
                        countSpan.textContent = `目前收件：收件中　`;
                    }
                }

                const thresholdSpan = document.createElement('span');
                thresholdSpan.className = 'min-threshold';
                thresholdSpan.textContent = `門檻：${person.threshold.toLocaleString()}　`;

                const targetSpan = document.createElement('span');
                targetSpan.className = 'min-target';
                targetSpan.textContent = `目標：${person.target.toLocaleString()}　`;

                goalInfo.appendChild(countSpan);

                goalInfo.append(thresholdSpan);
                goalInfo.append(targetSpan);

                personName.append(goalInfo);
            }

            personItem.appendChild(personName);

            const progressBlock = document.createElement('div');
            progressBlock.className = 'progress-block';

            // Create the progress container
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';

            // Create the info container
            const infoContainer = document.createElement('div');
            infoContainer.className = 'info-container';

            // ⬇️ 顯示目前收件數（從 Google Sheets 來）
            if (person.count) {
                // 👉 新增的收件進度條放這裡
                const countNum = person.countNum; // 若有逗號分隔

                const thresholdNum = typeof person.threshold === 'number' ? person.threshold : parseInt(person.threshold.toString().replace(/\D/g, ''));
                person.thresholdNum = thresholdNum; // 儲存門檻數

                const targetNum = parseInt(person.targetNum);

                if (!isNaN(countNum) && !isNaN(thresholdNum) && thresholdNum > 0) {

                    const receiptBarContainer = document.createElement('div');
                    receiptBarContainer.className = 'progress-bar one-line';

                    const receiptProgressBar = document.createElement('div');
                    receiptProgressBar.className = 'progress-fill';
                    receiptProgressBar.style.width = `0%`;

                    const receiptText = document.createElement('div');
                    receiptText.className = 'progress-text';
                    if (countNum.toLocaleString() === "0") {
                        receiptText.textContent = `持續收件中　`;
                    } else {
                        receiptText.textContent = `已收取：${countNum.toLocaleString()}+`;
                    }

                    const thresholdLine = document.createElement('div');
                    thresholdLine.className = 'threshold-line';
                    // 計算門檻目標的暫比
                    const thresholdPos = Math.min((thresholdNum / targetNum) * 100, 100);

                    // 計算收件數/門檻百分比
                    const receiptThPos = Math.min((countNum / thresholdNum) * 100, 100);
                    person.receiptThPos = receiptThPos; // 儲存門檻位置

                    thresholdLine.style.left = `${thresholdPos}%`;

                    const targetLine = document.createElement('div');
                    targetLine.className = 'target-line';
                    targetLine.style.left = `${99}%`;

                    receiptBarContainer.appendChild(receiptProgressBar);
                    receiptBarContainer.appendChild(receiptText);
                    receiptBarContainer.appendChild(thresholdLine);
                    receiptBarContainer.appendChild(targetLine);
                    progressContainer.appendChild(receiptBarContainer);

                    const labelProgress = document.createElement('div');
                    labelProgress.className = 'day-info';
                    labelProgress.textContent = `進度：0.0%`;
                    infoContainer.appendChild(labelProgress);

                    let curPercent = 0;
                    const finalPercent = (countNum / targetNum) * 100;
                    const step = finalPercent / (800 / 30);

                    const interval = setInterval(() => {
                        curPercent += step;
                        if (curPercent >= finalPercent) {
                            curPercent = finalPercent;
                            clearInterval(interval);
                        }
                        receiptProgressBar.style.width = `${Math.min(curPercent, 100)}%`;
                        labelProgress.textContent = `進度：${curPercent.toFixed(1)}%`;
                    }, 30);

                    // 判斷「收件進度是否已滿」 放煙火
                    if (finalPercent >= 100) {
                        // 建立 canvas（會自動套用上面 CSS）
                        const canvas = document.createElement('canvas');
                        canvas.id = `fireworkCanvas_${person.name}`; // 可選：方便除錯

                        // 插入到 personItem
                        personItem.appendChild(canvas);

                        // 等下一幀再設定尺寸並啟動煙火
                        requestAnimationFrame(() => {
                            // 由 CSS 負責寬高，直接啟動即可
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return;  // 如果無法取得就跳過

                            startFirework(canvas);
                        });
                    }
                }
            }

            // Create the progress bar container
            const progressBarContainer = document.createElement('div');
            progressBarContainer.className = 'progress-bar';

            // Create the progress bar
            const progressBar = document.createElement('div');
            progressBar.className = 'progress';
            // 初始進度條設定為寬度 0
            progressBar.style.width = `0%`; // 動畫從 0 開始
            // progressBar.style.width = `${progress}%`;

            // Create the day info element
            const dayInfo = document.createElement('div');
            dayInfo.className = 'day-info';
            //dayInfo.textContent = day === '還未開始' ? day : `${day}/${person.totalDays}天`;

            if (day === '還未開始') {
                dayInfo.textContent = day;
                progressBar.style.width = `0%`; // 不顯示進度
            } else {
                let currentPro = 0;
                const frameRate = 30;
                const stepPro = progress / (800 / frameRate);

                const intervalPro = setInterval(() => {
                    currentPro += stepPro;
                    if (currentPro >= progress) {
                        currentPro = progress;
                        clearInterval(intervalPro);
                    }

                    progressBar.style.width = `${currentPro}%`;
                }, frameRate);

                dayInfo.textContent = `第0天/${person.totalDays}天`; // 初始為 0 天
                let startDay = 0;
                const finalDay = parseInt(day.replace('第', '').replace('天', ''));
                const step = finalDay / (800 / frameRate);

                const interval = setInterval(() => {
                    startDay += step;
                    if (startDay >= finalDay) {
                        startDay = finalDay;
                        clearInterval(interval);
                    }

                    if (finalDay >= person.totalDays) {
                        dayInfo.textContent = `第${Math.floor(startDay)}天/${(person.totalDays + (60 - person.totalDays))}天`;
                        const tagInbox = document.createElement('div');
                        tagInbox.textContent = '持續收件中';
                        tagInbox.className = 'day-info-tag-Inbox';
                        dayInfo.appendChild(tagInbox);
                        // if (!['桃園市涂權吉'].includes(person.name)) {
                        //     dayInfo.appendChild(tagInbox);
                        // }

                        // const tagRoll = document.createElement('span');
                        // tagRoll.textContent = '+造冊天';
                        // tagRoll.className = 'day-info-tag-Roll';
                        // tagInbox.append(tagRoll);
                    }
                    else {
                        dayInfo.textContent = `第${Math.floor(startDay)}天/${person.totalDays}天`;
                    }
                }, frameRate);

                const progressBarText = document.createElement('div');
                progressBarText.className = 'progress-text';
                if (finalDay >= person.totalDays) {

                    progressBar.style.background = 'linear-gradient(90deg, #ffa726, #ffeb3b)';
                    const thresholdPercent = (person.countNum / person.thresholdNum) * 100;
                    if (thresholdPercent >= 100) {
                        progressBarText.textContent = `${getRandomMissMessage()}`;

                        if (thresholdPercent >= 120) {
                            progressBar.style.background = 'linear-gradient(90deg, #aed581, #dce775)';
                        }
                    }
                    else {
                        progressBarText.textContent = `${getRandomMissMessage()}`;
                    }
                }

                if (person.name === "臺北市羅智強") {
                    progressBarText.textContent = `收件數未更新`;
                }

                if(person.marqueeText !== "") {
                    // 要先清空 progressBarText 的內容
                    progressBarText.textContent = "";
                    const marqueeInline = document.createElement('div');
                    marqueeInline.className = 'urgent-marquee-inline';
                    const marqueeSpan = document.createElement('span');
                    marqueeSpan.style.animation = `urgent-marquee ${person.marqueeDuration}s linear infinite`;
                    marqueeSpan.textContent = person.marqueeText;
                    marqueeInline.appendChild(marqueeSpan);
                    progressBarText.appendChild(marqueeInline);
                }

                progressBarText.style.textAlign = 'center';
                progressBarText.style.width = '90%';
                progressBarContainer.appendChild(progressBarText);
            }
            // Append all elements
            progressBarContainer.appendChild(progressBar);
            progressContainer.appendChild(progressBarContainer);
            infoContainer.appendChild(dayInfo);

            progressBlock.appendChild(progressContainer);
            progressBlock.appendChild(infoContainer);
            personItem.appendChild(progressBlock);

            personListElement.appendChild(personItem);
        });

        if (urgentData.length === 0) {
            urgentData = personData
                .filter(item => {
                    const val = 100 - item.receiptThPos;
                    return val >= 15 && val <= 30;
                }) // 篩選 15~30 間
                .sort((a, b) => b.receiptThPos - a.receiptThPos)                      // 依 receiptThPos 由大到小排序
                .slice(0, 6)
                .map(item => ({
                    area: item.name.substring(0, 3),      // 前 3 個字當 area
                    name: item.name.substring(3),         // 後面當 name
                    receiptThPos: item.receiptThPos       // 原本的 receiptThPos
                }));

            renderUrgentSection(urgentData);
        }
    }

    function filterAndSort() {
        // const sortProcess = document.querySelector('.sort-process');
        // const classList = sortProcess.classList;
        // const isDesc = isFromSort ? !classList.contains('active') : classList.contains('active') && classList.contains('desc');
        // const isAsc = isFromSort ? classList.contains('active') && classList.contains('desc') : classList.contains('active') && classList.contains('asc');
        // const isToReset = isFromSort ? classList.contains('active') && classList.contains('asc') : !classList.contains('active');

        const sortValue = document.querySelector('#sort').value;
        const sortType = sortValue && sortValue.split('-')[0];
        const sortOrder = sortValue.split('-')[1] === 'desc' ? -1 : 1;


        // // ⬇️ 加入圖示切換函式
        // function _updateIcons(state) {
        //     const iconSort = document.querySelector('.icon-sort');
        //     const iconUp = document.querySelector('.icon-up');
        //     const iconDown = document.querySelector('.icon-down');

        //     iconSort.style.display = 'none';
        //     iconUp.style.display = 'none';
        //     iconDown.style.display = 'none';

        //     if (state === 'asc') {
        //         iconUp.style.display = 'inline-block';
        //     } else if (state === 'desc') {
        //         iconDown.style.display = 'inline-block';
        //     } else {
        //         iconSort.style.display = 'inline-block';
        //     }
        // }

        // function _resetClass() {
        //     classList.remove('asc');
        //     classList.remove('desc');
        //     classList.remove('active');
        //     _updateIcons(null); // ⬅️ 顯示 ⇅
        // }

        function _getDiffDaysPercent(startDate, totalDays) {
            const start = new Date(startDate);
            const today = new Date();
            const difference = today.getTime() - start.getTime();
            const days = Math.ceil(difference / (1000 * 3600 * 24));

            // 超過收件截止日
            if (days >= totalDays) {
                return totalDays / totalDays;
            }

            return days / totalDays;
        }

        function _sortData(sortType, sortOrder) {
            personData = personData.sort((a, b) => {
                let compareA = '';
                let compareB = '';

                switch (sortType) {
                    case 'targetNum':
                    case 'threshold':
                        compareA = parseInt(a.count) / a[sortType];
                        compareB = parseInt(b.count) / b[sortType];
                        break;
                    case 'startDate':
                        compareA = _getDiffDaysPercent(a[sortType], a.totalDays);
                        compareB = _getDiffDaysPercent(b[sortType], b.totalDays);
                        break;
                }

                return (compareA - compareB) * sortOrder;
            });
        }

        function _filterName() {
            const city = document.querySelector('#filter').value;

            // reset
            personData = JSON.parse(JSON.stringify(originalPersonData));
            if (city !== 'all') {
                personData = personData.filter(person => person.name.includes(city));
            }
        }

        _filterName();
        if (sortType) {
            _sortData(sortType, sortOrder);
        }

        // if (isAsc) {
        //     if (isFromSort) {
        //         _resetClass();
        //         classList.add('active', 'asc');
        //         _updateIcons('asc');  // 顯示 ▲
        //     }
        //     _sortData(1);
        // } else if (isDesc) {
        //     if (isFromSort) {
        //         _resetClass();
        //         classList.add('active', 'desc');
        //         _updateIcons('desc'); // 顯示 ▼
        //     }
        //     _sortData(-1);
        // } else if (isToReset) {
        //     _resetClass(); // 顯示 ⇅
        // }

        renderPersonList();
    }

    // document.querySelector('.sort-process').addEventListener('click', filterAndSort);
    document.querySelector('#sort').addEventListener('change', filterAndSort);
    document.querySelector('#filter').addEventListener('change', filterAndSort);

    // 隨機取陣列中一筆
    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // 取得一筆「達門檻」文宣
    function getRandomHitMessage() {
        if (!dayOverMessage) {
            console.warn("資料尚未載入完成");
            return null;
        }
        return getRandomItem(dayOverMessage.thresholdHitMessages);
    }

    // 取得一筆「未達門檻」文宣 [改為統一用這組]
    function getRandomMissMessage() {
        if (!dayOverMessage) {
            console.warn("資料尚未載入完成");
            return null;
        }
        return getRandomItem(dayOverMessage.thresholdMissMessages);
    }

    // 1. 告急專區資料
    let urgentData = [
    ];

    // 2. 將資料渲染到 #urgent-section
    function renderUrgentSection(data) {
        const container = document.getElementById('urgent-section');
        const section = document.createElement('div');
        section.className = 'urgent-section';

        // 標題
        const header = document.createElement('div');
        header.className = 'urgent-header';
        // 先放文字
        const headerText = document.createElement('span');
        header.textContent = '⚠️ 收件告急';
        header.appendChild(headerText);

        // 在 header 裡面加跑馬燈
        const marqueeInline = document.createElement('div');
        marqueeInline.className = 'urgent-marquee-inline header-speed';
        const marqueeSpan = document.createElement('span');
        marqueeSpan.textContent = '🚨二階段罷免連署最後倒數🔥快來加入宇宙小罷罷的毀滅爛委列車🚆一起送親中藍共立委回家睡覺💤月薪１９萬的國民黨爛立委👇👇👇能當薪水小偷就當薪水小偷💸能打混摸魚就絕不認真，能亂立法就亂立法📜修法修到制裁到自己還在喊司法迫害~刪預算刪到行政機關癱瘓⚠️還能跑去裝可憐說執政黨獨裁😢誒？怎麼哪裡怪怪的？最愛咆哮的黃國昌居然沒有出來罵國民黨大作弊？投這些人是改革？錯了～他們煮了一鍋大便大拌麵，懲罰全國人民～這些人現在每天早上起床對著鏡子說：「今天也要繼續亂搞立法院喔٩(｡•́‿•̀｡)۶」開會資料需要看嗎？不看也沒關係🙈投票照黨意，內容才不重要！預算怎麼砍？閉著眼砍、骰子丟一丟砍，反正砍就對了！然後記者問兩句，就開始「賴清德不用負責嗎？」４在HELLO？你以為他們在立法院上班？不說我還以為是分手擂台欸～✨快簽下去✨🌈一起罷免藍藍爛委，身心靈開花🌸宇宙同步✨考運上升📈福如東海🎁我現在數到三喔一二最後倒數還沒上車趕快上車，坐等傅崑萁自己爆炸變成巧克力口味的爆米花，簽下去罷道總裁就是你，我是你的前世你的今生你的夢中情人💝快來簽啦～現在不簽以後沒機會！一起攜手完成黃國昌毀滅國民黨宇宙的夢想吧，他實現不了的野心由你我來完成🥰宇宙小罷罷最後感謝追連載跑馬燈的朋朋們，謝謝大家的支持與喜歡，宇宙小罷罷永遠愛您💗最重要的壓軸獻給全台罷免藍委團隊的無名志工英雄們，感謝妳/你們這幾個月來無償不求回報的付出與努力，台灣有妳/你們真好💗大家三階要記得出門投票，我們一起投下『同意罷免』國民黨爛立委(๑•̀ㅂ•́)و💗';
        marqueeInline.appendChild(marqueeSpan);
        header.appendChild(marqueeInline);

        section.appendChild(header);

        // Grid 容器
        const grid = document.createElement('div');
        grid.className = 'urgent-grid';

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'urgent-item';

            const a = document.createElement('div');
            a.className = 'urgent-area';
            a.textContent = item.area;
            card.appendChild(a);

            const n = document.createElement('div');
            n.className = 'urgent-name';
            n.textContent = item.name;
            card.appendChild(n);

            // ★ 新增：點擊後平滑捲動到 person-name-fullname
            card.addEventListener('click', () => {
                // 找到下方所有 fullname 元素
                const elems = document.querySelectorAll('.person-name-fullname');
                for (const el of elems) {
                    if (el.textContent.trim() === item.name.trim()) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        break;
                    }
                }
                tagGAEvent(item.name, `告急卡`);
            });

            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }

    function tagGAEvent(name, type) {
        gtag('event', 'click', {
            event_category: `${name}-${type}`,
            event_label: `${name}-${type}`,
            value: 1,
            transport_type: 'beacon'//,
            // debug_mode: true // ✅ 加上這行
        });
    }
});
