// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up date picker with current date
    const dateInput = document.getElementById('dateInput');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
    
    // Set up event listeners
    dateInput.addEventListener('input', handleDateChange);
    
    // Initial calculation
    handleDateChange();
});

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

    if (day < 1 || day > daysInMonth[month - 1]) {
        document.getElementById('result').innerText = 'Please enter a valid date.';
        return;
    }

    // Calculate day of year
    let dayOfYear = 0;
    for (let i = 0; i < month - 1; i++) {
        dayOfYear += daysInMonth[i];
    }
    dayOfYear += day;

    const totalDays = isLeap ? 366 : 365;
    const percentPassed = (dayOfYear / totalDays) * 100;

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
    const size = 200;
    
    // High DPI canvas setup
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--console-bg').trim();
    ctx.fill();
    
    // Draw progress arc
    ctx.beginPath();
    ctx.moveTo(size/2, size/2);
    ctx.arc(size/2, size/2, size/2 * 0.8, -Math.PI/2, (Math.PI * 2 * percent/100) - Math.PI/2);
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

    // Calculate progress percentage
    const startOfYear = new Date(year, 0, 1);
    const progress = ((selectedDate - startOfYear) / (endOfYear - startOfYear)) * 100;
    animateProgressBar(progress);
}

function animateProgressBar(target) {
    const progressBar = document.getElementById('progressBar');
    let current = parseFloat(progressBar.style.width) || 0;
    
    const animate = () => {
        current += (target - current) * 0.1;
        progressBar.style.width = `${current}%`;
        if (Math.abs(current - target) > 0.5) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}
