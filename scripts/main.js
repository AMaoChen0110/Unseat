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
                        countSpan.textContent = `目前收件：統計中　`;
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
                        receiptText.textContent = `統計中　`;
                    } else {
                        receiptText.textContent = `已收取：${countNum.toLocaleString()}+`;
                    }

                    const thresholdLine = document.createElement('div');
                    thresholdLine.className = 'threshold-line';
                    const thresholdPos = Math.min((thresholdNum / targetNum) * 100, 100);
                    person.thresholdPos = thresholdPos; // 儲存門檻位置

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
                    const finalPercent = Math.min((countNum / targetNum) * 100, 100);
                    const step = finalPercent / (800 / 30);

                    const interval = setInterval(() => {
                        curPercent += step;
                        if (curPercent >= finalPercent) {
                            curPercent = finalPercent;
                            clearInterval(interval);
                        }
                        receiptProgressBar.style.width = `${curPercent}%`;
                        labelProgress.textContent = `進度：${curPercent.toFixed(1)}%`;
                    }, 30);

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
                        // const tagRoll = document.createElement('span');
                        // tagRoll.textContent = '+造冊天';
                        // tagRoll.className = 'day-info-tag-Roll';
                        // tagInbox.append(tagRoll);
                    }
                    else {
                        dayInfo.textContent = `第${Math.floor(startDay)}天/${person.totalDays}天`;
                    }
                }, frameRate);

                if (finalDay >= person.totalDays) {
                    const progressBarText = document.createElement('div');
                    progressBarText.className = 'progress-text';

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


                    if (person.name === "花蓮縣傅崐萁") {
                        progressBarText.textContent = `緊急！花蓮二階要重簽！`;
                    }


                    progressBarText.style.textAlign = 'center';
                    progressBarText.style.width = '90%';
                    progressBarContainer.appendChild(progressBarText);
                }

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

        // person.name.substring(0, 3); person.name.substring(3);
        const top6 = personData
            .filter(item => {
                const val = 100 - item.thresholdPos;
                return val >= 15 && val <= 30;
            }) // 篩選 15~30 間
            .sort((a, b) => b.thresholdPos - a.thresholdPos)                      // 依 thresholdPos 由大到小排序
            .slice(0, 6)
            .map(item => ({
                area: item.name.substring(0, 3) + '第一選區',      // 前 3 個字當 area
                name: item.name.substring(3),         // 後面當 name
                thresholdPos: item.thresholdPos       // 原本的 thresholdPos
            }));
        urgentData = top6; // 更新 urgentData

        renderUrgentSection(urgentData);
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
        marqueeInline.className = 'urgent-marquee-inline';
        const marqueeSpan = document.createElement('span');
        marqueeSpan.textContent = '⚠️ 件呢？件咧？我不是昨天才在你限動看到你說要簽結果現在人咧？你再睡傅崑萁已經在你夢裡跳戰舞你再躺韓國瑜會送你罷免滑水道下地獄還貼愛心貼圖國昌已經咆哮到太空艙破音司法正在被藍白亂黨活吞你還在選濾鏡？不簽連署藍委全體升級暗黑覺醒型號KMT-ZERO你一睡醒直接進入立法院寒冬宇宙版簽一下嘛簽一下嘛拜託託人家真的想要過門檻這不是情勒這是民主勒戒你不簽人家阿花都會看你沒禮貌你不簽藍白就會合體召喚黃國昌之怨靈你不簽我就要每天出現在你夢中問你到底簽了沒 真的簽下去財運橫掃八方考試秒解選擇題 連喜歡的人都突然密你說你很有正義感 件差一點國昌會偷笑阿明都簽十張你還在那邊精算要不要簽一張你說藍白爛那你快簽不然你就等著看藍白演《司法哭哭秀》還敢上北檢自導自演哭到震天嘎嘎叫宇宙都失焦 我在想現在犯法的人去北檢一哭二鬧是什麼最新的犯罪SOP嗎? 選罷法也是國民黨通過要嚴懲冒名連署的不是嗎?現在又不開心了喔哭哭真~的~~太~離~譜~了~ 我現在數到三喔一二件還沒拿出來三地球扣分你人生要進入KMT平行世界 簽下去福如東海身心靈解鎖心輪開啟KMT消滅術你不簽民主哭泣你一簽傅崑萁自己爆炸還附贈爆米花罷道總裁就是你我是你前世連署員快來簽啦～件件有愛罷免無罪現在不簽以後沒機會！人家隔壁阿花都簽了你還在等誰？簽個名而已那麼難嗎Q_Q罷免藍委就是罷免陳玉珍罷免藍委就是罷免黃國昌（誒不是啦是幫黃國昌完成他消滅國民黨的夢想啦）還在耍廢連阿明都簽了我都快變你老罷了419凱道反共見簽下去罷道總裁就是你我是你宇宙小罷罷快來一起簽！ ⚠️ ';
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

            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }
    
});
