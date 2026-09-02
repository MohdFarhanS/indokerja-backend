# IndoKerja Backend

Backend REST API untuk IndoKerja, platform lowongan kerja yang menghubungkan pencari kerja
(`JOB_SEEKER`) dan perusahaan (`COMPANY`). API ini menangani autentikasi, lowongan, lamaran,
otorisasi berbasis role, ownership data, serta riwayat perubahan status lamaran.

## Tentang IndoKerja

IndoKerja menyediakan backend untuk workflow utama berikut:

- `JOB_SEEKER`: melihat daftar dan detail lowongan, melamar, lalu memantau status lamaran sendiri.
- `COMPANY`: membuat dan melihat lowongan miliknya, melihat kandidat pada lowongan tersebut, lalu
  memperbarui status lamaran kandidat.

Frontend berkomunikasi dengan backend melalui REST API. Backend tetap menjadi batas keamanan utama
untuk autentikasi, role, ownership, validasi input, dan aturan bisnis.

## Fitur Backend

### Authentication

- Registrasi akun `JOB_SEEKER` dan `COMPANY`.
- Login dan pengambilan data pengguna yang sedang terautentikasi.
- JWT Bearer authentication dengan verifikasi signature, expiry, dan algoritma `HS256`.
- Role-based authorization untuk memisahkan akses kedua role.

### Jobs

- Daftar dan detail lowongan untuk `JOB_SEEKER` terautentikasi.
- Pembuatan lowongan oleh `COMPANY`.
- Daftar lowongan yang dimiliki `COMPANY` terautentikasi.

### Applications

- Pengajuan lamaran oleh `JOB_SEEKER`.
- Pencegahan lamaran ganda pada lowongan yang sama.
- Daftar lamaran milik `JOB_SEEKER`.
- Daftar kandidat pada lowongan milik `COMPANY`.
- Pembaruan status kandidat dan pencatatan riwayat status.
- Perlindungan terhadap pembaruan status serentak yang saling menimpa.

### Security

Backend menerapkan bcrypt, JWT, role dan ownership validation, strict request validation, safe
response projection, Helmet, CORS terbatas, rate limiting pada endpoint autentikasi, batas body JSON,
transaksi Prisma, serta database constraints.

## Teknologi yang Digunakan

Versi berikut berasal dari dependency dan konfigurasi repository saat ini.

| Teknologi           | Versi                  | Kegunaan                                                    |
| ------------------- | ---------------------- | ----------------------------------------------------------- |
| Node.js             | Tidak ditetapkan       | Runtime aplikasi; repository tidak menetapkan versi minimum |
| Express             | 5.2.1                  | HTTP server dan routing REST API                            |
| TypeScript          | 5.9.3                  | Static typing dengan strict mode                            |
| Prisma ORM / Client | 6.19.3                 | Schema, migration, dan akses PostgreSQL                     |
| PostgreSQL          | Sesuai database target | Penyimpanan data relasional                                 |
| Zod                 | 4.5.4                  | Validasi environment, body, parameter, dan enum             |
| bcrypt              | 6.0.0                  | Hash dan verifikasi password                                |
| jsonwebtoken        | 9.0.3                  | Pembuatan dan verifikasi JWT                                |
| Helmet              | 8.3.0                  | Security-related HTTP headers                               |
| CORS                | 2.8.6                  | Pembatasan origin frontend                                  |
| express-rate-limit  | 8.7.0                  | Rate limiting endpoint autentikasi                          |
| Jest / Supertest    | 30.5.1 / 7.2.2         | Unit, HTTP, dan integration test                            |
| ESLint / Prettier   | 10.9.1 / 3.9.6         | Lint dan format source code                                 |

> `package.json` tidak memiliki field `engines`, `.nvmrc`, atau `.node-version`. Gunakan versi Node.js
> aktif/LTS yang kompatibel dengan dependency di atas.

## Arsitektur Backend

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma ORM
  ↓
