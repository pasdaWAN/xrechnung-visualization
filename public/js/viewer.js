// Using functionality from: src/xsl/xrechnung-viewer.js
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const viewer = document.getElementById('viewer');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.html) {
                viewer.innerHTML = result.html;
                showTab('viewer');
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    });
});

function showTab(tabId) {
    // Using tab logic from: 
    // Reference to: src/xsl/xrechnung-viewer.js lines 2-46
    document.getElementById('upload').classList.add('divHide');
    document.getElementById('viewer').classList.add('divHide');
    document.getElementById(tabId).classList.remove('divHide');
} 