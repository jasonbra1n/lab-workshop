// Theme management with localStorage persistence
function initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply the preferred theme
    if (savedTheme) {
        document.documentElement.classList.add(savedTheme);
    } else if (prefersDark) {
        document.documentElement.classList.add('dark-theme');
    }
}

// Toggle between themes
function toggleTheme() {
    const htmlEl = document.documentElement;
    
    if (htmlEl.classList.contains('dark-theme')) {
        htmlEl.classList.remove('dark-theme');
        htmlEl.classList.add('light-theme');
        localStorage.setItem('theme', 'light-theme');
    } else {
        htmlEl.classList.remove('light-theme');
        htmlEl.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }
}

// Create a stylish theme toggle button
function addThemeToggle() {
    const toggle = document.createElement('button');
    toggle.id = 'theme-toggle';
    toggle.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path id="sun-icon" d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            <path id="moon-icon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" style="display:none"/>
        </svg>
    `;
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.setAttribute('title', 'Toggle dark/light mode');
    
    // Position and style the toggle
    toggle.style.position = 'fixed';
    toggle.style.bottom = '20px';
    toggle.style.right = '20px';
    toggle.style.zIndex = '1000';
    toggle.style.background = 'var(--primary-color)';
    toggle.style.color = 'white';
    toggle.style.border = 'none';
    toggle.style.borderRadius = '50%';
    toggle.style.width = '48px';
    toggle.style.height = '48px';
    toggle.style.display = 'flex';
    toggle.style.alignItems = 'center';
    toggle.style.justifyContent = 'center';
    toggle.style.cursor = 'pointer';
    toggle.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    toggle.addEventListener('click', toggleTheme);
    document.body.appendChild(toggle);
    
    // Update icon based on current theme
    updateThemeIcon();
}

// Update the toggle icon based on current theme
function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    document.getElementById('sun-icon').style.display = isDark ? 'none' : 'block';
    document.getElementById('moon-icon').style.display = isDark ? 'block' : 'none';
}

// Update CSS to work with our theme classes
function updateThemeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .dark-theme {
            --bg-color: #1e293b;
            --text-color: #f8fafc;
            --primary-color: #3b82f6;
            --card-bg: #334155;
            --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        
        .light-theme {
            --bg-color: #ffffff;
            --text-color: #333333;
            --primary-color: #2563eb;
            --card-bg: #f8fafc;
            --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    updateThemeStyles();
    initializeTheme();
    addThemeToggle();
    
    // Update icon when theme changes
    document.addEventListener('themeChanged', updateThemeIcon);
});

// Modify the toggleTheme function to dispatch an event
function toggleTheme() {
    const htmlEl = document.documentElement;
    
    if (htmlEl.classList.contains('dark-theme')) {
        htmlEl.classList.remove('dark-theme');
        htmlEl.classList.add('light-theme');
        localStorage.setItem('theme', 'light-theme');
    } else {
        htmlEl.classList.remove('light-theme');
        htmlEl.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }
    
    // Dispatch custom event
    htmlEl.dispatchEvent(new CustomEvent('themeChanged'));
}
// Add this to your existing script.js

document.addEventListener('DOMContentLoaded', function() {
    // Tool loading functionality
    const toolButtons = document.querySelectorAll('.tool-btn');
    const toolContainer = document.getElementById('tool-frame-container');
    
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            toolButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Load tool content
            const toolName = this.getAttribute('data-tool');
            loadTool(toolName);
        });
    });
    
    function loadTool(toolName) {
        // Clear previous content
        toolContainer.innerHTML = '';
        
        // Create iframe for the tool
        const iframe = document.createElement('iframe');
        iframe.src = `tools/${toolName}/`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.title = `${toolName} tool`;
        
        // Add loading indicator
        const loading = document.createElement('div');
        loading.textContent = 'Loading tool...';
        loading.style.textAlign = 'center';
        loading.style.padding = '20px';
        toolContainer.appendChild(loading);
        
        iframe.onload = function() {
            toolContainer.removeChild(loading);
        };
        
        toolContainer.appendChild(iframe);
    }
    
    // Initialize theme (keep your existing theme code)
    initializeTheme();
    addThemeToggle();
});

// Keep all your existing theme-related functions
