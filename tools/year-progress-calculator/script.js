document.addEventListener('DOMContentLoaded', function() {
    // Set current date by default
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateInput = document.getElementById("dateInput");
    
    dateInput.value = `${year}-${month}-${day}`;
    dateInput.addEventListener('change', handleDateChange);
    
    // Calculate immediately
    handleDateChange();
});

function handleDateChange() {
    calculateProgress();
    updateCountdownAndProgressBar();
}

function calculateProgress() {
    const dateInput = document.getElementById("dateInput").value;
    const date = new Date(dateInput + 'T00:00:00');

    if (isNaN(date.getTime())) {
        document.getElementById("result").innerText = "Please enter a valid date.";
        return;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const isLeap = new Date(year, 1, 29).getMonth() === 1;
    const daysInMonth = [31, (isLeap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (day < 1 || day > daysInMonth[month - 1]) {
        document.getElementById("result").innerText = "Please enter a valid date.";
        return;
    }

    let dayOfYear = 0;
    for (let i = 0; i < month - 1; i++) {
        dayOfYear += daysInMonth[i];
    }
    dayOfYear += day;

    const totalDays = isLeap ? 366 : 365;
    const percentPassed = (dayOfYear / totalDays) * 100;
    const degreesPassed = (percentPassed / 100) * 360;

    document.getElementById("result").innerHTML = `
        On ${month}/${day}/${year} (Day ${dayOfYear} of ${totalDays}),<br>
        <strong>${percentPassed.toFixed(2)}%</strong> of the year has passed.<br>
        ${isLeap ? "This is a leap year." : "This is not a leap year."}
    `;

    drawPieChart(percentPassed);
}

function drawPieChart(percent) {
    const canvas = document.getElementById("yearProgressChart");
    const ctx = canvas.getContext("2d");
    const size = 200; // Fixed size for better control
    
    // Set display size
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    // Set internal size for sharp rendering
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 * 0.8;

    ctx.clearRect(0, 0, size, size);

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--console-bg').trim();
    ctx.fill();

    // Progress arc
    const endAngle = (percent / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle - Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    ctx.fill();
}

function updateCountdownAndProgressBar() {
    const dateInput = document.getElementById("dateInput").value;
    const selectedDate = new Date(dateInput + 'T23:59:59');
    const year = selectedDate.getFullYear();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    if (isNaN(selectedDate.getTime())) {
        document.getElementById("countdown").innerText = "Invalid date.";
        return;
    }

    const timeRemaining = endOfYear - selectedDate;
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    document.getElementById("countdown").innerText = `${days} days remaining`;

    const startOfYear = new Date(year, 0, 1);
    const totalMs = endOfYear - startOfYear;
    const elapsedMs = selectedDate - startOfYear;
    const percentPassed = (elapsedMs / totalMs) * 100;

    animateProgressBar(percentPassed);
}

function animateProgressBar(targetWidth) {
    const progressBar = document.getElementById("progressBar");
    let currentWidth = parseFloat(progressBar.style.width) || 0;

    function step() {
        currentWidth += (targetWidth - currentWidth) * 0.1;
        progressBar.style.width = `${Math.min(currentWidth, 100)}%`;

        if (Math.abs(currentWidth - targetWidth) > 0.5) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}