PostgreSQL
```

- **Route** mendefinisikan endpoint dan rangkaian middleware.
- **Middleware** menangani autentikasi, otorisasi, validasi, rate limiting, dan error handling.
- **Controller** menerjemahkan HTTP request/response dan meneruskan error secara terpusat.
- **Service** menjalankan aturan bisnis, ownership check, transaksi, dan operasi database.
- **Prisma ORM** menjadi data-access layer untuk PostgreSQL.

## Struktur Folder

```text
indokerja-backend/
├── api/
│   └── index.ts
├── docs/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── config/
│   ├── integration/
│   ├── middlewares/
│   ├── modules/
│   │   ├── applications/
│   │   ├── auth/
│   │   └── jobs/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.local.ts
├── .env.example
├── package.json
├── tsconfig.json
└── vercel.json
```

`src/app.ts` mengonfigurasi Express tanpa memanggil `listen()`. Entry point pengembangan lokal berada
di `src/server.local.ts`, sedangkan `api/index.ts` mengekspor aplikasi untuk runtime serverless.

## Prasyarat

- Node.js dan npm yang kompatibel dengan dependency project.
- PostgreSQL lokal atau hosted PostgreSQL yang kompatibel, misalnya Neon.
- Git.

## Instalasi

1. Clone repository dan masuk ke direktori project:

   ```bash
   git clone https://github.com/MohdFarhanS/indokerja-backend.git
   cd indokerja-backend
   ```

2. Install dependency dari lockfile:

   ```bash
   npm ci
   ```

   Script `postinstall` otomatis menjalankan `prisma generate`. Gunakan `npm install` bila memang
   sedang memperbarui dependency atau lockfile.

## Konfigurasi Environment

Salin template environment dengan salah satu perintah berikut.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Unix/macOS:

```bash
cp .env.example .env
```

Kemudian sesuaikan nilai `.env` untuk lingkungan lokal. File `.env` berisi credential dan **tidak
boleh di-commit**.

| Variable         | Wajib | Keterangan                                                                           | Contoh aman                                     |
| ---------------- | ----- | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `NODE_ENV`       | Tidak | `development`, `production`, atau `test`; default `development`                      | `development`                                   |
| `PORT`           | Tidak | Port server lokal, integer `1`–`65535`; default `4000`                               | `4000`                                          |
| `DATABASE_URL`   | Ya    | PostgreSQL connection URL yang digunakan aplikasi                                    | `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `DIRECT_URL`     | Ya    | Direct PostgreSQL URL untuk operasi migration                                        | `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `JWT_SECRET`     | Ya    | Secret JWT minimal 32 byte UTF-8                                                     | `ganti-dengan-random-secret-minimal-32-byte`    |
| `JWT_EXPIRES_IN` | Tidak | Durasi positif JWT dengan unit `ms`, `s`, `m`, `h`, `d`, `w`, atau `y`; default `1d` | `1d`                                            |
| `CORS_ORIGIN`    | Ya    | Origin frontend yang diizinkan, harus diisi persis                                   | `http://localhost:5173`                         |

Contoh `.env.example` menggunakan placeholder dan bukan credential aktif.

## Menyiapkan Database

1. Pastikan `DATABASE_URL` dan `DIRECT_URL` mengarah ke database PostgreSQL yang benar.
2. Generate Prisma Client bila belum dijalankan melalui instalasi:

   ```bash
   npm run prisma:generate
   ```

3. Terapkan migration yang sudah tersimpan di repository:

   ```bash
   npm run prisma:migrate
   ```

   Script tersebut menjalankan `prisma migrate deploy` dan cocok untuk menerapkan existing
   migrations tanpa membuat migration baru. Saat mengembangkan perubahan schema secara lokal,
   `npx prisma migrate dev` digunakan untuk membuat dan menerapkan migration baru; jangan gunakan
   `prisma db push` sebagai pengganti migration yang menjadi source of truth.

### Seed Database

Untuk mengisi data demo secara idempotent:

```bash
npx prisma db seed
```

