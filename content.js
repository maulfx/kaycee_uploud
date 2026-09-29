let isInjected = false; 
function checkAndInjectInfo() {
    if (isInjected) return; 

    const currentUrl = window.location.href;
    if (currentUrl.includes('/upload') || currentUrl.includes('/creator-center') || currentUrl.includes('/tiktokstudio') || currentUrl.includes('/creator')) {
        injectScript();
        isInjected = true;
    }
}

// --- LOCAL MODE: Skip ban check, langsung init ---
checkAndInjectInfo();

const urlObserver = new MutationObserver(() => {
    checkAndInjectInfo();
    autoEnableHighQualitySwitch();
});

const targetNode = document.body || document.documentElement;
if (targetNode) {
    urlObserver.observe(targetNode, { childList: true, subtree: true });
}

// Otomatis aktifkan toggle "Allow high quality uploads" di antarmuka TikTok jika ada
function autoEnableHighQualitySwitch() {
    try {
        const currentUrl = window.location.href;
        if (!currentUrl.includes('/upload') && !currentUrl.includes('/creator-center') && !currentUrl.includes('/tiktokstudio') && !currentUrl.includes('/creator')) {
            return;
        }

        const switches = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
        switches.forEach(el => {
            const container = el.closest('div[class*="switch"], div[class*="item"], div[class*="row"], label') || el.parentElement;
            if (container && container.textContent) {
                const text = container.textContent.toLowerCase();
                if (text.includes('high quality') || text.includes('berkualitas tinggi') || text.includes('yüksek kaliteli')) {
                    const isChecked = el.checked || el.getAttribute('aria-checked') === 'true';
                    if (!isChecked) {
                        el.click();
                        console.log("[Kaycee :3] Auto-enabled High Quality Uploads switch on TikTok!");
                    }
                }
            }
        });
    } catch (e) {}
}
setInterval(autoEnableHighQualitySwitch, 2500);

if (document.readyState === "loading") { 
    document.addEventListener("DOMContentLoaded", addBadgeToPage); 
} else { 
    addBadgeToPage(); 
}


function injectScript() {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = function() { this.remove(); };
    (document.head || document.documentElement).appendChild(s);
}


function showBanOverlay(reason) {
    const currentBadge = document.getElementById('kuronai-badge');
    if (currentBadge) {
        currentBadge.style.transition = "all 0.5s ease";
        currentBadge.style.opacity = "0";
        currentBadge.style.transform = "translateY(30px)";

        setTimeout(() => {
            currentBadge.remove();
        }, 500);
    }


    setTimeout(() => {

        if (document.getElementById('kuronai-ban-notification')) return;

        const reasonText = reason || "Kaycee :3 Sistem Politikası ve Veri İşleme Protokolü ihlali tespit edildi. Erişim süresiz olarak durdurulmuştur.";
        const titleText = "SYSTEM BLOCKED";

        const div = document.createElement('div');
        div.id = "kuronai-ban-notification";
        

        div.innerHTML = `
            <div class="kuronai-ban-box">
                <div class="k-ban-icon-wrap">
                    <svg viewBox="0 0 24 24" class="k-ban-icon">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                </div>
                <div class="k-ban-text-content">
                    <h3 class="k-ban-title">${titleText}</h3>
                    <p class="k-ban-desc">${reasonText}</p>
                </div>
            </div>

            <style>
                /* Ban kutusu animasyonlu giriş */
                .kuronai-ban-box {
                    position: fixed; 
                    bottom: 30px; 
                    right: 30px; 
                    z-index: 2147483647;
                    background: rgba(20, 5, 5, 0.95); 
                    border: 1px solid rgba(254, 44, 85, 0.6);
                    padding: 16px 24px; 
                    border-radius: 12px; 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    box-shadow: 0 10px 40px rgba(254, 44, 85, 0.3), inset 0 0 15px rgba(254, 44, 85, 0.1); 
                    backdrop-filter: blur(10px);
                    display: flex; 
                    align-items: center; 
                    gap: 16px; 
                    
                    /* Görünmez başlar, animasyonla gelir */
                    opacity: 0;
                    transform: translateY(20px);
                    animation: banBoxFadeIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    
                    max-width: 320px;
                    pointer-events: auto; /* Buna tıklanabilsin */
                }

                @keyframes banBoxFadeIn {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .k-ban-icon-wrap {
                    width: 44px; 
                    height: 44px; 
                    border-radius: 50%; 
                    border: 2px solid #FE2C55;
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    background: rgba(254, 44, 85, 0.15);
                    box-shadow: 0 0 15px rgba(254, 44, 85, 0.4);
                    flex-shrink: 0;
                    animation: pulseBanIcon 2s infinite;
                }

                .k-ban-icon {
                    width: 22px; 
                    height: 22px; 
                    fill: #FE2C55;
                }

                @keyframes pulseBanIcon {
                    0% { box-shadow: 0 0 0 0 rgba(254, 44, 85, 0.5); }
                    70% { box-shadow: 0 0 0 10px rgba(254, 44, 85, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(254, 44, 85, 0); }
                }

                .k-ban-text-content {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .k-ban-title {
                    margin: 0 0 4px 0; 
                    font-size: 14px; 
                    color: #FE2C55; 
                    font-weight: 800; 
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    text-shadow: 0 0 8px rgba(254, 44, 85, 0.4);
                }

                .k-ban-desc {
                    margin: 0; 
                    font-size: 11px; 
                    color: #e0e0e0;
                    line-height: 1.4;
                    opacity: 0.9;
                }
            </style>
        `;
        document.body.appendChild(div);

    }, 400);
}


