<div align="center">

  <img src="icons/icon128.png" alt="Kaycee Studio Icon" width="120" height="120" style="border-radius: 50%; box-shadow: 0 8px 30px rgba(168, 85, 247, 0.4);" />

  # ✨ Kaycee Studio (Beta)
  **High-Quality 60FPS Lossless TikTok Upload Manager & Creator Studio Enhancement**

  <p>
    <img src="https://img.shields.io/badge/Manifest-V3-9333ea?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3" />
    <img src="https://img.shields.io/badge/Version-v1.1.0--Beta-a855f7?style=for-the-badge" alt="Version Beta" />
    <img src="https://img.shields.io/badge/Architecture-100%25%20Local-10b981?style=for-the-badge" alt="Local Mode" />
    <img src="https://img.shields.io/badge/FPS-60FPS%20Forced-06b6d4?style=for-the-badge" alt="60 FPS" />
  </p>

  <p align="center">
    Ekstensi Chrome Manifest V3 modern untuk kreator konten TikTok. Memaksimalkan kualitas upload video hingga <b>60 FPS tanpa penurunan bitrate/kompresi agresif</b>, dilengkapi <b>sistem cache profil dinamis</b> yang bekerja mulus di TikTok biasa maupun TikTok Studio, serta widget mengambang interaktif. Berjalan <b>100% secara lokal</b> di browser Anda tanpa server pihak ketiga.
  </p>

</div>

---

## 🌟 Fitur Utama (Key Features)

### 🚀 1. 60FPS Force & Lossless Bitrate Bypass
- **Bypass Canvas Compression**: Mencegah browser dan skrip re-encode bawaan TikTok menurunkan resolusi video asli kamu ke 576p.
- **Auto High Quality Switch**: Secara otomatis mengaktifkan opsi *"Allow high quality uploads"* / *"Izinkan unggahan berkualitas tinggi"* di antarmuka TikTok Studio tanpa perlu diklik manual setiap kali upload.
- **Header Injection & Hook**: Menyuntikkan konfigurasi upload beresolusi tinggi langsung ke pipeline unggahan TikTok.

### 🖼️ 2. Dynamic Avatar & Multi-Account Offline Cache *(Baru di v1.1.0)*
- **Offline Base64 Caching**: Otomatis mendeteksi foto profil akun TikTok yang sedang aktif dan menyimpannya sebagai Base64 data URL di penyimpanan lokal ekstensi.
- **TikTok Studio Sync**: Saat Anda berpindah ke halaman TikTok Studio / Creator Center (di mana data foto profil sering disembunyikan/terkendala WAF), foto profil akun Anda tetap muncul instan (0ms) dari cache lokal.
- **Anti-Expired & Anti-403**: Kebal terhadap masa kedaluwarsa link CDN TikTok dan error *Referrer-Policy / 403 Forbidden*.
- **Isolasi Multi-Akun**: Setiap akun memiliki cache profil tersendiri. Tidak ada kebocoran foto antar-akun, dan akun tanpa foto profil akan otomatis menampilkan inisial akun yang rapi.

### 🎛️ 3. Seamless Floating FAB & In-Page Studio
- **Transformasi Ikon & Popup (Single Window)**: Ikon mengambang (Floating Action Button) di halaman TikTok langsung bertransformasi menjadi panel popup Kaycee Studio saat diklik, dan kembali menjadi ikon saat ditutup tanpa menduplikasi jendela.
- **Smooth Dragging**: Pergerakan widget di layar dioptimalkan dengan akselerasi perangkat keras (*hardware-accelerated CSS transform*), halus dan tidak patah-patah.
- **Active Video Detection**: Mendeteksi video yang sedang diputar di feed maupun halaman *For You* TikTok untuk inspeksi dan unduhan langsung.

### 🎨 4. Liquid Glass UI & Custom Color Engine
- **Liquid Glass Aesthetic**: Tampilan antarmuka popup berbasis *glassmorphism* modern dengan efek frosted glass, rim reflections, dan ambient glow dinamis.
- **Custom Color Picker**: Dilengkapi palet preset warna (*Royal Violet, Cyber Cyan, Neon Rose, Emerald Green, Solar Orange, Ocean Blue*) serta pemilih warna bebas (*color wheel*).
- **Dark / Light Theme Toggle**: Transisi mulus antara mode gelap dan mode terang.
- **Bilingual Interface**: Dukungan bahasa **English (EN)** dan **Bahasa Indonesia (ID)**.

