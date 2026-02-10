// App Launcher Script

// Icon mapping for different app types
const iconMap = {
    'addition': '➕',
    'multiplication': '✖️',
    'spelling': '📝',
    'memory': '🧠',
    'wordsearch': '🔍',
    'drawing': '🎨',
    'typing': '⌨️',
    'geography': '🌍'
};

// Get a default icon based on the app path
function getAppIcon(path) {
    const pathName = path.replace('/', '').toLowerCase();
    
    // Check if we have a specific icon for this app
    for (const [key, icon] of Object.entries(iconMap)) {
        if (pathName.includes(key)) {
            return icon;
        }
    }
    
    // Default icons based on first letter
    const firstLetter = pathName.charAt(0).toUpperCase();
    return firstLetter || '📱';
}

// Load apps from JSON file
async function loadApps() {
    const appGrid = document.getElementById('app-grid');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    try {
        const response = await fetch('apps.json');
        
        if (!response.ok) {
            throw new Error('Failed to load apps.json');
        }
        
        const data = await response.json();
        
        // Hide loading indicator
        loading.style.display = 'none';
        
        // Validate data structure
        if (!data.apps || !Array.isArray(data.apps)) {
            throw new Error('Invalid apps.json format');
        }
        
        // Render apps
        renderApps(data.apps);
        
    } catch (err) {
        console.error('Error loading apps:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
    }
}

// Render app cards
function renderApps(apps) {
    const appGrid = document.getElementById('app-grid');
    
    if (apps.length === 0) {
        appGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No apps available</p>';
        return;
    }
    
    apps.forEach((app, index) => {
        const card = createAppCard(app, index);
        appGrid.appendChild(card);
    });
}

// Create individual app card
function createAppCard(app, index) {
    const card = document.createElement('a');
    card.className = 'app-card';
    card.href = `${app.path}/index.html`;
    card.style.setProperty('--app-color', app.color || '#6c757d');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    // Get appropriate icon
    const icon = getAppIcon(app.path);
    
    // Build card content
    card.innerHTML = `
        <div class="app-icon">${icon}</div>
        <h2 class="app-title">${escapeHtml(app.title)}</h2>
        <p class="app-description">${escapeHtml(app.description)}</p>
    `;
    
    // Add keyboard navigation support
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = card.href;
        }
    });
    
    // Add touch feedback
    card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
    });
    
    card.addEventListener('touchend', () => {
        setTimeout(() => {
            card.style.transform = '';
        }, 100);
    });
    
    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle navigation errors
window.addEventListener('error', (e) => {
    if (e.message.includes('apps.json')) {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        loading.style.display = 'none';
        error.style.display = 'block';
    }
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadApps);
} else {
    loadApps();
}

// Add service worker support for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}