Seed membuat satu Job Seeker, dua Company, tiga lowongan, dua lamaran, dan status history terkait.
Data ini hanya untuk pengembangan/demo, bukan production.

> **Peringatan:** Jangan menjalankan seed ini pada database production. Seeder membuat akun demo
> dengan kredensial yang diketahui publik dan hanya ditujukan untuk pengembangan, pengujian,
> atau demonstrasi lokal.

| Role         | Email                             | Password demo |
| ------------ | --------------------------------- | ------------- |
| `JOB_SEEKER` | `jobseeker@demo.indokerja.test`   | `Demo123!`    |
| `COMPANY`    | `company.one@demo.indokerja.test` | `Demo123!`    |
| `COMPANY`    | `company.two@demo.indokerja.test` | `Demo123!`    |

## Menjalankan Aplikasi

Development dengan automatic restart:

```bash
npm run dev
```

Server lokal berjalan pada `http://localhost:<PORT>`; default-nya `http://localhost:4000`.

Build production TypeScript:

```bash
npm run build
```

Repository tidak mendefinisikan script `start`. Entry point deployment saat ini adalah
`api/index.ts`; jangan mengasumsikan `npm start` tersedia.

### Health Check

```http
GET /api/health
```

Endpoint ini public dan mengembalikan respons seperti:

```json
{
  "status": "ok",
  "timestamp": "2026-09-02T00:00:00.000Z"
}
```

Nilai `timestamp` dibuat ketika request diterima.

## Autentikasi API

Endpoint terproteksi memerlukan access token dari login:

```http
Authorization: Bearer <access-token>
```

Flow autentikasi:

```text
register → login → dapatkan data.accessToken → kirim Bearer token
```

Registrasi hanya mengembalikan data user yang aman dan **tidak** mengembalikan token. Token diperoleh
dari `POST /api/auth/login` dan memiliki expiry sesuai `JWT_EXPIRES_IN`.

### Role

| Role         | Hak Akses Utama                                                                  |
| ------------ | -------------------------------------------------------------------------------- |
| `JOB_SEEKER` | Melihat lowongan, melamar, dan melihat lamaran sendiri                           |
| `COMPANY`    | Membuat/melihat lowongan sendiri serta melihat dan memperbarui kandidat miliknya |

## Endpoint API

Semua path menggunakan prefix `/api`.

| Method  | Endpoint                                  | Role          | Keterangan                                |
| ------- | ----------------------------------------- | ------------- | ----------------------------------------- |
| `GET`   | `/api/health`                             | Public        | Health check aplikasi                     |
| `POST`  | `/api/auth/register`                      | Public        | Registrasi Job Seeker atau Company        |
| `POST`  | `/api/auth/login`                         | Public        | Login dan memperoleh access token         |
| `GET`   | `/api/auth/me`                            | Authenticated | Data user berdasarkan token aktif         |
| `GET`   | `/api/jobs`                               | `JOB_SEEKER`  | Daftar lowongan                           |
| `GET`   | `/api/jobs/:jobId`                        | `JOB_SEEKER`  | Detail lowongan                           |
| `POST`  | `/api/jobs`                               | `COMPANY`     | Membuat lowongan milik Company aktif      |
| `GET`   | `/api/company/jobs`                       | `COMPANY`     | Daftar lowongan milik Company aktif       |
| `POST`  | `/api/jobs/:jobId/applications`           | `JOB_SEEKER`  | Melamar ke lowongan; body harus kosong    |
| `GET`   | `/api/applications/me`                    | `JOB_SEEKER`  | Daftar lamaran sendiri                    |
| `GET`   | `/api/jobs/:jobId/applications`           | `COMPANY`     | Kandidat pada lowongan milik Company      |
| `PATCH` | `/api/applications/:applicationId/status` | `COMPANY`     | Memperbarui status kandidat milik Company |

Tabel memuat 12 route, terdiri atas satu health check dan 11 route API fitur. Parameter `jobId` dan
`applicationId` harus berupa UUID.

