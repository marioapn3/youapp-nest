# Nest-YouApp: Aplikasi Chat Real-Time

Nest-YouApp adalah aplikasi chat real-time berbasis [NestJS](https://nestjs.com/) untuk backend dan HTML sederhana untuk frontend. Aplikasi ini mendukung autentikasi pengguna, pembuatan ruang chat, dan pengiriman pesan secara real-time.

## Fitur Utama
- Registrasi & login pengguna
- Chat real-time (WebSocket)
- Manajemen ruang chat
- Frontend sederhana (HTML/JS)

## Struktur Direktori

```
├── src/                # Source code backend NestJS
│   ├── modules/        # Modul utama: auth, users, chats
│   ├── common/         # DTO, filter, interceptor, interface
│   ├── guards/         # Guard untuk auth & websocket
│   └── ...
├── frontend/           # Frontend HTML sederhana
│   ├── login.html      # Halaman login/register
│   ├── rooms.html      # Pilih/kelola ruang chat
│   └── chat.html       # Chat room
├── test/               # E2E tests
├── docker-compose.yaml # (Opsional) Jalankan dengan Docker
├── package.json        # Konfigurasi npm
└── README.md           # Dokumentasi
```

## Persiapan & Instalasi

1. **Clone repo & install dependencies**

```bash
npm install
```

2. **Konfigurasi environment**

Salin `.env.example` menjadi `.env` dan sesuaikan jika diperlukan.

3. **Jalankan backend**

```bash
# Mode development
npm run start:dev

# Mode production
npm run start:prod
```

Backend akan berjalan di `http://localhost:3000` secara default.

## Menjalankan Frontend

Frontend berupa file HTML statis di folder `frontend/`:
- `login.html` — Login/registrasi
- `rooms.html` — Pilih ruang chat
- `chat.html` — Chat room

Buka file HTML tersebut langsung di browser, atau gunakan ekstensi Live Server pada VSCode untuk pengalaman lebih baik.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker (Opsional)

Jalankan aplikasi menggunakan Docker Compose:

```bash
docker-compose up --build
```

## Kontribusi
Pull request dan issue sangat diterima!

## Lisensi

Aplikasi ini menggunakan lisensi MIT.
