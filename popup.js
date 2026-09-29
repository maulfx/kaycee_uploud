
if (!document.getElementById('kuronai-global-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'kuronai-global-styles';

styleEl.textContent = `
    /* --- HATA TİTREME ANİMASYONU --- */
    @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-10px); }
        40%, 80% { transform: translateX(10px); }
    }

    /* Hata durumunda inputun alt çizgisini ve gölgesini kırmızı yapar */
    .error-active {
        border-bottom-color: #FE2C55 !important;
        filter: drop-shadow(0 0 5px rgba(254, 44, 85, 0.5));
    }
    
    /* Sallanma efektini uygular */
    .shake-active {
        animation: errorShake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }
`;
    document.head.appendChild(styleEl);
}

// --- LOCAL MODE: Device ID (tetap dipertahankan untuk keperluan internal) ---
let deviceID = null; 
function getSmartDeviceID() {
    return new Promise((resolve) => {
        let localID = localStorage.getItem('kuronai_device_id');
        chrome.storage.local.get(['kuronai_device_id'], function(localResult) {
            chrome.storage.sync.get(['kuronai_device_id'], function(syncResult) {
                let finalID = syncResult.kuronai_device_id || localResult.kuronai_device_id || localID;

                if (finalID) {
                    if (!localID) localStorage.setItem('kuronai_device_id', finalID);
                    if (!localResult.kuronai_device_id) chrome.storage.local.set({ 'kuronai_device_id': finalID });
                    if (!syncResult.kuronai_device_id) chrome.storage.sync.set({ 'kuronai_device_id': finalID });
                    resolve(finalID);
                } else {
                    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
                    const newID = `K-${randomPart}`;
                    localStorage.setItem('kuronai_device_id', newID);
                    chrome.storage.local.set({ 'kuronai_device_id': newID });
                    chrome.storage.sync.set({ 'kuronai_device_id': newID });
                    resolve(newID);
                }
            });
        });
    });
}

const g = i => document.getElementById(i);

const cv = document.getElementById('particle-canvas');

if (cv) {
    const ctx = cv.getContext('2d');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;

    let particles = [];
    

    let mouse = { x: null, y: null, radius: 100 };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });


    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        constructor(x, y, dirX, dirY, size, color) {
            this.x = x;
            this.y = y;
            this.dirX = dirX;
            this.dirY = dirY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
  
            if (this.x > cv.width || this.x < 0) this.dirX = -this.dirX;
            if (this.y > cv.height || this.y < 0) this.dirY = -this.dirY;

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < cv.width - this.size * 10) {
                    this.x += 2;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 2; 
                }
                if (mouse.y < this.y && this.y < cv.height - this.size * 10) {
                    this.y += 2;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 2;
                }
            }

            this.x += this.dirX;
            this.y += this.dirY;
            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        let numberOfParticles = (cv.height * cv.width) / 6000; 
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let dirX = (Math.random() * 1) - 0.5; 
            let dirY = (Math.random() * 1) - 0.5;

            let color = Math.random() > 0.5 ? 'rgba(37, 244, 238, 0.8)' : 'rgba(254, 44, 85, 0.8)';
            
            particles.push(new Particle(x, y, dirX, dirY, size, color));
        }
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {

                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                             + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                

                if (distance < (cv.width/7) * (cv.height/7)) {
                    opacityValue = 1 - (distance / 10000);
                    ctx.strokeStyle = 'rgba(255, 255, 255,' + opacityValue * 0.15 + ')'; 
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        connect(); 
    }


    window.addEventListener('resize', () => {
        cv.width = innerWidth;
        cv.height = innerHeight;
        initParticles();
    });

    initParticles();
    animate();
}

// --- LOCAL MODE: Langsung ke main view tanpa auth ---
(async function() {
    deviceID = await getSmartDeviceID(); 

    // Langsung tampilkan mainView tanpa perlu cek remote
    const curtain = document.getElementById('security-curtain');
    if (curtain) curtain.remove();

    const main = document.getElementById('mainView');
    const login = document.getElementById('loginView');
    if (main) { main.style.opacity = '1'; main.style.pointerEvents = 'auto'; }
    if (login) { login.style.opacity = '1'; login.style.pointerEvents = 'auto'; }
})();

const lv = g('loginView'), mv = g('mainView'), sv = g('statsView'); 
const ui = g('usernameInput'), lb = g('loginBtn'), bts = g('btnTextSpan'); 
const udn = g('userDisplayName'), ua = g('userAvatar'), lob = g('logoutBtn');
const lab = g('langBtn'), themeBtn = g('themeBtn'), stb = g('statsBtn');
const bmb = g('backToMainBtn'), sa = g('statsAvatar'), su = g('statsUsername');
const translations = {
    en: {
        status_off: "DISABLED",
        status_on: "SYSTEM ACTIVE",
        feat_60fps: "60 FPS FORCE",
        footer_made: "Kaycee :3",
        footer_status: "ONLINE",
        tagline: "“60FPS Lossless Upload Booster”",
        stats_title: "LIVE STATS",
        dl_title: "DOWNLOADER",
        stats_panel_title: "VIDEO ANALYSIS",
        dl_panel_title: "MEDIA DOWNLOADER",
        live_tag_static: "LIVE DATA",
        vid_prefix: "Video #",
        status_live: "⚡ LIVE DATA",
        status_boost: "⚡ BOOSTING...",
        status_active: "60FPS ACTIVE",
        time_now: "Just Uploaded",
        time_min: "min ago",
        time_hour: "hours ago",
        update_title: "UPDATE AVAILABLE!",
        update_force: "MANDATORY UPDATE!",
        update_desc: " update is ready to download.",
        best_time_title: "BEST UPLOAD TIME",
        best_time_calc: "Calculating...",
        best_time_nodata: "Insufficient Data",
        best_time_avg: "Avg. ~",
        best_time_views: "views",
        dl_input_ph: "Paste TikTok Link...",
        err_no_video_title: "NO VIDEOS FOUND",
        err_no_video_desc: "User might be private or has no content.",
        wrong_page: "UPLOAD PAGE ONLY!",
        searching_user: "Searching account..."
    },
    id: {
        status_off: "NONAKTIF",
        status_on: "SISTEM AKTIF",
        feat_60fps: "PAKSA 60 FPS",
        footer_made: "Kaycee :3",
        footer_status: "ONLINE",
        tagline: "“Pendorong Kualitas & 60FPS Lossless”",
        stats_title: "STATISTIK",
        dl_title: "PENGUNDUH",
        stats_panel_title: "ANALISIS VIDEO",
        dl_panel_title: "PENGUNDUH TIKTOK",
        live_tag_static: "DATA LANGSUNG",
        vid_prefix: "Video #",
        status_live: "⚡ DATA AKTIF",
        status_boost: "⚡ MENDORONG...",
        status_active: "60FPS AKTIF",
        time_now: "Baru saja",
        time_min: "menit lalu",
        time_hour: "jam lalu",
        update_title: "PEMBARUAN TERSEDIA!",
        update_force: "PEMBARUAN WAJIB!",
        update_desc: " versi siap diunduh.",
        best_time_title: "JAM UPLOAD TERBAIK",
        best_time_calc: "Menghitung...",
        best_time_nodata: "Data Belum Cukup",
        best_time_avg: "Rata-rata ~",
        best_time_views: "tayangan",
        dl_input_ph: "Tempel Tautan TikTok...",
        err_no_video_title: "VIDEO TIDAK DITEMUKAN",
        err_no_video_desc: "Akun mungkin privat atau belum ada video.",
        wrong_page: "HANYA DI HALAMAN UPLOAD!",
        searching_user: "Mencari akun..."
    }
};
let currentAvatarUrl = null;
let currentLang = 'en';
let currentVideoData = []; 
let currentIsReal = false;
let currentSourceMode = "";

