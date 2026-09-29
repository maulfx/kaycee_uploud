
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
const translations={en:{status_off:"DISABLED",status_on:"SYSTEM ACTIVE",feat1_title:"60FPS Force",feat1_desc:"Compression bypassed",feat2_title:"Lossless Upload",feat2_desc:"Original bitrate",feat3_title:"Promo Sound",feat3_desc:"No re-render inject",footer_made:"Made by Kuronai",footer_status:"ONLINE",btn_enter:"ENTER SYSTEM",remember:"Remember Me",btn_checking:"CHECKING...",stats_title:"VIDEO ANALYSIS",live_tag_static:"LIVE DATA STREAM",vid_prefix:"Video #",status_live:"⚡ LIVE DATA",status_boost:"⚡ BOOSTING...",status_active:"60FPS ACTIVE",time_now:"Just Uploaded",time_min:"min ago",time_hour:"hours ago",update_title:"UPDATE AVAILABLE!",update_force:"MANDATORY UPDATE!",update_desc:" update is ready to download.",best_time_title:"BEST UPLOAD TIME",best_time_calc:"Calculating...",best_time_nodata:"Insufficient Data",best_time_avg:"Avg. ~",best_time_views:"views",calc_title:"QUALITY CALCULATOR",calc_desc:"OPTIMUM RENDER SETTINGS",calc_input_sec:"Duration (Seconds)",calc_res_bitrate:"RECOMMENDED BITRATE (CBR)",calc_res_size:"ESTIMATED FILE SIZE",tags_title:"TAG VAULT",btn_copy:"COPY TAGS",dl_title:"MEDIA DOWNLOADER",dl_input_ph:"Paste TikTok Link",dl_btn_check:"ANALYZE & DOWNLOAD",err_no_video_title:"NO VIDEOS FOUND",err_no_video_desc:"User might be private or has no content."},tr:{status_off:"DEVRE DIŞI",status_on:"SİSTEM AKTİF",feat1_title:"60FPS Zorlama",feat1_desc:"Sıkıştırma engellendi",feat2_title:"Kayıpsız Yükleme",feat2_desc:"Orijinal kalite",feat3_title:"Promo Müzik",feat3_desc:"Render olmadan ekle",footer_made:"Kuronai Yapımıdır",footer_status:"ÇEVRİMİÇİ",btn_enter:"SİSTEME BAĞLAN",remember:"Beni Hatırla",btn_checking:"KONTROL EDİLİYOR...",stats_title:"VİDEO ANALİZİ",live_tag_static:"CANLI VERİ AKIŞI",vid_prefix:"Video #",status_live:"⚡ CANLI VERİ",status_boost:"⚡ HIZLANDIRILIYOR...",status_active:"60FPS AKTİF",time_now:"Şimdi Yüklendi",time_min:"dk önce",time_hour:"saat önce",update_title:"GÜNCELLEME MEVCUT!",update_force:"ZORUNLU GÜNCELLEME!",update_desc:" sürümü indirilebilir.",best_time_title:"EN İYİ YÜKLEME SAATİ",best_time_calc:"Hesaplanıyor...",best_time_nodata:"Yetersiz Veri",best_time_avg:"Ort. ~",best_time_views:"izlenme",calc_title:"KALİTE HESAPLAYICI",calc_desc:"OPTİMUM RENDER AYARLARI",calc_input_sec:"Video Süresi (Saniye)",calc_res_bitrate:"ÖNERİLEN BİTRATE (CBR)",calc_res_size:"TAHMİNİ DOSYA BOYUTU",tags_title:"ETİKET KASASI",btn_copy:"ETİKETLERİ KOPYALA",dl_title:"VİDEO İNDİRİCİ",dl_input_ph:"TikTok Video Linki",dl_btn_check:"ANALİZ ET & İNDİR",err_no_video_title:"VİDEO BULUNAMADI",err_no_video_desc:"Kullanıcı gizli olabilir veya videosu yok."},ru:{status_off:"ОТКЛЮЧЕНО",status_on:"СИСТЕМА АКТИВНА",feat1_title:"Форсирование 60FPS",feat1_desc:"Сжатие отключено",feat2_title:"Загрузка без потерь",feat2_desc:"Оригинальное качество",feat3_title:"Промо Звук",feat3_desc:"Без рендеринга",footer_made:"Создано Kuronai",footer_status:"ОНЛАЙН",btn_enter:"ВОЙТИ В СИСТЕМУ",remember:"Запомнить меня",btn_checking:"ПРОВЕРКА...",stats_title:"АНАЛИЗ ВИДЕО",live_tag_static:"ПОТОК ДАННЫХ",vid_prefix:"Видео #",status_live:"⚡ ЖИВЫЕ ДАННЫЕ",status_boost:"⚡ УСКОРЕНИЕ...",status_active:"60FPS АКТИВНО",time_now:"Только что",time_min:"мин. назад",time_hour:"ч. назад",update_title:"ЕСТЬ ОБНОВЛЕНИЕ!",update_force:"ОБЯЗАТЕЛЬНОЕ ОБНОВЛЕНИЕ!",update_desc:" готово к скачиванию.",best_time_title:"ЛУЧШЕЕ ВРЕМЯ",best_time_calc:"Вычисляется...",best_time_nodata:"Нет данных",best_time_avg:"Ср. ~",best_time_views:"просм.",calc_title:"КАЛЬКУЛЯТОР КАЧЕСТВА",calc_desc:"ОПТИМАЛЬНЫЕ НАСТРОЙКИ",calc_input_sec:"Длительность (сек)",calc_res_bitrate:"РЕКОМЕНДУЕМЫЙ БИТРЕЙТ",calc_res_size:"ПРИМЕРНЫЙ РАЗМЕР",tags_title:"ХЕШТЕГИ",btn_copy:"КОПИРОВАТЬ",dl_title:"ЗАГРУЗЧИК",dl_input_ph:"Вставьте ссылку TikTok",dl_btn_check:"НАЙТИ И СКАЧАТЬ",err_no_video_title:"ВИДЕО НЕ НАЙДЕНО",err_no_video_desc:"Пользователь скрыт или нет видео."}};
let currentAvatarUrl = null;
let currentLang = 'en';
let currentVideoData = []; 
let currentIsReal = false;
let currentSourceMode = "";

