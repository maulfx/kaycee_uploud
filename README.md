<div align="center">

  <img src="icons/icon128.png" alt="Kaycee :3 Icon" width="120" height="120" style="border-radius: 50%; box-shadow: 0 8px 30px rgba(168, 85, 247, 0.4);" />

  # ✨ Kaycee :3 (Beta)
  **High-Quality 60FPS Lossless TikTok Upload Manager & Studio Enhancement**

  <p>
    <img src="https://img.shields.io/badge/Manifest-V3-9333ea?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3" />
    <img src="https://img.shields.io/badge/Version-Beta-a855f7?style=for-the-badge" alt="Version Beta" />
    <img src="https://img.shields.io/badge/Architecture-100%25%20Local-10b981?style=for-the-badge" alt="Local Mode" />
    <img src="https://img.shields.io/badge/FPS-60FPS%20Forced-06b6d4?style=for-the-badge" alt="60 FPS" />
  </p>

  <p align="center">
    Ekstensi browser Chrome Manifest V3 yang dirancang untuk mengoptimalkan upload video TikTok dalam resolusi maksimal dan 60 FPS tanpa penurunan bitrate/kompresi agresif. Berjalan <b>100% secara lokal</b> di browser kamu tanpa memerlukan login pihak ketiga atau bot eksternal.
  </p>

</div>

---

## 🌟 Fitur Utama (Key Features)

### 🚀 1. 60FPS Force & Lossless Bitrate Bypass
- **Bypass Canvas Compression**: Mencegah browser dan skrip re-encode bawaan TikTok menurunkan resolusi video asli kamu ke 576p.
- **Auto High Quality Switch**: Secara otomatis mengaktifkan toggle *"Allow high quality uploads"* / *"Izinkan unggahan berkualitas tinggi"* di antarmuka TikTok Studio tanpa perlu diklik manual setiap kali upload.
- **Liquid Glass Floating Badge (`Kaycee Enhance`)**: Indikator status transparan modern yang menempel secara elegan di halaman TikTok untuk memantau status sistem bypass secara real-time.

### 🎨 2. Modern Liquid Glass UI & Custom Color Engine
- **Liquid Glass Aesthetic**: Tampilan antarmuka popup berbasis *glassmorphism* modern dengan efek frosted glass, rim reflections, dan ambient glow dinamis.
- **Custom Color Picker**: Dilengkapi palet preset warna (*Royal Violet, Cyber Cyan, Neon Rose, Emerald Green, Solar Orange, Ocean Blue*) serta pemilih warna bebas (*color wheel*) untuk mengubah tema warna sesuka hati.
- **Dark / Light Theme Toggle**: Transisi mulus antara mode gelap dan mode terang.
- **Bilingual Interface**: Dukungan bahasa **English (EN)** dan **Bahasa Indonesia (ID)**.

### 👤 3. Smart TikTok Profile Sync
- **Deteksi Otomatis Akun Aktif**: Otomatis mendeteksi username dan foto profil akun TikTok yang sedang login di tab aktif kamu.
- **Anti-Placeholder**: Mengabaikan avatar default passport (seperti inisial default) dan langsung menyinkronkan foto profil asli dari akun TikTok kamu.
- **One-Click Refresh**: Tombol sinkronisasi cepat untuk memperbarui data profil akun TikTok saat berpindah akun.

### 📊 4. Live Stats & Video Downloader
- **Best Time to Upload**: Analisis jam tayang terbaik berdasarkan performa video untuk memaksimalkan interaksi dan jangkauan audiens.
- **Downloader Terintegrasi**: Mengunduh video TikTok kualitas HD tanpa watermark dan mengekstrak audio MP3 langsung dari popup.

### 🔒 5. 100% Local & Privacy-Friendly
- Tidak memerlukan login ke bot Telegram atau server otentikasi eksternal.
- Tidak ada telemetry atau data pengguna yang dikirim ke server pihak ketiga. Semua konfigurasi tersimpan aman di `chrome.storage.local`.