### 📊 5. Live Stats & Video Downloader
- **Best Time to Upload**: Analisis jam tayang terbaik berdasarkan performa video untuk memaksimalkan interaksi dan jangkauan audiens.
- **Downloader Terintegrasi**: Mengunduh video TikTok kualitas HD tanpa watermark dan mengekstrak audio MP3 langsung dari antarmuka ekstensi.

### 🔒 6. 100% Local & Privacy-Friendly
- Tidak memerlukan login ke bot Telegram atau server otentikasi eksternal.
- Tidak ada telemetry atau data pengguna yang dikirim ke server luar. Semua konfigurasi tersimpan aman di `chrome.storage.local`.

---

## 📥 Cara Instalasi (Installation Guide)

1. **Unduh / Clone Repositori Ini**:
   ```bash
   git clone https://github.com/maulfx/kaycee_uploud.git
   ```
   *Atau klik tombol **Code** > **Download ZIP** dan ekstrak file zip tersebut di komputer Anda.*

2. **Buka Halaman Ekstensi di Chrome**:
   - Ketik alamat `chrome://extensions/` pada address bar browser Anda lalu tekan `Enter`.

3. **Aktifkan Mode Pengembang (Developer Mode)**:
   - Geser tombol **Developer mode** di pojok kanan atas ke posisi aktif (`ON`).

4. **Muat Ekstensi (Load Unpacked)**:
   - Klik tombol **Load unpacked** (atau **Muat yang belum dibongkar**) di pojok kiri atas.
   - Pilih folder tempat file ekstensi ini berada (`kaycee_uploud`).

5. **Selesai! ✨**:
   - Ekstensi **Kaycee Studio** siap digunakan.
   - Buka [TikTok Web](https://www.tiktok.com/) atau [TikTok Studio](https://www.tiktok.com/creator-center/upload), dan widget interaktif akan otomatis aktif.

---

## 📂 Struktur File (Project Structure)

```plaintext
kaycee_uploud/
├── manifest.json         # Konfigurasi Manifest V3 Chrome Extension
├── background.js         # Service worker (Base64 avatar cache & background fetcher)
├── content.js            # Content script halaman TikTok (FAB widget & DOM detector)
├── inject.js             # Main world script (60FPS URL & upload hook)
├── popup.html            # Antarmuka Liquid Glass Popup
├── popup.js              # Logika UI, tema, color picker, downloader, dan stats
├── icons/                # Aset ikon ekstensi (16x16, 32x32, 48x48, 128x128)
└── README.md             # Dokumentasi proyek
```

---

## 📋 Catatan Rilis (Release Notes)

### 🏷️ `v1.1.0-beta` *(Versi Terbaru)*
- **Fitur Baru**: Sistem *Dynamic Avatar Cache* berbasis Base64 lokal—foto profil TikTok tersimpan otomatis dan tetap muncul mulus di halaman TikTok Studio / Creator Center.
- **Multi-Akun Dinamis**: Mendukung deteksi akun jamak secara terisolasi tanpa file gambar hardcoded.
- **Peningkatan FAB**: Floating Action Button berubah langsung menjadi panel ekstensi dan kembali menjadi ikon tanpa membuka jendela ganda.
- **Optimasi Performa**: Menggunakan akselerasi CSS transform untuk dragging yang sangat halus tanpa lag.
- **Perbaikan Deteksi Feed**: Deteksi pemutaran video aktif di halaman *For You* dan feed TikTok.
- **Rebranding**: Pembaruan nama resmi menjadi **Kaycee Studio**.

### 🏷️ `v1.0.0` *(Legacy)*
- Rilis awal ekstensi dengan fitur 60FPS TikTok upload bypass, tema liquid glass, dan downloader.

---

## 🛡️ Kebijakan Privasi (Privacy Policy)

- **Lokal Sepenuhnya**: Semua data pengaturan dan cache disimpan di memori lokal browser (`chrome.storage.local`).
- **Tanpa Pihak Ketiga**: Tidak ada pengumpulan data pribadi, password, atau cookie yang dikirim ke server luar.

---

## 💖 Kontribusi & Lisensi

Dibuat untuk para kreator TikTok yang mengutamakan kualitas visual dan performa terbaik. 
Dipersilakan untuk membuat *Issue* atau *Pull Request* jika Anda memiliki saran fitur baru atau menemukan kendala!

**Enjoy your crystal-clear 60FPS TikTok uploads with Kaycee Studio! 🚀✨**