// --- LOCAL MODE: Default username dari TikTok active tab ---
const LOCAL_DEFAULT_USER = "@LocalUser";

document.addEventListener('DOMContentLoaded', async () => {
    chrome.storage.local.get(['theme', 'lang'], function(result) {
        const savedTheme = result.theme || 'dark';
        if (savedTheme === 'light') { document.body.classList.add('light-mode'); updateThemeIcon(true); }
        currentLang = result.lang || 'en';
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

    // Set user dari localStorage atau default
    const savedUser = localStorage.getItem('kuronai_username') || LOCAL_DEFAULT_USER;
    const savedAvatar = localStorage.getItem('kuronai_avatar') || '';
    
    // Simpan ke localStorage agar persistent
    if (!localStorage.getItem('kuronai_username')) {
        localStorage.setItem('kuronai_username', savedUser);
    }
    
    uP(savedUser, savedAvatar);

    // Cek status toggle dari halaman TikTok yang aktif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if(tab && tab.url && tab.url.includes("tiktok.com")) {
        chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", args: [currentLang], func: (l) => { if(window.setBadgeLanguage) window.setBadgeLanguage(l, false); } });
       
        const onUploadPage = tab && tab.url && (tab.url.includes('/upload') || tab.url.includes('/creator-center'));

        chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", func: () => window._k_60_isModeActive || false }, (r) => {
        
        if (r && r[0] && r[0].result === true && onUploadPage) {
        g('toggleBtn').checked = true;
        uUI(true);
        } else {
       
        g('toggleBtn').checked = false;
        uUI(false);
        }
    });
    }
    
});

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
lab.addEventListener('click', () => { if (currentLang === 'en') sL('tr'); else if (currentLang === 'tr') sL('ru'); else sL('en'); });

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

