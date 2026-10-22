// --- 1. GLOBAL CONFIGURATION ---
const sectionConfig = {
    graph: 'graph-section',
    settings: 'settings-section',
    integrations: 'integrations-section',
    viewer: 'viewer-section'
};

const projectNodes = {
    library:     { url: "ascripts/library.html",     name: "Common Ground Main Library" },
    wholez:      { url: "ascripts/WHOLEz.html",      name: "WHOLEz Node" },
    arch:        { url: "ascripts/arch.html",        name: "ARCH" },
    empowerment: { url: "ascripts/empowerment.html", name: "EMPOWERMENT" },
    family:      { url: "ascripts/family_ties.html", name: "Family Ties" },
    fitness:     { url: "ascripts/fitness.html",     name: "Five Fold Fitness" },
    kmo:         { url: "ascripts/kmo.html",         name: "KMo's Korner" },
    komic:       { url: "ascripts/komic.html",       name: "Komic Relief" },
    mugoda:      { url: "ascripts/mugoda.html",      name: "Mugoda Ministries" },
    music:       { url: "ascripts/music.html",       name: "Music Matters" },
    praise:      { url: "ascripts/praise.html",      name: "The Praise Report" },
    truth:       { url: "ascripts/truth.html",       name: "The Truth Will Set YOU Free" },
    austin:      { url: "ascripts/austin.html",      name: "Austin Cowboy" }
};

// --- 2. SECURITY ---
// Only SHA-256 hashes are stored, so the real password/PIN are not visible in the page source.
// Both the password AND the PIN are required.
const PASSWORD_HASH = "e1778869adf2539ea1b06f6b9a9339c2032d21605efb74cfe333ea8114f5f6a4";
const PIN_HASH = "7addaafed7639a12d8344a033f3b4dd2a8dbda264d28ca4290b5848ae00e977b";

async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword() {
    const passEl = document.getElementById('passInput');
    const pinEl = document.getElementById('pinInput');
    const [passHash, pinHash] = await Promise.all([sha256(passEl.value), sha256(pinEl.value)]);
    if (passHash === PASSWORD_HASH && pinHash === PIN_HASH) {
        document.getElementById('login-modal').style.display = 'none';
        KimLink.logInteraction('login');
    } else {
        alert("Access Denied: Invalid Credentials.");
        passEl.value = '';
        pinEl.value = '';
    }
}

function forgotPassword() {
    alert("Please contact the system administrator to reset your credentials.");
}

// --- 3. TRAFFIC & LOGGING ---
let trafficStats = JSON.parse(localStorage.getItem('trafficData')) || { human: 0, agent: 0 };

function logTraffic() {
    const ua = navigator.userAgent.toLowerCase();
    const isAgent = ua.includes("bot") || ua.includes("headless") || ua.includes("spider");
    if (isAgent) { trafficStats.agent++; } else { trafficStats.human++; }
    localStorage.setItem('trafficData', JSON.stringify(trafficStats));
    const display = document.getElementById('trafficDisplay');
    if (display) display.innerText = `Humans: ${trafficStats.human} | Agents: ${trafficStats.agent}`;
}

function exportTrafficLogs() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trafficStats));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "traffic_logs.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// --- 4. HARDWARE & ENVIRONMENT CONTROLLERS ---
const Hoverboard = {
    isActive: false,
    inputDevice: 'Wii Fit Board',
    toggleActivation: function () {
        this.isActive = !this.isActive;
        KimLink.logInteraction(`Hoverboard ${this.isActive ? 'activated' : 'deactivated'}`);
        return this.isActive;
    }
};

// KIMLINK PROTOCOL (BCI Middleware)
const KimLink = {
    isCalibrated: false,
    sessionID: null,
    initiateNeuralHandshake: function () {
        console.log("KimLink: Initializing Neural Handshake...");
        this.isCalibrated = true;
        this.sessionID = "KL-" + Math.floor(Math.random() * 10000);
        return `Handshake Complete. Session: ${this.sessionID}`;
    },
    logInteraction: function (action) {
        console.log(`[KimLink Secure Log] Action: ${action} | User Session: ${this.sessionID}`);
    }
};

// --- 5. NAVIGATION ---
function enterEnvironment(nodeKey) {
    const node = projectNodes[nodeKey];
    if (node) {
        logTraffic();
        window.location.href = node.url;
    } else {
        alert("Environment not found.");
    }
}

function updateViewer() {
    const selector = document.getElementById('projectSelector');
    const frame = document.getElementById('projectFrame');
    const statusDiv = document.getElementById('statusIndicator');
    if (!selector || !frame) return;
    const selected = projectNodes[selector.value];
    if (selected) {
        frame.src = selected.url;
        if (statusDiv) statusDiv.innerText = "Viewing: " + selected.name;
        KimLink.logInteraction("View " + selected.name);
    } else {
        frame.src = "about:blank";
        if (statusDiv) statusDiv.innerText = "Node not configured: " + selector.value;
    }
}

function showSection(targetKey) {
    Object.keys(sectionConfig).forEach(key => {
        const el = document.getElementById(sectionConfig[key]);
        if (el) el.style.display = (key === targetKey) ? 'block' : 'none';
    });
}

function toggleFeature() {
    alert("System Security Mode Toggled!");
}

// --- 6. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log(KimLink.initiateNeuralHandshake());
    logTraffic();

    const canvas = document.getElementById('myChart');
    if (canvas && typeof Chart !== 'undefined') {
        new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{ label: 'System Activity', data: [12, 19, 3, 5, 2], backgroundColor: '#3498db' }]
            }
        });
    }
    console.log("System Ready.");
});
