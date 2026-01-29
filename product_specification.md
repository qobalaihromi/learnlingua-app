# LinguaSpace - Spesifikasi Produk Final

**Konsep:** Personal Language Gym (Tempat Latihan Bahasa Pribadi).
**Platform:** Web App (PWA) dengan Dual Layout.
**Multi-Language Support:** Fitur **"Study Space"**. User bisa punya ruang terpisah untuk "English Space" dan "Japanese Space" agar materi tidak tercampur, mirip workspace di Notion/Slack.

---

## 1. Fitur: INPUT BAHASA (Memasukkan & Menghafal) 📥

Modul ini fokus pada konsumsi materi dan internalisasi pola.

### A. Hafalan Kosakata (Vocab Deck)
*   **Fungsi:** Menyimpan kata-kata baru yang ditemukan dari artikel/video.
*   **Mekanisme:** Flashcard Klasik (Depan: Kata Inggris -> Belakang: Arti/Konteks).
*   **Input Data:** Manual input / Copy-paste dari kamus.

### B. Belajar Grammar (Grammar Deck)
*   **Fungsi:** Menguasai pola kalimat tenses tanpa pusing teori.
*   **Mekanisme:** Flashcard Pola.
    *   *Depan:* Rumus + Penjelasan Singkat (S + Will + V1).
    *   *Belakang:* 3 Contoh Kalimat yang menggunakan rumus itu.

### C. Hafalan Dialog (Roleplay Script)
*   **Fungsi:** Menghapal *flow* percakapan daily/kantor.
*   **Mekanisme:** Script Viewer.
    *   Anda meng-copy dialog dari ChatGPT (misal: "Percakapan Meeting Pagi").
    *   Aplikasi memecahnya menjadi baris-baris.
    *   Setiap baris bisa diklik untuk melihat arti atau grammar (jika ada notes).

---

## 2. Fitur: OUTPUT BAHASA (Melatih Penggunaan) 📤

Modul ini fokus pada produksi aktif (Speaking & Writing).

### A. Listening & Speaking (Roleplay Recorder) 🗣️
*   **Best Practice:** Teknik *Shadowing & Recording*.
*   **Cara Kerja:**
    1.  Buka salah satu script dialog yang sudah disimpan.
    2.  Pilih peran (misal: Anda jadi Designer).
    3.  Aplikasi membacakan peran lawan (suara robot).
    4.  **REKAM:** Saat giliran Anda, tekan Mic dan rekam suara Anda.
    5.  **BANDINGKAN:** Dengarkan rekaman Anda vs Suara Native (TTS). Koreksi intonasi sendiri.

### B. Writing (Daily Journaling) ✍️
*   **UI/Frontend (Web vs Native):**
    *   **Web: Next.js** (Pilihan kita sekarang).
    *   **Mobile: React Native** (Target masa depan).
    *   *Kenapa Cocok?* Keduanya menggunakan bahasa yang sama (React/TypeScript).
    *   *Code Sharing:* Logic bisnis, Model WatermelonDB, dan Hooks bisa dipakai ulang 100%. Anda hanya perlu menulis ulang layout visual (DIV -> VIEW). Ini adalah **"Combo Standar Industri"** (dipakai Twitter, Uber, dll).
*   **Fungsi:** Melatih menuangkan pikiran ke bahasa Inggris setiap hari.
*   **Cara Kerja:**
    1.  Tersedia editor teks simpel "My Daily Journal".
    2.  Anda menulis 1 paragraf tentang hari ini.
    3.  **Self-Correction:** Anda bisa meng-copy tulisan Anda sendiri ke ChatGPT di luar aplikasi untuk minta koreksi, lalu simpan hasil koreksiannya di sini sebagai "Corrected Version" untuk dipelajari besok.

---

## 3. Fitur: TRACK PROGRESS LAPANGAN 📊

Dashboard yang jujur tentang seberapa keras Anda berlatih.

*   **Vocab Count:** Jumlah kata yang sudah ditandai "Hafal".
*   **Grammar Mastery:** Jumlah kartu grammar yang sudah selesai dipelajari.
*   **Dialog Completed:** Berapa skenario percakapan yang sudah selesai dilatih (Shadowing).
*   **Journal Volume:** Total kata yang sudah Anda tulis di jurnal hari ini/minggu ini.

---

## 5. Bedah Teknologi (Technical Anatomy) 🏗️

Agar Anda paham "Jeroan" aplikasi ini:

### A. Frontend (Wajah Aplikasi)
*   **Stack:** Next.js 15, Tailwind CSS, WatermelonDB (High Perf DB).
*   **UI Components (New):**
    *   **Shadcn UI:** Koleksi komponen premium (Dialog, Tabs, Input) yang *accessible* dan cantik. Standar baru desain React.
    *   **Lucide Icons:** Ikon vektor yang bersih dan modern.
*   **Next.js 15 (App Router):** Kerangka utama aplikasi. Cepat, modern, dan SEO-friendly.
*   **Tailwind CSS:** "Make-up" aplikasi. Membuat tampilan cantik, responsif (bagus di Laptop & HP), dan premium.
*   **Framer Motion:** "Otot" animasi. Membuat kartu berbalik mulus, confetti meledak, dan transisi halaman yang enak dilihat.

### B. Backend (Otak Aplikasi) - *High Performance Local-First* 🍉
*   **WatermelonDB:** Database performa tinggi yang digunakan oleh aplikasi skala besar.
    *   **Lazy Loading:** Sangat cepat. Hanya memuat data yang dilihat di layar. Punya 10.000 vocab tidak akan membuat HP lemot.
    *   **Future Proof:** Saat nanti kita buat Android App (Native), WatermelonDB bisa langsung bicara dengan SQLite (JSI) untuk performa 10x lebih cepat dari database biasa.
    *   *Analogi:* Ini bukan sekadar Memory Card, ini SSD NVMe untuk aplikasi Anda.

### C. AI & Intelligence (Kecerdasan) 🤖
*   **Web Speech API (Browser Native):**
    *   Kita tidak sewa API mahal dari Google/OpenAI.
    *   Kita "meminjam" fitur Speech-to-Text yang sudah ada di browser Laptop/HP Anda untuk fitur *Listening* & *Speaking check*.

### D. Hosting (Rumah Aplikasi)
*   **Vercel:** Tempat kita menaruh file website agar bisa diakses via internet (`linguaworkspace.vercel.app`). Gratis untuk hobi.

---

## 6. Road Map Pengembangan
1.  **Phase 1:** Setup Project & UI Dasar (Dual Layout).
2.  **Phase 2:** Database Lokal & Management Deck (Input).
3.  **Phase 3:** Integrasi YouTube & Article Reader.
4.  **Phase 4:** Fitur Latihan (Speaking, Flashcard).
5.  **Phase 5:** Polishing (Animasi & Confetti).
