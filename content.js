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
    const currentUrl = window.location.href;
    if (!currentUrl.includes('/upload') && !currentUrl.includes('/creator-center') && !currentUrl.includes('/tiktokstudio') && !currentUrl.includes('/creator')) {
        return;
    }

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
    if (!url || typeof url !== 'string') return true;
    if (url.startsWith('data:image/') || url.startsWith('chrome-extension://') || url.startsWith('icons/')) return false;
    const l = url.toLowerCase();
    return l.includes('user-avatar-default') || 
           l.includes('avatar_default') || 
           l.includes('default-avatar') || 
           l.includes('/letter_') ||
           (l.includes('tiktokcdn') && (l.includes('default') || l.includes('avatar_none')));
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
                '[class*="account-info"] img',
                '[class*="user-card"] img',
                '[class*="user-info"] img',
                '[class*="studio-header"] img',
                '[class*="studio-avatar"] img',
                'img[src*="avt-"]',
                'img[src*="/avatar"]',
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
                const bgEls = document.querySelectorAll('[style*="background-image"], [data-e2e="profile-icon"], [class*="avatar" i], [class*="account" i], [class*="profile" i]');
                for (const b of bgEls) {
                    const st = b.getAttribute('style') || b.style?.backgroundImage || '';
                    const match = st.match(/url\(["']?(https:\/\/[^"'\)]*(?:tiktokcdn|tos-|avt-|byte)[^"'\)]*)["']?\)/i);
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
                'a[href*="/@"]',
                '[class*="user-name"]',
                '[class*="username"]',
                '[class*="account-name"]'
            ];
            for (const sel of profileSelectors) {
                const el = document.querySelector(sel);
                if (el) {
                    const href = el.getAttribute('href') || el.innerText || '';
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

        // 6. Passport endpoint untuk username dan avatar
        if (!username || !avatar) {
            try {
                const res = await fetch("/passport/web/account/info/", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.data) {
                        if (!username) {
                            const u = data.data.username || data.data.unique_id || data.data.screen_name;
                            if (u) username = u.startsWith('@') ? u : ('@' + u);
                        }
                        if (!avatar) {
                            const candidate = data.data.avatar_large?.url_list?.[0] ||
                                              data.data.avatar_medium?.url_list?.[0] ||
                                              data.data.avatar_thumb?.url_list?.[0] ||
                                              data.data.avatar_url ||
                                              data.data.user_avatar ||
                                              data.data.avatar;
                            if (candidate && !isDefaultOrPassportAvatar(candidate)) {
                                avatar = candidate;
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        // 7. Cek creator user info endpoint di TikTok Studio
        if (!avatar) {
            try {
                const res = await fetch("/api/v1/web/creator/user/info/", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    const av = data?.data?.user?.avatar_larger || data?.data?.user?.avatar_url || data?.data?.avatar_url || data?.data?.avatar;
                    if (av && !isDefaultOrPassportAvatar(av)) {
                        avatar = av;
                    }
                }
            } catch(e) {}
        }

        // 8. Cek user detail API berdasarkan username
        if (username && !avatar) {
            try {
                const cleanU = username.replace('@', '').trim();
                const res = await fetch(`/api/user/detail/?uniqueId=${encodeURIComponent(cleanU)}`, { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    const uObj = data?.userInfo?.user;
                    if (uObj) {
                        const av = uObj.avatarLarger || uObj.avatarMedium || uObj.avatarThumb;
                        if (av && !isDefaultOrPassportAvatar(av)) {
                            avatar = av;
                        }
                    }
                }
            } catch(e) {}
        }

        // 9. Cek script tags pada halaman TikTok Studio (rehydration/Next.js data)
        if (!avatar) {
            try {
                for (const script of document.querySelectorAll('script')) {
                    const text = script.textContent || '';
                    if (text.length > 50 && (text.includes('avatarLarger') || text.includes('avatar_url') || text.includes('tos-alisg-avt') || text.includes('tos-maliva-avt'))) {
                        const m = text.match(/https:\/\/[^"'\s\\]*(?:tiktokcdn|tos-[^"'\s\\]*avt|byteimg)[^"'\s\\]*/);
                        if (m && !isDefaultOrPassportAvatar(m[0])) {
                            avatar = m[0].replace(/\\u002F/g, '/');
                            break;
                        }
                    }
                }
            } catch(e) {}
        }

        // 10. Jika username masih kosong, ambil username yang sudah tersimpan di cache
        if (!username) {
            try {
                const storedU = await new Promise(r => chrome.storage.local.get(['kuronai_username'], r));
                if (storedU && storedU.kuronai_username) username = storedU.kuronai_username;
            } catch(e) {}
        }

        // 11. Jika avatar belum ditemukan di halaman saat ini (misalnya di Upload/Creator page),
        // 11. Jika avatar belum ditemukan di halaman saat ini (misalnya di TikTok Studio / Creator page),
        // gunakan avatar yang sudah tersimpan di cache lokal ekstensi
        if (!avatar) {
            try {
                const stored = await new Promise(r => chrome.storage.local.get(['kuronai_avatar', 'kuronai_username', 'kuronai_avatar_cache'], r));
                const cleanU = (username || stored?.kuronai_username || '').replace('@', '').toLowerCase().trim();
                const cached = (cleanU && stored?.kuronai_avatar_cache?.[cleanU]) || stored?.kuronai_avatar;
                if (cached && !isDefaultOrPassportAvatar(cached)) {
                    avatar = cached;
                }
            } catch (e) {}
        }

        // Simpan ke storage jika berhasil dideteksi (JANGAN pernah hapus cache yang sudah tersimpan)
        const dataToSet = {};
        if (username) {
            dataToSet['kuronai_username'] = username;
        }
        if (avatar && !isDefaultOrPassportAvatar(avatar)) {
            dataToSet['kuronai_avatar'] = avatar;
            // Kirim ke background untuk dikonversi ke Base64 agar tersimpan permanen
            chrome.runtime.sendMessage({
                action: "CACHE_USER_AVATAR",
                username: username,
                avatar: avatar
            });
        }
        if (Object.keys(dataToSet).length > 0) {
            chrome.storage.local.set(dataToSet);
        }

        return { username: username || '', avatar: avatar || '' };
    } catch (err) {
        console.warn("Kaycee Studio user detect error:", err);
    }
    return { username: '', avatar: '' };
}

// Jalankan deteksi otomatis saat halaman TikTok aktif
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(detectTikTokUser, 1500);
    });
} else {
    setTimeout(detectTikTokUser, 1500);
}

// --- PELACAKAN VIDEO AKTIF DI TIKTOK (TERMASUK HALAMAN FOR YOU / FEED) ---
let lastActiveVideo = null;
let lastActiveContainer = null;
let lastActiveTimestamp = 0;

function trackVideoEvent(e) {
    if (e.target && e.target.tagName === 'VIDEO') {
        lastActiveVideo = e.target;
        lastActiveContainer = e.target.closest('[data-e2e="feed-item"], [data-e2e="recommend-list-item-container"], div[class*="ItemContainer"], div[class*="DivItemContainer"], section, article') || e.target.parentElement;
        lastActiveTimestamp = Date.now();
    }
}

document.addEventListener('play', trackVideoEvent, true);
document.addEventListener('playing', trackVideoEvent, true);
document.addEventListener('timeupdate', (e) => {
    if (e.target && e.target.tagName === 'VIDEO' && !e.target.paused) {
        trackVideoEvent(e);
    }
}, true);

// Dengarkan pesan dari popup untuk request user info & active video detection
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_ACTIVE_TIKTOK_USER" || request.action === "GET_TIKTOK_USER") {
        detectTikTokUser().then(userInfo => {
            sendResponse({
                success: true,
                username: userInfo?.username || '',
                avatar: userInfo?.avatar || ''
            });
        });
        return true;
    }

    if (request.action === "GET_CURRENT_PLAYING_VIDEO") {
        try {
            const currentUrl = window.location.href;
            const videoMatch = currentUrl.match(/@([\w.-]+)\/video\/(\d+)/);

            const videos = Array.from(document.querySelectorAll('video'));
            let activeVideo = videos.find(v => !v.paused && v.currentTime > 0);

            // Jika video sedang ter-pause (karena popup dibuka), gunakan video terakhir yang dimainkan
            if (!activeVideo && lastActiveVideo && document.body.contains(lastActiveVideo)) {
                activeVideo = lastActiveVideo;
            }

            // Jika masih belum ada, cari video yang paling tengah di viewport (tampilan layar)
            if (!activeVideo && videos.length > 0) {
                const viewportCenter = window.innerHeight / 2;
                let minDistance = Infinity;
                videos.forEach(v => {
                    const rect = v.getBoundingClientRect();
                    if (rect.height > 50) {
                        const videoCenter = rect.top + rect.height / 2;
                        const dist = Math.abs(videoCenter - viewportCenter);
                        if (dist < minDistance) {
                            minDistance = dist;
                            activeVideo = v;
                        }
                    }
                });
            }

            let container = null;
            if (activeVideo) {
                container = activeVideo.closest('[data-e2e="feed-item"], [data-e2e="recommend-list-item-container"], article, section, div[class*="DivItemContainer"], div[class*="ItemContainer"], div[class*="DivContentContainer"]') || activeVideo.parentElement;
            } else if (lastActiveContainer && document.body.contains(lastActiveContainer)) {
                container = lastActiveContainer;
            }

            let videoUrl = videoMatch ? currentUrl.split('?')[0] : '';
            let soundTitle = '';
            let author = videoMatch ? ('@' + videoMatch[1]) : '';
            let caption = '';
            let videoId = videoMatch ? videoMatch[2] : '';

            if (container) {
                // 1. Ekstraksi data dari React Fiber (paling presisi pada Web TikTok modern / For You)
                try {
                    const extractFiber = (el) => {
                        if (!el) return null;
                        const key = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
                        if (!key) return null;
                        let curr = el[key];
                        for (let i = 0; i < 35 && curr; i++) {
                            const p = curr.memoizedProps;
                            if (p) {
                                const item = p.itemInfo || p.videoData || p.item || p.videoInfo || (p.video && p.video.id ? p.video : null);
                                if (item && (item.id || item.itemId)) {
                                    return {
                                        id: String(item.id || item.itemId),
                                        author: item.author ? ('@' + (item.author.uniqueId || item.author.nickname || item.author)) : '',
                                        desc: item.desc || ''
                                    };
                                }
                            }
                            curr = curr.return;
                        }
                        return null;
                    };

                    const fiberData = extractFiber(activeVideo) || extractFiber(container);
                    if (fiberData) {
                        if (fiberData.id) videoId = fiberData.id;
                        if (fiberData.author && !author) author = fiberData.author;
                        if (fiberData.desc && !caption) caption = fiberData.desc;
                    }
                } catch(e) {}

                // 2. Cari link video langsung di dalam container
                if (!videoId) {
                    const vLinks = container.querySelectorAll('a[href*="/video/"]');
                    for (const vl of vLinks) {
                        const href = vl.getAttribute('href') || vl.href || '';
                        const m = href.match(/\/video\/(\d+)/);
                        if (m && m[1]) {
                            videoId = m[1];
                            const am = href.match(/@([\w.-]+)/);
                            if (am && am[1] && !author) author = '@' + am[1];
                            break;
                        }
                    }
                }

                // 3. Cari author jika belum dapat
                if (!author) {
                    const authorEl = container.querySelector('a[data-e2e="video-author-uniqueid"], a[data-e2e="video-author-avatar"], [data-e2e="feed-author"], a[href^="/@"]');
                    if (authorEl) {
                        const href = authorEl.getAttribute('href') || '';
                        const txt = authorEl.textContent.trim();
                        const m = href.match(/@([\w.-]+)/);
                        if (m && m[1]) author = '@' + m[1];
                        else if (txt) author = txt.startsWith('@') ? txt : ('@' + txt);
                    }
                }

                // 4. Cari ID video 19 digit dari atribut player (xgwrapper-0-74..., data-id, dsb)
                if (!videoId) {
                    const idEls = container.querySelectorAll('[id*="xgwrapper"], [id*="player"], [data-id], [data-item-id]');
                    for (const el of idEls) {
                        const str = (el.id || '') + ' ' + (el.getAttribute('data-id') || '') + ' ' + (el.getAttribute('data-item-id') || '');
                        const m = str.match(/\b(7\d{18})\b/);
                        if (m && m[1]) {
                            videoId = m[1];
                            break;
                        }
                    }
                }

                // 5. Fallback regex dari outerHTML container jika ID belum ketemu
                if (!videoId && container.outerHTML) {
                    const htmlM = container.outerHTML.match(/(?:video\/|xgwrapper-\d+-|"itemId":\s*"?|"id":\s*"?)(7\d{18})/);
                    if (htmlM && htmlM[1]) {
                        videoId = htmlM[1];
                    }
                }

                // 6. Sound / Music title
                const soundEl = container.querySelector('h4[data-e2e="browse-music"], a[href*="/music/"], [class*="MusicText"], [class*="music-title"], [data-e2e="video-music"]');
                if (soundEl && soundEl.textContent) soundTitle = soundEl.textContent.trim();

                // 7. Caption / Description
                const descEl = container.querySelector('[data-e2e="browse-video-desc"], [data-e2e="video-desc"], [data-e2e="video-caption"], [class*="DivTextInfoContainer"], [class*="video-meta-caption"]');
                if (descEl && !caption) caption = descEl.innerText || descEl.textContent || '';
            }

            if (videoId && (!videoUrl || !videoUrl.includes(videoId))) {
                videoUrl = `https://www.tiktok.com/${author || '@tiktok'}/video/${videoId}`;
            }

            if (!soundTitle) {
                const pageSound = document.querySelector('h4[data-e2e="browse-music"], a[href*="/music/"], [data-e2e="video-music"]');
                if (pageSound) soundTitle = pageSound.textContent.trim();
            }

            if (!caption) {
                const pageDesc = document.querySelector('[data-e2e="browse-video-desc"], [data-e2e="video-desc"], [data-e2e="video-caption"], h1[data-e2e="video-desc"]');
                if (pageDesc) caption = pageDesc.innerText || pageDesc.textContent || '';
            }

            sendResponse({
                success: !!(videoUrl || activeVideo || videoId),
                videoUrl: videoUrl || '',
                soundTitle: soundTitle,
                author: author,
                caption: caption.trim(),
                isPlaying: activeVideo ? !activeVideo.paused : true
            });
        } catch (err) {
            sendResponse({ success: false, error: err.message });
        }
        return true;
    }
});

// ========================================================
// --- FLOATING POPUP WIDGET (Always-on in Browser) ---
// ========================================================
(function initFloatingWidget() {
    if (document.getElementById('kecho-floating-host')) return;

    const host = document.createElement('div');
    host.id = 'kecho-floating-host';
    host.style.cssText = 'all: initial; position: absolute; z-index: 2147483647;';
    const shadow = host.attachShadow({ mode: 'open' });

    const popupUrl = chrome.runtime.getURL('popup.html');

    const style = document.createElement('style');
    style.textContent = `
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
        
        .floating-avatar-btn {
            position: fixed;
            top: 24px;
            right: 24px;
            left: auto;
            bottom: auto;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            padding: 2.5px;
            background: linear-gradient(135deg, #AE7EFD, #756B5F);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55), 0 0 16px rgba(174, 126, 253, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            user-select: none;
            z-index: 2147483647;
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
            box-sizing: border-box;
            touch-action: none;
        }
        .floating-avatar-btn:active {
            cursor: grabbing;
        }
        .floating-avatar-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.65), 0 0 24px rgba(174, 126, 253, 0.75);
        }
        .floating-avatar-btn.fab-hidden {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transform: scale(0.5) !important;
        }
        .avatar-fab-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            display: block;
            pointer-events: none;
        }
        .avatar-fab-fallback {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #1B1A1B, #262224);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            font-size: 17px;
            pointer-events: none;
        }
        .avatar-fab-status-dot {
            position: absolute;
            bottom: 1px;
            right: 1px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #22c55e;
            border: 2px solid #140526;
            box-shadow: 0 0 6px #22c55e;
            pointer-events: none;
        }
        .hidden { display: none !important; }

        .floating-panel {
            position: fixed;
            top: 80px;
            right: 24px;
            width: 328px;
            height: 520px;
            border-radius: 20px;
            background: rgba(27, 26, 27, 0.96);
            border: 1px solid rgba(194, 198, 201, 0.18);
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(174, 126, 253, 0.35);
            backdrop-filter: blur(28px) saturate(180%);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 2147483647;
            opacity: 0;
            pointer-events: none;
            transform: translateY(-10px) scale(0.96);
            transform-origin: top right;
            transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .floating-panel.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) scale(1);
        }
        .floating-panel.is-dragging {
            transition: none !important;
            will-change: left, top;
            user-select: none !important;
            backdrop-filter: none !important;
            background: rgba(27, 26, 27, 0.98) !important;
        }
        .floating-panel.is-dragging iframe {
            pointer-events: none !important;
        }
        .floating-avatar-btn.is-dragging {
            transition: none !important;
            will-change: left, top;
        }

        .panel-header {
            height: 34px;
            padding: 0 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            user-select: none;
            cursor: move;
        }
        .panel-header-title {
            display: flex;
            align-items: center;
            gap: 6px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 11px;
            font-weight: 700;
        }
        .panel-close-btn {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        .panel-close-btn:hover {
            background: rgba(254, 44, 85, 0.35);
            color: #fe2c55;
        }

        .panel-iframe {
            width: 320px;
            height: 480px;
            border: none;
            border-radius: 0 0 18px 18px;
            margin: 0 auto;
            display: block;
            flex: 1;
            background: transparent;
        }
    `;

    const container = document.createElement('div');
    container.innerHTML = `
        <div class="floating-avatar-btn" id="kechoAvatarFab" title="Kaycee :3 (Klik untuk buka/tutup, geser untuk pindah)">
            <img class="avatar-fab-img" id="kechoAvatarFabImg" alt="" referrerpolicy="no-referrer">
            <div class="avatar-fab-fallback hidden" id="kechoAvatarFabFallback">K</div>
            <span class="avatar-fab-status-dot"></span>
        </div>

        <div class="floating-panel" id="kechoPanel">
            <div class="panel-header" id="kechoDragHeader">
                <div class="panel-header-title">
                    <span style="color:#AE7EFD;">✦</span> Kaycee Studio
                </div>
                <button type="button" class="panel-close-btn" id="kechoCloseBtn" title="Tutup">✕</button>
            </div>
            <iframe class="panel-iframe" src="${popupUrl}" allow="clipboard-read; clipboard-write;"></iframe>
        </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(container);

    const fab = shadow.getElementById('kechoAvatarFab');
    const fabImg = shadow.getElementById('kechoAvatarFabImg');
    const fabFallback = shadow.getElementById('kechoAvatarFabFallback');
    const panel = shadow.getElementById('kechoPanel');
    const closeBtn = shadow.getElementById('kechoCloseBtn');
    const dragHeader = shadow.getElementById('kechoDragHeader');

    // Update avatar image on floating FAB
    function setFabAvatar(avatarUrl, username) {
        const u = username || localStorage.getItem('kuronai_username') || '';

        if (!avatarUrl || isDefaultOrPassportAvatar(avatarUrl)) {
            avatarUrl = '';
        }

        if (avatarUrl && fabImg) {
            // Jika avatar yang sama sudah berhasil ditampilkan, cegah render ulang agar tidak kedip
            if (fabImg.getAttribute('data-loaded-src') === avatarUrl && !fabImg.classList.contains('hidden')) {
                return;
            }

            fabImg.onload = () => {
                fabImg.setAttribute('data-loaded-src', avatarUrl);
                fabImg.classList.remove('hidden');
                if (fabFallback) fabFallback.classList.add('hidden');
            };
            fabImg.onerror = () => {
                fabImg.removeAttribute('data-loaded-src');
                fabImg.classList.add('hidden');
                if (fabFallback) {
                    fabFallback.classList.remove('hidden');
                    fabFallback.innerText = (u.replace('@', '').charAt(0) || 'K').toUpperCase();
                }
            };

            if (fabImg.src !== avatarUrl) {
                fabImg.src = avatarUrl;
            }
            if (fabImg.complete && fabImg.naturalWidth > 0) {
                fabImg.setAttribute('data-loaded-src', avatarUrl);
                fabImg.classList.remove('hidden');
                if (fabFallback) fabFallback.classList.add('hidden');
            }
        } else if (fabFallback) {
            if (fabImg) {
                fabImg.removeAttribute('data-loaded-src');
                fabImg.classList.add('hidden');
            }
            fabFallback.classList.remove('hidden');
            fabFallback.innerText = (u.replace('@', '').charAt(0) || 'K').toUpperCase();
        }
    }

    // 1. Read cached avatar from extension chrome.storage.local
    chrome.storage.local.get(['kuronai_avatar', 'kuronai_username', 'kuronai_avatar_cache'], (res) => {
        const u = res?.kuronai_username || '';
        const cleanU = u.replace('@', '').toLowerCase().trim();
        const av = (cleanU && res?.kuronai_avatar_cache?.[cleanU]) || res?.kuronai_avatar || '';
        if (av && !isDefaultOrPassportAvatar(av)) {
            setFabAvatar(av, u);
        } else {
            setFabAvatar('', u);
        }
    });

    // 2. Listen to storage changes for avatar updates
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && (changes.kuronai_avatar || changes.kuronai_username)) {
            chrome.storage.local.get(['kuronai_avatar', 'kuronai_username'], (res) => {
                if (res?.kuronai_avatar) {
                    setFabAvatar(res.kuronai_avatar, res?.kuronai_username);
                }
            });
        }
    });

    // 3. Targeted TikTok avatar scanner (only verified user header elements)
    let avatarFound = false;
    let studioAvatarObserver = null;

    function scanAndApplyAvatar() {
        if (avatarFound) return true;

        // Direct DOM images via official header/profile selectors ONLY
        const selectors = [
            '[data-e2e="profile-icon"] img',
            'a[data-e2e="nav-profile"] img',
            '[data-e2e="user-avatar"] img',
            'header a[href*="/@"] img',
            'nav a[href*="/@"] img',
            'header [class*="avatar" i] img',
            'nav [class*="avatar" i] img',
            '[class*="creator-header"] [class*="avatar" i] img',
            '[class*="studio-header"] img',
            '[class*="studio-avatar"] img',
            '[class*="account-info"] img'
        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
                const src = el.currentSrc || el.src || el.getAttribute('src');
                if (src && !isDefaultOrPassportAvatar(src) && (src.includes('tiktokcdn') || src.includes('byte') || src.includes('tos-') || src.includes('avt-'))) {
                    avatarFound = true;
                    setFabAvatar(src);
                    chrome.storage.local.set({ kuronai_avatar: src });
                    if (studioAvatarObserver) {
                        try { studioAvatarObserver.disconnect(); } catch(e) {}
                    }
                    return true;
                }
            }
        }

        // Background-image on user profile icon
        const bgEls = document.querySelectorAll('[data-e2e="profile-icon"], [data-e2e="user-avatar"]');
        for (const el of bgEls) {
            const bg = el.style.backgroundImage || window.getComputedStyle(el).backgroundImage;
            if (bg && bg.startsWith('url(')) {
                const match = bg.match(/url\(["']?(https:\/\/[^"'\)]*(?:tiktokcdn|tos-|avt-|byte)[^"'\)]*)["']?\)/i);
                if (match && match[1] && !isDefaultOrPassportAvatar(match[1])) {
                    avatarFound = true;
                    setFabAvatar(match[1]);
                    chrome.storage.local.set({ kuronai_avatar: match[1] });
                    if (studioAvatarObserver) {
                        try { studioAvatarObserver.disconnect(); } catch(e) {}
                    }
                    return true;
                }
            }
        }

        // Check detectTikTokUser (Rehydration, SIGI_STATE, Passport API)
        detectTikTokUser().then(userInfo => {
            if (userInfo && userInfo.avatar && !isDefaultOrPassportAvatar(userInfo.avatar)) {
                avatarFound = true;
                setFabAvatar(userInfo.avatar, userInfo.username);
                if (studioAvatarObserver) {
                    try { studioAvatarObserver.disconnect(); } catch(e) {}
                }
            }
        });
        return false;
    }

    scanAndApplyAvatar();
    setTimeout(scanAndApplyAvatar, 600);
    setTimeout(scanAndApplyAvatar, 1500);
    setTimeout(scanAndApplyAvatar, 3200);

    // Amati perubahan DOM hanya sampai avatar ditemukan
    try {
        let obsDebounce = null;
        studioAvatarObserver = new MutationObserver(() => {
            if (avatarFound) {
                studioAvatarObserver.disconnect();
                return;
            }
            if (!obsDebounce) {
                obsDebounce = setTimeout(() => {
                    obsDebounce = null;
                    scanAndApplyAvatar();
                }, 500);
            }
        });
        studioAvatarObserver.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(() => { 
            if (studioAvatarObserver) studioAvatarObserver.disconnect(); 
        }, 12000);
    } catch(e) {}

    let isOpen = false;

    function positionPanelAtFab() {
        const fabRect = fab.getBoundingClientRect();
        const panelWidth = 328;
        const panelHeight = 520;

        // Buka panel tepat di posisi FAB (sejajar dengan posisi icon saat diklik)
        let top = Math.max(10, Math.min(window.innerHeight - panelHeight - 10, fabRect.top));
        let left = Math.max(10, Math.min(window.innerWidth - panelWidth - 10, fabRect.right - panelWidth));

        panel.style.top = top + 'px';
        panel.style.left = left + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }

    function openPanel() {
        isOpen = true;
        positionPanelAtFab();
        panel.classList.add('open');
        // Icon disembunyikan agar popup menggantikan icon (tidak muncul double)
        fab.classList.add('fab-hidden');
    }

    function closePanel() {
        isOpen = false;
        panel.classList.remove('open');
        // Icon dimunculkan kembali saat popup ditutup (popup berubah kembali menjadi icon)
        fab.classList.remove('fab-hidden');
    }

    function togglePanel() {
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    closeBtn.addEventListener('click', closePanel);

    // Klik di luar panel menutup popup
    document.addEventListener('mousedown', (e) => {
        if (!isOpen || isFabDragging || isDragging) return;
        const path = e.composedPath();
        if (!path.includes(host)) {
            closePanel();
        }
    });

    // Default position: TOP-RIGHT (Kanan Atas)
    try {
        // Bersihkan cache posisi lama yang berada di kanan bawah
        localStorage.removeItem('kecho_fab_pos');
        localStorage.removeItem('kecho_avatar_fab_pos');
        const savedPosStr = localStorage.getItem('kecho_avatar_fab_pos_tr');
        if (savedPosStr) {
            const savedPos = JSON.parse(savedPosStr);
            if (savedPos && savedPos.top > window.innerHeight - 100) {
                // Posisi tersimpan adalah warisan kanan bawah lama, reset ke kanan atas
                localStorage.removeItem('kecho_avatar_fab_pos_tr');
                fab.style.top = '24px';
                fab.style.right = '24px';
                fab.style.left = 'auto';
                fab.style.bottom = 'auto';
            } else if (savedPos && savedPos.left !== undefined && savedPos.top !== undefined) {
                fab.style.left = Math.max(10, Math.min(window.innerWidth - 58, savedPos.left)) + 'px';
                fab.style.top = Math.max(10, Math.min(window.innerHeight - 58, savedPos.top)) + 'px';
                fab.style.right = 'auto';
                fab.style.bottom = 'auto';
            } else {
                fab.style.top = '24px';
                fab.style.right = '24px';
                fab.style.left = 'auto';
                fab.style.bottom = 'auto';
            }
        } else {
            fab.style.top = '24px';
            fab.style.right = '24px';
            fab.style.left = 'auto';
            fab.style.bottom = 'auto';
        }
    } catch(e) {
        fab.style.top = '24px';
        fab.style.right = '24px';
        fab.style.left = 'auto';
        fab.style.bottom = 'auto';
    }

    // Draggable circular avatar button dengan requestAnimationFrame
    let isFabDragging = false;
    let fabStartX, fabStartY, fabInitialX, fabInitialY, hasFabMoved = false;
    let fabRafId = null, targetFabLeft = 0, targetFabTop = 0;

    fab.addEventListener('mousedown', (e) => {
        isFabDragging = true;
        hasFabMoved = false;
        fabStartX = e.clientX;
        fabStartY = e.clientY;
        const rect = fab.getBoundingClientRect();
        fabInitialX = rect.left;
        fabInitialY = rect.top;
        targetFabLeft = fabInitialX;
        targetFabTop = fabInitialY;
        fab.classList.add('is-dragging');
        document.addEventListener('mousemove', onFabMouseMove, { passive: true });
        document.addEventListener('mouseup', onFabMouseUp);
        e.preventDefault();
    });

    function onFabMouseMove(e) {
        if (!isFabDragging) return;
        const dx = e.clientX - fabStartX;
        const dy = e.clientY - fabStartY;
        if (Math.hypot(dx, dy) > 4) {
            hasFabMoved = true;
        }
        targetFabLeft = Math.max(10, Math.min(window.innerWidth - 58, fabInitialX + dx));
        targetFabTop = Math.max(10, Math.min(window.innerHeight - 58, fabInitialY + dy));

        if (!fabRafId) {
            fabRafId = requestAnimationFrame(() => {
                fab.style.left = targetFabLeft + 'px';
                fab.style.top = targetFabTop + 'px';
                fab.style.right = 'auto';
                fab.style.bottom = 'auto';
                fabRafId = null;
            });
        }
    }

    function onFabMouseUp(e) {
        if (!isFabDragging) return;
        isFabDragging = false;
        fab.classList.remove('is-dragging');
        if (fabRafId) {
            cancelAnimationFrame(fabRafId);
            fabRafId = null;
        }
        document.removeEventListener('mousemove', onFabMouseMove);
        document.removeEventListener('mouseup', onFabMouseUp);

        if (hasFabMoved) {
            const rect = fab.getBoundingClientRect();
            try {
                localStorage.setItem('kecho_avatar_fab_pos_tr', JSON.stringify({ left: rect.left, top: rect.top }));
            } catch(err){}
        } else {
            togglePanel();
        }
    }

    // Dragging support for floating panel header dengan requestAnimationFrame & no-lag
    let isDragging = false, startX, startY, startLeft, startTop;
    let targetPanelLeft = 0, targetPanelTop = 0;
    let panelRafId = null;

    dragHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('#kechoCloseBtn')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = panel.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        targetPanelLeft = startLeft;
        targetPanelTop = startTop;

        panel.classList.add('is-dragging');
        document.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        targetPanelLeft = Math.max(10, Math.min(window.innerWidth - 340, startLeft + deltaX));
        targetPanelTop = Math.max(10, Math.min(window.innerHeight - 530, startTop + deltaY));

        if (!panelRafId) {
            panelRafId = requestAnimationFrame(() => {
                panel.style.left = targetPanelLeft + 'px';
                panel.style.top = targetPanelTop + 'px';
                panel.style.right = 'auto';
                panel.style.bottom = 'auto';

                // Update juga posisi FAB di belakang layar
                const newFabLeft = Math.max(10, Math.min(window.innerWidth - 58, targetPanelLeft + 328 - 48));
                const newFabTop = Math.max(10, Math.min(window.innerHeight - 58, targetPanelTop));
                fab.style.left = newFabLeft + 'px';
                fab.style.top = newFabTop + 'px';
                fab.style.right = 'auto';
                fab.style.bottom = 'auto';

                panelRafId = null;
            });
        }
    }

    function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        panel.classList.remove('is-dragging');
        if (panelRafId) {
            cancelAnimationFrame(panelRafId);
            panelRafId = null;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        const rect = fab.getBoundingClientRect();
        try {
            localStorage.setItem('kecho_avatar_fab_pos_tr', JSON.stringify({ left: rect.left, top: rect.top }));
        } catch(err){}
    }

    function attachHost() {
        const root = document.documentElement || document.body;
        if (!root) {
            setTimeout(attachHost, 100);
            return;
        }
        if (!document.contains(host)) {
            root.appendChild(host);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachHost);
    } else {
        attachHost();
    }

    // Pastikan host tetap menempel di DOM meskipun terjadi navigasi client-side SPA (seperti TikTok Studio/Upload)
    setInterval(() => {
        if (!document.contains(host)) {
            const root = document.documentElement || document.body;
            if (root) root.appendChild(host);
        }
    }, 1000);
})();
