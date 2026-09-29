(function() {

    // Sadece yükleme sayfalarında çalışmasını sağlayan kontrol (TikTok Studio & Upload)
    function isUploadPage() {
        const url = window.location.href;
        return url.includes('/upload') || url.includes('/creator-center') || url.includes('/tiktokstudio') || url.includes('/creator');
    }

    // Sistem Durum Değişkenleri - Default aktif agar selalu memproteksi resolusi video
    const savedActiveState = localStorage.getItem('kuronai_60fps_active');
    window._k_60_isModeActive = (savedActiveState !== 'false');
    window._k_60_currentLang = 'en'; 

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
        
        statusText.innerText = "Kaycee Enhance";
        badge.classList.remove('ready', 'active');
        
        if (status === 'active') {
            badge.classList.add('active');
        } else {
            badge.classList.add('ready');
        }
    }

    // Mengaktifkan bypass mode (Lossless Bitrate & 60FPS Force)
    window.activate60FPS = function() {
        window._k_60_isModeActive = true;
        try { localStorage.setItem('kuronai_60fps_active', 'true'); } catch(e){}
        updateBadge('active');
        return { status: "SYSTEM ACTIVE (60FPS FORCED)" };
    };

    // Menonaktifkan bypass mode
    window.reset60FPS = function() {
        window._k_60_isModeActive = false;
        try { localStorage.setItem('kuronai_60fps_active', 'false'); } catch(e){}
        updateBadge('ready');
        return { status: "SYSTEM DISABLED" };
    };

    // =====================================================================
    // --- 1. BYPASS CANVAS RE-ENCODE (URL.createObjectURL OVERRIDE) ---
    // Trik Referensi: Mencegah web TikTok memuat video ke canvas internal
    // yang menyebabkan kompresi downscale ke 576p.
    // =====================================================================
    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    const dummyBlobUrl = originalCreateObjectURL(new Blob([new Uint8Array(8)], { type: "application/octet-stream" }));

    URL.createObjectURL = function(target) {
        if (window._k_60_isModeActive && isUploadPage() && target instanceof Blob && target.type?.startsWith("video/")) {
            console.log("[Kaycee :3] Bypassed video canvas load via dummy object URL!");
            return dummyBlobUrl;
        }
        return originalCreateObjectURL(target);
    };

    // =====================================================================
    // --- 2. DEEP CLEAN METADATA KOMPRESI TIKTOK ---
    // =====================================================================
    function deepClean(obj) {
        if (!obj || typeof obj !== 'object') return;
        
        // Hapus metadata yang memicu re-render canvas dan kompresi bitrate rendah
        const forbiddenKeys = ['draft', 'canvas_config', 'vedit_segment_info', 'is_use_canvas'];
        
        forbiddenKeys.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                delete obj[key];
            }
        });

        // Blokir canvas rendering TikTok agar bitrate & resolusi asli tidak diturunkan
        if (obj.cloud_edit_is_use_video_canvas !== undefined) {
            obj.cloud_edit_is_use_video_canvas = false;
        }
        if (obj.is_use_canvas !== undefined) {
            obj.is_use_canvas = false;
        }

        // Normalize post type ke direct raw video stream
        if (obj.post_type === 2) {
            obj.post_type = 3;
        }

        // Aktifkan flag HD / high quality pada payload post
        if (obj.allow_high_quality !== undefined) {
            obj.allow_high_quality = 1;
        }
        if (obj.enable_hd !== undefined) {
            obj.enable_hd = true;
        }

        for (let k in obj) {
            if (obj[k] && typeof obj[k] === 'object') {
                deepClean(obj[k]);
            }
        }
    }

    // --- JSON.stringify Hook ---
    const originalJSONStringify = JSON.stringify;
    JSON.stringify = function(value, replacer, space) {
        if (!isUploadPage()) {
            return originalJSONStringify.apply(this, arguments);
        }

        if (window._k_60_isModeActive && value && typeof value === 'object') {
            try {
                if (value.single_post_req_list || value.vedit_common_info || value.post_common_info || value.video_param) {
                    deepClean(value);
                }
            } catch (e) {
                console.error("[Kaycee :3] Clean Error:", e);
            }
        }

        return originalJSONStringify.apply(this, arguments);
    };

    // =====================================================================
    // --- 3. INTERSEPSI REQUEST PENGUNGGAHAN ('project/post') ---
    // Trik Referensi: Mencegat fetch & XHR saat tombol "Post" ditekan
    // untuk memastikan payload akhir bebas dari parameter kompresi.
    // =====================================================================
    function isPostRequest(url) {
        const str = typeof url === "string" ? url : (url && url.url ? url.url : "");
        return str.includes("project/post") || str.includes("web/project/post");
    }

    function cleanPostPayload(rawBody) {
        try {
            let data = null;
            if (typeof rawBody === "string") {
                data = JSON.parse(rawBody);
            } else if (rawBody && typeof rawBody === "object") {
                data = rawBody;
            }
            if (data) {
                deepClean(data);
                return typeof rawBody === "string" ? JSON.stringify(data) : data;
            }
        } catch (e) {}
        return rawBody;
    }

    const originalFetch = window.fetch;
    window.fetch = async function(resource, init) {
        if (window._k_60_isModeActive && isUploadPage() && isPostRequest(resource)) {
            if (init && init.body) {
                init.body = cleanPostPayload(init.body);
            }
        }
        return originalFetch.apply(this, arguments);
    };

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._reqUrl = url;
        return originalXhrOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
        if (window._k_60_isModeActive && isUploadPage() && isPostRequest(this._reqUrl) && typeof body === "string") {
            body = cleanPostPayload(body);
        }
        return originalXhrSend.call(this, body);
    };

    // Inisialisasi status saat halaman upload dimuat
    if (isUploadPage()) {
        const shouldBeActive = localStorage.getItem('kuronai_60fps_active') !== 'false';
        window._k_60_isModeActive = shouldBeActive;
        setTimeout(() => updateBadge(shouldBeActive ? 'active' : 'ready'), 400);
    }

})();