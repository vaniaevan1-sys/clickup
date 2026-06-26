# ClickUp Client Dashboard

Dashboard real-time untuk client, ditarik langsung dari ClickUp. Tanpa login, tinggal buka link.

---

## Deploy ke Vercel (5 menit)

### Step 1 — Upload ke GitHub

1. Buat repo baru di GitHub (bisa private)
2. Upload semua file ini ke repo tersebut

### Step 2 — Connect ke Vercel

1. Buka [vercel.com](https://vercel.com) → Login dengan GitHub
2. Klik **"Add New Project"**
3. Pilih repo yang baru dibuat → klik **Deploy**

### Step 3 — Tambah Environment Variables

Di Vercel, setelah project dibuat:
1. Masuk ke **Settings → Environment Variables**
2. Tambahkan variabel berikut:

| Name | Value |
|------|-------|
| `CLICKUP_API_KEY` | API Token ClickUp kamu |
| `CLICKUP_LIST_IDS` | List ID project (pisah koma kalau lebih dari satu) |
| `NEXT_PUBLIC_COMPANY_NAME` | Nama perusahaan kamu |

3. Klik **Save** → lalu **Redeploy**

### Step 4 — Ambil linknya

Vercel akan kasih URL seperti: `https://nama-project.vercel.app`

Kasih link ini ke client — bisa dibuka siapa aja, tanpa login!

---

## Cara dapat API Key ClickUp

1. Login ke ClickUp
2. Klik avatar kamu (pojok kiri bawah) → **Settings**
3. Klik **Apps** di menu kiri
4. Copy **API Token** di bagian atas

## Cara dapat List ID

1. Buka List yang mau ditampilkan di ClickUp
2. Lihat URL browser: `app.clickup.com/xxx/v/li/XXXXXXXXX`
3. Angka di bagian akhir URL itu adalah List ID kamu

---

## Fitur

- Realtime dari ClickUp (auto-refresh tiap 5 menit)
- Tampil status, due date, assignee tiap task
- Progress bar keseluruhan
- Highlight task yang overdue
- Responsive (mobile-friendly)
- Bisa multi-list (beberapa List dalam satu dashboard)
