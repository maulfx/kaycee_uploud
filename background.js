// =====================================================
// --- KURONAI BACKGROUND.JS - LOCAL MODE (No Remote Auth) ---
// =====================================================

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


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // Fetch active TikTok user from TikTok cookies
    if (request.action === "GET_ACTIVE_TIKTOK_USER") {
        fetch("https://www.tiktok.com/passport/web/account/info/")
            .then(r => r.json())
            .then(json => {
                if (json.data && json.data.username) {
                    sendResponse({ 
                        success: true, 
                        username: "@" + json.data.username,
                        avatar: json.data.avatar_url
                    });
                } else {
                    sendResponse({ success: false });
                }
            })
            .catch(() => sendResponse({ success: false }));
        return true; 
    }

    // SEND_LOG - LOCAL MODE: hanya console.log, tidak kirim ke remote
    if (request.action === "SEND_LOG") {
        console.log(`[LOCAL LOG] ${request.type}: ${request.msg} (User: ${request.username || 'Anonim'})`);
        return true;
    }

    // Fetch avatar dari TikWM
    if (request.action === "FETCH_AVATAR") {
        const username = request.username.replace('@', '');
        const tikWmUrl = `https://www.tikwm.com/api/user/info?unique_id=${username}`;

        fetch(tikWmUrl)
            .then(r => r.json())
            .then(json => {
                if (json.code === 0 && json.data && json.data.user) {
                    sendResponse({ 
                        success: true, 
                        avatar: json.data.user.avatarLarger 
                    });
                } else {
                    sendResponse({ success: false });
                }
            })
            .catch(() => sendResponse({ success: false }));
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
});

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