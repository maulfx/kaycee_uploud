let isInjected = false; 
function checkAndInjectInfo() {
    if (isInjected) return; 

    const currentUrl = window.location.href;
    if (currentUrl.includes('/upload') || currentUrl.includes('/creator-center')) {
        injectScript();
        isInjected = true;
    }
}

// --- LOCAL MODE: Skip ban check, langsung init ---
checkAndInjectInfo();

const urlObserver = new MutationObserver(() => {
    checkAndInjectInfo();
});

if (document.body) {
    urlObserver.observe(document.body, { childList: true, subtree: true });
}

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

        const reasonText = reason || "Kuronai Sistem Politikası ve Veri İşleme Protokolü ihlali tespit edildi. Erişim süresiz olarak durdurulmuştur.";
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

    chrome.storage.local.get(['theme', 'lang'], function(result) {
        const theme = result.theme || 'dark';
        const lang = result.lang || 'en';

        const badgeTexts = {
            en: "System Ready",
            tr: "Sistem Hazır",
            ru: "СИСТЕМА ГОТОВА"
        };
        const statusText = badgeTexts[lang] || "System Ready";
        const lightClass = (theme === 'light') ? 'light-mode' : '';

        
        const overlayHTML = `
        <div id="kuronai-badge" class="k-badge-container">
            <div class="k-content ${lightClass}">
                <div id="k-indicator-dot" class="k-dot"></div>
                
                <div class="k-text-group">
                    <div class="k-header-row">
                        <svg class="k-icon" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                        </svg>
                        <span class="k-title">Kuronai Booster v4.0</span>
                    </div>
                    <span id="k-status-text" class="k-status">${statusText}</span>
                </div>

                <div id="k-minimize-btn" class="k-action-btn" title="Gizle/Göster">
                    <svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
                </div>
            </div>
        </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = overlayHTML;
        document.body.appendChild(div);

      
        const badgeContainer = document.getElementById('kuronai-badge');
        const minBtn = document.getElementById('k-minimize-btn');

        const isMinimized = localStorage.getItem('kuronai_badge_minimized') === 'true';
        if(isMinimized) {
            badgeContainer.classList.add('minimized');
        }

       
        minBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            toggleBadge();
        });

        
        badgeContainer.addEventListener('click', () => {
            if (badgeContainer.classList.contains('minimized')) {
                toggleBadge();
            }
        });

        function toggleBadge() {
            badgeContainer.classList.toggle('minimized');
            const currentState = badgeContainer.classList.contains('minimized');
            localStorage.setItem('kuronai_badge_minimized', currentState);
        }

        
        const script = document.createElement('script');
        script.textContent = `
            setTimeout(function() {
                if (window.setBadgeLanguage) {
                    window.setBadgeLanguage('${lang}');
                }
            }, 1000);
        `;
        (document.head || document.documentElement).appendChild(script);
        script.onload = function() { this.remove(); };
    });

    
    const style = document.createElement('style');
    style.textContent = `
        .k-header-row { display: flex; align-items: center; gap: 6px; }
        .k-icon { width: 14px; height: 14px; fill: #888; transition: fill 0.3s; }
        .k-title { font-size: 11px; color: #888; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; transition: color 0.3s; white-space: nowrap; }
        
        /* Ana Konteyner */
        .k-badge-container { 
            position: fixed; bottom: 30px; right: 30px; 
            z-index: 2147483647; font-family: 'Segoe UI', sans-serif; 
            user-select: none; opacity: 0; transform: translateY(20px); 
            transition: all 0.5s; cursor: default; 
        }
        .k-badge-container.visible { opacity: 1; transform: translateY(0); }
        
        /* KOYU TEMA */
        .k-content { 
            background: rgba(15, 15, 15, 0.90); 
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(255, 255, 255, 0.15); 
            padding: 12px 20px; border-radius: 12px; display: flex; align-items: center; gap: 12px; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.6); 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            max-width: 300px;
            overflow: hidden;
        }

        /* AÇIK TEMA (LIGHT) */
        .k-content.light-mode {
            background: rgba(255, 255, 255, 0.95) !important;
            border-color: rgba(0, 0, 0, 0.1) !important;
            box-shadow: 0 5px 25px rgba(0,0,0,0.1) !important;
        }
        .k-content.light-mode .k-title { color: #555 !important; }
        .k-content.light-mode .k-icon { fill: #555 !important; }
        .k-content.light-mode .k-action-btn svg { fill: #555 !important; }

        .k-text-group { display: flex; flex-direction: column; transition: opacity 0.2s; opacity: 1; }
        .k-status { font-size: 14px; color: #fff; font-weight: 700; transition: color 0.3s; white-space: nowrap; }
        
        .k-dot { 
            width: 10px; height: 10px; flex-shrink: 0;
            background-color: #444; border-radius: 50%; 
            box-shadow: 0 0 0 2px rgba(255,255,255,0.1); 
            transition: all 0.3s ease; 
        }

        /* GİZLEME BUTONU STİLLERİ */
        .k-action-btn {
            width: 20px; height: 20px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; cursor: pointer;
            transition: all 0.2s; margin-left: 5px; opacity: 0.5;
        }
        .k-action-btn:hover { background: rgba(255,255,255,0.1); opacity: 1; }
        
        /* İKON DÖNDÜRME (Normalde Sağa Bakıyor) */
        .k-action-btn svg { 
            width: 16px; height: 16px; fill: #fff; 
            transition: transform 0.3s; 
            transform: rotate(90deg); /* SAĞA BAKAN OK */
        }

        /* --- MINIMIZED (GİZLENMİŞ) DURUM --- */
        .k-badge-container.minimized .k-content {
            padding: 0;
            gap: 0;
            border-radius: 50%;
            width: 40px; height: 40px; /* Tıklama alanı biraz daha rahat olsun */
            justify-content: center;
        }
        
        .k-badge-container.minimized .k-text-group { 
            display: none; opacity: 0; width: 0; 
        }
        
        .k-badge-container.minimized .k-action-btn {
            display: none; /* Gizli modda ok tuşu kaybolsun, sadece nokta kalsın */
        }
        
        .k-badge-container.minimized {
            cursor: pointer; /* Üzerine gelince el işareti çıksın */
        }
        
        .k-badge-container.minimized:hover .k-content {
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(37, 244, 238, 0.4);
        }

        /* Durum Renkleri */
        .k-badge-container.ready .k-dot { background-color: #2ecc71; box-shadow: 0 0 10px #2ecc71; }
        .k-badge-container.ready .k-status { color: #2ecc71; }
        
        .k-badge-container.active .k-dot { background-color: #25F4EE; box-shadow: 0 0 15px #25F4EE; animation: pulseDot 1.5s infinite; }
        .k-badge-container.active .k-status { color: #25F4EE; }
        .k-badge-container.active .k-content { border-color: rgba(37,244,238,0.4); }
        
        @keyframes pulseDot { 0% { box-shadow: 0 0 0 0 rgba(37, 244, 238, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(37, 244, 238, 0); } 100% { box-shadow: 0 0 0 0 rgba(37, 244, 238, 0); } }
    `;
    document.head.appendChild(style);
    setTimeout(() => {
        const badge = document.getElementById('kuronai-badge');
        if(badge) { badge.classList.add('visible'); badge.classList.add('ready'); }
    }, 500);
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_HUNTER") {
        console.log("Kuronai: Manuel hesap avcısı tetiklendi, sayfa taranıyor...");
        
        let attempts = 0;
        const avciInterval = setInterval(() => {
            attempts++;
            let detectedUser = null;


            const sidebarLink = document.querySelector('a[data-e2e="nav-profile"]');
            if (sidebarLink && sidebarLink.getAttribute('href')) {
                const match = sidebarLink.getAttribute('href').match(/\/(@[\w.-]+)/);
                if (match && match[1]) detectedUser = match[1];
            }


            if (!detectedUser) {
                const menuProfile = document.querySelector('a.TUXMenuItem[href*="/@"]');
                if (menuProfile && menuProfile.getAttribute('href')) {
                    const match = menuProfile.getAttribute('href').match(/\/(@[\w.-]+)/);
                    if (match && match[1]) detectedUser = match[1];
                }
            }


            if (!detectedUser) {
                const allProfileLinks = document.querySelectorAll('a[href*="/@"]');
                for (let link of allProfileLinks) {
                    if (link.innerHTML.includes('Profil') || link.innerHTML.includes('Avatar')) {
                        const match = link.getAttribute('href').match(/\/(@[\w.-]+)/);
                        if (match && match[1]) {
                            detectedUser = match[1];
                            break;
                        }
                    }
                }
            }


            if (detectedUser) {
                clearInterval(avciInterval); 
                console.log("Hesap yakalandı: ", detectedUser);
                
                chrome.storage.local.set({ 
                    'kuronai_fetched_username': detectedUser 
                });


                document.head.innerHTML = `
                    <style>
                        body { margin: 0; padding: 0; background: #0a0a0a !important; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                        .kuronai-success-container { text-align: center; background: rgba(20, 20, 20, 0.8); border: 1px solid #25F4EE; box-shadow: 0 0 40px rgba(37, 244, 238, 0.3), inset 0 0 20px rgba(37, 244, 238, 0.1); padding: 60px 80px; border-radius: 20px; backdrop-filter: blur(10px); animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                        @keyframes popIn { 0% { transform: scale(0.8) translateY(30px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
                        .kuronai-icon { width: 80px; height: 80px; fill: #25F4EE; margin-bottom: 20px; filter: drop-shadow(0 0 10px rgba(37, 244, 238, 0.6)); animation: float 3s ease-in-out infinite; }
                        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                        h1 { color: #25F4EE; margin: 0 0 10px 0; font-size: 38px; letter-spacing: 3px; font-weight: 800;}
                        p { color: #aaa; font-size: 16px; margin: 0 0 30px 0; letter-spacing: 1px;}
                        .username-badge { display: inline-block; background: rgba(254, 44, 85, 0.15); border: 2px solid #FE2C55; color: #FE2C55; font-weight: 800; font-size: 28px; padding: 10px 30px; border-radius: 12px; box-shadow: 0 0 20px rgba(254, 44, 85, 0.3); letter-spacing: 2px; }
                        .footer-text { font-size: 13px; margin-top: 30px; color: #555; }
                    </style>
                `;
                document.body.innerHTML = `
                    <div class="kuronai-success-container">
                        <svg class="kuronai-icon" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <h1>SİSTEME BAĞLANDI</h1>
                        <p>Kimlik doğrulama işlemi başarıyla tamamlandı.</p>
                        <div class="username-badge">${detectedUser}</div>
                        <div class="footer-text">Lütfen eklentiyi açıp şifrenizi belirleyin ve KAYIT OL butonuna basın.<br>Bu sekmeyi artık kapatabilirsiniz.</div>
                    </div>
                `;
                
                sendResponse({ success: true, username: detectedUser });
            } else if (attempts > 10) {
                clearInterval(avciInterval);
                console.log("Kuronai: Kullanıcı bulunamadı, zaman aşımı.");
                sendResponse({ success: false, error: "timeout" });
            }
        }, 1000); 

        return true; 
    }
});

let isShieldChecked = false;

// --- LOCAL MODE: Ban shield disabled ---
// All remote ban shield functions removed for local mode.