function addBadgeToPage() {
    if (document.getElementById('kuronai-badge')) return;

    if (!document.body) {
        document.addEventListener('DOMContentLoaded', addBadgeToPage);
        return;
    }

    if (!document.getElementById('k-badge-style')) {
        const style = document.createElement('style');
        style.id = 'k-badge-style';
        style.textContent = `
            /* Ana Konteyner */
            .k-badge-container { 
                position: fixed; 
                bottom: 25px; 
                right: 25px; 
                z-index: 2147483647; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; 
                user-select: none; 
                opacity: 0; 
                transform: translateY(16px); 
                transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
                cursor: default; 
                pointer-events: auto;
            }
            .k-badge-container.visible { 
                opacity: 1; 
                transform: translateY(0); 
            }
            
            /* LIQUID GLASS - ULTRA TRANSPARENT (NOT SOLID BLACK) */
            .k-content { 
                background: rgba(22, 10, 36, 0.28) !important; 
                backdrop-filter: blur(24px) saturate(200%) !important; 
                -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
                border: 1px solid rgba(255, 255, 255, 0.24) !important; 
                padding: 7px 16px 7px 12px; 
                border-radius: 9999px; 
                display: inline-flex; 
                align-items: center; 
                gap: 8px; 
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16), 
                            inset 0 1px 1.5px rgba(255, 255, 255, 0.45),
                            inset 0 -1px 1px rgba(0, 0, 0, 0.1) !important; 
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .k-content:hover { 
                background: rgba(22, 10, 36, 0.38) !important; 
                border-color: rgba(255, 255, 255, 0.45) !important; 
                box-shadow: 0 10px 36px rgba(0, 0, 0, 0.22), 
                            inset 0 1px 1.5px rgba(255, 255, 255, 0.65) !important;
                transform: translateY(-1px);
            }

            /* LIGHT MODE SUPPORT */
            .k-content.light-mode {
                background: rgba(255, 255, 255, 0.38) !important;
                border-color: rgba(255, 255, 255, 0.7) !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.95) !important;
            }
            .k-content.light-mode .k-enhance-title { 
                color: #1e1b4b !important; 
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8) !important;
            }

            .k-enhance-title { 
                font-size: 13px; 
                font-weight: 700; 
                color: #ffffff; 
                letter-spacing: 0.3px; 
                white-space: nowrap; 
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
                line-height: 1;
            }
            
            /* STATUS GLOWING DOT */
            .k-dot { 
                width: 8px; 
                height: 8px; 
                flex-shrink: 0;
                border-radius: 50%; 
                background-color: #25F4EE; 
                box-shadow: 0 0 10px #25F4EE, 0 0 4px rgba(37, 244, 238, 0.9); 
                transition: all 0.3s ease; 
            }

            .k-badge-container.ready .k-dot { 
                background-color: #10b981; 
                box-shadow: 0 0 10px #10b981, 0 0 4px rgba(16, 185, 129, 0.9); 
            }
            
            .k-badge-container.active .k-dot { 
                background-color: #25F4EE; 
                box-shadow: 0 0 14px #25F4EE, 0 0 5px rgba(37, 244, 238, 0.95); 
                animation: kPulseDot 1.8s infinite ease-in-out; 
            }

            .k-badge-container.active .k-content { 
                border-color: rgba(37, 244, 238, 0.45) !important; 
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 0 20px rgba(37, 244, 238, 0.25), inset 0 1px 1.5px rgba(255, 255, 255, 0.5) !important;
            }
            
            @keyframes kPulseDot { 
                0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 10px #25F4EE; } 
                50% { transform: scale(1.25); opacity: 0.8; box-shadow: 0 0 18px #25F4EE, 0 0 28px rgba(37, 244, 238, 0.45); } 
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    chrome.storage.local.get(['theme'], function(result) {
        if (!document.body || document.getElementById('kuronai-badge')) return;

        const theme = result.theme || 'dark';
        const lightClass = (theme === 'light') ? 'light-mode' : '';

        const overlayHTML = `
        <div id="kuronai-badge" class="k-badge-container">
            <div class="k-content ${lightClass}">
                <div id="k-indicator-dot" class="k-dot"></div>
                <span id="k-status-text" class="k-enhance-title">Kaycee Enhance</span>
            </div>
        </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = overlayHTML;
        const badgeEl = div.firstElementChild || div;
        document.body.appendChild(badgeEl);

        try { localStorage.removeItem('kuronai_badge_minimized'); } catch(e){}

        setTimeout(() => {
            const badge = document.getElementById('kuronai-badge');
            if (badge) {
                badge.classList.add('visible');
                badge.classList.add('ready');
            }
        }, 300);
    });
}