// Helper: Cek apakah URL avatar adalah avatar default ByteDance Passport (seperti icon K hijau)
function isDefaultOrPassportAvatar(url) {
    if (!url) return true;
    const l = url.toLowerCase();
    return l.includes('passport') || 
           l.includes('default_avatar') || 
           l.includes('letter_') || 
           l.includes('obj/passport-') || 
           l.includes('sso-') || 
           l.includes('user-avatar-default');
}

// --- LOCAL MODE: Deteksi akun TikTok yang sedang aktif ---
async function initUserAccount() {
    chrome.storage.local.get(['kuronai_username', 'kuronai_avatar'], function(result) {
        let initialUser = result.kuronai_username || localStorage.getItem('kuronai_username');
        let initialAvatar = result.kuronai_avatar || localStorage.getItem('kuronai_avatar') || '';

        // Jika avatar yang tersimpan adalah avatar passport default (icon huruf K hijau), bersihkan
        if (initialAvatar && isDefaultOrPassportAvatar(initialAvatar)) {
            initialAvatar = '';
            localStorage.removeItem('kuronai_avatar');
            chrome.storage.local.remove(['kuronai_avatar']);
        }

        // Abaikan "@LocalUser" atau "LocalUser" jika tersisa dari sesi sebelumnya
        if (initialUser && initialUser !== "@LocalUser" && initialUser !== "LocalUser") {
            uP(initialUser, initialAvatar);
        } else {
            uP("Kaycee :3", "");
        }

        // Segera refresh untuk mendeteksi akun TikTok yang sedang login saat ini
        refreshTikTokUser();
    });
}

