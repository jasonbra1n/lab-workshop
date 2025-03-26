// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.classList.add(savedTheme);
    } else if (prefersDark) {
        document.documentElement.classList.add('dark-theme');
    }
    updateThemeIcon();
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
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'none' : 'block';
        moonIcon.style.display = isDark ? 'block' : 'none';
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
    document.body.appendChild(toggle);
    toggle.addEventListener('click', toggleTheme);
    updateThemeIcon();
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
            const toolName = this.dataset.tool;
            loadTool(toolName);
            // Virtual pageview tracking for Google Analytics
            gtag('event', 'page_view', {
                page_title: toolName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), // e.g., "Image To Webp Converter"
                page_path: `/tools/${toolName}`
            });
        });
    });
    
    async function loadTool(toolName) {
        try {
            toolContainer.innerHTML = '<div class="loading">Loading tool...</div>';
            
            // Fetch tool HTML
            const htmlResponse = await fetch(`tools/${toolName}/index.html`);
            if (!htmlResponse.ok) throw new Error('Tool HTML not found');
            const html = await htmlResponse.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const toolContent = doc.querySelector('.container') || doc.querySelector('body > div');
            
            if (!toolContent) throw new Error('Invalid tool format');
            
            // Create wrapper with proper structure
            const wrapper = document.createElement('div');
            wrapper.className = `tool-container ${toolName}-container`;
            
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'tool-content';
            contentWrapper.innerHTML = toolContent.innerHTML;
            
            wrapper.appendChild(contentWrapper);
            toolContainer.innerHTML = '';
            toolContainer.appendChild(wrapper);
            
            // Fetch and apply tool CSS
            const cssResponse = await fetch(`tools/${toolName}/styles.css`);
            if (cssResponse.ok) {
                const cssText = await cssResponse.text();
                const styleElement = document.createElement('style');
                styleElement.textContent = cssText;
                toolContainer.appendChild(styleElement);
            } else {
                console.warn(`No styles.css found for ${toolName}, relying on main styles`);
            }
            
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
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const toolWrapper = document.querySelector('.tool-container');
        if (toolWrapper) {
            if (window.innerWidth <= 480) {
                toolWrapper.classList.add('mobile-view');
            } else {
                toolWrapper.classList.remove('mobile-view');
            }
        }
    });
});