const hdStyles = document.createElement('style');
hdStyles.textContent = `
    /* --- 1. HD BUTONU (SIDEBAR) --- */
    .kuronai-hd-btn {
        margin-top: 12px; 
        cursor: pointer; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center;
        z-index: 999;
        flex-shrink: 0; 
        width: 48px; 
        group: hd-group; /* Hover grubu */
    }

    .kuronai-hd-icon {
        width: 44px; 
        height: 44px; 
        border-radius: 50%; 
        
        /* Glassmorphism Efekti */
        background: rgba(22, 24, 35, 0.4); 
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        
        display: flex; 
        align-items: center; 
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
    }

    /* İkonun Kendisi (SVG) */
    .kuronai-hd-icon svg {
        width: 24px; 
        height: 24px; 
        fill: #e1e1e1; /* Normalde beyazımsı gri */
        transition: fill 0.3s;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    /* HOVER (Üzerine Gelince) */
    .kuronai-hd-btn:hover .kuronai-hd-icon {
        background: rgba(37, 244, 238, 0.15); /* Hafif Turkuaz Arka Plan */
        border-color: #25F4EE; /* Turkuaz Kenarlık */
        box-shadow: 0 0 15px rgba(37, 244, 238, 0.4); /* Neon Parlama */
        transform: scale(1.1); /* Hafif Büyüme */
    }

    .kuronai-hd-btn:hover .kuronai-hd-icon svg {
        fill: #25F4EE; /* İkon Rengi Turkuaz Olsun */
        filter: drop-shadow(0 0 5px rgba(37, 244, 238, 0.8));
    }

    /* HD Yazısı */
    .kuronai-hd-text {
        font-family: 'SofiaPro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px; 
        color: rgba(255,255,255,0.8); 
        margin-top: 4px; 
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        transition: color 0.3s;
    }
    .kuronai-hd-btn:hover .kuronai-hd-text {
        color: #25F4EE;
    }


    #kuronai-hd-overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: #000; z-index: 9999; display: flex; align-items: center; justify-content: center;
    }
    

    .k-modern-close {
        position: absolute; top: 20px; right: 20px; z-index: 10000;
        width: 36px; height: 36px;
        

        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .k-modern-close svg {
        width: 18px; height: 18px;
        fill: #fff;
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .k-modern-close:hover {
        background: rgba(254, 44, 85, 0.9); /* TikTok Kırmızısı */
        border-color: #FE2C55;
        transform: rotate(90deg) scale(1.1); /* Dönme Efekti */
        box-shadow: 0 0 15px rgba(254, 44, 85, 0.6);
    }
`;
(document.head || document.documentElement).appendChild(hdStyles);

