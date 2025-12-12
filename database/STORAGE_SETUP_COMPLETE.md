# Supabase Storage Setup - Complete Guide

## ✅ Recommended Setup: Public Buckets + RLS Policies

### Why Public Buckets?

**Public = Anyone can VIEW images** ✅ Good for:
- Vendor cover images (need to display on website)
- Package images (need to display in listings)
- User avatars (need to display in profiles)
- Review images (need to display in reviews)

**Public ≠ Anyone can UPLOAD** ✅ Protected by:
- RLS (Row Level Security) policies
- Authentication requirement
- File size limits
- MIME type restrictions

---

## 📋 Setup Steps

### Step 1: Create Buckets (Public)

In Supabase Dashboard → Storage:

**Bucket 1: `vendor-images`**
- ✅ **Public**: Yes (check this)
- File size limit: 5 MB
- Allowed MIME types: `image/*` (or leave blank)

**Bucket 2: `listing-images`**
- ✅ **Public**: Yes (check this)
- File size limit: 5 MB
- Allowed MIME types: `image/*`

**Bucket 3: `user-uploads`**
- ✅ **Public**: Yes (check this)
- File size limit: 2 MB
- Allowed MIME types: `image/*`

---

### Step 2: Set Up RLS Policies

**Option A: Via SQL Editor (Recommended)**

1. Go to **SQL Editor** in Supabase Dashboard
2. Run `database/storage_policies.sql`
3. This creates policies that:
   - ✅ Allow public READ (anyone can view images)
   - ✅ Restrict UPLOAD to authenticated users only
   - ✅ Allow users to update/delete their own files

**Option B: Via Dashboard**

1. Go to **Storage** → Select bucket → **Policies**
2. Click **New Policy**
3. Create policies manually (see policies below)

---

## 🔒 Security Explained

### What "Public" Means:

```
Public Bucket = Anyone can VIEW images
                ↓
         https://xxx.supabase.co/storage/v1/object/public/vendor-images/...
                ↓
         Works in <img src="..."> tags
                ↓
         No authentication needed to VIEW
```

### What RLS Policies Do:

```
RLS Policies = Control who can UPLOAD/UPDATE/DELETE
                ↓
         Only authenticated users can upload
                ↓
         Users can only modify their own files
                ↓
         Prevents unauthorized uploads
```

---

## 🎯 Final Setup

### Summary:

1. ✅ Create buckets as **Public**
2. ✅ Run `storage_policies.sql` to add RLS
3. ✅ Result: Public viewing + Secure uploading

### What This Gives You:

- ✅ **Public viewing**: Images load fast, no auth needed
- ✅ **Secure uploading**: Only logged-in users can upload
- ✅ **User control**: Users can manage their own files
- ✅ **No backend needed**: Frontend handles everything

---

## 🚨 Alternative: Private Buckets (If Needed Later)

If you need private files (invoices, contracts), create separate private buckets:

**Private Bucket: `documents`**
- ❌ **Public**: No (uncheck)
- Use signed URLs for access
- Backend generates temporary URLs

But for images (covers, portfolios, avatars), **public buckets are perfect**.

---

## ✅ Your Action Items

1. **Create 3 buckets** (all Public ✅)
2. **Run `storage_policies.sql`** (adds security)
3. **Done!** Ready to upload images

---

## 📝 Quick Reference

**Public Buckets:**
- ✅ Good for: Images that need to be displayed publicly
- ✅ Security: RLS policies restrict uploads
- ✅ Performance: Fast CDN delivery

**Private Buckets:**
- ✅ Good for: Sensitive documents, invoices
- ✅ Security: Requires signed URLs
- ⚠️ Requires: Backend to generate URLs

**For your use case (images): Public + RLS = Perfect!** ✅