async function refreshTikTokUser() {
    try {
        let foundUser = null;
        let foundAvatar = null;

        // 1. Cek tab TikTok aktif atau semua tab TikTok yang sedang dibuka
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let targetTab = null;

        if (activeTab && activeTab.url && activeTab.url.includes("tiktok.com")) {
            targetTab = activeTab;
        } else {
            const allTikTokTabs = await chrome.tabs.query({ url: "*://*.tiktok.com/*" });
            if (allTikTokTabs && allTikTokTabs.length > 0) {
                targetTab = allTikTokTabs[0];
            }
        }

        if (targetTab && targetTab.id) {
            // A. Coba request via messaging ke content script tab TikTok
            try {
                const response = await new Promise((resolve) => {
                    chrome.tabs.sendMessage(targetTab.id, { action: "GET_ACTIVE_TIKTOK_USER" }, (res) => {
                        if (chrome.runtime.lastError || !res) resolve(null);
                        else resolve(res);
                    });
                });
                if (response && response.success && response.username) {
                    foundUser = response.username;
                    if (response.avatar && !isDefaultOrPassportAvatar(response.avatar)) {
                        foundAvatar = response.avatar;
                    }
                }
            } catch (e) {}

            // B. Eksekusi script langsung di tab TikTok untuk membaca DOM / Rehydration data jika avatar belum ketemu
            if (!foundAvatar) {
                try {
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: targetTab.id },
                        func: () => {
                            try {
                                const isBad = (u) => {
                                    if (!u) return true;
                                    const l = u.toLowerCase();
                                    return l.includes('passport') || l.includes('default_avatar') || l.includes('letter_') || l.includes('obj/passport-');
                                };

                                // 1. Rehydration data
                                const re = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
                                if (re && re.textContent) {
                                    const d = JSON.parse(re.textContent);
                                    const u = d?.__DEFAULT_SCOPE__?.['webapp.app-context']?.user;
                                    if (u) {
                                        const av = u.avatarLarger || u.avatarMedium || u.avatarThumb || '';
                                        const un = u.uniqueId || u.nickname || '';
                                        if (av && !isBad(av)) return { username: un ? ('@' + un) : null, avatar: av };
                                    }
                                }
                                // 2. SIGI_STATE
                                const si = document.getElementById('SIGI_STATE');
                                if (si && si.textContent) {
                                    const d = JSON.parse(si.textContent);
                                    const u = d?.AppContext?.user;
                                    if (u && u.avatarLarger && !isBad(u.avatarLarger)) {
                                        return { username: u.uniqueId ? ('@' + u.uniqueId) : null, avatar: u.avatarLarger };
                                    }
                                }
                                // 3. DOM selectors profil TikTok asli dari navigasi/header
                                const sel = [
                                    '[data-e2e="profile-icon"] img',
                                    'a[data-e2e="nav-profile"] img',
                                    '[data-e2e="user-avatar"] img',
                                    'header a[href*="/@"] img',
                                    'nav a[href*="/@"] img',
                                    'aside a[href*="/@"] img',
                                    '[class*="header"] [class*="avatar" i] img',
                                    '[class*="creator-header"] [class*="avatar" i] img',
                                    '[class*="user-icon"] img',
                                    'img[class*="avatar" i]',
                                    'img[class*="Avatar" i]',
                                    'header img[src*="tiktokcdn"]',
                                    'nav img[src*="tiktokcdn"]'
                                ];
                                for (const s of sel) {
                                    const el = document.querySelector(s);
                                    if (el) {
                                        const src = el.currentSrc || el.src;
                                        if (src && (src.includes('tiktokcdn') || src.includes('tos-') || src.includes('avt-')) && !isBad(src)) {
                                            return { avatar: src };
                                        }
                                    }
                                }
                                // 4. background-image
                                const bgEls = document.querySelectorAll('[style*="background-image"], [data-e2e="profile-icon"], [class*="avatar" i]');
                                for (const b of bgEls) {
                                    const st = b.getAttribute('style') || b.style?.backgroundImage || '';
                                    const m = st.match(/url\(["']?(https:\/\/[^"'\)]*(?:tiktokcdn|tos-|avt-)[^"'\)]*)["']?\)/i);
                                    if (m && m[1] && !isBad(m[1])) {
                                        return { avatar: m[1] };
                                    }
                                }
                            } catch (e) {}
                            return null;
                        }
                    });
                    if (results && results[0] && results[0].result) {
                        if (results[0].result.username && !foundUser) foundUser = results[0].result.username;
                        if (results[0].result.avatar && !isDefaultOrPassportAvatar(results[0].result.avatar)) {
                            foundAvatar = results[0].result.avatar;
                        }
                    }
                } catch (e) {}
            }
        }

        // 2. Jika masih belum dapat dari tab, minta background worker cek passport endpoint
        if (!foundUser) {
            try {
                const bgRes = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({ action: "GET_ACTIVE_TIKTOK_USER" }, (res) => {
                        if (chrome.runtime.lastError || !res) resolve(null);
                        else resolve(res);
                    });
                });
                if (bgRes && bgRes.success && bgRes.username) {
                    foundUser = bgRes.username;
                    if (bgRes.avatar && !isDefaultOrPassportAvatar(bgRes.avatar)) {
                        foundAvatar = bgRes.avatar;
                    }
                }
            } catch (e) {}
        }

        // 3. Update UI dan simpan data jika berhasil dideteksi
        if (foundUser) {
            if (!foundUser.startsWith('@')) foundUser = '@' + foundUser;

            localStorage.setItem('kuronai_username', foundUser);
            chrome.storage.local.set({ kuronai_username: foundUser });

            if (foundAvatar && !isDefaultOrPassportAvatar(foundAvatar)) {
                localStorage.setItem('kuronai_avatar', foundAvatar);
                chrome.storage.local.set({ kuronai_avatar: foundAvatar });
                uP(foundUser, foundAvatar);
            } else {
                uP(foundUser, '');
                // Ambil avatar asli melalui background worker
                chrome.runtime.sendMessage({ action: "FETCH_AVATAR", username: foundUser }, (r) => {
                    if (r && r.success && r.avatar && !isDefaultOrPassportAvatar(r.avatar)) {
                        foundAvatar = r.avatar;
                        localStorage.setItem('kuronai_avatar', foundAvatar);
                        chrome.storage.local.set({ kuronai_avatar: foundAvatar });
                        uP(foundUser, foundAvatar);
                    }
                });
            }
            return true;
        } else {
            const existingUser = localStorage.getItem('kuronai_username');
            if (!existingUser || existingUser === "@LocalUser" || existingUser === "LocalUser") {
                uP("@TikTokUser", "");
            }
            return false;
        }
    } catch (err) {
        console.error("Gagal mendeteksi akun TikTok:", err);
        return false;
    }
}


function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 168;
    const g = parseInt(hex.substring(2, 4), 16) || 85;
    const b = parseInt(hex.substring(4, 6), 16) || 247;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustHex(hex, percent) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    let num = parseInt(hex, 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function applyCustomColor(hex, save = true) {
    if (!hex || !hex.startsWith('#')) return;
    const root = document.documentElement;
    const darker = adjustHex(hex, -45);
    const lighter = adjustHex(hex, 35);
    const glow = hexToRgba(hex, 0.45);

    root.style.setProperty('--primary', lighter);
    root.style.setProperty('--primary-deep', darker);
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-glow', glow);

    const isLight = document.body.classList.contains('light-mode');
    if (!isLight) {
        root.style.setProperty('--bg-gradient', `
            radial-gradient(ellipse 90% 55% at 20% 0%, ${hexToRgba(lighter, 0.3)} 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 25%, ${hexToRgba(hex, 0.38)} 0%, transparent 55%),
            radial-gradient(circle at 15% 70%, ${hexToRgba(darker, 0.42)} 0%, transparent 55%),
            radial-gradient(circle at 85% 90%, ${hexToRgba(adjustHex(darker, -25), 0.65)} 0%, transparent 60%),
            linear-gradient(160deg, #160829 0%, ${adjustHex(darker, -40)} 30%, #140526 70%, #0a0314 100%)
        `);
    } else {
        root.style.setProperty('--bg-gradient', `
            radial-gradient(ellipse 90% 55% at 20% 0%, ${hexToRgba(lighter, 0.9)} 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 25%, ${hexToRgba(hex, 0.4)} 0%, transparent 55%),
            radial-gradient(circle at 15% 70%, ${hexToRgba(darker, 0.3)} 0%, transparent 55%),
            linear-gradient(160deg, #faf5ff 0%, #f3e8ff 35%, #e9d5ff 75%, ${hexToRgba(lighter, 0.5)} 100%)
        `);
    }

    if (save) {
        chrome.storage.local.set({ customThemeColor: hex });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    chrome.storage.local.get(['theme', 'lang'], function(result) {
        const savedTheme = result.theme || 'dark';
        if (savedTheme === 'light') { document.body.classList.add('light-mode'); updateThemeIcon(true); }
        currentLang = (result.lang === 'id') ? 'id' : 'en';
        if (result.customThemeColor) { applyCustomColor(result.customThemeColor, false); }
        sL(currentLang, false, false);
    });

    // --- LOCAL MODE: Sembunyikan telegramView dan loginView, langsung ke mainView ---
    const tv = g('telegramView');
    const loginViewEl = g('loginView');
    
    if (tv) tv.style.display = 'none';
    if (loginViewEl) loginViewEl.style.display = 'none';
    
    // Langsung tampilkan mainView
    if (mv) {
        mv.classList.remove('hidden-right');
        mv.style.display = 'flex';
    }

    // Inisialisasi deteksi akun TikTok yang aktif
    initUserAccount();

    // Cek status toggle dari halaman TikTok yang aktif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if(tab && tab.url && tab.url.includes("tiktok.com")) {
        chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", args: [currentLang], func: (l) => { if(window.setBadgeLanguage) window.setBadgeLanguage(l, false); } });
       
        const onUploadPage = tab && tab.url && (tab.url.includes('/upload') || tab.url.includes('/creator-center') || tab.url.includes('/tiktokstudio') || tab.url.includes('/creator'));

        chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", func: () => window._k_60_isModeActive }, (r) => {
            if (r && r[0] && r[0].result === true && onUploadPage) {
                g('toggleBtn').checked = true;
                uUI(true);
            } else if (onUploadPage && (localStorage.getItem('kuronai_60fps_active') !== 'false')) {
                // Auto active jika di halaman upload
                g('toggleBtn').checked = true;
                uUI(true);
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    world: "MAIN",
                    func: () => window.activate60FPS ? window.activate60FPS() : null
                });
            } else {
                g('toggleBtn').checked = false;
                uUI(false);
            }
        });
    }
});


