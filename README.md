# Aplikasi Catatan Pribadi - Backend

Backend untuk aplikasi catatan pribadi menggunakan **Go + Chi Router + MySQL + JWT**.

## Tech Stack

- **Language**: Go 1.21
- **Framework**: Chi Router
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcrypt

## Struktur Folder

```
backend/
├── cmd/
│   └── main.go                  # Entry point aplikasi
├── internal/
│   ├── database/
│   │   └── database.go          # Koneksi MySQL
│   ├── handlers/
│   │   ├── auth.go              # Register & Login
│   │   ├── folders.go           # CRUD Folders
│   │   ├── notes.go             # CRUD Notes
│   │   └── tags.go              # CRUD Tags
│   ├── middleware/
│   │   └── auth.go              # JWT Middleware
│   ├── models/
│   │   ├── user.go              # Model User
│   │   ├── folder.go            # Model Folder
│   │   ├── note.go              # Model Note
│   │   └── tag.go               # Model Tag
│   └── utils/
│       ├── jwt.go               # JWT utilities
│       ├── password.go          # Password hashing
│       └── response.go          # JSON response helpers
├── migrations/
│   └── 001_create_tables.sql    # Database schema
├── .env                         # Environment variables
├── .env.example                 # Contoh environment variables
└── go.mod                       # Go dependencies
```

## Setup & Instalasi

### 1. Install Go

Pastikan Go sudah terinstall (versi 1.21 atau lebih baru):

```bash
go version
```

### 2. Install MySQL

Install MySQL atau gunakan XAMPP. Pastikan MySQL service sudah berjalan.

### 3. Buat Database

Buka MySQL dan buat database baru:

```sql
CREATE DATABASE notes_app;
```

### 4. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
copy .env.example .env
```

Edit `.env` sesuai konfigurasi MySQL kamu:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # kosongkan jika tidak pakai password
DB_NAME=notes_app

JWT_SECRET=ganti-dengan-secret-key-yang-kuat-minimal-32-karakter
PORT=8080
```

### 5. Install Dependencies

```bash
go mod download
```

### 6. Jalankan Migrasi Database

Jalankan SQL script untuk membuat tabel:

```bash
# Buka MySQL
mysql -u root -p notes_app < migrations/001_create_tables.sql
```

Atau copy-paste isi file `migrations/001_create_tables.sql` ke MySQL client/phpMyAdmin.

### 7. Jalankan Server

```bash
go run cmd/api/main.go
```

Server akan berjalan di `http://localhost:8080`

## API Endpoints

### Authentication (Public)

| Method | Endpoint        | Deskripsi            |
| ------ | --------------- | -------------------- |
| POST   | `/api/register` | Registrasi user baru |
| POST   | `/api/login`    | Login user           |

### Folders (Protected - Butuh JWT)

| Method | Endpoint           | Deskripsi          |
| ------ | ------------------ | ------------------ |
| GET    | `/api/folders`     | Ambil semua folder |
| POST   | `/api/folders`     | Buat folder baru   |
| PUT    | `/api/folders/:id` | Update folder      |
| DELETE | `/api/folders/:id` | Hapus folder       |

### Notes (Protected - Butuh JWT)

| Method | Endpoint                    | Deskripsi                       |
| ------ | --------------------------- | ------------------------------- |
| GET    | `/api/notes`                | Ambil semua catatan             |
| GET    | `/api/notes?folder_id=1`    | Filter catatan by folder        |
| GET    | `/api/notes?favorite=true`  | Filter catatan favorit          |
| GET    | `/api/notes?search=keyword` | Search catatan by title/content |
| GET    | `/api/notes/:id`            | Ambil detail catatan            |
| POST   | `/api/notes`                | Buat catatan baru               |
| PUT    | `/api/notes/:id`            | Update catatan                  |
| DELETE | `/api/notes/:id`            | Hapus catatan                   |

### Tags (Protected - Butuh JWT)

| Method | Endpoint                         | Deskripsi              |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/api/tags`                      | Ambil semua tag        |
| POST   | `/api/tags`                      | Buat tag baru          |
| DELETE | `/api/tags/:id`                  | Hapus tag              |
| POST   | `/api/notes/:noteId/tags/:tagId` | Tambah tag ke catatan  |
| DELETE | `/api/notes/:noteId/tags/:tagId` | Hapus tag dari catatan |

## Contoh Request

### 1. Register

```bash
POST http://localhost:8080/api/register
Content-Type: application/json

{
  "username": "alif",
  "email": "alif@example.com",
  "password": "password123",
  "full_name": "Alif Ramadhan"
}
```

### 2. Login

```bash
POST http://localhost:8080/api/login
Content-Type: application/json

{
  "email": "alif@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "alif",
      "email": "alif@example.com",
      "full_name": "Alif Ramadhan"
    }
  }
}
```

### 3. Buat Catatan (dengan JWT token)

```bash
POST http://localhost:8080/api/notes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Catatan Pertama",
  "content": "Ini adalah catatan pertama saya",
  "folder_id": 1,
  "is_favorite": false
}
```

## Database Schema

Total **5 tabel**:

1. **users** - Data user untuk authentication
2. **folders** - Kategori/folder untuk catatan
3. **notes** - Data catatan
4. **tags** - Tag/label untuk catatan
5. **note_tags** - Relasi many-to-many antara notes dan tags

## Testing dengan Postman/Hoppscotch

1. Import endpoint ke Postman
2. Register user baru
3. Login dan copy JWT token
4. Gunakan token di header `Authorization: Bearer <token>` untuk endpoint yang protected
5. Test semua CRUD operations

## Build untuk Production

```bash
go build -o server cmd/api/main.go
```

Jalankan:

```bash
./server
```

## Catatan

- Password di-hash menggunakan bcrypt sebelum disimpan ke database
- JWT token berlaku 24 jam
- Semua endpoint CRUD sudah dilindungi dengan middleware authentication
- User hanya bisa akses data miliknya sendiri (validasi user_id di setiap query)
