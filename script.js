// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.classList.add(savedTheme);
    } else if (prefersDark) {
        document.documentElement.classList.add('dark-theme');
    }
}

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
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    document.getElementById('sun-icon').style.display = isDark ? 'none' : 'block';
    document.getElementById('moon-icon').style.display = isDark ? 'block' : 'none';
}

// Tool Loading System
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    addThemeToggle();
    
    const toolButtons = document.querySelectorAll('.tool-btn');
    const toolContainer = document.getElementById('tool-container');
    
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadTool(this.dataset.tool);
        });
    });
    
    async function loadTool(toolName) {
        try {
            toolContainer.innerHTML = '<div class="loading">Loading tool...</div>';
            
            const response = await fetch(`tools/${toolName}/index.html`);
            if (!response.ok) throw new Error('Tool not found');
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const toolContent = doc.querySelector('.container') || doc.querySelector('body > div');
            
            if (!toolContent) throw new Error('Invalid tool format');
            
            toolContent.classList.add('tool-container');
            toolContainer.innerHTML = '';
            toolContainer.appendChild(toolContent);
            
            // Load the tool's JS
            const script = document.createElement('script');
            script.src = `tools/${toolName}/script.js`;
            toolContainer.appendChild(script);
            
        } catch (error) {
            toolContainer.innerHTML = `
                <div class="error">
                    <h3>Error loading tool</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Return Home</button>
                </div>
            `;
        }
    }
});
