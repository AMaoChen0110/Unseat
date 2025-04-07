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
        const finalDay = Math.min(currentDay, 40);

        return {
            day: `第${currentDay}天`,
            progress: (finalDay / 40) * 100
        };
    };

    // data
    let originalPersonData = []
    let personData = []

    // 使用 fetch 讀取 personData.json
    fetch('personData.json')
        .then(response => response.json())
        .then(data => {
            personData = data;
            fetchCountData();
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
                thresholdSpan.textContent = `最低門檻：${person.threshold.toLocaleString()}　`;
               
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
                const countNum = parseInt(person.count.replace(/,/g, '')); // 若有逗號分隔
                const thresholdNum = typeof person.threshold === 'number' ? person.threshold : parseInt(person.threshold.toString().replace(/\D/g, ''));

                const targetNum = parseInt(person.targetNum);
                const thresholdPercent = Math.min((countNum / thresholdNum) * 100, 100);
                const targetPercent = Math.min((countNum / targetNum) * 100, 100);

                if (!isNaN(countNum) && !isNaN(thresholdNum) && thresholdNum > 0) {
                   
                    const receiptBarContainer = document.createElement('div');
                    receiptBarContainer.className = 'progress-bar dual-layer';

                    const targetProgress = document.createElement('div');
                    targetProgress.className = 'progress-half progress-target';
                    targetProgress.style.width = `0%`;

                    const thresholdProgress = document.createElement('div');
                    thresholdProgress.className = 'progress-half progress-threshold';
                    thresholdProgress.style.width = `0%`;

                    receiptBarContainer.appendChild(thresholdProgress);
                    receiptBarContainer.appendChild(targetProgress);
                    progressContainer.appendChild(receiptBarContainer);

                    const labelTarget = document.createElement('div');
                    labelTarget.className = 'day-info';
                    labelTarget.textContent = `目標：0.0%`;
                    
                    const labelThreshold = document.createElement('div');
                    labelThreshold.className = 'day-info';
                    labelThreshold.textContent = `門檻：0.0%`;
                    
                    infoContainer.appendChild(labelTarget);
                    infoContainer.appendChild(labelThreshold);

                    let curThreshold = 0;
                    let curTarget = 0;
                    const duration = 800;
                    const frameRate = 30;
                    const stepThreshold = thresholdPercent / (duration / frameRate);
                    const stepTarget = targetPercent / (duration / frameRate);
                    
                    const interval = setInterval(() => {
                        curThreshold += stepThreshold;
                        curTarget += stepTarget;
                    
                        if (curThreshold >= thresholdPercent) curThreshold = thresholdPercent;
                        if (curTarget >= targetPercent) curTarget = targetPercent;
                    
                        thresholdProgress.style.width = `${curThreshold}%`;
                        targetProgress.style.width = `${curTarget}%`;
                    
                        labelThreshold.textContent = `門檻進度：${curThreshold.toFixed(1)}%`;
                        labelTarget.textContent = `目標進度：${curTarget.toFixed(1)}%`;
                    
                        if (curThreshold >= thresholdPercent && curTarget >= targetPercent) {
                            clearInterval(interval);
                        }
                    }, frameRate);

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

                    dayInfo.textContent = `第${Math.floor(startDay)}天/${person.totalDays}天`;
                }, frameRate);

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
    }

    function filterAndSort(isFromSort) {
        const sortProcess = document.querySelector('.sort-process');
        const classList = sortProcess.classList;
        const isAsc = isFromSort ? !classList.contains('active') : classList.contains('active') && classList.contains('asc');
        const isDesc = isFromSort ? classList.contains('active') && classList.contains('asc') : classList.contains('active') && classList.contains('desc');
        const isToReset = isFromSort ? classList.contains('active') && classList.contains('desc') : !classList.contains('active');

        // ⬇️ 加入圖示切換函式
        function _updateIcons(state) {
            const iconSort = document.querySelector('.icon-sort');
            const iconUp = document.querySelector('.icon-up');
            const iconDown = document.querySelector('.icon-down');

            iconSort.style.display = 'none';
            iconUp.style.display = 'none';
            iconDown.style.display = 'none';

            if (state === 'asc') {
                iconUp.style.display = 'inline-block';
            } else if (state === 'desc') {
                iconDown.style.display = 'inline-block';
            } else {
                iconSort.style.display = 'inline-block';
            }
        }

        function _resetClass() {
            classList.remove('asc');
            classList.remove('desc');
            classList.remove('active');
            _updateIcons(null); // ⬅️ 顯示 ⇅
        }

        function _sortData(sortOrder) {
            personData = personData.sort((a, b) => {
                const percentA = parseInt(a.count) / a.threshold;
                const percentB = parseInt(b.count) / b.threshold;
                return (percentA - percentB) * sortOrder;
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

        if (isAsc) {
            if (isFromSort) {
                _resetClass();
                classList.add('active', 'asc');
                _updateIcons('asc');  // 顯示 ▲
            }
            _sortData(1);
        } else if (isDesc) {
            if (isFromSort) {
                _resetClass();
                classList.add('active', 'desc');
                _updateIcons('desc'); // 顯示 ▼
            }
            _sortData(-1);
        } else if (isToReset) {
            _resetClass(); // 顯示 ⇅
        }

        renderPersonList();
    }

    document.querySelector('.sort-process').addEventListener('click', () => filterAndSort(true));
    document.querySelector('#filter').addEventListener('change', () => filterAndSort(false));
});
