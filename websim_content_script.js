// This script intercepts link clicks within the iframe content.
document.addEventListener('click', function(e) {
    // Find the nearest 'a' tag ancestor
    const link = e.target.closest('a');

    if (link && link.href) {
        // Prevent the default navigation
        e.preventDefault();

        // Send a message to the parent window (the browser chrome)
        window.parent.postMessage({
            type: 'navigate',
            url: link.getAttribute('href') // Use getAttribute to get the raw value
        }, '*'); // In a real app, you'd use a specific target origin
    }
});

