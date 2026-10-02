// =====================================================
// --- KURONAI BACKGROUND.JS - DYNAMIC AVATAR & ACCOUNT CACHE ---
// =====================================================

// Konversi URL gambar ke Base64 data URL agar tersimpan permanen di cache lokal ekstensi
async function fetchImageAsBase64(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') return '';
    if (imageUrl.startsWith('data:image/')) return imageUrl;
    try {
        const res = await fetch(imageUrl, { referrerPolicy: 'no-referrer' });
        if (!res.ok) return imageUrl;
        const buffer = await res.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        const mime = res.headers.get('content-type') || 'image/jpeg';
        return `data:${mime};base64,${btoa(binary)}`;
    } catch (e) {
        return imageUrl;
    }
}

// Device ID (tetap dipertahankan untuk internal tracking)
async function getSystemID() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['kuronai_device_id'], function(result) {
            if (result.kuronai_device_id) {
                chrome.storage.sync.set({ 'kuronai_device_id': result.kuronai_device_id });
                resolve(result.kuronai_device_id);
            } else {
                chrome.storage.sync.get(['kuronai_device_id'], function(syncResult) {
                    if (syncResult.kuronai_device_id) {
                        chrome.storage.local.set({ 'kuronai_device_id': syncResult.kuronai_device_id });
                        resolve(syncResult.kuronai_device_id);
                    } else {
                        const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
                        const newID = `K-${randomPart}`;
                        chrome.storage.local.set({ 'kuronai_device_id': newID });
                        chrome.storage.sync.set({ 'kuronai_device_id': newID });
                        resolve(newID);
                    }
                });
            }
        });
    });
}

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // Centralized AnalystFYP URL Analysis via background service worker (Bypasses page CSP)
    if (request.action === "ANALYZE_TIKTOK_URL") {
        (async () => {
            try {
                const payload = request.payload || { url: request.url };
                const resp = await fetch("https://kayceeanalystfyp-kaycee-try.up.railway.app/api/analyze-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (resp.ok) {
                    const data = await resp.json();
                    sendResponse({ success: true, data: data });
                } else {
                    const err = await resp.json().catch(() => ({}));
                    sendResponse({ success: false, error: err.detail || ("HTTP " + resp.status) });
                }
            } catch (err) {
                sendResponse({ success: false, error: err.message || "Gagal menghubungi server AnalystFYP" });
            }
        })();
        return true;
    }


    // Simpan avatar akun ke storage (konversi ke base64 jika masih remote URL)
    if (request.action === "CACHE_USER_AVATAR") {
        const { username, avatar } = request;
        if (username && avatar && !isDefaultOrPassportAvatar(avatar)) {
            (async () => {
                const base64Av = await fetchImageAsBase64(avatar);
                chrome.storage.local.get(['kuronai_avatar_cache'], (res) => {
                    const cache = res?.kuronai_avatar_cache || {};
                    const cleanU = username.replace('@', '').toLowerCase().trim();
                    cache[cleanU] = base64Av;
                    chrome.storage.local.set({
                        kuronai_username: username,
                        kuronai_avatar: base64Av,
                        kuronai_avatar_cache: cache
                    });
                });
                sendResponse({ success: true, avatar: base64Av });
            })();
            return true;
        }
        sendResponse({ success: false });
        return true;
    }

    // Fetch active TikTok user from TikTok cookies
    if (request.action === "GET_ACTIVE_TIKTOK_USER") {
        fetch("https://www.tiktok.com/passport/web/account/info/", { credentials: "include" })
            .then(r => r.json())
            .then(async (json) => {
                if (json && json.data) {
                    const u = json.data.username || json.data.unique_id || json.data.screen_name || json.data.name;
                    let a = '';
                    const candidate = json.data.avatar_large?.url_list?.[0] ||
                                      json.data.avatar_medium?.url_list?.[0] ||
                                      json.data.avatar_thumb?.url_list?.[0] ||
                                      json.data.avatar_url ||
                                      json.data.user_avatar ||
                                      json.data.avatar;
                    if (candidate && !isDefaultOrPassportAvatar(candidate)) {
                        a = candidate;
                    }
                    if (u) {
                        const uname = u.startsWith('@') ? u : '@' + u;
                        const cleanUname = uname.replace('@', '').trim();
                        if (!a) {
                            try {
                                const profileRes = await fetch(`https://www.tiktok.com/@${cleanUname}`, { credentials: "include" });
                                if (profileRes.ok) {
                                    const html = await profileRes.text();
                                    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                                                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
                                    const jsonMatch = html.match(/"avatarLarger":"([^"]+)"/) || html.match(/"avatarMedium":"([^"]+)"/);
                                    if (ogMatch && ogMatch[1] && !isDefaultOrPassportAvatar(ogMatch[1])) {
                                        a = ogMatch[1];
                                    } else if (jsonMatch && jsonMatch[1]) {
                                        const parsedAv = jsonMatch[1].replace(/\\u002F/g, '/');
                                        if (!isDefaultOrPassportAvatar(parsedAv)) a = parsedAv;
                                    }
                                }
                            } catch(e) {}
                        }

                        // Jika avatar ditemukan, simpan ke cache sebagai Base64
                        if (a && !isDefaultOrPassportAvatar(a)) {
                            const b64 = await fetchImageAsBase64(a);
                            chrome.storage.local.get(['kuronai_avatar_cache'], (cacheRes) => {
                                const cache = cacheRes?.kuronai_avatar_cache || {};
                                cache[cleanUname.toLowerCase()] = b64;
                                chrome.storage.local.set({
                                    kuronai_username: uname,
                                    kuronai_avatar: b64,
                                    kuronai_avatar_cache: cache
                                });
                            });
                            sendResponse({ 
                                success: true, 
                                username: uname,
                                avatar: b64
                            });
                            return;
                        }

                        // Jika avatar tidak ada di DOM/API (misal saat buka TikTok Studio), gunakan cache yang tersimpan
                        const storageData = await new Promise(r => chrome.storage.local.get(['kuronai_avatar', 'kuronai_username', 'kuronai_avatar_cache'], r));
                        const cachedAv = storageData?.kuronai_avatar_cache?.[cleanUname.toLowerCase()] || 
                                         (storageData?.kuronai_username?.toLowerCase() === uname.toLowerCase() ? storageData?.kuronai_avatar : '');

                        sendResponse({ 
                            success: true, 
                            username: uname,
                            avatar: cachedAv || ''
                        });
                        return;
                    }
                }
                chrome.storage.local.get(['kuronai_username', 'kuronai_avatar'], (res) => {
                    sendResponse({
                        success: true,
                        username: res?.kuronai_username || '',
                        avatar: res?.kuronai_avatar || ''
                    });
                });
            })
            .catch(() => {
                chrome.storage.local.get(['kuronai_username', 'kuronai_avatar'], (res) => {
                    sendResponse({
                        success: true,
                        username: res?.kuronai_username || '',
                        avatar: res?.kuronai_avatar || ''
                    });
                });
            });
        return true; 
    }

    // SEND_LOG - LOCAL MODE: hanya console.log, tidak kirim ke remote
    if (request.action === "SEND_LOG") {
        console.log(`[LOCAL LOG] ${request.type}: ${request.msg} (User: ${request.username || 'Anonim'})`);
        return true;
    }

    // Fetch avatar dari TikWM, Video Author API, atau TikTok profile HTML
    if (request.action === "FETCH_AVATAR" || request.action === "FETCH_USER_PROFILE") {
        const username = (request.username || '').replace('@', '').trim();
        if (!username) {
            sendResponse({ success: false });
            return true;
        }

        // Cek cache terlebih dahulu
        chrome.storage.local.get(['kuronai_avatar_cache'], async (res) => {
            const cached = res?.kuronai_avatar_cache?.[username.toLowerCase()];
            if (cached && !isDefaultOrPassportAvatar(cached)) {
                sendResponse({ success: true, avatar: cached });
                return;
            }

            const fetchTimeout = (url, opts = {}, ms = 3500) => {
                const ctrl = new AbortController();
                const tm = setTimeout(() => ctrl.abort(), ms);
                return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(tm));
            };

            const cacheAndSend = async (avUrl) => {
                const b64 = await fetchImageAsBase64(avUrl);
                chrome.storage.local.get(['kuronai_avatar_cache'], (cRes) => {
                    const c = cRes?.kuronai_avatar_cache || {};
                    c[username.toLowerCase()] = b64;
                    chrome.storage.local.set({
                        kuronai_avatar: b64,
                        kuronai_avatar_cache: c
                    });
                });
                sendResponse({ success: true, avatar: b64 });
            };

            // 1. Coba TikWM user info API
            try {
                const r = await fetchTimeout(`https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(username)}`, {}, 3000);
                if (r && r.ok) {
                    const json = await r.json();
                    if (json.code === 0 && json.data && json.data.user) {
                        const av = json.data.user.avatarLarger || json.data.user.avatarMedium || json.data.user.avatarThumb;
                        if (av && !isDefaultOrPassportAvatar(av)) {
                            await cacheAndSend(av);
                            return;
                        }
                    }
                }
            } catch (e) {}

            // 2. Coba video terbaru via Render API -> author avatar via TikWM
            try {
                const analyzeRes = await fetchTimeout(`https://tiktok-api-8czj.onrender.com/api/analyze?username=${encodeURIComponent(username)}`, {}, 4000);
                if (analyzeRes && analyzeRes.ok) {
                    const analyzeJson = await analyzeRes.json();
                    if (analyzeJson && analyzeJson.success && Array.isArray(analyzeJson.data) && analyzeJson.data.length > 0 && analyzeJson.data[0].id) {
                        const videoId = analyzeJson.data[0].id;
                        const tikwmVideoRes = await fetchTimeout(`https://www.tikwm.com/api/?url=https://www.tiktok.com/@${username}/video/${videoId}`, {}, 3500);
                        if (tikwmVideoRes && tikwmVideoRes.ok) {
                            const tikwmVideoJson = await tikwmVideoRes.json();
                            const authorAv = tikwmVideoJson?.data?.author?.avatar;
                            if (authorAv && !isDefaultOrPassportAvatar(authorAv)) {
                                await cacheAndSend(authorAv);
                                return;
                            }
                        }
                    }
                }
            } catch (e) {}

            // 3. Fallback ke profil HTML TikTok
            try {
                const r = await fetchTimeout(`https://www.tiktok.com/@${username}`, { credentials: "include" }, 3500);
                if (r && r.ok) {
                    const html = await r.text();
                    const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
                    const jm = html.match(/"avatarLarger":"([^"]+)"/) || html.match(/"avatarMedium":"([^"]+)"/);
                    if (m && m[1] && !isDefaultOrPassportAvatar(m[1])) {
                        await cacheAndSend(m[1]);
                        return;
                    } else if (jm && jm[1]) {
                        const parsedAv = jm[1].replace(/\\u002F/g, '/');
                        if (!isDefaultOrPassportAvatar(parsedAv)) {
                            await cacheAndSend(parsedAv);
                            return;
                        }
                    }
                }
            } catch (e) {}

            sendResponse({ success: false });
        });

        return true; 
    }

    // Fetch TikTok video data
    if (request.action === "FETCH_TIKTOK_DATA") {
        let username = request.username.trim();
        const baseUrl = "https://tiktok-api-8czj.onrender.com"; 
        const myApiUrl = `${baseUrl}/api/analyze?username=${encodeURIComponent(username)}`;

        fetch(myApiUrl)
            .then(r => r.json())
            .then(json => {
                if (json.success) {
                    sendResponse({ success: true, data: json.data });
                } else {
                    sendResponse({ success: false, error: "USER_NOT_FOUND" });
                }
            })
            .catch(err => {
                sendResponse({ success: false, error: "SERVER_OFFLINE" });
            });

        return true; 
    }

    // Download media
    if (request.action === "DOWNLOAD_MEDIA") {
        chrome.downloads.download({
            url: request.url,
            filename: `kuronai_downloads/${request.filename}`,
            saveAs: false
        });
    }

    // Analyze single video
    if (request.action === "ANALYZE_SINGLE_VIDEO") {
        const encodedUrl = encodeURIComponent(request.url);
        const url = `https://www.tikwm.com/api/?url=${encodedUrl}`;
        
        fetch(url)
            .then(r => r.json())
            .then(json => {
                if (json.code === 0 && json.data) {
                    const d = json.data;
                    sendResponse({ 
                        success: true, 
                        data: {
                            cover: d.cover,
                            title: d.title,
                            playUrl: d.play || d.hdplay, 
                            musicUrl: d.music, 
                            author: d.author.nickname,
                            views: d.play_count,
                            likes: d.digg_count
                        } 
                    });
                } else {
                    sendResponse({ success: false });
                }
            })
            .catch(() => sendResponse({ success: false }));
        return true; 
    }

    // HD Video fetch
    if (request.action === "FETCH_HD_VIDEO") {
        handleHDProcess(request.url)
            .then(finalLink => {
                if (finalLink) {
                    sendResponse({ success: true, data: { playUrl: finalLink } });
                } else {
                    sendResponse({ success: false, error: "Link yok" });
                }
            })
            .catch(err => {
                sendResponse({ success: false, error: err.toString() });
            });

        return true; 
    }

    // Shazam Music Recognition
    if (request.action === "RECOGNIZE_MUSIC_AI" || request.action === "RECOGNIZE_MUSIC_SHAZAM") {
        recognizeMusicWithShazam(request)
            .then(res => sendResponse(res))
            .catch(err => sendResponse({ success: false, error: err.toString() }));
        return true;
    }

    // Get TikTok Audio Stream from Video URL
    if (request.action === "GET_TIKTOK_AUDIO_STREAM") {
        fetchTikTokAudioStream(request)
            .then(res => sendResponse(res))
            .catch(err => sendResponse({ success: false, error: err.toString() }));
        return true;
    }
});

