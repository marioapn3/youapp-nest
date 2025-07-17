# Nest YouApp - HTML Frontend

Frontend sederhana menggunakan HTML, CSS, dan JavaScript vanilla untuk testing fitur backend Nest YouApp.

## 📁 File yang Tersedia

1. **`login.html`** - Halaman login dan register
2. **`rooms.html`** - Halaman daftar percakapan/rooms
3. **`chat.html`** - Halaman chat real-time

## 🚀 Cara Menggunakan

### 1. Persiapan
- Pastikan backend NestJS sudah berjalan di `http://localhost:3000`
- Buka file HTML menggunakan browser (Chrome, Firefox, Safari, dll)

### 2. Testing Flow

#### Langkah 1: Login/Register
1. Buka `login.html` di browser
2. Pilih mode **Login** atau **Register**
3. Isi form dengan data yang valid:
   - **Login**: Email/Username + Password
   - **Register**: Email + Username + Password + Confirm Password
4. Klik tombol "Sign In" atau "Sign Up"
5. Jika berhasil, akan otomatis redirect ke `rooms.html`

#### Langkah 2: Melihat Rooms/Conversations
1. Setelah login, akan masuk ke halaman `rooms.html`
2. Halaman ini menampilkan daftar percakapan yang tersedia
3. Fitur yang tersedia:
   - **Search conversations** - mencari percakapan
   - **Room cards** - kartu percakapan dengan info terakhir
   - **Unread badges** - indikator pesan belum dibaca
   - **Open Chat** - tombol untuk membuka chat

#### Langkah 3: Chat Real-time
1. Klik tombol "Open Chat" pada salah satu room
2. Akan masuk ke halaman `chat.html`
3. Fitur chat yang tersedia:
   - **Real-time messaging** menggunakan WebSocket
   - **Connection status** - indikator koneksi WebSocket
   - **Message history** - riwayat pesan
   - **Send messages** - kirim pesan baru
   - **Auto-scroll** - otomatis scroll ke pesan terbaru

## 🔧 Fitur yang Diimplementasi

### Authentication (`login.html`)
- ✅ Login dengan email/username + password
- ✅ Register dengan email + username + password
- ✅ Form validation dan error handling
- ✅ JWT token storage di localStorage
- ✅ Auto-redirect setelah login berhasil
- ✅ Toggle antara mode login dan register

### Rooms Management (`rooms.html`)
- ✅ Fetch rooms dari API backend
- ✅ Display rooms dalam card layout
- ✅ Search functionality
- ✅ Mock data untuk testing
- ✅ User info display
- ✅ Logout functionality

### Real-time Chat (`chat.html`)
- ✅ WebSocket connection dengan Socket.IO
- ✅ Real-time message sending/receiving
- ✅ Message history display
- ✅ Connection status indicator
- ✅ Responsive design
- ✅ Auto-resize textarea
- ✅ Enter key untuk send message

## 🎨 Design Features

- **Modern UI** dengan gradient colors
- **Responsive design** untuk mobile dan desktop
- **Smooth animations** dan transitions
- **Loading states** dan error handling
- **Clean typography** dan spacing
- **Intuitive navigation** antar halaman

## 🔗 API Integration

### Endpoints yang Digunakan:
- `POST /login` - User login
- `POST /register` - User registration
- `GET /viewRooms` - Get user's conversations
- `GET /viewMessages` - Get messages for a room
- `POST /sendMessage` - Send a message

### WebSocket Events:
- `connectionSuccess` - Koneksi WebSocket berhasil
- `newMessage` - Pesan baru diterima
- `messageSent` - Pesan berhasil dikirim
- `disconnect` - Koneksi terputus

## 🧪 Testing Tips

### Testing Multi-User Chat:
1. Buka `login.html` di 2 tab browser berbeda
2. Register/login dengan user yang berbeda
3. Pilih room yang sama di kedua tab
4. Kirim pesan dari salah satu tab
5. Pesan akan muncul real-time di tab lainnya

### Testing WebSocket Connection:
- Perhatikan indikator "Connected" di header chat
- Jika "Disconnected", refresh halaman atau cek backend

### Testing Error Handling:
- Coba login dengan password salah
- Coba akses chat tanpa login
- Coba kirim pesan saat WebSocket disconnect

## 🐛 Troubleshooting

### Masalah Umum:

1. **CORS Error**
   - Pastikan backend mengizinkan CORS dari frontend
   - Backend harus berjalan di `http://localhost:3000`

2. **WebSocket Connection Failed**
   - Pastikan backend WebSocket gateway aktif
   - Cek console browser untuk error details

3. **Authentication Failed**
   - Pastikan format data login/register sesuai
   - Cek response dari backend di Network tab

4. **Messages Not Loading**
   - Cek apakah token JWT masih valid
   - Refresh halaman atau login ulang

## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🚀 Quick Start

1. **Start backend:**
   ```bash
   npm run start:dev
   ```

2. **Open frontend:**
   - Buka `login.html` di browser
   - Atau gunakan live server: `python -m http.server 8000`

3. **Test flow:**
   - Register → Login → Rooms → Chat

## 📝 Notes

- File ini menggunakan **mock data** untuk demo jika backend belum siap
- **Socket.IO CDN** digunakan untuk WebSocket functionality
- **LocalStorage** digunakan untuk menyimpan token dan user data
- Semua styling menggunakan **vanilla CSS** tanpa framework

## 🔄 Update Log

- **v1.0** - Initial release dengan 3 file HTML
- Fitur: Login, Rooms, Real-time Chat
- WebSocket integration dengan Socket.IO
- Responsive design dan modern UI 