---

## 📥 Cara Instalasi (Installation Guide)

Ikuti langkah-langkah mudah berikut untuk memasang ekstensi di browser berbasis Chromium (Google Chrome, Microsoft Edge, Brave, Opera, dll.):

1. **Unduh / Clone Repositori Ini**:
   ```bash
   git clone https://github.com/maulfx/kaycee_uploud.git
   ```
   *Atau klik tombol **Code** > **Download ZIP** dan ekstrak file zip tersebut di komputermu.*

2. **Buka Halaman Ekstensi di Chrome**:
   - Ketik alamat `chrome://extensions/` pada address bar browser kamu lalu tekan `Enter`.

3. **Aktifkan Mode Pengembang (Developer Mode)**:
   - Geser tombol **Developer mode** di pojok kanan atas ke posisi aktif (`ON`).

4. **Muat Ekstensi (Load Unpacked)**:
   - Klik tombol **Load unpacked** (atau **Muat yang belum dibongkar**) di pojok kiri atas.
   - Pilih folder tempat file ekstensi ini berada (`kaycee_uploud`).

5. **Selesai! ✨**:
   - Ikon **Kaycee :3** akan muncul di bar ekstensi browser.
   - Buka [TikTok Web](https://www.tiktok.com/) atau [TikTok Studio / Upload](https://www.tiktok.com/creator-center/upload), dan floating pill **Kaycee Enhance** akan aktif otomatis.

---

## 📂 Struktur File (Project Structure)

```plaintext
kaycee_uploud/
├── manifest.json         # Konfigurasi Manifest V3 Chrome Extension
├── background.js         # Service worker latar belakang (fetch helper & cache)
├── content.js            # Content script halaman TikTok (floating badge & auto-switch)
├── inject.js             # Main world script (60FPS URL & bypass hook)
├── popup.html            # Antarmuka Liquid Glass Popup
├── popup.js              # Logika UI, tema, color picker, downloader, dan stats
├── icons/                # Aset ikon resolusi tinggi (16x16, 32x32, 48x48, 128x128)
└── README.md             # Dokumentasi proyek
```

---

## ⚙️ Penggunaan (Usage)

1. **Mengunggah Video**:
   - Buka halaman upload TikTok seperti biasa.
   - Perhatikan badge **Kaycee Enhance** di pojok kanan bawah yang menyala hijau/cyan menandakan sistem siap dan bypass 60FPS aktif.
   - Unggah video MP4 / MOV 60 FPS kamu. Ekstensi akan otomatis memastikan opsi kualitas tinggi aktif dan mencegah reduksi bitrate.

2. **Mengubah Warna Tema**:
   - Buka popup ekstensi dengan mengklik ikon **Kaycee :3**.
   - Klik ikon kuas/palet di navbar atas untuk memunculkan pilihan warna.
   - Pilih salah satu dot warna favorit atau klik lingkaran pelangi untuk memilih warna custom secara bebas.

3. **Menyinkronkan Akun TikTok**:
   - Jika kamu baru saja login atau berganti akun di TikTok, buka popup dan klik ikon **Perbarui Akun** (tanda panah melingkar) di navbar atas.

---

## 🛡️ Kebijakan Privasi (Privacy Policy)

- **Lokal Sepenuhnya**: Semua data pengaturan (tema, bahasa, warna) disimpan di memori lokal browser kamu (`chrome.storage.local`).
- **Tanpa Pihak Ketiga**: Tidak ada pengumpulan data pribadi, password, atau cookie yang dikirim ke server luar.

---

## 💖 Kontribusi & Lisensi

Dibuat dengan cinta untuk para kreator TikTok yang mengutamakan kualitas visual terbaik. 
Dipersilakan untuk membuat *Issue* atau *Pull Request* jika kamu memiliki ide fitur baru atau perbaikan bug!

**Enjoy your crystal-clear 60FPS TikTok uploads! 🚀✨**
