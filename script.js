// --- 1. CONFIGURATION ---
const sectionConfig = {
    'graph': 'graph-section',
    'settings': 'settings-section',
    'integrations': 'integrations-section',
    'viewer': 'viewer-section'
};

const projectNodes = {
    "library": "https://www.google.com",
    "angels": "https://www.wikipedia.org",
    "nexus": "https://www.github.com"
};

// --- 2. PASSWORD & PIN SECURITY ---
function checkPassword() {
    const pass = document.getElementById('passInput').value;
    const pin = document.getElementById('pinInput').value;
    
    // Set your credentials here
    const validPassword = "";
    const validPin = "";

    if (pass === validPassword || pin === validPin) { 
        document.getElementById('login-modal').style.display = 'none';
    } else {
        alert("Access Denied: Invalid Password or PIN");
        // Optional: Clear fields after failed attempt
        document.getElementById('passInput').value = '';
        document.getElementById('pinInput').value = '';
    }
}

function forgotPassword() {
    alert("Please contact the system administrator to reset your credentials.");
}

// --- 3. DYNAMIC NAVIGATION ---
function showSection(targetKey) {
    Object.keys(sectionConfig).forEach(key => {
        const element = document.getElementById(sectionConfig[key]);
        if (element) {
            element.style.display = (key === targetKey) ? 'block' : 'none';
        }
    });
}

// --- 4. VIEWER LOGIC ---
function updateViewer() {
    const selector = document.getElementById('projectSelector');
    const frame = document.getElementById('projectFrame');
    if (frame && selector && projectNodes[selector.value]) {
        frame.src = projectNodes[selector.value];
    }
}

// --- 5. INITIALIZATION ---
// Ensure Chart.js is loaded before this runs
const ctx = document.getElementById('myChart')?.getContext('2d');
if (ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets: [{ label: 'System Activity', data: [12, 19, 3, 5, 2], backgroundColor: '#3498db' }]
        }
    });
}

function toggleFeature() { 
    alert("System Security Mode Toggled!"); 
}
