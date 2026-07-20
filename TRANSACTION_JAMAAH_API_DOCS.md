# 📚 Dokumentasi API - Transaction Jamaah

## 📖 Daftar Isi
1. [Overview](#overview)
2. [Struktur File](#struktur-file)
3. [Response Format](#response-format)
4. [Endpoints](#endpoints)
5. [Contoh Penggunaan](#contoh-penggunaan)
6. [Error Handling](#error-handling)

---

## Overview

Fitur **Transaction Jamaah** digunakan untuk mengelola data jamaah yang terdaftar dalam setiap transaksi pembelian paket umrah. Setiap transaksi dapat memiliki satu atau lebih jamaah.

### Relasi Entitas
```
TransactionJamaah (1-to-Many)
├── Transaction (Parent) → tbl_transaction
├── TransactionDetail (Parent) → tbl_transaction_details
├── User (via Transaction)
├── Product (via Transaction)
└── Profile (via User)
```

---

## Struktur File

```
📁 Project Root
├── 📁 repositories/transactions/
│   ├── transaction.repository.js
│   └── ✅ transaction_jamaah.repository.js (NEW)
│
├── 📁 services/transactions/
│   ├── transaction.service.js
│   └── ✅ transaction_jamaah.service.js (NEW)
│
├── 📁 controllers/api/transactions/
│   ├── transaction.controller.js
│   └── ✅ transaction_jamaah.controller.js (NEW)
│
├── 📁 routes/api/transactions/
│   ├── ✅ transaction.routes.js (UPDATED - include jamaah routes)
│   └── ✅ transaction_jamaah.routes.js (NEW)
│
└── 📁 models/transactions/
    └── transaction_jamaah.model.js (EXISTING)
```

### Lapisan Arsitektur

| Lapisan | File | Tanggung Jawab |
|---------|------|----------------|
| **Repository** | `transaction_jamaah.repository.js` | Query database (CRUD, custom query) dengan include relations |
| **Service** | `transaction_jamaah.service.js` | Business logic, validasi, formatting, error handling |
| **Controller** | `transaction_jamaah.controller.js` | HTTP request/response, parameter parsing, akses control |
| **Routes** | `transaction_jamaah.routes.js` | Endpoint definition dan middleware binding |

---

## Response Format

Semua respons API mengikuti format standard project:

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Data jamaah berhasil diambil",
  "data": {
    "id": 1,
    "fullname": "Ahmad Sudarman",
    "email": "ahmad@example.com",
    "phone": "+6281234567890",
    "gender": "Laki-laki",
    "status": "menikah",
    "documents": {
      "ktp": "file_ktp.jpg",
      "kk": "file_kk.jpg",
      "passpor": "file_passpor.jpg",
      "diri": "file_diri.jpg",
      "akta_kelahiran": null
    },
    "transaction": {
      "id": 5,
      "transactionNo": "TXN-001",
      "status": "SUCCESS",
      "totalPrice": 25000000,
      "createdAt": "2026-07-20T10:00:00Z",
      "product": { /* Product object */ },
      "user": { /* User object */ }
    },
    "detail": {
      "id": 10,
      "productName": "Paket Umrah Premium",
      "roomType": "Deluxe",
      "price": 25000000,
      "departureDate": "2026-08-15T00:00:00Z"
    },
    "createdAt": "2026-07-20T10:30:00Z",
    "updatedAt": "2026-07-20T10:30:00Z"
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Jamaah dengan ID 999 tidak ditemukan",
  "data": null
}
```

### DataTables Response
```json
{
  "success": true,
  "message": "Jamaah berhasil diambil",
  "draw": 1,
  "recordsTotal": 150,
  "recordsFiltered": 25,
  "data": [
    { /* jamaah objects */ }
  ]
}
```

---

## Endpoints

### 1. **GET** `/api/transactions/jamaah`
Ambil semua jamaah dengan optional filter

**Query Parameters:**
- `transactionId` (number) - Filter berdasarkan transaction ID
- `gender` (string) - Filter berdasarkan gender (L/P)
- `status` (string) - Filter berdasarkan status pernikahan
- `filter` (JSON string) - Custom filter object

**Response:** 200 OK dengan array jamaah

**Contoh:**
```bash
curl -X GET "http://localhost:3000/api/transactions/jamaah?transactionId=5" \
  -H "Content-Type: application/json"

curl -X GET "http://localhost:3000/api/transactions/jamaah?filter=%7B%22gender%22:%22L%22%7D" \
  -H "Content-Type: application/json"
```

---

### 2. **GET** `/api/transactions/jamaah/datatables`
Ambil jamaah untuk datatable dengan pagination (untuk DataTables plugin)

**Query Parameters:**
- `draw` (number) - Draw counter
- `start` (number) - Offset pagination
- `length` (number) - Limit per page
- `search[value]` (string) - Search query
- `order[0][column]` (number) - Column index untuk sorting
- `order[0][dir]` (string) - Sort direction (asc/desc)

**Response:** 200 OK dengan draw, recordsTotal, recordsFiltered, data

**Contoh:**
```bash
curl -X GET "http://localhost:3000/api/transactions/jamaah/datatables?draw=1&start=0&length=10&search%5Bvalue%5D=ahmad" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. **GET** `/api/transactions/jamaah/:id`
Ambil jamaah berdasarkan ID

**URL Parameters:**
- `id` (number) - Jamaah ID

**Response:** 200 OK atau 404 Not Found

**Contoh:**
```bash
curl -X GET "http://localhost:3000/api/transactions/jamaah/1" \
  -H "Content-Type: application/json"
```

---

### 4. **GET** `/api/transactions/jamaah/transaction/:transactionId`
Ambil semua jamaah dari satu transaksi

**URL Parameters:**
- `transactionId` (number) - Transaction ID

**Response:** 200 OK dengan array jamaah

**Contoh:**
```bash
curl -X GET "http://localhost:3000/api/transactions/jamaah/transaction/5" \
  -H "Content-Type: application/json"
```

---

### 5. **GET** `/api/transactions/jamaah/statistics`
Ambil statistik total jamaah

**Query Parameters:** None

**Response:** 200 OK dengan objek statistik

**Contoh Return:**
```json
{
  "total": 150,
  "byGender": {
    "male": 80,
    "female": 70
  },
  "byTransactionStatus": {
    "success": 140,
    "pending": 5,
    "failed": 5
  }
}
```

**Contoh:**
```bash
curl -X GET "http://localhost:3000/api/transactions/jamaah/statistics" \
  -H "Content-Type: application/json"
```

---

### 6. **GET** `/api/transactions/jamaah/filter`
Cari jamaah dengan custom filter

**Query Parameters:**
- `gender` (string) - L atau P
- `status` (string) - "belum menikah" atau "menikah"
- `transactionStatus` (string) - Transaction status (SUCCESS, PENDING, FAILED)
- `createdAt_from` (date) - Filter dari tanggal
- `createdAt_to` (date) - Filter sampai tanggal

**Response:** 200 OK dengan array jamaah

**Contoh:**
```bash
curl -X GET "http://localhost:3000/api/transactions/jamaah/filter?gender=L&status=menikah" \
  -H "Content-Type: application/json"

curl -X GET "http://localhost:3000/api/transactions/jamaah/filter?transactionStatus=SUCCESS&createdAt_from=2026-07-01&createdAt_to=2026-07-31" \
  -H "Content-Type: application/json"
```

---

### 7. **GET** `/api/transactions/jamaah/search/name`
Search jamaah berdasarkan nama

**Query Parameters:**
- `q` (string) - Query nama (partial match)

**Response:** 200 OK dengan array jamaah

**Contoh:**
```bash
curl -X GET "http://localhost:3000/api/transactions/jamaah/search/name?q=Ahmad" \
  -H "Content-Type: application/json"
```

---

### 8. **GET** `/api/transactions/jamaah/search/email`  
Search jamaah berdasarkan email

**Query Parameters:**
- `q` (string) - Query email (partial match)

**Response:** 200 OK dengan array jamaah

**Contoh:**
```bash
curl -X GET "http://localhost:3000/api/transactions/jamaah/search/email?q=ahmad@" \
  -H "Content-Type: application/json"
```

---

### 9. **POST** `/api/transactions/jamaah`
Buat jamaah baru

**Request Body:**
```json
{
  "transaction_id": 5,
  "transaction_detail_id": 10,
  "fullname": "Ahmad Sudarman",
  "email": "ahmad@example.com",
  "phone": "+6281234567890",
  "gender": "L",
  "status": "menikah",
  "img_ktp": "ktp_hash.jpg",
  "img_kk": "kk_hash.jpg",
  "img_passpor": "passpor_hash.jpg",
  "img_diri": "diri_hash.jpg",
  "img_akta_kelahiran": null
}
```

**Response:** 201 Created dengan jamaah object

**Validasi:**
- Semua field required kecuali `img_akta_kelahiran`
- Email harus format valid
- Phone 10-15 digit
- Gender: L atau P
- Status: "belum menikah" atau "menikah"

**Contoh:**
```bash
curl -X POST "http://localhost:3000/api/transactions/jamaah" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": 5,
    "transaction_detail_id": 10,
    "fullname": "Ahmad Sudarman",
    "email": "ahmad@example.com",
    "phone": "081234567890",
    "gender": "L",
    "status": "menikah",
    "img_ktp": "ktp.jpg",
    "img_kk": "kk.jpg",
    "img_passpor": "passpor.jpg",
    "img_diri": "diri.jpg"
  }'
```

---

### 10. **POST** `/api/transactions/jamaah/bulk`
Buat multiple jamaah sekaligus

**Request Body:**
```json
{
  "jamaahList": [
    {
      "transaction_id": 5,
      "transaction_detail_id": 10,
      "fullname": "Ahmad Sudarman",
      "email": "ahmad@example.com",
      "phone": "081234567890",
      "gender": "L",
      "status": "menikah",
      "img_ktp": "ktp.jpg",
      "img_kk": "kk.jpg",
      "img_passpor": "passpor.jpg",
      "img_diri": "diri.jpg"
    },
    {
      "transaction_id": 5,
      "transaction_detail_id": 10,
      "fullname": "Aisyah Sudarman",
      "email": "aisyah@example.com",
      "phone": "081234567891",
      "gender": "P",
      "status": "menikah",
      "img_ktp": "ktp2.jpg",
      "img_kk": "kk2.jpg",
      "img_passpor": "passpor2.jpg",
      "img_diri": "diri2.jpg"
    }
  ]
}
```

**Response:** 201 Created dengan array jamaah

**Contoh:**
```bash
curl -X POST "http://localhost:3000/api/transactions/jamaah/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "jamaahList": [...]
  }'
```

---

### 11. **PUT** `/api/transactions/jamaah/:id`
Update jamaah

**URL Parameters:**
- `id` (number) - Jamaah ID

**Request Body:**
```json
{
  "fullname": "Ahmad Sudarman Update",
  "email": "ahmad.new@example.com",
  "phone": "081234567899"
}
```

**Response:** 200 OK dengan updated jamaah object

**Contoh:**
```bash
curl -X PUT "http://localhost:3000/api/transactions/jamaah/1" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Ahmad Sudarman Update",
    "email": "ahmad.new@example.com"
  }'
```

---

### 12. **DELETE** `/api/transactions/jamaah/:id`
Delete jamaah

**URL Parameters:**
- `id` (number) - Jamaah ID

**Response:** 200 OK dengan deleted count

**Contoh:**
```bash
curl -X DELETE "http://localhost:3000/api/transactions/jamaah/1" \
  -H "Content-Type: application/json"
```

---

## Contoh Penggunaan

### Scenario 1: Ambil semua jamaah dari transaksi tertentu
```bash
# List jamaah untuk transaksi ID 5
curl -X GET "http://localhost:3000/api/transactions/jamaah/transaction/5" \
  -H "Content-Type: application/json"
```

### Scenario 2: Search dengan pagination (DataTables)
```bash
# Ambil 10 jamaah pertama, search "ahmad"
curl -X GET "http://localhost:3000/api/transactions/jamaah/datatables?draw=1&start=0&length=10&search%5Bvalue%5D=ahmad" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Scenario 3: Filter jamaah berdasarkan gender dan status pernikahan
```bash
# Jamaah laki-laki yang sudah menikah
curl -X GET "http://localhost:3000/api/transactions/jamaah/filter?gender=L&status=menikah" \
  -H "Content-Type: application/json"
```

### Scenario 4: Bulk create jamaah saat checkout
```bash
# Buat 2 jamaah sekaligus untuk transaksi yang baru dibuat
curl -X POST "http://localhost:3000/api/transactions/jamaah/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "jamaahList": [
      {
        "transaction_id": 5,
        "transaction_detail_id": 10,
        "fullname": "Ahmad Sudarman",
        "email": "ahmad@example.com",
        "phone": "081234567890",
        "gender": "L",
        "status": "menikah",
        "img_ktp": "ktp.jpg",
        "img_kk": "kk.jpg",
        "img_passpor": "passpor.jpg",
        "img_diri": "diri.jpg"
      },
      {
        "transaction_id": 5,
        "transaction_detail_id": 10,
        "fullname": "Aisyah Sudarman",
        "email": "aisyah@example.com",
        "phone": "081234567891",
        "gender": "P",
        "status": "menikah",
        "img_ktp": "ktp2.jpg",
        "img_kk": "kk2.jpg",
        "img_passpor": "passpor2.jpg",
        "img_diri": "diri2.jpg"
      }
    ]
  }'
```

### Scenario 5: Update data jamaah
```bash
curl -X PUT "http://localhost:3000/api/transactions/jamaah/1" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Ahmad Sudarman (Updated)",
    "phone": "081234567899"
  }'
```

---

## Error Handling

### Common Error Responses

**400 Bad Request** - Validasi data gagal
```json
{
  "success": false,
  "message": "Format email tidak valid"
}
```

**404 Not Found** - Data tidak ditemukan
```json
{
  "success": false,
  "message": "Jamaah dengan ID 999 tidak ditemukan"
}
```

**403 Forbidden** - Akses ditolak
```json
{
  "success": false,
  "message": "Akses ditolak"
}
```

### Validasi Field

| Field | Validasi |
|-------|----------|
| `transaction_id` | Required, numeric, transaction harus exist |
| `transaction_detail_id` | Required, numeric |
| `fullname` | Required, string |
| `email` | Required, valid email format |
| `phone` | Required, 10-15 digits |
| `gender` | Required, L atau P |
| `status` | Required, "belum menikah" atau "menikah" |
| `img_ktp` | Required, string (filename) |
| `img_kk` | Required, string (filename) |
| `img_passpor` | Required, string (filename) |
| `img_diri` | Required, string (filename) |
| `img_akta_kelahiran` | Optional, string (filename) |

---

## Integration dengan Existing Code

### Dengan Transaction Service (Checkout)
Di `services/transactions/transaction.service.js`, tambahkan saat checkout selesai:

```javascript
// Setelah transaction berhasil dibuat
const transactionJamaahService = require('./transaction_jamaah.service');

// Bulk create jamaah data
await transactionJamaahService.createBulkJamaah(jamaahDataArray, { transaction: t });
```

### Dengan Frontend (DataTables)
```javascript
$('#jamaahTable').DataTable({
  processing: true,
  serverSide: true,
  ajax: {
    url: '/api/transactions/jamaah/datatables',
    type: 'GET',
    headers: {
      'Authorization': 'Bearer ' + authToken
    }
  },
  columns: [
    {data: 'fullname'},
    {data: 'email'},
    {data: 'phone'},
    {data: 'gender'},
    {data: 'status'}
  ]
});
```

---

## Performance Tips

1. **Use DataTables endpoint** untuk list besar (> 50 data)
2. **Use search/filter endpoints** untuk query spesifik
3. **Batch create with /bulk** untuk multiple jamaah
4. **Index database** pada fields: `transaction_id`, `email`, `phone`

---

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2026-07-20 | Initial release - Transaction Jamaah feature |

---

**Dokumentasi ini dibuat otomatis dari Graphifyy analysis + pattern project**
