// Set current date on load
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateInput = document.getElementById("dateInput");
    
    dateInput.value = `${year}-${month}-${day}`;
    dateInput.dispatchEvent(new Event('change'));
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
    const size = Math.min(canvas.width, canvas.height);
    
    canvas.width = 200;
    canvas.height = 200;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX * 0.8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
