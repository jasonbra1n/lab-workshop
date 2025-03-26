let currentPercent = 0;

function initYearProgress() {
    // Set current date if not set
    const dateInput = document.getElementById('dateInput');
    if (!dateInput.value) {
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }

    // Initialize progress bar
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = '0%';

    // Set up event listeners
    dateInput.addEventListener('change', handleDateChange);
    
    // Observe theme changes
    observeThemeChanges();
    
    // Initial calculation
    handleDateChange();
}

function handleDateChange() {
    calculateProgress();
    updateCountdownAndProgressBar();
}

function calculateProgress() {
    const dateInput = document.getElementById('dateInput');
    const date = new Date(dateInput.value + 'T00:00:00');
    
    if (isNaN(date.getTime())) {
        document.getElementById('result').innerText = 'Please enter a valid date.';
        return;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Check for leap year
    const isLeap = new Date(year, 1, 29).getMonth() === 1;
    const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Calculate day of year
    let dayOfYear = daysInMonth.slice(0, month - 1).reduce((a, b) => a + b, 0) + day;
    const totalDays = isLeap ? 366 : 365;
    currentPercent = (dayOfYear / totalDays) * 100;

    // Update results
    document.getElementById('result').innerHTML = `
        On ${month}/${day}/${year} (Day ${dayOfYear} of ${totalDays}),<br>
        <strong>${currentPercent.toFixed(2)}%</strong> of the year has passed.<br>
        ${isLeap ? "This is a leap year." : "This is not a leap year."}
    `;

    updatePieChart();
}

function updatePieChart() {
    const canvas = document.getElementById('yearProgressChart');
    const ctx = canvas.getContext('2d');
    const size = 200;
    
    // High DPI rendering
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    const center = size / 2;
    const radius = center * 0.8;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (currentPercent / 100) * 2 * Math.PI;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw background (unfilled portion)
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--console-bg').trim();
    ctx.fill();
    
    // Draw progress (filled portion)
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    ctx.fill();
}

function updateCountdownAndProgressBar() {
    const dateInput = document.getElementById('dateInput');
    const selectedDate = new Date(dateInput.value + 'T23:59:59');
    
    if (isNaN(selectedDate.getTime())) return;

    const year = selectedDate.getFullYear();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    const timeRemaining = endOfYear - selectedDate;
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    
    document.getElementById('countdown').innerText = `${days} days remaining in ${year}`;

    // Animate progress bar
    const startOfYear = new Date(year, 0, 1);
    const progress = ((selectedDate - startOfYear) / (endOfYear - startOfYear)) * 100;
    animateProgressBar(progress);
}

function animateProgressBar(target) {
    const progressBar = document.getElementById('progressBar');
    let current = parseFloat(progressBar.style.width) || 0;
    
    const step = () => {
        current += (target - current) * 0.1;
        progressBar.style.width = `${current}%`;
        if (Math.abs(current - target) > 0.5) requestAnimationFrame(step);
    };
    
    requestAnimationFrame(step);
}

function observeThemeChanges() {
    const observer = new MutationObserver(() => {
        updatePieChart();
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
}

// Initialize when loaded
initYearProgress();
