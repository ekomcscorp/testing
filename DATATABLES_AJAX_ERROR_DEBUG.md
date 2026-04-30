# 🔧 DataTables Ajax Error - Debug Guide

## ❌ Error Message
```
DataTables warning: table id=userlevelDetail - Ajax error. For more information about this error, please see http://datatables.net/tn/7
```

---

## 🎯 Root Causes & Solutions

### **1. Response Format Invalid**
**Symptom:** Error meski API response ok

**Solusi:**
- Pastikan API return format:
```json
{
  "draw": 1,
  "recordsTotal": 100,
  "recordsFiltered": 50,
  "data": [...]
}
```

✅ **Fixed in:** 
- `utils/response.js` - `exports.datatables()`
- Controller mapping response dengan benar

---

### **2. Access Denied (403 Error)**
**Symptom:** Browser console log 403 status

**Solusi:**
- Check user session login
- Check role/permission di database
- Verify akses columns di `tbl_akses`:
  - `view_level = 'Y'` untuk user level ini

✅ **Fixed in:**
- Controller: Better error message untuk 403
- Service: Null-safe akses check
- Frontend: Display error message ke user

---

### **3. Database Error (500 Error)**
**Symptom:** Response 500 atau server error

**Debug:**
Check server logs:
```bash
npm run dev
# Lihat console output untuk error details
```

**Common issues:**
- Table tidak ada di database
- Column name mismatch
- Query syntax error

✅ **Fixed in:**
- Repository: Try-catch dengan detail error log
- Service: Error propagation ke controller
- Controller: Full error logging (message + stack)

---

### **4. CORS Issue**
**Symptom:** Network error, response blocked

**Solusi:**
Check `app.js` CORS config:
```javascript
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
```

---

## 🔍 How to Debug

### **Browser Console:**
```javascript
// Akan melihat response detail
console.log("DataTables response:", json);
console.log("Error details:", { status, statusText, response })
```

### **Server Console:**
```
Service - getAllUserlevelDatatables query: {...}
Repository - getPaginatedUserlevels params: {...}
Repository result: { count: 10, rowsLength: 5 }
Service returning: { draw: 1, recordsTotal: 10, ... }
```

### **Network Tab (DevTools - F12):**
1. Open DevTools → Network tab
2. Trigger table load
3. Click request `/api/userlevel/datatables`
4. Check:
   - Status code (200 = ok)
   - Response tab (valid JSON?)
   - Headers (CORS headers ok?)

---

## 🚀 Testing Checklist

### Local (Development)
- ✅ User login dengan correct role
- ✅ Check database punya data
- ✅ API endpoint accessible
- ✅ Response format valid
- ✅ No JavaScript errors di console

### Production (Deploy)
- ✅ Environment variable correct
- ✅ Database connection string valid
- ✅ User role/permission setup di database
- ✅ API CORS config untuk production domain
- ✅ Check server logs untuk error

---

## 📝 Key Files Modified

| File | Change |
|------|--------|
| `public/javascripts/userlevel_javascript.js` | Added error handler + debug logging |
| `controllers/api/userlevel.controller.js` | Better error handling & logging |
| `services/userlevel.service.js` | Data validation & error handling |
| `repositories/userlevel.repository.js` | Try-catch & logging |
| `utils/response.js` | Already correct format ✅ |

---

## 🎨 Features Added

1. **Better Error Messages**
   - User-friendly error popup
   - Detailed console logs untuk debugging

2. **Response Validation**
   - Check response is valid JSON
   - Validate data structure
   - Fallback to empty array jika null

3. **Logging at Every Layer**
   - Frontend: DataTables response + error
   - Controller: Request + response info
   - Service: Query + data validation
   - Repository: SQL + result count

---

## 🆘 If Still Error After Deploy:

1. **Check server logs:**
   ```bash
   # SSH into server
   tail -f logs/app.log
   # atau
   pm2 logs  # jika pakai PM2
   ```

2. **Test API directly:**
   ```bash
   curl -X GET \
     "http://yourapp.com/api/userlevel/datatables" \
     -H "Cookie: session_id=..." \
     -H "Content-Type: application/json"
   ```

3. **Check browser console:**
   - F12 → Console tab
   - Lihat error message yang ditampilkan
   - Copy error text untuk debugging

4. **Ask untuk:**
   - Server error logs
   - Browser console error message
   - Network response (full JSON)
