const addressBar = document.getElementById('address-bar');
const contentFrame = document.getElementById('content-frame');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const errorModal = document.getElementById('error-modal');
const closeModalBtn = document.querySelector('.close-btn');
const blockedUrlEl = document.getElementById('blocked-url');

const ALLOWED_PROTOCOL = 'websim://';
const ALLOWED_PAGES = ['home', 'page1', 'page2', 'about'];

let history = [];
let historyIndex = -1;

function isAllowedUrl(url) {
    if (!url.startsWith(ALLOWED_PROTOCOL)) {
        return false;
    }
    const page = url.substring(ALLOWED_PROTOCOL.length);
    return ALLOWED_PAGES.includes(page);
}

function getHtmlFile(websimUrl) {
    const page = websimUrl.substring(ALLOWED_PROTOCOL.length);
    return `websim_${page}.html`;
}

function navigateTo(url) {
    if (!isAllowedUrl(url)) {
        showErrorModal(url);
        // Revert address bar to the current page
        addressBar.value = history[historyIndex];
        return;
    }

    // Add to history
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(url);
    historyIndex++;

    // Load content and update UI
    contentFrame.src = getHtmlFile(url);
    addressBar.value = url;
    updateNavButtons();
}

function updateNavButtons() {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= history.length - 1;
}

function showErrorModal(url) {
    blockedUrlEl.textContent = url;
    errorModal.classList.remove('hidden');
}

function hideErrorModal() {
    errorModal.classList.add('hidden');
}

// Event Listeners
addressBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        navigateTo(addressBar.value.trim());
    }
});

backBtn.addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        const url = history[historyIndex];
        contentFrame.src = getHtmlFile(url);
        addressBar.value = url;
        updateNavButtons();
    }
});

forwardBtn.addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const url = history[historyIndex];
        contentFrame.src = getHtmlFile(url);
        addressBar.value = url;
        updateNavButtons();
    }
});

refreshBtn.addEventListener('click', () => {
    contentFrame.src = contentFrame.src;
});

closeModalBtn.addEventListener('click', hideErrorModal);
window.addEventListener('click', (e) => {
    if (e.target === errorModal) {
        hideErrorModal();
    }
});


// Custom navigation event from iframe
window.addEventListener('message', (event) => {
    // Basic security check
    if (event.origin !== window.origin) return;

    if (event.data && event.data.type === 'navigate') {
        navigateTo(event.data.url);
    }
});


// Initial navigation
navigateTo('websim://home');

