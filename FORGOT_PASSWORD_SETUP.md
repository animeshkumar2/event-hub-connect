# Forgot Password Flow - Setup Guide

## ✅ Implementation Complete!

The forgot password flow has been fully implemented with console logging for development and easy email integration for production.

## 🗄️ Database Setup

**Run this SQL migration first:**

```bash
psql -U your_user -d your_database -f database/add_password_reset_tokens.sql
```

Or execute the SQL directly in your Supabase dashboard.

## 🧪 Testing (Console Logging)

### Step 1: Start Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Test the Flow

1. **Go to login page**: http://localhost:8080/login
2. **Click "Forgot password?"**
3. **Enter your email** (must be a registered user)
4. **Click "Send Reset Link"**
5. **Check backend console** - you'll see:
   ```
   ================================================================================
   PASSWORD RESET EMAIL
   ================================================================================
   To: your@email.com
   Subject: Reset Your Password - CartEvent
   
   Reset Link: http://localhost:8080/reset-password?token=abc-123-xyz
   
   This link will expire in 1 hour.
   ================================================================================
   ```
6. **Copy the reset link** from console
7. **Paste it in browser**
8. **Enter new password** (with strength indicator)
9. **Submit** - password is reset!
10. **Login with new password**

## 📧 Adding Real Email (Optional - For Production)

### Option 1: Gmail SMTP (Free - 500 emails/day)

Add to `backend/src/main/resources/application.properties`:

```properties
# Email Configuration
app.email.enabled=true
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Option 2: Titan Email (Your Domain)

```properties
# Email Configuration
app.email.enabled=true
spring.mail.host=smtp.titan.email
spring.mail.port=587
spring.mail.username=celebrate@cartevent.com
spring.mail.password=your-titan-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Option 3: Resend (Modern, 3000/month free)

```properties
# Email Configuration  
app.email.enabled=true
app.email.provider=resend
app.email.resend.api-key=your-resend-api-key
```

## 🔒 Security Features

- ✅ Tokens expire after 1 hour
- ✅ Tokens are single-use only
- ✅ Old tokens are invalidated when new one is requested
- ✅ Password strength validation
- ✅ Secure token generation (UUID)
- ✅ No email enumeration (same response for valid/invalid emails)

## 📱 Features Implemented

### Frontend:
- ✅ "Forgot Password?" link on login page
- ✅ Email input page with validation
- ✅ Success message with instructions
- ✅ Reset password page with token validation
- ✅ Password strength indicator
- ✅ Password requirements checklist
- ✅ Password visibility toggle
- ✅ Expired/invalid token handling
- ✅ Responsive design

### Backend:
- ✅ Password reset token model & repository
- ✅ Email service (console logging + SMTP ready)
- ✅ Password reset service with validation
- ✅ Three API endpoints:
  - POST `/api/auth/forgot-password` - Request reset
  - POST `/api/auth/reset-password` - Reset password
  - GET `/api/auth/validate-reset-token` - Validate token
- ✅ Token expiry (1 hour)
- ✅ Single-use tokens
- ✅ Automatic cleanup of old tokens

## 🎯 Next Steps

1. **Test the flow** with console logging
2. **Add email credentials** when ready for production
3. **Optional**: Set up scheduled job to clean expired tokens:
   ```java
   @Scheduled(cron = "0 0 * * * *") // Every hour
   public void cleanupExpiredTokens() {
       passwordResetService.cleanupExpiredTokens();
   }
   ```

## 🐛 Troubleshooting

**Issue**: Reset link not appearing in console
- **Solution**: Check backend logs, ensure user email exists in database

**Issue**: Token validation fails
- **Solution**: Token expires after 1 hour, request a new one

**Issue**: Email not sending (when SMTP configured)
- **Solution**: Check SMTP credentials, firewall settings, enable "Less secure apps" for Gmail

## 📚 API Documentation

### Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc-123-xyz",
  "newPassword": "NewSecurePassword123"
}
```

### Validate Token
```http
GET /api/auth/validate-reset-token?token=abc-123-xyz
```

---

**Implementation Time**: ~3 hours
**Status**: ✅ Complete and ready for testing!
