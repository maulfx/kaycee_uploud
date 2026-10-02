/**
 * ==============================================================================
 * Kaycee_AnalystFYP Integration Module for Kaycee Studio / Kaycee_Uploud
 * Cloud Backend: https://kayceeanalystfyp-kaycee-try.up.railway.app
 * ==============================================================================
 */

(function () {
  const ANALYST_SERVER_URL = "https://kayceeanalystfyp-kaycee-try.up.railway.app";
  const analyzedCache = new Map();
  let currentActiveId = null;
  let isMinimized = false;

  console.log("⚡ [Kaycee Studio] Kaycee_AnalystFYP Real-Time Engine Connected!");

  // Polling observer: cek perubahan video setiap 1.2 detik
  setInterval(inspectCurrentVideo, 1200);

  async function inspectCurrentVideo() {
    const videoData = extractActiveVideo();
    if (!videoData || !videoData.id) return;

    if (videoData.id === currentActiveId) return;
    currentActiveId = videoData.id;

    // Cek cache lokal agar tidak spam request ke server
    if (analyzedCache.has(videoData.id)) {
      renderBadge(analyzedCache.get(videoData.id));
      return;
    }

    renderLoading();

    try {
      const response = await fetch(`${ANALYST_SERVER_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          views: videoData.views,
          likes: videoData.likes,
          reposts: videoData.reposts,
          saves: videoData.saves,
          comments: videoData.comments,
          duration: videoData.duration || 13,
          age_hours: 2.0,
          title: videoData.title || ""
        })
      });

      if (!response.ok) throw new Error("Server error");
      const result = await response.json();
      analyzedCache.set(videoData.id, result);
      renderBadge(result);
    } catch (err) {
      // Fallback lokal jika ada kendala jaringan
      const fallback = localCalculate(videoData);
      analyzedCache.set(videoData.id, fallback);
      renderBadge(fallback);
    }
  }

  // ─── Ekstraksi DOM TikTok Ultra-Cepat (<1ms) ───────────────────
  function extractActiveVideo() {
    const parseNum = (text) => {
      if (!text) return 0;
      text = text.trim().toUpperCase();
      if (text.includes('K')) return Math.round(parseFloat(text.replace('K', '')) * 1000);
      if (text.includes('M')) return Math.round(parseFloat(text.replace('M', '')) * 1000000);
      if (text.includes('B')) return Math.round(parseFloat(text.replace('B', '')) * 1000000000);
      return parseInt(text.replace(/,/g, '')) || 0;
    };

    // Deteksi ID video aktif dari URL atau elemen video
    const urlMatch = location.href.match(/\/video\/(\d+)/);
    const videoId = urlMatch ? urlMatch[1] : (document.querySelector('video')?.src || location.pathname);

    // Ambil metrik engagement dari tombol aksi TikTok
    const likeEl = document.querySelector('[data-e2e="like-count"]') || document.querySelector('button[aria-label*="like"] strong');
    const commentEl = document.querySelector('[data-e2e="comment-count"]') || document.querySelector('button[aria-label*="comment"] strong');
    const saveEl = document.querySelector('[data-e2e="undefined-count"]') || document.querySelector('button[aria-label*="favorite"] strong') || document.querySelector('button[aria-label*="bookmark"] strong');
    const shareEl = document.querySelector('[data-e2e="share-count"]') || document.querySelector('button[aria-label*="share"] strong');
    const captionEl = document.querySelector('[data-e2e="browse-video-desc"]') || document.querySelector('h1[data-e2e="video-desc"]');

    const likes = parseNum(likeEl?.textContent);
    const comments = parseNum(commentEl?.textContent);
    const saves = parseNum(saveEl?.textContent);
    const reposts = parseNum(shareEl?.textContent);

    if (likes === 0 && saves === 0 && reposts === 0) return null;

    // Estimasi views median jika berada di player web
    const estViews = Math.max(Math.round(likes * 6.5), 1000);

    return {
      id: videoId,
      likes,
      comments,
      saves,
      reposts,
      views: estViews,
      title: captionEl ? captionEl.textContent : "",
      duration: 13
    };
  }

  // ─── Render Floating HUD Badge ────────────────────────────────
  function getBadgeContainer() {
    let host = document.getElementById("kaycee-fyp-radar-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "kaycee-fyp-radar-host";
      document.body.appendChild(host);
    }
    return host;
  }

  function renderLoading() {
    const host = getBadgeContainer();
    host.innerHTML = `
      <div class="kaycee-fyp-card loading">
        <span class="pulse-icon">⚡</span>
        <span class="loading-text">Kaycee_AnalystFYP: Menganalisa...</span>
      </div>
    `;
  }

  function renderBadge(data) {
    const host = getBadgeContainer();
    const prob = data.probability_pct;
    const color = data.badge_color || (prob >= 75 ? "#00f2fe" : prob >= 55 ? "#10b981" : prob >= 35 ? "#f59e0b" : "#ef4444");

    if (isMinimized) {
      host.innerHTML = `
        <div class="kaycee-fyp-minimized" style="border-color: ${color}; box-shadow: 0 0 15px ${color}60;" title="Klik untuk memperbesar">
          <span>⚡</span>
          <strong style="color: ${color}">${prob}%</strong>
        </div>
      `;
      host.querySelector(".kaycee-fyp-minimized").onclick = () => {
        isMinimized = false;
        renderBadge(data);
      };
      return;
    }

    const m = data.metrics || {};
    const repost = m.repost_rate !== undefined ? `${m.repost_rate}%` : "-";
    const save = m.save_rate !== undefined ? `${m.save_rate}%` : "-";
    const like = m.like_rate !== undefined ? `${m.like_rate}%` : "-";

    host.innerHTML = `
      <div class="kaycee-fyp-card" style="border-color: ${color}; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px ${color}35;">
        <div class="card-top">
          <div class="brand-line">
            <span class="logo-bolt">⚡</span>
            <span class="brand-title">Kaycee_AnalystFYP</span>
            <span class="tier-tag" style="background:${color}20; color:${color}; border:1px solid ${color}40;">
              ${data.status_label || (prob >= 70 ? 'MEGA FYP' : prob >= 50 ? 'BREAKOUT' : 'NORMAL')}
            </span>
          </div>
          <button class="btn-toggle-min" title="Kecilkan">−</button>
        </div>

        <div class="score-row">
          <div class="score-display">
            <span class="score-val" style="color:${color}">${prob}%</span>
            <span class="score-sub">Peluang FYP</span>
          </div>
          <div class="reach-display">
            <span class="reach-label">Potensi Jangkauan:</span>
            <strong class="reach-val" style="color:#fff">${data.potential_views || '-'}</strong>
          </div>
        </div>

        <div class="stats-row">
          <div class="mini-stat">
            <span>🔄 Repost</span>
            <strong>${repost}</strong>
          </div>
          <div class="mini-stat">
            <span>🔖 Save</span>
            <strong>${save}</strong>
          </div>
          <div class="mini-stat">
            <span>👍 Like</span>
            <strong>${like}</strong>
          </div>
        </div>

        <div class="card-footer">
          <a href="${ANALYST_SERVER_URL}" target="_blank" class="dashboard-link">Buka Live Dashboard ↗</a>
        </div>
      </div>
    `;

    host.querySelector(".btn-toggle-min").onclick = (e) => {
      e.stopPropagation();
      isMinimized = true;
      renderBadge(data);
    };
  }

  // ─── Fallback Formula Lokal ───────────────────────────────────
  function localCalculate(v) {
    const likeRate = (v.likes / v.views) * 100;
    const saveRate = (v.saves / v.views) * 100;
    const repostRate = (v.reposts / v.views) * 100;
    const score = (likeRate + (repostRate * 4.5) + (saveRate * 2.2)) * 1.35;
    const prob = Math.min(Math.max(Math.round(100 / (1 + Math.exp(-0.12 * (score - 28.5)))), 1), 99);

    return {
      probability_pct: prob,
      status_label: prob >= 75 ? "🚀 MEGA FYP" : prob >= 55 ? "📈 BREAKOUT" : "🟡 BASELINE",
      potential_views: prob >= 75 ? "100k - 500k+ Views" : prob >= 55 ? "30k - 100k Views" : "5k - 20k Views",
      badge_color: prob >= 75 ? "#00f2fe" : prob >= 55 ? "#10b981" : "#f59e0b",
      metrics: {
        like_rate: Math.round(likeRate * 10) / 10,
        save_rate: Math.round(saveRate * 10) / 10,
        repost_rate: Math.round(repostRate * 10) / 10
      }
    };
  }

  // ─── Inject CSS Styling ───────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    #kaycee-fyp-radar-host {
      position: fixed;
      top: 90px;
      right: 24px;
      z-index: 999999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      user-select: none;
    }
    .kaycee-fyp-card {
      background: rgba(11, 15, 25, 0.94);
      border: 1.5px solid #00f2fe;
      border-radius: 14px;
      padding: 14px;
      width: 270px;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      color: #fff;
    }
    .kaycee-fyp-card.loading {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      width: auto;
      font-size: 12px;
      color: #94a3b8;
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .brand-line {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .logo-bolt {
      font-size: 15px;
      color: #00f2fe;
    }
    .brand-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: -0.2px;
      color: #f8fafc;
    }
    .tier-tag {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      text-transform: uppercase;
    }
    .btn-toggle-min {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #94a3b8;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-toggle-min:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    .score-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 10px;
    }
    .score-display {
      display: flex;
      flex-direction: column;
    }
    .score-val {
      font-size: 26px;
      font-weight: 800;
      line-height: 1;
      font-family: monospace;
    }
    .score-sub {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .reach-display {
      text-align: right;
    }
    .reach-label {
      display: block;
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
    }
    .reach-val {
      font-size: 12px;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 10px;
    }
    .mini-stat {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      padding: 4px 6px;
      text-align: center;
    }
    .mini-stat span {
      display: block;
      font-size: 9px;
      color: #64748b;
    }
    .mini-stat strong {
      font-size: 11px;
      font-family: monospace;
      color: #fff;
    }
    .card-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 8px;
      text-align: center;
    }
    .dashboard-link {
      font-size: 10px;
      color: #00f2fe;
      text-decoration: none;
      font-weight: 600;
    }
    .dashboard-link:hover {
      text-decoration: underline;
    }
    .kaycee-fyp-minimized {
      background: rgba(11, 15, 25, 0.92);
      border: 1.5px solid #00f2fe;
      border-radius: 50px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: transform 0.2s ease;
      font-size: 13px;
    }
    .kaycee-fyp-minimized:hover {
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(style);
})();
