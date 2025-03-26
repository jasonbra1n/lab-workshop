function initYearProgress() {
    // Ensure date is set
    const dateInput = document.getElementById('dateInput');
    if (!dateInput.value) {
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }

    // Initialize progress bar with explicit style
    const progressBar = document.getElementById('progressBar');
    if (!progressBar.style.width) {
        progressBar.style.width = '0%';
    }

    // Set up event listeners
    dateInput.addEventListener('change', handleDateChange);
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
        handleDateChange(); // Redraw chart with current date on theme change
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    // Initial calculation
    handleDateChange();
}

function handleDateChange() {
    calculateProgress();
    updateCountdownAndProgressBar();
}

function calculateProgress() {
    const dateInput = document.getElementById('dateInput');
    const dateStr = dateInput.value;
    if (!dateStr) return;

    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Calculate progress
    const isLeap = new Date(year, 1, 29).getMonth() === 1;
    const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let dayOfYear = daysInMonth.slice(0, month - 1).reduce((a, b) => a + b, 0) + day;
    const totalDays = isLeap ? 366 : 365;
    const percentPassed = (dayOfYear / totalDays) * 100;

    // Update display
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
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const center = size / 2;
    const radius = center * 0.8;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (percent / 100) * 2 * Math.PI;

    // Draw background circle
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--console-bg').trim();
    ctx.fill();
    
    // Draw progress slice
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    ctx.fill();
}

function updateCountdownAndProgressBar() {
    const dateInput = document.getElementById('dateInput');
    const dateStr = dateInput.value;
    if (!dateStr) return;

    const selectedDate = new Date(dateStr + 'T23:59:59');
    if (isNaN(selectedDate.getTime())) return;

    const year = selectedDate.getFullYear();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    const startOfYear = new Date(year, 0, 1);
    
    // Update countdown
    const daysRemaining = Math.floor((endOfYear - selectedDate) / (1000 * 60 * 60 * 24));
    document.getElementById('countdown').innerText = `${daysRemaining} days remaining in ${year}`;

    // Update progress bar
    const progressPercent = ((selectedDate - startOfYear) / (endOfYear - startOfYear)) * 100;
    animateProgressBar(progressPercent);
}

function animateProgressBar(targetPercent) {
    const progressBar = document.getElementById('progressBar');
    let currentWidth = parseFloat(progressBar.style.width) || 0;
    
    const animate = () => {
        currentWidth += (targetPercent - currentWidth) * 0.1;
        progressBar.style.width = `${currentWidth}%`;
        if (Math.abs(currentWidth - targetPercent) > 0.5) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// Initialize
initYearProgress();
