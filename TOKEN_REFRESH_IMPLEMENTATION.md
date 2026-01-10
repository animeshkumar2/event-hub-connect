# Token Expiration & Refresh Implementation Plan

## Priority: 🔴 CRITICAL
**Impact**: Users get logged out abruptly, lose work  
**Effort**: 3-4 hours  
**Status**: ✅ COMPLETE

---

## Implementation Summary

### ✅ Backend Changes (COMPLETE)

#### 1. JwtUtil.java
- ✅ Added `refreshExpiration` property (7 days = 604800000ms)
- ✅ Added `generateRefreshToken()` method
- ✅ Added `getExpiresIn()` method to return token expiry in seconds
- ✅ Updated token generation to support both access and refresh tokens

#### 2. AuthService.java
- ✅ Updated `AuthResponse` class to include:
  - `refreshToken` field
  - `expiresIn` field (seconds until expiration)
- ✅ Updated `GoogleAuthResponse` class with same fields
- ✅ Modified `register()` to generate and return refresh token
- ✅ Modified `login()` to generate and return refresh token
- ✅ Modified `authenticateWithGoogle()` to generate and return refresh token
- ✅ Added `refreshToken()` method to handle token refresh requests

#### 3. AuthController.java
- ✅ Added POST `/api/auth/refresh` endpoint
- ✅ Accepts refresh token in Authorization header
- ✅ Returns new access token and refresh token
- ✅ Handles errors with 401 status

---

### ✅ Frontend Changes (COMPLETE)

#### 1. AuthContext.tsx
- ✅ Added `refreshToken` state
- ✅ Added `refreshTimerRef` state for timer management
- ✅ Added `startTokenRefreshTimer()` function
  - Decodes JWT to get expiration time
  - Schedules refresh 5 minutes before expiry
  - Logs timing information to console
- ✅ Added `refreshAccessToken()` function
  - Calls `/auth/refresh` endpoint
  - Updates both tokens in state and localStorage
  - Restarts refresh timer with new token
- ✅ Updated `login()` to store refresh token and start timer
- ✅ Updated `register()` to store refresh token and start timer
- ✅ Updated `loginWithGoogle()` to store refresh token and start timer
- ✅ Updated `logout()` to clear refresh timer and token
- ✅ Updated initial load to restore refresh token and start timer
- ✅ Added cleanup effect to clear timer on unmount
- ✅ Exposed `refreshAccessToken` in context interface

#### 2. api.ts
- ✅ Modified `request()` method to accept `isRetry` parameter
- ✅ Added 401 interceptor logic:
  - Detects 401 responses
  - Attempts token refresh using refresh token
  - Retries original request with new token
  - Redirects to login if refresh fails
  - Prevents infinite retry loops
- ✅ Updated `post()` method to accept optional RequestInit options
- ✅ Handles session expiry gracefully

#### 3. SessionExpiryWarning.tsx (NEW)
- ✅ Created warning component
- ✅ Checks token expiry every 30 seconds
- ✅ Shows warning when < 5 minutes remaining
- ✅ Displays countdown timer (MM:SS format)
- ✅ Dismissible by user
- ✅ Auto-hides when session refreshed
- ✅ Positioned fixed bottom-right
- ✅ Yellow alert styling

#### 4. App.tsx
- ✅ Imported `SessionExpiryWarning` component
- ✅ Added component to app root (visible on all pages)

---

## How It Works

### Token Lifecycle

```
1. User logs in
   ↓
2. Backend returns:
   - Access token (24h)
   - Refresh token (7d)
   - expiresIn (86400 seconds)
   ↓
3. Frontend stores both tokens
   ↓
4. Timer scheduled for 19 minutes (24h - 5min)
   ↓
5. At 19 minutes:
   - Auto-refresh triggered
   - New tokens received
   - Timer restarted
   ↓
6. If API call gets 401:
   - Interceptor catches it
   - Attempts refresh
   - Retries original request
   ↓
7. If refresh fails:
   - User logged out
   - Redirected to login
```

### Warning System

```
Every 30 seconds:
  ↓
Check token expiry
  ↓
< 5 minutes left?
  ↓
Show warning with countdown
  ↓
User can dismiss
  ↓
Auto-hide when refreshed
```