const colorPickerBtn = g('colorPickerBtn');
const colorPaletteBar = g('colorPaletteBar');
const customColorWheelBtn = g('customColorWheelBtn');
const nativeColorPicker = g('nativeColorPicker');

if (colorPickerBtn && colorPaletteBar) {
    colorPickerBtn.addEventListener('click', () => {
        colorPaletteBar.classList.toggle('hidden');
    });
}

document.querySelectorAll('.color-dot-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const c = e.target.dataset.color;
        if (c) {
            applyCustomColor(c);
            if (nativeColorPicker) nativeColorPicker.value = c;
        }
    });
});

if (customColorWheelBtn && nativeColorPicker) {
    customColorWheelBtn.addEventListener('click', () => {
        nativeColorPicker.click();
    });
}

if (nativeColorPicker) {
    nativeColorPicker.addEventListener('input', (e) => {
        applyCustomColor(e.target.value);
    });
    nativeColorPicker.addEventListener('change', (e) => {
        applyCustomColor(e.target.value, true);
    });
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        const themeVal = isLight ? 'light' : 'dark';
        chrome.storage.local.set({theme: themeVal});
        updateThemeIcon(isLight);
        sendThemeToPage(isLight);
    });
}
function updateThemeIcon(isLight) {
    const moonIcon = document.querySelector('.icon-moon');
    const sunIcon = document.querySelector('.icon-sun');
    if (moonIcon && sunIcon) {
        if (isLight) { moonIcon.classList.add('hidden'); sunIcon.classList.remove('hidden'); } 
        else { moonIcon.classList.remove('hidden'); sunIcon.classList.add('hidden'); }
    }
}
function sendThemeToPage(isLight) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes("tiktok.com")) {
            chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: (light) => { const badgeContent = document.querySelector('.k-content'); if (badgeContent) { if (light) badgeContent.classList.add('light-mode'); else badgeContent.classList.remove('light-mode'); } }, args: [isLight] });
        }
    });
}

function sL(l, stp = true, an = true) {
    const dS = () => {
        currentLang = l; chrome.storage.local.set({lang: l}); g('langBtn').innerText = l.toUpperCase();
        const ic = g('toggleBtn').checked;
        if(translations[l]) {
            document.querySelectorAll('[data-key]').forEach(el => {
                const k = el.getAttribute('data-key');
                if (k === 'status_off' || k === 'status_on') uUI(ic);
                else el.innerText = translations[l][k] || el.innerText;
            });
            const c = g('videoList');
            if (c && !c.innerHTML.includes('svg') && currentVideoData.length > 0) rVL(c, currentVideoData, currentIsReal, currentSourceMode);
        }
    };
    if (an) { document.body.classList.add('switching-lang'); setTimeout(() => { dS(); document.body.classList.remove('switching-lang'); }, 200); } else { dS(); }
    if (stp) { chrome.tabs.query({ active: true, currentWindow: true }, (ts) => { if(ts[0] && ts[0].url && ts[0].url.includes("tiktok.com")) { chrome.scripting.executeScript({ target: { tabId: ts[0].id }, world: "MAIN", args: [l, g('toggleBtn').checked], func: (l, a) => { if(window.setBadgeLanguage) window.setBadgeLanguage(l, a); } }).catch(()=>{}); } }); }
}
lab.addEventListener('click', () => { if (currentLang === 'en') sL('id'); else sL('en'); });

function calculateBestTime(videos) {
    const timeRes = document.getElementById('bestTimeResult'); const viewRes = document.getElementById('bestTimeViews'); const t = translations[currentLang] || translations['en']; 
    if (!timeRes || !videos || videos.length === 0) { if(timeRes) timeRes.innerText = "-"; if(viewRes) viewRes.innerText = ""; return; }
    let hoursMap = {}; let validCount = 0;
    videos.forEach(v => {
        if (!v.create_time) return; 
        validCount++; let date = new Date(v.create_time * 1000); let hour = date.getHours();
        if (!hoursMap[hour]) hoursMap[hour] = { totalViews: 0, count: 0 };
        let rawViews = v.views;
        if (typeof rawViews === 'string') { if (rawViews.includes('M')) rawViews = parseFloat(rawViews) * 1000000; else if (rawViews.includes('K')) rawViews = parseFloat(rawViews) * 1000; else rawViews = parseInt(rawViews); }
        hoursMap[hour].totalViews += rawViews; hoursMap[hour].count++;
    });
    if (validCount === 0) { timeRes.innerText = t.best_time_nodata; viewRes.innerText = ""; return; }
    let bestHour = -1; let maxAvgViews = 0;
    for (let h in hoursMap) { let avg = hoursMap[h].totalViews / hoursMap[h].count; if (avg > maxAvgViews) { maxAvgViews = avg; bestHour = h; } }
    if (bestHour !== -1) {
        let nextHour = (parseInt(bestHour) + 1) % 24; timeRes.innerText = `${bestHour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`;
        let displayAvg = fN(Math.floor(maxAvgViews)); viewRes.innerText = `${t.best_time_avg}${displayAvg} ${t.best_time_views}`;
    }
}

