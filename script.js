// Listen for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // This will automatically trigger due to our CSS media query
    // But we can add any JS-specific theme changes here
    console.log(`Theme changed to ${e.matches ? 'dark' : 'light'}`);
});

// Optional: Add a theme toggle button if you want manual control
function addThemeToggle() {
    const toggle = document.createElement('button');
    toggle.textContent = 'Toggle Theme';
    toggle.style.position = 'fixed';
    toggle.style.bottom = '20px';
    toggle.style.right = '20px';
    toggle.style.zIndex = '1000';
    toggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('force-dark');
        document.documentElement.classList.toggle('force-light');
    });
    document.body.appendChild(toggle);
}

// Call this if you want manual theme control
// addThemeToggle();