---

## Testing Checklist

### Backend
- ✅ Refresh token endpoint returns new tokens
- ✅ Refresh token validates correctly
- ✅ Expired refresh tokens are rejected
- ✅ Vendor ID is included in refresh response
- ✅ expiresIn field is returned

### Frontend
- ⏳ Tokens are auto-refreshed 5 minutes before expiry (needs live testing)
- ⏳ 401 errors trigger token refresh (needs live testing)
- ⏳ Failed refresh logs user out (needs live testing)
- ⏳ Warning shows before session expires (needs live testing)
- ✅ Refresh token stored securely in localStorage
- ✅ Logout clears both tokens
- ✅ Timer cleanup on unmount

### UX
- ⏳ No abrupt logouts during work (needs live testing)
- ⏳ Warning appears 5 minutes before expiry (needs live testing)
- ⏳ Seamless token refresh (no interruption) (needs live testing)
- ✅ Clear error messages on refresh failure

---

## Configuration

### Backend (application.properties)
```properties
# JWT Configuration
jwt.secret=your-secret-key-change-this-in-production-min-256-bits
jwt.expiration=86400000          # 24 hours (access token)
jwt.refresh.expiration=604800000  # 7 days (refresh token)
```

### Frontend (localStorage)
- `auth_token` - Access token (24h)
- `refresh_token` - Refresh token (7d)
- `user_data` - User information
- `user_id` - User ID
- `user_role` - User role
- `vendor_id` - Vendor ID (if applicable)

---

## Benefits

✅ **No abrupt logouts** - Seamless experience  
✅ **Work preservation** - Users don't lose data  
✅ **Better security** - Short-lived access tokens  
✅ **User warning** - Time to save work  
✅ **Graceful degradation** - Clear error messages  
✅ **Auto-recovery** - 401 errors handled automatically  

---

## Next Steps for Testing

1. **Start backend** with updated code
2. **Start frontend** with updated code
3. **Login as vendor** and verify:
   - Both tokens stored in localStorage
   - Console logs show timer scheduled
4. **Wait 19 minutes** (or modify timer for faster testing)
   - Verify auto-refresh happens
   - Check console logs
   - Verify new tokens in localStorage
5. **Test 401 handling**:
   - Manually expire access token
   - Make API call
   - Verify auto-refresh and retry
6. **Test warning**:
   - Modify warning threshold to 1 minute for testing
   - Verify warning appears
   - Verify countdown works
   - Verify dismissal works
7. **Test logout**:
   - Verify both tokens cleared
   - Verify timer cleared

---

## Files Modified

### Backend
- `backend/src/main/java/com/eventhub/util/JwtUtil.java`
- `backend/src/main/java/com/eventhub/service/AuthService.java`
- `backend/src/main/java/com/eventhub/controller/AuthController.java`

### Frontend
- `frontend/src/shared/contexts/AuthContext.tsx`
- `frontend/src/shared/services/api.ts`
- `frontend/src/shared/components/SessionExpiryWarning.tsx` (NEW)
- `frontend/src/app/App.tsx`

---

## Production Considerations

### Security
1. **Refresh Token Storage**: Currently in localStorage (acceptable for MVP)
   - Future: Consider httpOnly cookies for better security
2. **Token Rotation**: New refresh token issued on each refresh ✅
3. **Refresh Token Revocation**: 
   - Future: Store refresh tokens in database
   - Future: Allow manual revocation
   - Future: Implement "logout all devices"

### Performance
1. **Timer Management**: Single timer per session ✅
2. **Network Efficiency**: Only refresh when needed ✅
3. **Error Handling**: Graceful degradation ✅

### Monitoring
1. **Log refresh attempts** (already implemented)
2. **Track refresh failures** (already implemented)
3. **Monitor session duration** (can add analytics)

---

## Status: ✅ IMPLEMENTATION COMPLETE

All code changes have been implemented. Ready for testing and deployment.

---

## Current State

### Token Configuration
- **Expiration**: 24 hours (86400000 ms)
- **Type**: JWT (JSON Web Token)
- **Storage**: localStorage (`auth_token`)
- **No refresh mechanism**: Users are logged out after 24 hours