// --- LOCAL MODE: Tombol perbarui / sinkron akun TikTok ---
if (lob) {
    lob.title = "Perbarui Akun TikTok";
    lob.addEventListener('click', async () => {
        lob.style.transform = 'rotate(360deg)';
        lob.style.transition = 'transform 0.5s ease';
        setTimeout(() => { lob.style.transform = 'none'; lob.style.transition = ''; }, 600);
        
        localStorage.removeItem('kuronai_username');
        localStorage.removeItem('kuronai_avatar');
        chrome.storage.local.remove(['kuronai_username', 'kuronai_avatar']);
        
        uP("Mencari akun...", "");
        const success = await refreshTikTokUser();
        if (!success) {
            uP("@TikTokUser", "");
        }
    });
}

function uP(n, a) {
    if (!n) n = "Kaycee :3";
    if (!n.startsWith('@') && n !== "Kaycee :3" && n !== "Mencari akun..." && n !== "Searching account...") n = '@' + n;
    if (udn) udn.innerText = n;
    if (su) su.innerText = n;
    
    const imgEl = g('userAvatarImg');
    const letterEl = g('userAvatarLetter');
    const l = (n.replace('@', '').charAt(0) || 'K').toUpperCase();

    if (!a) a = localStorage.getItem('kuronai_avatar');

    // Jika avatar yang tersimpan adalah avatar passport default (icon huruf K hijau), bersihkan
    if (a && isDefaultOrPassportAvatar(a)) {
        a = '';
        localStorage.removeItem('kuronai_avatar');
        chrome.storage.local.remove(['kuronai_avatar']);
    }

    const setLetterFallback = () => {
        if (n === "Kaycee :3" || !n || n === "@TikTokUser" || n === "@LocalUser") {
            if (imgEl) {
                imgEl.src = "icons/default_avatar.png";
                imgEl.classList.remove('hidden');
                if (letterEl) letterEl.style.display = 'none';
            }
        } else {
            if (imgEl) imgEl.classList.add('hidden');
            if (letterEl) {
                letterEl.style.display = 'block';
                letterEl.innerText = l;
            }
        }
    };

    if (a && a !== "undefined" && a !== "null" && a !== "" && !isDefaultOrPassportAvatar(a)) {
        if (imgEl) {
            imgEl.src = a;
            imgEl.classList.remove('hidden');
            if (letterEl) letterEl.style.display = 'none';
            imgEl.onerror = () => {
                setLetterFallback();
            };
        }
        if (sa) {
            sa.innerText = "";
            sa.style.background = `url('${a}') center center / cover no-repeat`;
            sa.style.border = "1.5px solid rgba(255,255,255,0.85)";
        }
    } else {
        setLetterFallback();
        if (sa) {
            sa.innerText = l;
            sa.style.background = "linear-gradient(135deg, var(--primary-deep), var(--accent))";
        }

        // Jika avatar belum ada dan username terdeteksi, minta background worker cari avatar asli
        if (n && n.startsWith('@') && n.length > 2 && n !== "@TikTokUser" && n !== "@LocalUser") {
            chrome.runtime.sendMessage({ action: "FETCH_AVATAR", username: n }, (res) => {
                if (res && res.success && res.avatar && !isDefaultOrPassportAvatar(res.avatar)) {
                    localStorage.setItem('kuronai_avatar', res.avatar);
                    chrome.storage.local.set({ kuronai_avatar: res.avatar });
                    if (imgEl) {
                        imgEl.src = res.avatar;
                        imgEl.classList.remove('hidden');
                        if (letterEl) letterEl.style.display = 'none';
                    }
                    if (sa) {
                        sa.innerText = "";
                        sa.style.background = `url('${res.avatar}') center center / cover no-repeat`;
                    }
                }
            });
        }
    }
}

stb.addEventListener('click', () => {
    mv.classList.add('hidden-left');
    sv.style.display = 'flex';
    const container = g('videoList');
    sBF(container); 
    setTimeout(() => { sv.classList.remove('hidden-right') }, 50);
});bmb.addEventListener('click',()=>{sv.classList.add('hidden-right');setTimeout(()=>{sv.style.display='none';mv.classList.remove('hidden-left')},300)});

function sBF(c){
    let r=localStorage.getItem('kuronai_username')||'kaycee'; if(r.startsWith('@'))r=r.substring(1);
    c.innerHTML='<div style="text-align:center; padding:20px; color:#666; font-size:12px;">Veriler Analiz Ediliyor...</div>';
    document.getElementById('bestTimeResult').innerText = "Hesaplanıyor..."; document.getElementById('bestTimeViews').innerText = "";
    chrome.runtime.sendMessage({action:"FETCH_TIKTOK_DATA",username:r},(x)=>{
        const t = translations[currentLang];
        if(chrome.runtime.lastError || !x || !x.success || !x.data || x.data.length === 0){
            c.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:40px 20px; text-align:center; opacity:0.7;"><svg viewBox="0 0 24 24" style="width:40px; height:40px; fill:var(--text-sub); margin-bottom:15px; opacity:0.5;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M0 0h24v24H0z" fill="none"/><line x1="2" y1="2" x2="22" y2="22" stroke="var(--text-sub)" stroke-width="2" /></svg><div style="font-family:'Rajdhani'; font-weight:700; font-size:16px; color:var(--text-main);">${t.err_no_video_title}</div><div style="font-size:11px; color:var(--text-sub); margin-top:5px;">${t.err_no_video_desc}</div></div>`;
            document.getElementById('bestTimeResult').innerText = "-"; document.getElementById('bestTimeViews').innerText = ""; return;
        }
        if(x.success && x.data.length > 0){
            let cl = x.data.filter(i => parseInt(i.views) > 0);
            currentVideoData = cl.slice(0, 10).map(i => ({ views: fN(i.views), title: i.title, cover: i.cover, playUrl: i.playUrl, musicUrl: i.musicUrl, engagement: cE(i.views, i.likes, i.comments, i.shares), isReal: true, create_time: i.create_time }));
            rVL(c, currentVideoData, true, "LIVE SYNC");
        }
    });
}

