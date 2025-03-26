// Main calculator functionality
function initYearProgress() {
    // Set up date picker
    const dateInput = document.getElementById('dateInput');
    if (!dateInput.value) {
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }

    // Add event listener
    dateInput.addEventListener('change', handleDateChange);
    
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
    const percentPassed = (dayOfYear / totalDays) * 100;

    // Update results
    document.getElementById('result').innerHTML = `
        On ${month}/${day}/${year} (Day ${dayOfYear} of ${totalDays}),<br>
        <strong>${percentPassed.toFixed(2)}%</strong> of the year has passed.<br>
        ${isLeap ? "This is a leap year." : "This is not a leap year."}
    `;

    drawPieChart(percentPassed);
}

function drawPieChart(percent) {
    const canvas = document.getElementById('yearProgressChart');
    const ctx = canvas.getContext('2d');
    const size = Math.min(200, window.innerWidth * 0.8);
    
    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const center = size / 2;
    const radius = center * 0.8;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (percent / 100) * 2 * Math.PI;

    // Clear and redraw
    ctx.clearRect(0, 0, size, size);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--console-bg').trim();
    ctx.fill();
    
    // Progress arc
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
    const year = selectedDate.getFullYear();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    // Calculate days remaining
    const days = Math.floor((endOfYear - selectedDate) / (1000 * 60 * 60 * 24));
    document.getElementById('countdown').innerText = `${days} days remaining in ${year}`;

    // Update progress bar
    const startOfYear = new Date(year, 0, 1);
    const progress = ((selectedDate - startOfYear) / (endOfYear - startOfYear)) * 100;
    animateProgressBar(progress);
}

function animateProgressBar(target) {
    const progressBar = document.getElementById('progressBar');
    let current = parseFloat(progressBar.style.width) || 0;
    
    const step = () => {
        current += (target - current) * 0.1;
        progressBar.style.width = `${Math.min(current, 100)}%`;
        if (Math.abs(current - target) > 0.5) requestAnimationFrame(step);
    };
    
    requestAnimationFrame(step);
}

// Initialize when loaded
initYearProgress();