function injectHDButtons() {
    const shareButtons = document.querySelectorAll('[data-e2e="share-icon"]');

    shareButtons.forEach(icon => {

        let actionItem = icon.closest('button') || icon.parentElement.parentElement;
        let sidebar = actionItem.closest('[class*="DivActionItemContainer"]');

        if (!sidebar) {
             sidebar = actionItem.parentElement; 
        }

        if (!sidebar) return;

        if (sidebar.querySelector('.kuronai-hd-btn')) return;

        const btn = document.createElement('div');
        btn.className = 'kuronai-hd-btn';
        btn.innerHTML = `
            <div class="kuronai-hd-icon" title="HD Oynat">
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                    <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                </svg>
            </div>
            <span class="kuronai-hd-text">HD</span>
        `;
        

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            startHDMode(btn);
        });


        sidebar.appendChild(btn);
    });
}

function startHDMode(btnElement) {

    if (btnElement.getAttribute('data-loading') === 'true') return; 


    const icon = btnElement.querySelector('.kuronai-hd-icon');
    let originalIconContent = icon ? icon.innerHTML : "";
    if(icon) icon.innerHTML = `<div style="width:14px; height:14px; border:2px solid #25F4EE; border-top-color:transparent; border-radius:50%; animation:spin 1s infinite;"></div>`;
    
    btnElement.setAttribute('data-loading', 'true');
    btnElement.style.opacity = '0.7';

    let targetUrl = null;
    const currentUrl = window.location.href;
    if (currentUrl.includes('/video/') && !currentUrl.includes('/foryou') && !currentUrl.includes('/live')) {
        targetUrl = currentUrl.split('?')[0];
    } 
    else {
        
        let videoContainer = btnElement.closest('[data-e2e="feed-video"]');
        
        if (!videoContainer) {
            videoContainer = btnElement.closest('[class*="DivVideoPlayerContainer"]') || 
                             btnElement.parentElement.parentElement.parentElement;
        }

        if (videoContainer) {
            const wrapper = videoContainer.querySelector('[id^="xgwrapper"]');
            if (wrapper) {
                const parts = wrapper.id.split('-');
                const potentialID = parts[parts.length - 1];
                if (/^\d{15,30}$/.test(potentialID)) {
                    targetUrl = `https://www.tiktok.com/video/${potentialID}`;
                }
            }
            
            if (!targetUrl) {
                const timestampLink = videoContainer.querySelector('a[href*="/video/"]');
                if (timestampLink && !timestampLink.href.includes('random')) {
                    targetUrl = timestampLink.href;
                }
            }
        }
    }

    if (!targetUrl) {
        alert("Hedef video tespit edilemedi. (Sayfa yapısı değişmiş olabilir)");
        resetBtn();
        return;
    }
    let overlayContainer = btnElement.closest('[data-e2e="feed-video"]') || 
                           btnElement.closest('[class*="DivVideoPlayerContainer"]') || 
                           btnElement.closest('[class*="DivContentContainer"]');
                           
    if (!overlayContainer) {
         overlayContainer = btnElement.closest('div[class*="DivMainContainer"]') || document.body;
    }
    
    const originalVideo = overlayContainer.querySelector('video');

    console.log("📡 HD İsteği Gönderiliyor:", targetUrl);

    chrome.runtime.sendMessage({ action: "FETCH_HD_VIDEO", url: targetUrl }, (response) => {
        resetBtn();

        if (response && response.success && response.data && response.data.playUrl) {
            let finalContainer = overlayContainer;
            if(originalVideo && originalVideo.parentElement) {
                finalContainer = originalVideo.parentElement.parentElement || originalVideo.parentElement;
            }
            
            enableHDOverlay(finalContainer, originalVideo, response.data.playUrl);
        } else {
            console.error("API Hatası:", response);
            alert("HD kaynak alınamadı.");
        }
    });

    function resetBtn() {
        btnElement.setAttribute('data-loading', 'false');
        btnElement.style.opacity = '1';
        if(icon) icon.innerHTML = originalIconContent;
    }
}