function cE(v,l,c,s){if(!v||v==0)return"0.0%";const t=parseInt(l||0)+parseInt(c||0)+parseInt(s||0);return((t/parseInt(v))*100).toFixed(1)+"%"}
function tT(t,m){if(!t)return"";if(t.length<=m)return t;return t.substring(0,m)+"..."}

function rVL(c,d,ir,sm){
    c.innerHTML=''; const t=translations[currentLang];
    d.forEach((v,i)=>{
        const el=document.createElement('div'); el.className='video-item';
        let dt="",st="",ts="",eh="",bh="";
        if(ir){
            if(v.title&&v.title.trim()!=="")dt=tT(v.title,20);else dt=`${t.vid_prefix}${i+1}`;
            st=t.status_live; if(v.cover)ts=`background: url('${v.cover}') center/cover no-repeat;`;else ts=`background: #333;`;
            eh=`<div class="engagement-badge" title="Etkileşim Oranı">🔥 ${v.engagement}</div>`;
            
        }
        const vc=v.views,vcl=ir?'#2ecc71':'#fff';
        el.innerHTML=`<div class="vid-left"><div style="display:flex; gap:10px; align-items:center;"><div class="vid-thumb" style="${ts}"></div><div class="vid-info"><div class="vid-date" title="${ir?v.title:''}">${dt}</div>${eh}<div class="vid-status" style="${ir?'color:#25F4EE; margin-top:2px;':''}">${st}</div></div></div></div><div class="vid-right-group"><div class="vid-views" style="color:${vcl}">${vc}</div>${bh}</div>`;
        c.appendChild(el)
    });
    document.querySelectorAll('.video-dl').forEach(b=>{b.addEventListener('click',()=>dM(b.dataset.link,b.dataset.name))});
    document.querySelectorAll('.music-dl').forEach(b=>{b.addEventListener('click',()=>dM(b.dataset.link,b.dataset.name))});
    if(ir) { setTimeout(() => calculateBestTime(d), 100); }
}


const toggleBtn = g('toggleBtn');
const masterPillTrigger = g('masterPillTrigger');

if (masterPillTrigger && toggleBtn) {
    masterPillTrigger.addEventListener('click', () => {
        toggleBtn.click();
    });
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', async (e) => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const isUploadPage = tab && tab.url && (tab.url.includes('/upload') || tab.url.includes('/creator-center') || tab.url.includes('/tiktokstudio') || tab.url.includes('/creator'));

        if (e.target.checked && !isUploadPage) {
            e.preventDefault(); 
            e.target.checked = false; 
            showWrongPageWarning(); 
            return; 
        }

        const ic = e.target.checked;
        uUI(ic); 
        localStorage.setItem('kuronai_60fps_active', ic ? 'true' : 'false');
        chrome.storage.local.set({ kuronai_60fps_active: ic });

        if (tab && tab.url.includes("tiktok.com")) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                world: "MAIN",
                args: [currentLang, ic],
                func: (l, a) => { if (window.setBadgeLanguage) window.setBadgeLanguage(l, a) }
            });

            const actionFunc = ic ? 
                () => window.activate60FPS ? window.activate60FPS() : null : 
                () => window.reset60FPS ? window.reset60FPS() : null;

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                world: "MAIN",
                func: actionFunc
            });
        }
    });
}

function showWrongPageWarning() {
    const statusText = g('statusText');
    const mainCard = g('mainCard');
    const warningMsg = (translations[currentLang] && translations[currentLang]['wrong_page']) || 'UPLOAD PAGE ONLY!';

    if (statusText) {
        statusText.innerText = warningMsg;
        statusText.style.color = "#FE2C55"; 
    }
    if (mainCard) {
        mainCard.classList.remove('active');
        mainCard.classList.add('shake-animation'); 
    }

    setTimeout(() => {
        if (toggleBtn && !toggleBtn.checked) {
            if (statusText && translations[currentLang]) {
                statusText.innerText = translations[currentLang]['status_off'];
                statusText.style.color = "";
            }
            if (mainCard) mainCard.classList.remove('active');
        }
        if (mainCard) mainCard.classList.remove('shake-animation');
    }, 1500);
}

function dM(u,f){if(!u||u==="undefined"){alert("Link bulunamadı!");return}chrome.runtime.sendMessage({action:"DOWNLOAD_MEDIA",url:u,filename:f})}
function fN(n){n=parseInt(n);if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toString()}

function uUI(a){
    const st=g('statusText'), mc=g('mainCard'), tk=a?'status_on':'status_off';
    if(st && translations[currentLang]) {
        st.innerText = translations[currentLang][tk];
        st.style.color = "";
    }
    if(mc){
        if(a){
            mc.classList.add('active');
        } else {
            mc.classList.remove('active');
        }
    }
}

// --- LOCAL MODE: Update notification completely disabled ---