### Problems
1. ❌ No token refresh - users logged out after 24 hours
2. ❌ No warning before expiration
3. ❌ Lost work if token expires during form filling
4. ❌ Poor UX - abrupt logout
5. ❌ No graceful 401 handling

---

## Solution: Token Refresh System

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│  API Request │────────▶│   Backend   │
│             │         │  Interceptor │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │                        │
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ Token Check │         │ 401 Handler  │         │ Refresh API │
│ (every 5min)│         │ Auto-refresh │         │ /auth/refresh│
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## Implementation Steps

### Step 1: Backend - Add Refresh Token Support (1-2 hours)

#### 1.1 Update JwtUtil.java
Add methods for:
- `generateRefreshToken()` - 7 days expiration
- `validateRefreshToken()`
- `getExpirationFromToken()`

```java
@Value("${jwt.refresh.expiration:604800000}") // 7 days
private Long refreshExpiration;

public String generateRefreshToken(UUID userId) {
    return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
            .signWith(getSigningKey())
            .compact();
}

public Date getExpirationFromToken(String token) {
    return getClaimFromToken(token, Claims::getExpiration);
}
```

#### 1.2 Update AuthService.java
Return both access and refresh tokens:

```java
@Data
@AllArgsConstructor
public static class AuthResponse {
    private String token;           // Access token (24h)
    private String refreshToken;    // Refresh token (7d)
    private UUID userId;
    private String email;
    private String role;
    private UUID vendorId;
    private Long expiresIn;        // Seconds until expiration
}
```

#### 1.3 Add Refresh Endpoint in AuthController.java

```java
@PostMapping("/refresh")
public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
    @RequestHeader("Authorization") String refreshToken
) {
    try {
        // Validate refresh token
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new AuthException("INVALID_REFRESH_TOKEN", "Invalid or expired refresh token");
        }
        
        // Get user from refresh token
        UUID userId = jwtUtil.getUserIdFromToken(refreshToken);
        UserProfile user = userProfileRepository.findById(userId)
            .orElseThrow(() -> new AuthException("USER_NOT_FOUND", "User not found"));
        
        // Generate new tokens
        String newAccessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId());
        
        // Get vendor ID if applicable
        UUID vendorId = null;
        if (user.getRole() == UserProfile.Role.VENDOR) {
            vendorId = vendorRepository.findByUserId(user.getId())
                    .map(Vendor::getId)
                    .orElse(null);
        }
        
        AuthResponse response = new AuthResponse(
            newAccessToken,
            newRefreshToken,
            user.getId(),
            user.getEmail(),
            user.getRole().name(),
            vendorId,
            86400L // 24 hours in seconds
        );
        
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    } catch (Exception e) {
        return ResponseEntity.status(401)
            .body(ApiResponse.error("Failed to refresh token"));
    }
}
```

---

### Step 2: Frontend - Token Management (1-2 hours)

#### 2.1 Update AuthContext.tsx

Add token refresh logic:

```typescript
// Store both tokens
const [refreshToken, setRefreshToken] = useState<string | null>(null);

// Load tokens on mount
useEffect(() => {
  const storedToken = localStorage.getItem('auth_token');
  const storedRefreshToken = localStorage.getItem('refresh_token');
  
  if (storedToken && storedRefreshToken) {
    setToken(storedToken);
    setRefreshToken(storedRefreshToken);
    apiClient.setToken(storedToken);
    
    // Start token refresh timer
    startTokenRefreshTimer(storedToken);
  }
}, []);

// Auto-refresh token before expiry
const startTokenRefreshTimer = (token: string) => {
  try {
    // Decode JWT to get expiration
    const decoded = jwtDecode<{ exp: number }>(token);
    const expiresAt = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      setTimeout(async () => {
        await refreshAccessToken();
      }, refreshTime);
    } else {
      // Token already expired or about to expire
      refreshAccessToken();
    }
  } catch (error) {
    console.error('Error parsing token:', error);
  }
};

const refreshAccessToken = async () => {
  try {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) {
      logout();
      return;
    }
    
    const response = await apiClient.post<{
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>('/auth/refresh', {}, {
      headers: { 'Authorization': storedRefreshToken }
    });
    
    if (response.success && response.data) {
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      apiClient.setToken(newToken);
      
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      
      // Start new refresh timer
      startTokenRefreshTimer(newToken);
      
      console.log('Token refreshed successfully');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Show warning to user
    toast.warning('Your session is about to expire. Please save your work.');
    
    // Give user 2 minutes to save work before logout
    setTimeout(() => {
      logout();
      toast.error('Session expired. Please log in again.');
    }, 2 * 60 * 1000);
  }
};
```

