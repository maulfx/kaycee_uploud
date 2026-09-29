(function() {

    // Sadece yükleme sayfalarında çalışmasını sağlayan kontrol
    function isUploadPage() {
        const url = window.location.href;
        return url.includes('/upload') || url.includes('/creator-center');
    }

    // Sistem Durum Değişkenleri
    if (typeof window._k_60_isModeActive === 'undefined') {
        window._k_60_isModeActive = false;
    }
    window._k_60_currentLang = 'tr'; 

    const badgeTranslations = {
        en: { ready: "SYSTEM READY", active: "SYSTEM ACTIVE" },
        tr: { ready: "SİSTEM HAZIR", active: "SİSTEM AKTİF" },
        ru: { ready: "СИСТЕМА ГОТОВА", active: "СИСТЕМА АКТИВНА" }
    };

    window.setBadgeLanguage = function(lang) {
        if (!badgeTranslations[lang]) return;
        window._k_60_currentLang = lang;
        const currentStatus = window._k_60_isModeActive ? 'active' : 'ready';
        updateBadge(currentStatus);
    };

    function updateBadge(status) {
        const badge = document.getElementById('kuronai-badge');
        const statusText = document.getElementById('k-status-text');

        if (!badge || !statusText) return;
        
        const lang = window._k_60_currentLang || 'tr';
        const texts = badgeTranslations[lang];
        badge.classList.remove('ready', 'active');
        
        if (status === 'active') {
            badge.classList.add('active');
            statusText.innerText = texts.active; 
            statusText.style.color = "#25F4EE"; 
        } else {
            badge.classList.add('ready');
            statusText.innerText = texts.ready; 
            statusText.style.color = "#2ecc71"; 
        }
    }

    // Sistemi Aktif Etme (Sadece Temizlik Modunu Açar)
    window.activate60FPS = function() {
        window._k_60_isModeActive = true;
        updateBadge('active');
        return { status: "TEMİZLİK MODU AKTİF!" };
    };

    // Sistemi Sıfırlama
    window.reset60FPS = function() {
        window._k_60_isModeActive = false;
        updateBadge('ready');
        return { status: "Sıfırlandı." };
    };
    
    // --- JSON TEMİZLİK (DEEP CLEAN) MEKANİZMASI ---
    const originalJSONStringify = JSON.stringify;

    JSON.stringify = function(value, replacer, space) {
        if (!isUploadPage()) {
            return originalJSONStringify.apply(this, arguments);
        }

        // Eğer mod aktifse TikTok'un gönderdiği verileri temizle
        if (window._k_60_isModeActive && value && typeof value === 'object') {
            try {
                const deepClean = (obj) => {
                    if (!obj || typeof obj !== 'object') return;
                    
                    // Gereksiz meta verileri ve kısıtlamaları kaldır
                    const forbiddenKeys = ['draft', 'canvas_config', 'vedit_segment_info'];
                    
                    forbiddenKeys.forEach(key => {
                        if (obj.hasOwnProperty(key)) {
                            delete obj[key];
                        }
                    });

                    // Video canvas kullanımını engelle (Orijinal bitrate koruması için)
                    if (obj.cloud_edit_is_use_video_canvas !== undefined) {
                        obj.cloud_edit_is_use_video_canvas = false;
                    }

                    // Post tipini normalize et
                    if (obj.post_type === 2) {
                        obj.post_type = 3;
                    }

                    for (let k in obj) {
                        if (obj[k] && typeof obj[k] === 'object') {
                            deepClean(obj[k]);
                        }
                    }
                };

                // Sadece kritik TikTok isteklerini hedef al
                if (value.single_post_req_list || value.vedit_common_info || value.post_common_info) {
                    deepClean(value);
                }

            } catch (e) {
                console.error("[Kuronai] Temizlik Hatası:", e);
            }
        }

        return originalJSONStringify.apply(this, arguments);
    };

    if (isUploadPage()) {
        window._k_60_isModeActive = false; 
        updateBadge('ready');
    }

})();