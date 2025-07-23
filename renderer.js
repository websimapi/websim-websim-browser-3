const addressBar = document.getElementById('address-bar');
const contentView = document.getElementById('content-view');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');

const ALLOWED_PROTOCOL = 'websim://';

function getHtmlFile(websimUrl) {
    if (!websimUrl || !websimUrl.startsWith(ALLOWED_PROTOCOL)) {
        return 'websim_home.html'; // Default or error page
    }
    const page = websimUrl.substring(ALLOWED_PROTOCOL.length);
    // Basic security check to prevent directory traversal
    if (page.includes('..') || page.includes('/')) {
        return 'websim_home.html';
    }
    return `websim_${page}.html`;
}

function navigateTo(url) {
    if (url.startsWith(ALLOWED_PROTOCOL)) {
        addressBar.value = url;
        const file = getHtmlFile(url);
        contentView.src = file;
    } else {
        // Show an error for disallowed protocols
        window.electronAPI.showBlockedNavigationDialog(url);
        // Revert the address bar to the webview's current URL
        addressBar.value = ALLOWED_PROTOCOL + contentView.src.split('websim_')[1].replace('.html', '');
    }
}

// --- Event Listeners ---

// Address bar navigation
addressBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        navigateTo(addressBar.value.trim());
    }
});

// WebView navigation events
contentView.addEventListener('dom-ready', () => {
    updateNavButtons();
    // Inject script to handle link clicks inside the webview
    contentView.executeJavaScript(`
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                e.preventDefault();
                // Send desired URL to the host page
                window.electronAPI.sendNavigation(link.getAttribute('href'));
            }
        });
    `);
});

// Update address bar when webview navigates
contentView.addEventListener('did-navigate', (e) => {
    const pageName = e.url.split('websim_')[1]?.replace('.html', '');
    if (pageName) {
        addressBar.value = `${ALLOWED_PROTOCOL}${pageName}`;
    }
    updateNavButtons();
});


// Handle navigation requests from the webview content
window.electronAPI.onNavigationRequest((url) => {
    navigateTo(url);
});

// Browser chrome buttons
backBtn.addEventListener('click', () => contentView.goBack());
forwardBtn.addEventListener('click', () => contentView.goForward());
refreshBtn.addEventListener('click', () => contentView.reload());

function updateNavButtons() {
    backBtn.disabled = !contentView.canGoBack();
    forwardBtn.disabled = !contentView.canGoForward();
}

// Initial state
updateNavButtons();