### Job Type

Nilai `jobType` yang diterima:

- `FULL_TIME`
- `PART_TIME`
- `CONTRACT`
- `INTERNSHIP`

### Status Lamaran

Nilai `status` yang tersedia:

- `APPLIED`
- `REVIEWING`
- `SHORTLISTED`
- `REJECTED`
- `ACCEPTED`

Backend selalu menetapkan status awal `APPLIED`. Company dapat berpindah ke status lain yang valid
tanpa state machine linear, tetapi hanya untuk application pada lowongan miliknya.

## Aturan Bisnis Penting

- Satu Job Seeker hanya dapat melamar sekali pada job yang sama.
- Ownership job dan application ditentukan dari user pada token, bukan dari input client.
- Company hanya dapat melihat dan memperbarui kandidat pada job miliknya.
- Pembuatan application dan history awal `APPLIED` dilakukan dalam satu transaksi.
- Pembaruan ke status yang sama ditolak dengan `400 Bad Request` dan tidak membuat history.
- Perubahan status dan history baru disimpan dalam satu transaksi.
- Status update serentak dilindungi secara optimistis; request yang kehilangan race mendapat
  `409 Conflict` dan perlu mengambil state terbaru.
- Database juga menjamin keunikan pasangan `jobId` dan `jobSeekerId`.

## Validasi

Body dan route params divalidasi dengan Zod. Object schema bersifat strict sehingga field tambahan
ditolak, termasuk field yang dapat menyebabkan mass assignment. UUID dan enum yang tidak valid juga
ditolak.

Boundary penting untuk lowongan:

- `title` dan `location`: setelah trim, 1–150 karakter.
- `salary`: integer positif hingga `2,147,483,647`.
- `description`: setelah trim, 1–10.000 karakter.
- `jobType`: salah satu enum Job Type yang didukung.

### Password

Password registrasi harus:

- minimal 12 karakter dan maksimal 72 byte UTF-8;
- memiliki huruf besar ASCII, huruf kecil ASCII, angka, dan simbol;
- tidak menganggap whitespace sebagai simbol.

Password tidak di-trim sehingga whitespace dipertahankan. Pada login, password wajib tidak kosong
dan tetap dibatasi maksimal 72 byte UTF-8. Password demo dari seed dibuat langsung untuk data lokal
dan bukan contoh password yang lolos kebijakan registrasi.

## Format Respons Error

Format error umum:

```json
{
  "success": false,
  "message": "Pesan error yang aman"
}
```

