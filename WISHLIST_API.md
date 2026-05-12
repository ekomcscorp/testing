# Product Wishlist API Documentation

## Overview
API untuk mengelola wishlist produk. User dapat menambahkan, menghapus, dan melihat produk favorit mereka.

## Base URL
```
/api/products
```

## Authentication
Semua endpoint memerlukan user yang sudah authenticated (via JWT token di header atau cookie).

---

## Endpoints

### 1. Tambah Produk ke Wishlist
**POST** `/wishlist/add`

**Request Body:**
```json
{
  "product_id": 1
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Added to wishlist",
  "data": {
    "id": 5,
    "user_id": 10,
    "product_id": 1,
    "createdAt": "2026-05-12T10:30:00.000Z",
    "updatedAt": "2026-05-12T10:30:00.000Z"
  }
}
```

**Error Responses:**
- 400: Product sudah ada di wishlist
- 401: User tidak authenticated
- 422: Product ID tidak dikirim

---

### 2. Hapus Produk dari Wishlist
**DELETE** `/wishlist/:product_id`

**URL Parameters:**
- `product_id` (required): ID produk yang akan dihapus

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Removed from wishlist",
  "data": {
    "message": "Removed from wishlist"
  }
}
```

**Error Responses:**
- 400: Item wishlist tidak ditemukan
- 401: User tidak authenticated
- 422: Product ID tidak valid

---

### 3. Lihat Wishlist User
**GET** `/wishlist`

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Wishlist fetched successfully",
  "data": [
    {
      "id": 5,
      "user_id": 10,
      "product_id": 1,
      "createdAt": "2026-05-12T10:30:00.000Z",
      "updatedAt": "2026-05-12T10:30:00.000Z",
      "product": {
        "id": 1,
        "name": "Umrah Package A",
        "description": "5 Days Umrah Package",
        "price": 15000000
      }
    }
  ]
}
```

**Error Responses:**
- 401: User tidak authenticated
- 500: Internal Server Error

---

### 4. Cek Status Wishlist Produk
**GET** `/wishlist/check/:product_id`

**URL Parameters:**
- `product_id` (required): ID produk yang akan dicek

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Wishlist status retrieved",
  "data": {
    "product_id": 1,
    "isInWishlist": true
  }
}
```

**Error Responses:**
- 401: User tidak authenticated
- 422: Product ID tidak valid
- 500: Internal Server Error

---

### 5. Toggle Wishlist (Add atau Remove)
**POST** `/wishlist/toggle`

**Request Body:**
```json
{
  "product_id": 1
}
```

**Success Response (Jika ditambahkan - 201):**
```json
{
  "status": "success",
  "message": "Added to wishlist",
  "data": {
    "action": "added",
    "id": 5,
    "user_id": 10,
    "product_id": 1,
    "createdAt": "2026-05-12T10:30:00.000Z",
    "updatedAt": "2026-05-12T10:30:00.000Z"
  }
}
```

**Success Response (Jika dihapus - 200):**
```json
{
  "status": "success",
  "message": "Removed from wishlist",
  "data": {
    "action": "removed",
    "message": "Removed from wishlist"
  }
}
```

**Error Responses:**
- 400: General error
- 401: User tidak authenticated
- 422: Product ID tidak dikirim

---

## Error Response Format

```json
{
  "status": "error",
  "message": "Error message here"
}
```

---

## cURL Examples

### Tambah ke Wishlist
```bash
curl -X POST http://localhost:3000/api/products/wishlist/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": 1
  }'
```

### Lihat Wishlist
```bash
curl -X GET http://localhost:3000/api/products/wishlist \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Hapus dari Wishlist
```bash
curl -X DELETE http://localhost:3000/api/products/wishlist/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Toggle Wishlist
```bash
curl -X POST http://localhost:3000/api/products/wishlist/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": 1
  }'
```

### Cek Status Wishlist
```bash
curl -X GET http://localhost:3000/api/products/wishlist/check/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Notes

1. Semua endpoint memerlukan user authenticated
2. User tidak bisa menambahkan produk yang sama 2x ke wishlist
3. Endpoint `/wishlist` akan mengembalikan semua produk di wishlist user beserta detail produknya
4. Toggle endpoint otomatis menambah atau menghapus berdasarkan status saat ini
5. Wishlist data disortir berdasarkan yang terbaru ditambahkan