// --- LOCAL MODE: Logout hanya reset ke mainView dengan default user ---
if (lob) {
    lob.addEventListener('click', () => {
        localStorage.removeItem('kuronai_username');
        localStorage.removeItem('kuronai_avatar');
        
        // Set ulang ke default user
        localStorage.setItem('kuronai_username', LOCAL_DEFAULT_USER);
        uP(LOCAL_DEFAULT_USER, '');
    });
}

function uP(n, a) {
    if (!n.startsWith('@')) n = '@' + n;
    if (udn) udn.innerText = n;
    if (su) su.innerText = n;
    if (!a) a = localStorage.getItem('kuronai_avatar');
    if (a && a !== "undefined" && a !== "null" && a !== "") {
        const s = `url('${a}') center center / cover no-repeat`;
        if (ua) { ua.innerText = ""; ua.style.background = s; ua.style.border = "2px solid rgba(255,255,255,0.2)"; }
        if (sa) { sa.innerText = ""; sa.style.background = s; sa.style.border = "2px solid rgba(37, 244, 238, 0.3)"; }
    } else {
        const l = n.replace('@', '').charAt(0).toUpperCase();
        if (ua) { ua.style.background = "#FE2C55"; ua.innerText = l; ua.style.display = "flex"; ua.style.alignItems = "center"; ua.style.justifyContent = "center"; }
        if (sa) { sa.style.background = "#FE2C55"; sa.innerText = l; sa.style.display = "flex"; sa.style.alignItems = "center"; sa.style.justifyContent = "center"; }
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
    let r=localStorage.getItem('kuronai_username')||'kuronai'; if(r.startsWith('@'))r=r.substring(1);
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

toggleBtn.addEventListener('click', async (e) => {

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isUploadPage = tab && tab.url && (tab.url.includes('/upload') || tab.url.includes('/creator-center'));
    

    if (e.target.checked && !isUploadPage) {
        e.preventDefault(); 
        e.target.checked = false; 
        showWrongPageWarning(); 
        return; 
    }


    const ic = e.target.checked;
    uUI(ic); 

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

function showWrongPageWarning() {
    const statusText = g('statusText');
    const mainCard = g('mainCard');
    const warnings = { en: "UPLOAD PAGE ONLY!", tr: "SADECE YÜKLEME EKRANI!", ru: "ТОЛЬКО ЗАГРУЗКА!" };
    const warningMsg = warnings[currentLang] || warnings['en'];

    statusText.innerText = warningMsg;
    statusText.style.color = "#FE2C55"; 
    mainCard.style.borderColor = "#FE2C55"; 
    mainCard.classList.add('shake-animation'); 

    setTimeout(() => {
        if (!toggleBtn.checked) {
            statusText.innerText = translations[currentLang]['status_off'];
            statusText.style.color = "#777";
            mainCard.style.borderColor = "rgba(255, 255, 255, 0.08)";
        }
        mainCard.classList.remove('shake-animation');
    }, 1500);
}function dM(u,f){if(!u||u==="undefined"){alert("Link bulunamadı!");return}chrome.runtime.sendMessage({action:"DOWNLOAD_MEDIA",url:u,filename:f})}
function fN(n){n=parseInt(n);if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toString()}

function uUI(a){const st=g('statusText'),mc=g('mainCard'),tk=a?'status_on':'status_off';if(translations[currentLang])st.innerText=translations[currentLang][tk];if(a){st.style.color="#25F4EE";mc.classList.add('active')}else{st.style.color="#777";mc.classList.remove('active')}}

// --- LOCAL MODE: Update checker tetap bisa digunakan tapi tanpa locked mode ---
const G='https://raw.githubusercontent.com',U='/Kuronai46/kuronai-extension-updates',vP='/main/version.json';const API=G+U+vP;
async function cU(){
    try{
        const m=chrome.runtime.getManifest(),cv=m.version;
        const r=await fetch(API);
        const d=await r.json();
        if(iNV(d.version,cv)){
            const b=g('updateBanner'),vs=g('newVersionNum'),ts=b?b.querySelector('.update-title'):null;
            if(b&&vs){
                vs.innerText=d.version;
                b.href=d.url;
                b.classList.remove('hidden');
                document.body.classList.add('has-update');
                // LOCAL MODE: Tidak lock interface untuk update
                if(typeof sL==="function"){sL(currentLang,false,false)}
            }
        }
    }catch(e){console.log(e)}
}
function iNV(n,o){const v1=n.split('.').map(Number),v2=o.split('.').map(Number);for(let i=0;i<Math.max(v1.length,v2.length);i++){const n1=v1[i]||0,n2=v2[i]||0;if(n1>n2)return!0;if(n1<n2)return!1}return!1}
cU();

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


// ======================================================
// --- KURONAI ENGINE: SECURE 120FPS BYPASS (LOCAL) ---
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openBypassBtn");
    const closeBtn = document.getElementById("closeBypassBtn");
    const overlay = document.getElementById("bypass-overlay");
    const uploadCard = document.getElementById("uploadCard");
    const fileInput = document.getElementById("bypassFileInput");
    const startBtn = document.getElementById("startBypassBtn");
    const consoleArea = document.getElementById("b-console");
    
    let selectedFile = null;
    let isTyping = false;

    // Terminal Yazı Sistemi
    async function bLog(message, type="normal") {
        const cursor = document.getElementById("bp-cursor");
        while(isTyping) await new Promise(r => setTimeout(r, 50));
        isTyping = true;
        if(cursor && consoleArea) consoleArea.removeChild(cursor);
        const line = document.createElement("span");
        if (consoleArea) {
            consoleArea.appendChild(document.createElement("br"));
            consoleArea.appendChild(document.createTextNode("> "));
            consoleArea.appendChild(line);
        }
        for(let char of message) {
            line.innerHTML += char;
            if (consoleArea) consoleArea.scrollTop = consoleArea.scrollHeight;
            await new Promise(r => setTimeout(r, 10));
        }
        if(type === "highlight") line.className = "hl";
        if(type === "success") line.className = "suc";
        if(type === "error") line.className = "err";
        const newCursor = document.createElement("span");
        newCursor.id = "bp-cursor";
        newCursor.className = "bp-cursor";
        if (consoleArea) consoleArea.appendChild(newCursor);
        isTyping = false;
    }

    if(openBtn) {
        openBtn.addEventListener("click", () => {
            overlay.style.display = "flex";
            setTimeout(() => overlay.style.opacity = "1", 10);
        });
    }
    
    if(closeBtn) {
        closeBtn.addEventListener("click", () => {
            overlay.style.opacity = "0";
            setTimeout(() => overlay.style.display = "none", 400);
        });
    }

    if(uploadCard) uploadCard.addEventListener("click", () => fileInput.click());

    // Binary FPS Okuyucu
    async function extractRealFPS(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const buffer = e.target.result;
                const view = new DataView(buffer);
                const uint8 = new Uint8Array(buffer);
                try {
                    const videMagic = [0x76, 0x69, 0x64, 0x65]; 
                    const stszMagic = [0x73, 0x74, 0x73, 0x7A]; 
                    let videIndex = -1;
                    for (let i = 0; i < uint8.length - 4; i++) {
                        if (uint8[i] === videMagic[0] && uint8[i+1] === videMagic[1] && uint8[i+2] === videMagic[2] && uint8[i+3] === videMagic[3]) {
                            videIndex = i; break;
                        }
                    }
                    if (videIndex !== -1) {
                        for (let i = videIndex; i < uint8.length - 4; i++) {
                            if (uint8[i] === stszMagic[0] && uint8[i+1] === stszMagic[1] && uint8[i+2] === stszMagic[2] && uint8[i+3] === stszMagic[3]) {
                                const totalFrames = view.getUint32(i + 12);
                                resolve(totalFrames); return;
                            }
                        }
                    }
                    resolve(null);
                } catch (err) { resolve(null); }
            };
            reader.readAsArrayBuffer(file.slice(0, 1024 * 1024 * 150));
        });
    }

    if(fileInput) {
        fileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if(!file) return;
            selectedFile = file;
            let name = file.name;
            if (name.length > 20) name = name.substring(0, 17) + "...";
            document.getElementById("uploadText").innerText = name;
            uploadCard.style.borderColor = "#25F4EE";
            document.getElementById("up-icon").style.filter = "drop-shadow(0 0 5px #25F4EE)";
            await bLog("Analyzing video binary structure...", "normal");
            const totalFrames = await extractRealFPS(file);
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                const bitrate = video.duration > 0 ? ((file.size * 8) / video.duration / 1000000).toFixed(2) : 0;
                let fps = "---";
                if (totalFrames && video.duration > 0) fps = Math.round(totalFrames / video.duration);
                document.getElementById("b-res").innerText = `${video.videoWidth}x${video.videoHeight}`;
                document.getElementById("b-size").innerText = `${sizeMB} MB`;
                document.getElementById("b-bitrate").innerText = `${bitrate} Mbps`;
                document.getElementById("b-fps").innerText = `${fps} FPS`; 
                startBtn.disabled = false;
                startBtn.className = "bp-btn ready";
                bLog(`Target acquired: ${name}`, "highlight");
                bLog(`Resolution: ${video.videoWidth}x${video.videoHeight} | FPS: ${fps}`, "highlight");
            };
            video.src = URL.createObjectURL(file);
        });
    }

    // --- LOCAL MODE: Bypass engine tanpa fetch ke cloud ---
    if(startBtn) {
        startBtn.addEventListener("click", async () => {
            if(!selectedFile) return;
            startBtn.disabled = true;
            startBtn.className = "bp-btn";
            startBtn.innerText = "INITIALIZING LOCAL ENGINE...";
            await bLog("Starting local bypass engine...", "normal");

            try {
                // LOCAL MODE: Payload lokal, tidak perlu fetch ke server
                const LOCAL_PAYLOAD = 0x00010000; // Standard elst media rate payload
                
                await bLog("Local payload ready.", "success");
                startBtn.innerText = "INJECTING PAYLOAD...";
                await bLog("Injecting binary payload...", "normal");

                const buffer = await selectedFile.arrayBuffer();
                const dataView = new DataView(buffer);
                const uint8 = new Uint8Array(buffer);
                const elst = [0x65, 0x6C, 0x73, 0x74]; 
                
                let index = -1;
                for (let i = 0; i < uint8.length - 4; i++) {
                    if (uint8[i] === elst[0] && uint8[i+1] === elst[1] && uint8[i+2] === elst[2] && uint8[i+3] === elst[3]) {
                        index = i; break;
                    }
                }

                if (index === -1) throw new Error("'elst' atom not found!");

                // Gunakan payload lokal
                dataView.setUint32(index + 8, LOCAL_PAYLOAD, false); 

                const blob = new Blob([buffer], { type: selectedFile.type });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${selectedFile.name.replace(/\.[^/.]+$/, "")}_kuronai_bypass.mp4`;
                a.click();

                startBtn.style.background = "linear-gradient(90deg, #FE2C55, #d9183d)";
                startBtn.style.color = "#fff";
                startBtn.innerText = "BYPASS SUCCESSFUL";
                startBtn.style.boxShadow = "0 0 15px rgba(254, 44, 85, 0.4)";
                await bLog("Bypass payload successfully injected!", "success");

            } catch (error) {
                await bLog("Fatal Error: " + error.message, "error");
                startBtn.innerText = "ERROR! RETRY";
                startBtn.disabled = false;
                startBtn.className = "bp-btn ready";
            }
        });
    }
});