// RapidAPI Shazam Configuration
const RAPIDAPI_SHAZAM_KEY = "1cf2fee3bcmsha88352316aa9947p138eaejsnff41e477cf60";
const RAPIDAPI_SHAZAM_HOST = "shazam.p.rapidapi.com";

// Fetch TikTok Audio Stream via TikWM
async function fetchTikTokAudioStream(request) {
    const videoUrl = request.videoUrl;
    const fallback = {
        audioUrl: request.audioUrl || '',
        playUrl: '',
        videoTitle: '',
        soundTitle: request.soundTitle || 'TikTok Sound',
        author: request.author || 'TikTok Creator',
        cover: ''
    };

    if (videoUrl) {
        try {
            const tikwmUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`;
            const tikwmRes = await fetch(tikwmUrl);
            const tikwmJson = await tikwmRes.json();
            if (tikwmJson && tikwmJson.code === 0 && tikwmJson.data) {
                const d = tikwmJson.data;
                const audio = d.music || (d.music_info && d.music_info.play) || '';
                return {
                    success: true,
                    audioUrl: audio,
                    playUrl: d.play || d.hdplay || '',
                    videoTitle: d.title || fallback.soundTitle,
                    soundTitle: (d.music_info && d.music_info.title) || d.title || fallback.soundTitle,
                    author: (d.music_info && d.music_info.author) || (d.author && d.author.nickname) || fallback.author,
                    cover: (d.music_info && d.music_info.cover) || d.cover || ''
                };
            }
        } catch (e) {
            console.warn("[Kaycee KEcho] TikWM fetch error:", e);
        }
    }
    return {
        success: !!fallback.audioUrl,
        ...fallback
    };
}

// Engine Pengenal Musik KEcho (Shazam RapidAPI)
async function recognizeMusicWithShazam(request) {
    const fallbackInfo = request.fallbackInfo || {
        title: request.soundTitle || 'TikTok Sound',
        author: request.author || 'TikTok Creator',
        cover: '',
        audioUrl: request.audioUrl || '',
        playUrl: '',
        videoTitle: ''
    };

    const pcmBase64 = request.pcmBase64;

    if (pcmBase64) {
        try {
            const resp = await fetch('https://shazam.p.rapidapi.com/songs/v2/detect', {
                method: 'POST',
                headers: {
                    'x-rapidapi-host': RAPIDAPI_SHAZAM_HOST,
                    'x-rapidapi-key': RAPIDAPI_SHAZAM_KEY,
                    'content-type': 'text/plain'
                },
                body: pcmBase64
            });

            // Rate Limit & Quota Handling
            const remaining = resp.headers.get('x-ratelimit-requests-remaining');
            if (resp.status === 429 || (remaining !== null && parseInt(remaining, 10) <= 0)) {
                console.warn("[Kaycee KEcho] Rate limit reached. Remaining:", remaining);
                return {
                    success: false,
                    rateLimited: true,
                    error: "API monthly quota reached."
                };
            }

            if (!resp.ok) {
                const errText = await resp.text();
                const isQuota = resp.status === 403 || errText.toLowerCase().includes('quota') || errText.toLowerCase().includes('rate limit');
                if (isQuota) {
                    return { success: false, rateLimited: true, error: "API monthly quota reached." };
                }
                throw new Error(`HTTP ${resp.status}`);
            }

            const json = await resp.json();
            console.log("[Kaycee KEcho] RapidAPI detect result:", json);

            if (json && json.message && (json.message.toLowerCase().includes('quota') || json.message.toLowerCase().includes('rate limit') || json.message.toLowerCase().includes('exceeded'))) {
                return { success: false, rateLimited: true, error: json.message };
            }

            if (json && json.matches && json.matches.length > 0 && json.track) {
                const track = json.track;
                const title = track.title || fallbackInfo.title;
                const artist = track.subtitle || fallbackInfo.author;
                const cover = (track.images && (track.images.coverart || track.images.coverarthq || track.images.background)) || fallbackInfo.cover || '';
                const shazamUrl = track.url || (track.share && track.share.href) || `https://www.shazam.com/search?query=${encodeURIComponent(title + ' ' + artist)}`;

                let appleMusicUrl = '';
                if (track.hub && track.hub.options) {
                    for (const opt of track.hub.options) {
                        if (opt.actions) {
                            for (const act of opt.actions) {
                                if (act.uri && act.uri.includes('apple.com')) {
                                    appleMusicUrl = act.uri;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!appleMusicUrl) {
                    appleMusicUrl = `https://music.apple.com/search?term=${encodeURIComponent(title + ' ' + artist)}`;
                }

                const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`;

                let album = 'Single';
                let releaseDate = '';
                if (track.sections) {
                    const songSection = track.sections.find(s => s.type === 'SONG');
                    if (songSection && songSection.metadata) {
                        const albumMeta = songSection.metadata.find(m => m.title === 'Album');
                        if (albumMeta && albumMeta.text) album = albumMeta.text;
                        const relMeta = songSection.metadata.find(m => m.title === 'Released');
                        if (relMeta && relMeta.text) releaseDate = relMeta.text;
                    }
                }

                return {
                    success: true,
                    aiMatched: true,
                    data: {
                        title: title,
                        artist: artist,
                        album: album,
                        releaseDate: releaseDate,
                        shazamUrl: shazamUrl,
                        appleMusicUrl: appleMusicUrl,
                        spotifyUrl: spotifyUrl,
                        audioUrl: fallbackInfo.audioUrl,
                        cover: cover,
                        videoPlayUrl: fallbackInfo.playUrl || '',
                        videoCaption: fallbackInfo.videoTitle || '',
                        source: 'KEcho Audio Engine'
                    }
                };
            }
        } catch (e) {
            console.warn("[Kaycee KEcho] RapidAPI error:", e);
        }
    }

    // Fallback: Jika tidak ada kecocokan di katalog musik Shazam
    return {
        success: true,
        aiMatched: false,
        data: {
            title: fallbackInfo.title || "TikTok Original Sound",
            artist: fallbackInfo.author || "TikTok Creator",
            album: "TikTok Original",
            releaseDate: "",
            shazamUrl: `https://www.shazam.com/search?query=${encodeURIComponent((fallbackInfo.title || '') + ' ' + (fallbackInfo.author || ''))}`,
            appleMusicUrl: `https://music.apple.com/search?term=${encodeURIComponent((fallbackInfo.title || '') + ' ' + (fallbackInfo.author || ''))}`,
            spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent((fallbackInfo.title || '') + ' ' + (fallbackInfo.author || ''))}`,
            audioUrl: fallbackInfo.audioUrl,
            cover: fallbackInfo.cover,
            videoPlayUrl: fallbackInfo.playUrl || '',
            videoCaption: fallbackInfo.videoTitle || '',
            source: 'TikTok Sound'
        }
    };
}

// HD Video processing
async function handleHDProcess(tiktokUrl) {
    try {
        const submitResponse = await fetch("https://www.tikwm.com/api/video/task/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": "https://www.tikwm.com/originalDownloader.html",
                "Origin": "https://www.tikwm.com"
            },
            body: `url=${encodeURIComponent(tiktokUrl)}&web=1`
        });

        const submitData = await submitResponse.json();

        if (submitData.code === 0 && submitData.data && submitData.data.task_id) {
            const taskID = submitData.data.task_id;
            console.log("⏳ [HD] Görev ID alındı:", taskID);
            
            await new Promise(r => setTimeout(r, 2000));

            return await checkTaskResult(taskID);
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

async function checkTaskResult(taskId) {
    try {
        const resultUrl = `https://www.tikwm.com/api/video/task/result?task_id=${taskId}`;
        const resultResponse = await fetch(resultUrl);
        const json = await resultResponse.json();

        if (json.code === 0 && json.data) {
            const detaylar = json.data.detail || json.data;
            const hdLink = detaylar.play_url || detaylar.download_url || detaylar.play;
            if (hdLink) return hdLink;
        }
        
        return null;
    } catch (e) {
        console.error("Result Hatası:", e);
        return null;
    }
}

// On install - local only
chrome.runtime.onInstalled.addListener(async (details) => {
    await getSystemID();
    if (details.reason === "install") {
        console.log("[LOCAL] Extension installed successfully.");
    } else if (details.reason === "update") {
        console.log(`[LOCAL] Extension updated to v${chrome.runtime.getManifest().version}`);
    }
});