const dlPageBtn = g('dlPageBtn'), dlView = g('dlView'), backDl = g('backFromDl'), dlInput = g('dlUrlInput'), analyzeBtn = g('analyzeBtn'), dlResult = g('dlResultArea');
if(dlPageBtn) { dlPageBtn.addEventListener('click', () => { mv.classList.add('hidden-left'); dlView.style.display = 'flex'; setTimeout(() => dlView.classList.remove('hidden-right'), 50); }); }
if(backDl) { backDl.addEventListener('click', () => { dlView.classList.add('hidden-right'); setTimeout(() => { dlView.style.display = 'none'; mv.classList.remove('hidden-left'); dlResult.classList.add('hidden'); dlInput.value = ''; }, 300); }); }
if(analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
        const url = dlInput.value.trim();
        if(url.length < 10 || !url.includes('tiktok.com')) { const group = dlInput.parentElement.parentElement; group.style.borderColor = '#FE2C55'; group.classList.add('shake-animation'); setTimeout(() => { group.style.borderColor = 'rgba(255,255,255,0.1)'; group.classList.remove('shake-animation'); }, 1000); return; }
        const originalContent = analyzeBtn.innerHTML; analyzeBtn.innerHTML = "⏳"; analyzeBtn.disabled = true;
        chrome.runtime.sendMessage({action: "ANALYZE_SINGLE_VIDEO", url: url}, (response) => {
            analyzeBtn.disabled = false; analyzeBtn.innerHTML = originalContent;
            if(response && response.success) {
                const d = response.data;
                if(d.cover) g('dlCover').style.backgroundImage = `url('${d.cover}')`;
                if(d.author) g('dlAuthor').innerText = '@' + d.author;
                const titleText = d.title ? (d.title.length > 80 ? d.title.substring(0, 80) + '...' : d.title) : 'Başlıksız';
                g('dlDesc').innerText = titleText;
                g('dlStatsViews').innerText = fN(d.views || 0); 
                g('dlStatsLikes').innerText = fN(d.likes || 0);
                const vidBtnOld = g('dlVideoBtn');
                const hdBtnOld = g('dlHDBtn'); 
                const musBtnOld = g('dlMusicBtn');
                const newVidBtn = vidBtnOld.cloneNode(true);
                const newHDBtn = hdBtnOld.cloneNode(true);
                const newMusicBtn = musBtnOld.cloneNode(true);
                vidBtnOld.parentNode.replaceChild(newVidBtn, vidBtnOld);
                hdBtnOld.parentNode.replaceChild(newHDBtn, hdBtnOld);
                musBtnOld.parentNode.replaceChild(newMusicBtn, musBtnOld);
                newVidBtn.addEventListener('click', () => dM(d.playUrl, `tiktok_std_${Date.now()}.mp4`));
                newMusicBtn.addEventListener('click', () => dM(d.musicUrl, `tiktok_audio_${Date.now()}.mp3`));
                newHDBtn.addEventListener('click', () => {
                    const originalHTML = newHDBtn.innerHTML;
                    newHDBtn.innerHTML = `<svg viewBox="0 0 24 24" style="animation:spin 1s infinite;"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg>`;
                    newHDBtn.disabled = true;
                    const targetUrl = g('dlUrlInput').value.trim();
                    chrome.runtime.sendMessage({ action: "FETCH_HD_VIDEO", url: targetUrl }, (hdRes) => {
                        newHDBtn.innerHTML = originalHTML;
                        newHDBtn.disabled = false;

                        if (hdRes && hdRes.success && hdRes.data && hdRes.data.playUrl) {
                            dM(hdRes.data.playUrl, `tiktok_HD_${Date.now()}.mp4`);
                        } else {
                            alert("HD Link Bulunamadı veya Zaman Aşımı.");
                        }
                    });
                });
                
                dlResult.classList.remove('hidden');
            } else { analyzeBtn.style.backgroundColor = '#FE2C55'; setTimeout(() => { analyzeBtn.style.backgroundColor = ''; }, 1000); }
        });
    });
}

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;


function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playCyberSound(type) {
    initAudio();
    const now = audioCtx.currentTime;
    

    const masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = 0.3; 

    if (type === 'hover') {

        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(masterGain);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.03); 
        
        gain1.gain.setValueAtTime(0.05, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        
        osc1.start(now);
        osc1.stop(now + 0.03);


        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(masterGain);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1210, now); 
        
        gain2.gain.setValueAtTime(0.02, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc2.start(now);
        osc2.stop(now + 0.05);

    } else if (type === 'click') {

        const oscLow = audioCtx.createOscillator();
        const gainLow = audioCtx.createGain();
        oscLow.connect(gainLow);
        gainLow.connect(masterGain);

        oscLow.type = 'triangle';
        oscLow.frequency.setValueAtTime(150, now);
        oscLow.frequency.exponentialRampToValueAtTime(40, now + 0.1); 
        
        gainLow.gain.setValueAtTime(0.2, now);
        gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        oscLow.start(now);
        oscLow.stop(now + 0.1);

        const oscHigh = audioCtx.createOscillator();
        const gainHigh = audioCtx.createGain();
        oscHigh.connect(gainHigh);
        gainHigh.connect(masterGain);

        oscHigh.type = 'square';
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2000;
        oscHigh.connect(filter);
        filter.connect(gainHigh);

        oscHigh.frequency.setValueAtTime(800, now);
        gainHigh.gain.setValueAtTime(0.05, now);
        gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        oscHigh.start(now);
        oscHigh.stop(now + 0.05);
        
    } else if (type === 'success') {

        [440, 554, 659].forEach((freq, i) => { 
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (i * 0.05)); 
            
            gain.gain.setValueAtTime(0.05, now + (i * 0.05));
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            osc.start(now);
            osc.stop(now + 0.4);
        });
    } else if (type === 'error') {

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const hoverElements = document.querySelectorAll('button, .cyber-btn, .update-card, .social-btn');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => playCyberSound('hover'));
    });


    const clickElements = document.querySelectorAll('button, a, input, .card, .icon-btn, .lang-btn, .theme-btn');
    clickElements.forEach(el => {
        el.addEventListener('mousedown', () => playCyberSound('click'));
    });
});


