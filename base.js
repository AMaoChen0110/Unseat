document.addEventListener('DOMContentLoaded', function() {
    // Define the base date - March 18, 2025
    const baseDate = new Date(2025, 2, 18); // Month is 0-indexed, so 2 = March
    
    // Get current date when the page loads
    const currentDate = new Date();
    
    // Format the current date for display
    const formattedDate = `${currentDate.getFullYear()}/${currentDate.getMonth()+1}/${currentDate.getDate()}`;
    
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
        const startDay = parseInt(person.status.replace(/第(\d+)天/, '$1'));
        
        // Calculate the current day for this person
        const currentDay = startDay + diffDays - 1; // -1 because we're counting from the reference date
        
        // Ensure we don't exceed 40 days
        const finalDay = Math.min(currentDay, 40);
        
        return { 
            day: `第${finalDay}天`, 
            progress: (finalDay / 40) * 100 
        };
    };

    // Person data as shown in the image
    const personData = [
        { name: '新北市洪孟楷', status: '第5天', totalDays: 40, threshold: 38764, target: '5萬' },
        { name: '新北市葉元之', status: '第11天', totalDays: 40, threshold: 23313, target: '4萬' },
        { name: '新北市張智倫', status: '第4天', totalDays: 40, threshold: 28766, target: '3萬5' },
        { name: '新北市林德福', status: '第4天', totalDays: 40, threshold: 23830, target: '3萬' },
        { name: '新北市羅明才', status: '第6天', totalDays: 40, threshold: 29664, target: '4萬' },
        { name: '新北市廖先翔', status: '第5天', totalDays: 40, threshold: 26512, target: '4萬5' },
        { name: '臺北市王鴻薇', status: '第6天', totalDays: 40, threshold: 27733, target: '4萬5' },
        { name: '臺北市李彥秀', status: '第7天', totalDays: 40, threshold: 31809, target: '6萬' },
        { name: '臺北市羅智強', status: '第7天', totalDays: 40, threshold: 23313, target: '4萬' },
        { name: '臺北市徐巧芯', status: '第6天', totalDays: 40, threshold: 23482, target: '4萬' },
        { name: '臺北市賴士葆', status: '第6天', totalDays: 40, threshold: 24832, target: '3萬2' },
        { name: '基隆市林沛祥', status: '還未開始', totalDays: 40, threshold: "X", target: "X" },
        { name: '臺中市顏寬恒', status: '第11天', totalDays: 40, threshold: 30278, target: '4萬' },
        { name: '臺中市楊瓊瓔', status: '第11天', totalDays: 40, threshold: 26026, target: '6萬5' },
        { name: '臺中市廖偉翔', status: '第12天', totalDays: 40, threshold: 32921, target: '5萬' },
        { name: '臺中市黃健豪', status: '第12天', totalDays: 40, threshold: 36323, target: '5萬' },
        { name: '臺中市羅廷瑋', status: '第12天', totalDays: 40, threshold: 27337, target: '7萬' },
        { name: '臺中市江啟臣', status: '第12天', totalDays: 40, threshold: 21060, target: '3萬5' },
        { name: '南投縣馬文君', status: '第13天', totalDays: 40, threshold: 18622, target: '2萬7' },
        { name: '南投縣游顥', status: '第13天', totalDays: 40, threshold: 19833, target: '2萬5' },
        { name: '彰化縣謝衣鳳', status: '第4天', totalDays: 40, threshold: 26719, target: '3萬5' },
        { name: '花蓮縣傅崐萁', status: '第14天', totalDays: 40, threshold: 19377, target: '2萬5' },
        { name: '雲林縣丁學忠', status: '第11天', totalDays: 40, threshold: 27501, target: '3萬5' },
        { name: '臺東縣黃建賓', status: '第13天', totalDays: 40, threshold: 11534, target: '1萬5' },
        { name: '桃園市牛煦庭', status: '第12天', totalDays: 40, threshold: 33956, target: '8萬' },
        { name: '桃園市涂權吉', status: '第13天', totalDays: 40, threshold: 30872, target: '5萬' },
        { name: '桃園市魯明哲', status: '第13天', totalDays: 40, threshold: 30122, target: '4萬5' },
        { name: '桃園市萬美玲', status: '第12天', totalDays: 40, threshold: 30233, target: '4萬5~5萬' },
        { name: '桃園市呂玉玲', status: '第13天', totalDays: 40, threshold: 28064, target: '4萬5' },
        { name: '桃園市邱若華', status: '第12天', totalDays: 40, threshold: 28222, target: '4萬' },
        { name: '新竹市鄭正鈐', status: '第14天', totalDays: 40, threshold: 35465, target: '5萬' },
        { name: '新竹縣徐欣瑩', status: '第7天', totalDays: 40, threshold: 21527, target: '4萬5' },
        { name: '新竹縣林思銘', status: '第7天', totalDays: 40, threshold: 23287, target: '3萬' },
        { name: '苗栗縣陳超明', status: '第2天', totalDays: 40, threshold: 20586, target: '3萬' },
        { name: '苗栗縣邱鎮軍', status: '第2天', totalDays: 40, threshold: 23187, target: '3萬' }
      ];
      

    // Generate the person list HTML
    const personListElement = document.getElementById('person-list');
    personData.forEach(person => {
        // Calculate the current day and progress for this person
        const { day, progress } = calculateDayDifference(baseDate, person);
        
        // Create the person item element
        const personItem = document.createElement('div');
        personItem.className = 'person-item';
        
        // Create the person name element
        const personName = document.createElement('div');
        personName.className = 'person-name';
        personName.textContent = person.name;
        
        // Create the progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        // Create the progress bar container
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress-bar';
        
        // Create the progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'progress';
        progressBar.style.width = `${progress}%`;
        
        // Create the day info element
        const dayInfo = document.createElement('div');
        dayInfo.className = 'day-info';
        dayInfo.textContent = day === '還未開始' ? day : `${day}/${person.totalDays}天`;
        if (person.threshold && person.target) {
            const goalInfo = document.createElement('div');
            goalInfo.className = 'goal-info';
            goalInfo.textContent = `目標：${person.target.toLocaleString()}　門檻：${person.threshold.toLocaleString()}`;
            personName.append(goalInfo);
        }

        // Append all elements
        progressBarContainer.appendChild(progressBar);
        progressContainer.appendChild(progressBarContainer);
        progressContainer.appendChild(dayInfo);
        personItem.appendChild(personName);
        personItem.appendChild(progressContainer);
        personListElement.appendChild(personItem);
    });
});