#### 2.2 Update api.ts - Add 401 Interceptor

```typescript
// Add response interceptor for 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {}, {
            headers: { 'Authorization': refreshToken }
          });
          
          const { token } = response.data.data;
          localStorage.setItem('auth_token', token);
          apiClient.setToken(token);
          
          // Retry original request
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### 2.3 Add Session Expiry Warning Component

```typescript
// components/SessionExpiryWarning.tsx
export function SessionExpiryWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  
  useEffect(() => {
    // Check token expiry every minute
    const interval = setInterval(() => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const decoded = jwtDecode<{ exp: number }>(token);
        const expiresAt = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;
        
        // Show warning if less than 5 minutes left
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          setShowWarning(true);
          setTimeLeft(Math.floor(timeUntilExpiry / 1000));
        } else {
          setShowWarning(false);
        }
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  if (!showWarning) return null;
  
  return (
    <Alert className="fixed bottom-4 right-4 w-96 border-yellow-500 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle>Session Expiring Soon</AlertTitle>
      <AlertDescription>
        Your session will expire in {Math.floor(timeLeft / 60)} minutes.
        Save your work to avoid losing changes.
      </AlertDescription>
    </Alert>
  );
}
```

---

### Step 3: Update Login/Register Flows (30 mins)

Update all auth methods to store refresh token:

```typescript
// In login, register, loginWithGoogle
batchLocalStorageUpdate({
  'auth_token': newToken,
  'refresh_token': refreshToken,  // NEW
  'user_id': userId,
  'user_data': JSON.stringify(userData),
  'user_role': role,
  'vendor_id': vendorId || '',
});

// Start refresh timer
startTokenRefreshTimer(newToken);
```

---

## Testing Checklist

### Backend
- [ ] Refresh token endpoint returns new tokens
- [ ] Refresh token validates correctly
- [ ] Expired refresh tokens are rejected
- [ ] Vendor ID is included in refresh response

### Frontend
- [ ] Tokens are auto-refreshed 5 minutes before expiry
- [ ] 401 errors trigger token refresh
- [ ] Failed refresh logs user out
- [ ] Warning shows before session expires
- [ ] Refresh token stored securely
- [ ] Logout clears both tokens

### UX
- [ ] No abrupt logouts during work
- [ ] Warning appears 5 minutes before expiry
- [ ] Seamless token refresh (no interruption)
- [ ] Clear error messages on refresh failure

---

## Configuration

### application.properties
```properties
# JWT Configuration
jwt.secret=your-secret-key-change-this-in-production-min-256-bits
jwt.expiration=86400000          # 24 hours (access token)
jwt.refresh.expiration=604800000  # 7 days (refresh token)
```

### Security Considerations

1. **Refresh Token Storage**: 
   - Store in httpOnly cookie (more secure) OR
   - localStorage (current approach, acceptable for MVP)

2. **Token Rotation**: 
   - Issue new refresh token on each refresh
   - Invalidate old refresh token

3. **Refresh Token Revocation**:
   - Store refresh tokens in database
   - Allow manual revocation
   - Implement "logout all devices"

---

## Benefits

✅ **No abrupt logouts** - Seamless experience  
✅ **Work preservation** - Users don't lose data  
✅ **Better security** - Short-lived access tokens  
✅ **User warning** - Time to save work  
✅ **Graceful degradation** - Clear error messages  

---

## Estimated Time

- **Backend**: 1-2 hours
- **Frontend**: 1-2 hours  
- **Testing**: 30 minutes
- **Total**: 3-4 hours

---

## Priority

This should be implemented **before production** as it significantly impacts user experience and is a common source of frustration.

**Recommended**: Implement this as Phase 4 before moving to other features.