document.addEventListener('DOMContentLoaded', () => {

    const cards = document.querySelectorAll('.card, .glass-card, .update-card');

    cards.forEach(card => {

        card.style.transition = 'transform 0.1s ease, box-shadow 0.2s ease';
        card.style.transformStyle = 'preserve-3d';
        card.style.perspective = '1000px';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / 10) * -1; 
            const rotateY = (x - centerX) / 10;        

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            const shadowX = (x - centerX) / 5;
            const shadowY = (y - centerY) / 5;
            card.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3)`;
        });


        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease'; 
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)'; 
        });
    });
});


const spotlightStyle = document.createElement('style');
spotlightStyle.innerHTML = `

    .card::after, .login-card::after, .glass-card::after, .social-btn::after {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: inherit;

        opacity: 0;
        transition: opacity 0.5s ease;
        z-index: 1;
        pointer-events: none; 
        

        background: radial-gradient(
            600px circle at var(--mouse-x) var(--mouse-y), 
            rgba(37, 244, 238, 0.10), 
            transparent 40%
        );
    }


    .card:hover::after, 
    .login-card:hover::after, 
    .glass-card:hover::after,
    .social-btn:hover::after {
        opacity: 1;
    }
`;
document.head.appendChild(spotlightStyle);

document.addEventListener('DOMContentLoaded', () => {
    const lightTargets = document.querySelectorAll('.card, .login-card, .glass-card, .social-btn');

    lightTargets.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});

const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes cyberSlideIn {
        0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            filter: blur(5px);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }

    /* Başlangıçta görünmez olsunlar ki animasyonla gelsinler */
    .stagger-load {
        opacity: 0; 
    }
`;
document.head.appendChild(styleSheet);

document.addEventListener("DOMContentLoaded", () => {

    const blocks = document.querySelectorAll(
        '.header-bar, .status-card, .features-list, .social-actions, .footer'
    );

    blocks.forEach((el, index) => {

        el.classList.add('stagger-load');

        el.style.animation = `cyberSlideIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`;
        el.style.animationDelay = `${index * 0.1}s`; 
    });
});


document.addEventListener('DOMContentLoaded', () => {

    const magnets = document.querySelectorAll('.cyber-btn, .social-btn, .icon-btn, .glass-btn, .lang-btn');

    magnets.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            

            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;


            const strength = 0.4;
            

            btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            

            const icon = btn.querySelector('svg');
            if(icon) {
                icon.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            }
        });


        btn.addEventListener('mouseleave', () => {

            btn.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            btn.style.transform = 'translate(0, 0)';
            
            const icon = btn.querySelector('svg');
            if(icon) {
                icon.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                icon.style.transform = 'translate(0, 0)';
            }

            setTimeout(() => {
                btn.style.transition = '';
                if(icon) icon.style.transition = '';
            }, 400);
        });
    });
});

const sheenStyle = document.createElement('style');
sheenStyle.innerHTML = `

    @keyframes sheenSlide {
        0% { left: -100%; opacity: 0; }
        5% { opacity: 1; }
        100% { left: 100%; opacity: 0; }
    }


    .cyber-btn, .social-btn, .glass-btn {
        position: relative;
        overflow: hidden !important;
    }


    .cyber-btn::before, .social-btn::before, .glass-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        

        background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
        );
        

        transform: skewX(-25deg);
        pointer-events: none;
        z-index: 2;
    }


    .cyber-btn:hover::before, 
    .social-btn:hover::before, 
    .glass-btn:hover::before {
        animation: sheenSlide 0.7s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
`;
document.head.appendChild(sheenStyle);


const shockwaveStyle = document.createElement('style');
shockwaveStyle.innerHTML = `
    .shockwave {
        position: absolute;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        

        width: 0px;
        height: 0px;
        border: 2px solid rgba(37, 244, 238, 0.8);
        box-shadow: 0 0 10px rgba(37, 244, 238, 0.5), inset 0 0 10px rgba(37, 244, 238, 0.5);
        opacity: 1;
        
        animation: shockwaveExpand 0.6s ease-out forwards;
    }

    @keyframes shockwaveExpand {
        0% {
            width: 0px;
            height: 0px;
            opacity: 1;
            border-width: 4px;
        }
        100% {
            width: 500px;
            height: 500px;
            opacity: 0;
            border-width: 0px;
        }
    }
`;
document.head.appendChild(shockwaveStyle);


document.addEventListener('click', (e) => {

    const wave = document.createElement('div');
    wave.classList.add('shockwave');
    
    
    wave.style.left = e.clientX + 'px';
    wave.style.top = e.clientY + 'px';
    
    
    const target = e.target.closest('.logout-btn, .btn-secondary, .icon-btn.music-dl');
    if (target) {
        wave.style.borderColor = 'rgba(254, 44, 85, 0.8)';
        wave.style.boxShadow = '0 0 10px rgba(254, 44, 85, 0.5), inset 0 0 10px rgba(254, 44, 85, 0.5)';
    }


    document.body.appendChild(wave);
    

    setTimeout(() => {
        wave.remove();
    }, 600);
});


const sparkStyle = document.createElement('style');
sparkStyle.innerHTML = `
    .spark {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #25F4EE;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 10px #25F4EE;
    }
`;
document.head.appendChild(sparkStyle);

document.addEventListener('click', (e) => {
    const sparkCount = 8; 
    const color = '#25F4EE';
    

    const target = e.target.closest('.logout-btn, .btn-secondary');
    const finalColor = target ? '#FE2C55' : color;

    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.classList.add('spark');
        document.body.appendChild(spark);


        const x = e.clientX;
        const y = e.clientY;
        
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.background = finalColor;
        spark.style.boxShadow = `0 0 10px ${finalColor}`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 60 + 20; 
        

        const animation = spark.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, opacity: 0 }
        ], {
            duration: 400 + Math.random() * 200,
            easing: 'cubic-bezier(0, .9, .57, 1)',
        });


        animation.onfinish = () => spark.remove();
    }
});

const borderStyle = document.createElement('style');
borderStyle.innerHTML = `

    .card::before, .glass-card::before, .login-card::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: inherit;
        padding: 1.5px;
        

        -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        

        background: radial-gradient(
            300px circle at var(--mouse-x) var(--mouse-y), 
            rgba(37, 244, 238, 1),
            rgba(255, 255, 255, 0.1) 40%,
            transparent 80%
        );
        
        z-index: 2;
        pointer-events: none;
        opacity: 0.6;
        transition: opacity 0.5s ease;
    }
`;
document.head.appendChild(borderStyle);

document.addEventListener('DOMContentLoaded', () => {
    const borders = document.querySelectorAll('.card, .glass-card, .login-card');

    borders.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});