function startApp() {
    injectHDButtons();
    setInterval(() => {
        injectHDButtons();
    }, 1500);

}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

function enableHDOverlay(container, originalVideo, videoData) {
    let srcMain = (typeof videoData === 'object') ? videoData.playUrl : videoData;
    let targetWrapper = originalVideo.closest('div[class*="DivBasicPlayerWrapper"]');
    if (!targetWrapper) targetWrapper = originalVideo.parentElement;
    let parentContainer = targetWrapper.parentElement;
    Array.from(targetWrapper.children).forEach(child => {
        child.style.visibility = 'hidden'; 
    });
    targetWrapper.style.position = 'relative';

    let hiddenSiblings = []; 
    if (parentContainer) {
        Array.from(parentContainer.children).forEach(sibling => {
            if (sibling !== targetWrapper && (sibling.querySelector('picture') || sibling.querySelector('img') || sibling.getAttribute('mode') === '0')) {
                sibling.style.display = 'none';
                hiddenSiblings.push(sibling);
            }
        });
    }

    const overlay = document.createElement('div');
    overlay.id = 'kuronai-hd-overlay';

    Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '1', 
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        visibility: 'visible' 
    });
    
    overlay.innerHTML = `
        <iframe src="${srcMain}" 
                style="width: 100%; height: 100%; border: none;" 
                allow="autoplay; fullscreen; picture-in-picture"
                referrerpolicy="no-referrer">
        </iframe>
        
        <button id="kuronai-close-hd" class="k-modern-close" title="HD Modu Kapat">
            <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        </button>
    `;
    targetWrapper.appendChild(overlay);
    if(originalVideo) {
        originalVideo.muted = true;
        originalVideo.pause();
    }

    const closeBtn = overlay.querySelector('#kuronai-close-hd');
    
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.remove();

        Array.from(targetWrapper.children).forEach(child => {
            child.style.visibility = 'visible';
        });

        hiddenSiblings.forEach(el => el.style.display = '');

        if (originalVideo) {
            originalVideo.muted = false;
        }
    });
}

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

