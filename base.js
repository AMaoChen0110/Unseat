document.addEventListener('DOMContentLoaded', function () {
    // Define the base date - March 18, 2025
    const baseDate = new Date(2025, 2, 18); // Month is 0-indexed, so 2 = March

    // Get current date when the page loads
    const currentDate = new Date();

    // Format the current date for display
    const formattedDate = `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`;

    // Update the title with current date
    document.getElementById('current-date-title').innerHTML =
        `${formattedDate} 全台大罷免第二階段連署時間條 <span class="hourglass">⌛</span>`;

    // Calculate days difference (current day is day 1, next day is day 2, etc.)
    const calculateDayDifference = (startDate, person) => {
        // If hasn't started yet
        if (person.status === '還未開始') {
            return { day: person.status, progress: 0 };
        }

        // Calculate the difference in days
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Extract the person's starting day from their status
        let startDay = parseInt(person.status.replace(/第(\d+)天/, '$1'));
        if(person.name === '基隆市林沛祥'){
            startDay = -5;
        }

        // Calculate the current day for this person
        const currentDay = startDay + diffDays - 1; // -1 because we're counting from the reference date

        // Ensure we don't exceed 40 days
        const finalDay = Math.min(currentDay, 40);

        return {
            day: `第${currentDay}天`,
            progress: (finalDay / 40) * 100
        };
    };

    // Person data as shown in the image
    const personData = [
        { name: '新北市洪孟楷', status: '第5天', totalDays: 40, threshold: 38764, target: '5萬', url: 'https://linktr.ee/nomorered?ltclid=fa4a25f8-4565-4499-8c17-32513b13a4b7' },
        { name: '新北市葉元之', status: '第11天', totalDays: 40, threshold: 23313, target: '4萬', url: 'https://linktr.ee/banqiaobigsanyuan?ltclid=e6bad381-4713-4283-8c83-f81013013a40' },
        { name: '新北市張智倫', status: '第4天', totalDays: 40, threshold: 28766, target: '3萬5', url: 'https://linktr.ee/bettershuanghe?ltclid=8936793b-96be-4330-ad63-7d9df48abd4e' },
        { name: '新北市林德福', status: '第4天', totalDays: 40, threshold: 23830, target: '3萬', url: 'https://linktr.ee/bettershuanghe?ltclid=36136451-fbf3-4907-b7f8-3d4dd2569466' },
        { name: '新北市羅明才', status: '第6天', totalDays: 40, threshold: 29664, target: '4萬', url: 'https://linktr.ee/baluobo1111?ltclid=92a842ef-ae1a-41ee-bdb1-c3874c116bc6' },
        { name: '新北市廖先翔', status: '第5天', totalDays: 40, threshold: 26512, target: '4萬5', url: 'https://linktr.ee/12scissorkick?ltclid=79b5be4d-e7e7-4427-b756-9992ccf813b7' },
        { name: '臺北市王鴻薇', status: '第6天', totalDays: 40, threshold: 27733, target: '4萬5', url: 'https://linktr.ee/wanghongwei2025gg?utm_source=linktree_profile_share&ltsid=1ecda328-baa8-4ab0-aeb0-8c3403043c76&ltclid=55162d4b-90bc-4c32-80b8-a159309299e5' },
        { name: '臺北市李彥秀', status: '第7天', totalDays: 40, threshold: 31809, target: '6萬', url: 'https://linktr.ee/recall.giansiu?ltclid=255f239f-980e-4105-938e-ee9a4bb4051e' },
        { name: '臺北市羅智強', status: '第7天', totalDays: 40, threshold: 23313, target: '4萬', url: 'https://www.daanreboot.tw/?ltclid=862efe8d-1a53-40df-995a-2c560e728367' },
        { name: '臺北市徐巧芯', status: '第6天', totalDays: 40, threshold: 23482, target: '4萬', url: 'https://linktr.ee/recall.hsu900?ltclid=bc86ea44-4a64-4063-be1c-d4c8dc4efa79' },
        { name: '臺北市賴士葆', status: '第6天', totalDays: 40, threshold: 24832, target: '3萬2', url: 'https://linktr.ee/banish.laishyhbao?ltclid=b7d4e8a4-3541-484f-a95b-1111dc362d14' },
        { name: '基隆市林沛祥', status: '第-5天', totalDays: 40, threshold: 30394, target: "4萬", url: 'https://linktr.ee/keelungreplay?ltclid=eea0bb9c-2a22-4766-891b-3d0ac9722407' },
        { name: '桃園市牛煦庭', status: '第12天', totalDays: 40, threshold: 33956, target: '8萬', url: 'https://linktr.ee/birdcrushcow?ltclid=0b030171-1f95-4e59-8c90-524e4bf93e22' },
        { name: '桃園市涂權吉', status: '第13天', totalDays: 40, threshold: 30872, target: '5萬', url: 'https://linktr.ee/taoyuanboxerrecall?ltclid=64724a9c-5e5e-4f0b-8227-c7a77bfec203' },
        { name: '桃園市魯明哲', status: '第13天', totalDays: 40, threshold: 30122, target: '4萬5', url: 'https://linktr.ee/chunglirecall?ltclid=0dec0585-a07a-4aaa-9a7d-2753e27b2c68' },
        { name: '桃園市萬美玲', status: '第12天', totalDays: 40, threshold: 30233, target: '4萬5~5萬', url: 'https://linkgoods.com/wanbyela444?ltclid=d76b5baf-75b3-47eb-85a3-333686335c47' },
        { name: '桃園市呂玉玲', status: '第13天', totalDays: 40, threshold: 28064, target: '4萬5', url: 'https://linktr.ee/recalllu0604?ltclid=55b74e4d-a52d-4d77-8f59-9b25ecd7c638' },
        { name: '桃園市邱若華', status: '第12天', totalDays: 40, threshold: 28222, target: '4萬', url: 'https://linktr.ee/recallt6chiu?ltclid=419a7977-f426-42c9-99e9-d8176b7c7ba8' },
        { name: '新竹市鄭正鈐', status: '第14天', totalDays: 40, threshold: 35465, target: '5萬', url: 'https://www.threads.net/@resident300hc.2024' },
        { name: '新竹縣徐欣瑩', status: '第7天', totalDays: 40, threshold: 21527, target: '4萬5', url: 'https://linktr.ee/recall.hsu.hsin.ying?ltclid=2a8b4147-4ed3-471d-b0cd-f53cf29915ea' },
        { name: '新竹縣林思銘', status: '第7天', totalDays: 40, threshold: 23287, target: '3萬', url: 'https://linktr.ee/recall.lsm?ltclid=0fdd5ae6-3c85-4124-a51e-3fc569f058d5' },
        { name: '苗栗縣陳超明', status: '第2天', totalDays: 40, threshold: 20586, target: '3萬', url: 'https://sites.google.com/view/ba-miaoli-lawmaker/index?authuser=0&ltclid=d58a4eb8-0f2b-4a95-bd38-e8335bd00e19' },
        { name: '苗栗縣邱鎮軍', status: '第2天', totalDays: 40, threshold: 23187, target: '3萬', url: 'https://sites.google.com/view/ba-miaoli-lawmaker/index?authuser=0&ltclid=d58a4eb8-0f2b-4a95-bd38-e8335bd00e19' },
        { name: '臺中市顏寬恒', status: '第11天', totalDays: 40, threshold: 30278, target: '4萬', url: 'https://bento.me/taichung2jyen?ltclid=ee3a2801-5333-438b-89eb-b99c7949db9e' },
        { name: '臺中市楊瓊瓔', status: '第11天', totalDays: 40, threshold: 26026, target: '6萬5', url: 'https://linktr.ee/recallvote_taichung3rd?ltclid=7f33be9a-35bc-4bbe-baa5-4a4482985454' },
        { name: '臺中市廖偉翔', status: '第12天', totalDays: 40, threshold: 32921, target: '5萬', url: 'https://linktr.ee/tc4.recall?ltclid=9b3843c8-3703-40da-bf97-ecd8444556a0' },
        { name: '臺中市黃健豪', status: '第12天', totalDays: 40, threshold: 36323, target: '5萬', url: 'https://linktr.ee/recallvote_beibeitun?ltclid=1ba16855-f494-4195-93db-527b180b4292' },
        { name: '臺中市羅廷瑋', status: '第12天', totalDays: 40, threshold: 27337, target: '7萬', url: 'https://linktr.ee/beat__low?ltclid=4286878d-7a62-4875-8cea-8b0558dce178' },
        { name: '臺中市江啟臣', status: '第12天', totalDays: 40, threshold: 21060, target: '3萬5', url: 'https://linktr.ee/taichung8th.recall?ltclid=548d59c3-d237-4c9e-8fc8-186bb50e80ba' },
        { name: '南投縣馬文君', status: '第13天', totalDays: 40, threshold: 18622, target: '2萬7', url: 'https://magenta-pear-z108l8.mystrikingly.com/?ltclid=bb17e223-083d-4f2f-8168-86073c444873' },
        { name: '南投縣游顥', status: '第13天', totalDays: 40, threshold: 19833, target: '2萬5', url: 'https://linktr.ee/toueryouout?ltclid=f7cefc1e-3ab6-47b0-901e-7ca91e129c7f' },
        { name: '彰化縣謝衣鳳', status: '第4天', totalDays: 40, threshold: 26719, target: '3萬5', url: 'https://linktr.ee/bamain_c1feng' },
        { name: '雲林縣丁學忠', status: '第11天', totalDays: 40, threshold: 27501, target: '3萬5', url: 'https://linktr.ee/badingact?ltclid=58c2c4bc-fa82-48cd-b6f6-3182a2dd8470' },
        { name: '花蓮縣傅崐萁', status: '第14天', totalDays: 40, threshold: 19377, target: '2萬5', url: 'https://linktr.ee/shimmer.tw?ltclid=6c87cfaa-1474-4e77-a77c-0900b55f7e72' },
        { name: '臺東縣黃建賓', status: '第13天', totalDays: 40, threshold: 11534, target: '1萬5', url: 'https://line.me/ti/g2/durnftvfKTx6RIYBHo3-hzzwNR24TgWCCnaYQA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default&ltclid=526fa497-f874-406f-bc73-876660d230de' }
    ];

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

            // 呼叫你原本顯示畫面邏輯
            renderPersonList();
        });

    function renderPersonList() {
        // Generate the person list HTML
        const personListElement = document.getElementById('person-list');
        personListElement.innerHTML = ''; // 清空前次渲染
        personData.forEach(person => {
            // Calculate the current day and progress for this person
            const { day, progress } = calculateDayDifference(baseDate, person);

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

            const firstPart = document.createElement('span');
            firstPart.textContent = person.name.substring(0, 3);
            firstPart.className = 'person-name-area';
            
            const secondPart = document.createElement('span');
            secondPart.textContent = person.name.substring(3);
            secondPart.className = 'person-name-fullname';
            
            personName.appendChild(firstPart);
            personName.appendChild(secondPart);

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
                        countSpan.textContent = `目前收件：尚未更新　`;
                    }
                }
            
                const thresholdText = `門檻：${person.threshold.toLocaleString()}　`;
                const targetText = `目標：${person.target.toLocaleString()}`;
            
                goalInfo.appendChild(countSpan);
                goalInfo.append(thresholdText + targetText);
            
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

                if (!isNaN(countNum) && !isNaN(thresholdNum) && thresholdNum > 0) {
                    const finalPercent = Math.min((countNum / thresholdNum) * 100, 100);

                    const receiptBarContainer = document.createElement('div');
                    receiptBarContainer.className = 'progress-bar receipt';

                    const receiptProgressBar = document.createElement('div');
                    receiptProgressBar.className = 'progress';
                    receiptProgressBar.style.width = `0%`; // 初始寬度設為 0

                    // receiptProgressBar.style.width = `${receiptProgress}%`;

                    const receiptLabel = document.createElement('div');
                    receiptLabel.className = 'day-info';
                    receiptLabel.textContent = `收件進度：0%`; // 初始為 0
                    // receiptLabel.textContent = `收件進度：${receiptProgress.toFixed(1)}%`;

                    receiptBarContainer.appendChild(receiptProgressBar);
                    progressContainer.appendChild(receiptBarContainer);
                    infoContainer.appendChild(receiptLabel);

                    let current = 0;
                    const duration = 800;
                    const frameRate = 30;
                    const step = finalPercent / (duration / frameRate);
    
                    const interval = setInterval(() => {
                        current += step;
                        if (current >= finalPercent) {
                            current = finalPercent;
                            clearInterval(interval);
                        }
    
                        receiptProgressBar.style.width = `${current}%`;
                        receiptLabel.textContent = `收件進度：${current.toFixed(1)}%`;
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
});