Validation error menambahkan object `errors` per field:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"]
  }
}
```

Malformed JSON menghasilkan `400` dengan message `Invalid JSON payload`. Error internal tidak
mengekspos Prisma error, stack trace, atau detail rahasia.

### HTTP Status Penting

| Status                      | Arti dalam API                                                          |
| --------------------------- | ----------------------------------------------------------------------- |
| `200 OK`                    | Request baca, login, atau status update berhasil                        |
| `201 Created`               | Registrasi, job, atau application berhasil dibuat                       |
| `400 Bad Request`           | Validasi/malformed JSON gagal atau status baru sama dengan status aktif |
| `401 Unauthorized`          | Token tidak ada/tidak valid/kedaluwarsa atau login gagal                |
| `403 Forbidden`             | Role atau ownership tidak mengizinkan operasi                           |
| `404 Not Found`             | Route atau resource tidak ditemukan                                     |
| `409 Conflict`              | Email/application duplikat atau konflik concurrent status update        |
| `429 Too Many Requests`     | Batas percobaan autentikasi terlampaui                                  |
| `500 Internal Server Error` | Error tak terduga dengan respons aman                                   |

## Keamanan

Backend menerapkan beberapa lapisan keamanan berikut:

- Password di-hash dengan bcrypt cost factor 12.
- JWT menggunakan `HS256`, expiry wajib, payload tervalidasi, dan secret minimal 32 byte UTF-8.
- RBAC dan ownership validation dijalankan server-side pada setiap operasi terkait.
- Zod strict schemas dan explicit Prisma field mapping mencegah mass assignment.
- Response projection tidak menyertakan `passwordHash`, secret, atau internal Prisma.
- Helmet, exact configured CORS origin, body JSON maksimum `100kb`, dan rate limit 20 request per 15
  menit pada login/registrasi.
- Transaksi menjaga coupled writes; unique constraints menjaga integritas database.
- Optimistic concurrency check mencegah status update paralel saling menimpa tanpa terdeteksi.

Perlindungan ini harus tetap dikombinasikan dengan pengelolaan secret, database, dependency, dan
infrastruktur yang benar pada tiap environment.

## Pengujian

Unit dan HTTP tests (service, middleware, schema, controller, dan app):

```bash
npm test -- --runInBand
```

Integration test database-backed untuk workflow lintas role, ownership, duplicate application,
history, dan concurrent status update:

```bash
npm run test:integration
```

Integration test memerlukan PostgreSQL non-production yang dapat dimodifikasi melalui konfigurasi
`.env`. Test menolak berjalan jika `NODE_ENV=production` dan membersihkan record yang dibuatnya.

Lint dan pemeriksaan format:

```bash
npm run lint
npm run format:check
```

### Verifikasi Database / Prisma

```bash
npx prisma format
npx prisma validate
npx prisma migrate status
```

- `format` memformat schema Prisma.
- `validate` memeriksa konfigurasi dan schema.
- `migrate status` membandingkan migration lokal dengan database yang dikonfigurasi.

### Quality Check Sebelum Commit

```bash
npm run build
npm test -- --runInBand
npm run test:integration
npm run lint
npm run format:check
git diff --check
```

Jalankan integration test hanya terhadap database test/development yang aman untuk dimodifikasi.

## Troubleshooting

### Prisma tidak dapat terhubung

Periksa format `DATABASE_URL`/`DIRECT_URL`, credential, SSL requirement, jaringan, serta akses host
database. Gunakan `npx prisma migrate status` untuk memeriksa koneksi dan status migration.

### Migration belum diterapkan

Jalankan `npm run prisma:migrate`, lalu periksa kembali dengan `npx prisma migrate status`.

### Prisma Client belum sinkron

Jalankan `npm run prisma:generate` setelah perubahan schema atau pergantian dependency.

### JWT configuration error

Pastikan `JWT_SECRET` minimal 32 byte UTF-8 dan `JWT_EXPIRES_IN` menggunakan format durasi yang
didukung, misalnya `1d`.

### CORS error saat frontend terhubung

Pastikan `CORS_ORIGIN` sama persis dengan origin frontend, termasuk protocol dan port.

## Integrasi Frontend

Frontend IndoKerja menggunakan REST API ini dan perlu diarahkan ke base URL backend yang sesuai
dengan environment-nya. Repository frontend terkait:
[MohdFarhanS/indokerja-frontend](https://github.com/MohdFarhanS/indokerja-frontend).

## Deployment

Repository ini sudah disiapkan untuk deployment serverless melalui `api/index.ts` dan
`vercel.json`. Namun deployment production, konfigurasi environment production, domain,
CORS production, serta verifikasi runtime production belum dilakukan pada tahap ini.

Panduan dan URL production akan diperbarui setelah Stage 12 selesai dan terverifikasi.

## Workflow Pengembangan

1. Buat branch scoped dari `main`.
2. Implementasikan perubahan sesuai stage dan arsitektur yang ada.
3. Jalankan quality checks yang relevan.
4. Buat pull request yang mencatat perubahan, migration/API/environment impact, hasil validasi, dan
   keterbatasan.
5. Merge setelah review.

## Catatan Pengembangan

- Tinjau dependency audit secara berkala dan evaluasi advisory berdasarkan dampak runtime aktual.
- Project saat ini menggunakan Prisma 6.x. Upgrade major Prisma, termasuk perubahan konfigurasi
  seed, harus dilakukan setelah compatibility testing.