// --- AUTO-DETECT TIKTOK LOGGED-IN ACCOUNT ---
async function detectTikTokUser() {
    let username = null;
    let avatar = null;

    try {
        // 1. Cek __UNIVERSAL_DATA_FOR_REHYDRATION__ (paling akurat pada web TikTok modern)
        const rehydrateEl = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
        if (rehydrateEl && rehydrateEl.textContent) {
            try {
                const parsed = JSON.parse(rehydrateEl.textContent);
                const userObj = parsed?.__DEFAULT_SCOPE__?.['webapp.app-context']?.user;
                if (userObj) {
                    if (userObj.uniqueId) username = '@' + userObj.uniqueId;
                    else if (userObj.nickname) username = '@' + userObj.nickname;
                    
                    const av = userObj.avatarLarger || userObj.avatarMedium || userObj.avatarThumb || null;
                    if (av && !isDefaultOrPassportAvatar(av)) {
                        avatar = av;
                    }
                }
            } catch (e) {}
        }

        // 2. Cek SIGI_STATE
        if (!avatar || !username) {
            const sigiEl = document.getElementById('SIGI_STATE');
            if (sigiEl && sigiEl.textContent) {
                try {
                    const parsed = JSON.parse(sigiEl.textContent);
                    const userObj = parsed?.AppContext?.user;
                    if (userObj) {
                        if (!username && userObj.uniqueId) username = '@' + userObj.uniqueId;
                        if (!avatar && userObj.avatarLarger && !isDefaultOrPassportAvatar(userObj.avatarLarger)) {
                            avatar = userObj.avatarLarger;
                        }
                    }
                } catch (e) {}
            }
        }

        // 3. Cek Gambar Avatar asli di DOM halaman (Header, Navigasi, Creator Studio, Profile Icon)
        if (!avatar) {
            const imgSelectors = [
                '[data-e2e="profile-icon"] img',
                'a[data-e2e="nav-profile"] img',
                '[data-e2e="user-avatar"] img',
                'header a[href*="/@"] img',
                'nav a[href*="/@"] img',
                'aside a[href*="/@"] img',
                '[class*="header"] [class*="avatar" i] img',
                '[class*="creator-header"] [class*="avatar" i] img',
                '[class*="navbar"] [class*="avatar" i] img',
                '[class*="user-icon"] img',
                '[class*="user-avatar"] img',
                'img[class*="avatar" i]',
                'img[class*="Avatar" i]',
                'header img[src*="tiktokcdn"]',
                'nav img[src*="tiktokcdn"]'
            ];

            for (const s of imgSelectors) {
                const img = document.querySelector(s);
                if (img) {
                    const src = img.currentSrc || img.src || img.getAttribute('src');
                    if (src && (src.includes('tiktokcdn') || src.includes('tos-') || src.includes('avt-')) && !isDefaultOrPassportAvatar(src)) {
                        avatar = src;
                        break;
                    }
                }
            }

            if (!avatar) {
                const bgEls = document.querySelectorAll('[style*="background-image"], [data-e2e="profile-icon"], [class*="avatar" i]');
                for (const b of bgEls) {
                    const st = b.getAttribute('style') || b.style?.backgroundImage || '';
                    const match = st.match(/url\(["']?(https:\/\/[^"'\)]*(?:tiktokcdn|tos-|avt-)[^"'\)]*)["']?\)/i);
                    if (match && match[1] && !isDefaultOrPassportAvatar(match[1])) {
                        avatar = match[1];
                        break;
                    }
                }
            }
        }

        // 4. Deteksi username dari navigasi jika belum dapat
        if (!username) {
            const profileSelectors = [
                'a[data-e2e="nav-profile"]',
                'a[data-e2e="profile-icon"]',
                'a.TUXMenuItem[href*="/@"]',
                'a[href^="/@"]',
                'a[href*="/@"]'
            ];
            for (const sel of profileSelectors) {
                const el = document.querySelector(sel);
                if (el) {
                    const href = el.getAttribute('href') || '';
                    const match = href.match(/@([\w.-]+)/);
                    if (match && match[1]) {
                        username = '@' + match[1];
                        break;
                    }
                }
            }
        }

        // 5. Jika username diketahui tapi avatar belum didapat, lakukan same-origin fetch profil HTML
        if (username && !avatar) {
            try {
                const cleanU = username.replace('@', '').trim();
                const profileRes = await fetch(`/@${cleanU}`, { credentials: 'include' });
                if (profileRes.ok) {
                    const html = await profileRes.text();
                    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
                    const jsonMatch = html.match(/"avatarLarger":"([^"]+)"/) || html.match(/"avatarMedium":"([^"]+)"/);
                    if (ogMatch && ogMatch[1] && !isDefaultOrPassportAvatar(ogMatch[1])) {
                        avatar = ogMatch[1];
                    } else if (jsonMatch && jsonMatch[1]) {
                        const parsedAv = jsonMatch[1].replace(/\\u002F/g, '/');
                        if (!isDefaultOrPassportAvatar(parsedAv)) {
                            avatar = parsedAv;
                        }
                    }
                }
            } catch(e) {}
        }

        // 6. Passport endpoint HANYA untuk username fallback jika belum ketemu
        if (!username) {
            try {
                const res = await fetch("https://www.tiktok.com/passport/web/account/info/", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.data) {
                        const u = data.data.username || data.data.unique_id || data.data.screen_name;
                        if (u) username = u.startsWith('@') ? u : ('@' + u);
                    }
                }
            } catch (e) {}
        }

        // Simpan ke storage jika berhasil dideteksi
        if (username) {
            chrome.storage.local.set({
                'kuronai_username': username,
                'kuronai_avatar': avatar || ''
            });
            return { username, avatar };
        }
    } catch (err) {
        console.warn("Kaycee :3 user detect error:", err);
    }
    return null;
}

// Jalankan deteksi otomatis saat halaman TikTok aktif
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(detectTikTokUser, 1500);
    });
} else {
    setTimeout(detectTikTokUser, 1500);
}

// Dengarkan pesan dari popup untuk request user info
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_ACTIVE_TIKTOK_USER" || request.action === "GET_TIKTOK_USER") {
        detectTikTokUser().then(userInfo => {
            if (userInfo && userInfo.username) {
                sendResponse({ success: true, username: userInfo.username, avatar: userInfo.avatar });
            } else {
                sendResponse({ success: false });
            }
        });
        return true;
    }
});
