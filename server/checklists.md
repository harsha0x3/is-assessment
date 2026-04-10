Date: 04, APr, 2026

---

[-] SSO integration
[x] Latest comment for each dept view in executive dash
[] Proper date validation for start and end dates
[] Proper Error, Debug and Info Level logs
[] Audit Logging
[] Assessment Cycle for each dept

---

# 🔐 Authentication & Authorization Hardening

---

# 🧱 1. Session Management (FOUNDATION)

- [ x ] Create `sessions` table
  - [ x ] `id` (UUID, session_id)
  - [ x ] `user_id`
  - [ x ] `refresh_token_hash`
  - [ x ] `csrf_token`
  - [ x ] `user_agent`
  - [ x ] `ip_address`
  - [ x ] `is_active`
  - [ x ] `created_at`
  - [ x ] `expires_at`
  - [ x ] `last_used_at`

---

# 🍪 2. Cookie Strategy

## Access Token

- [ x ] Store in HttpOnly cookie
- [ x ] `secure=True`
- [ x ] `samesite="Strict"` (or "Lax" if needed)

## Refresh Token

- [ x ] Store in HttpOnly cookie
- [ x ] Never expose to JS
- [ x ] Rotate on every refresh

## Session ID Cookie (NEW)

- [ x ] Create `session_id` cookie
- [ x ] HttpOnly + Secure
- [ x ] Used to fetch session from DB

---

# 🔑 3. Token Structure

- [ x ] Add `sid` (session_id) to access token
- [ x ] Add `sid` to refresh token
- [ x ] Include:
  - [ x ] `sub` (user_id)
  - [ x ] `role`
  - [ x ] `mfa_verified`

---

# 🔐 4. Secure Refresh Token Storage

- [ x ] Hash refresh tokens before storing
- [ x ] Store only hashed version in DB
- [ x ] Never log tokens

---

# 🔄 5. Login Flow (REWRITE)

- [ x ] Create session record
- [ x ] Capture:
  - [ x ] user agent
  - [ x ] IP address
- [ x ] Generate CSRF token and store in session
- [ x ] Generate access + refresh tokens (with `sid`)
- [ x ] Hash and store refresh token
- [ x ] Set cookies:
  - [ x ] access_token
  - [ x ] refresh_token
  - [ x ] session_id
  - [ x ] csrf_token

---

# 🔁 6. Refresh Token Rotation (CRITICAL)

- [ x ] Decode refresh token
- [ x ] Fetch session using `sid`
- [ x ] Ensure session is active
- [ x ] Verify refresh token hash matches DB

- [ x ] If mismatch:
  - [ x ] Invalidate session

- [ x ] Generate new tokens
- [ x ] Replace stored refresh token hash
- [ x ] Update `last_used_at`
- [ x ] Rotate CSRF token

---

# 🚫 7. Replay Attack Protection

- [ ] Detect reused/invalid refresh tokens
- [ ] Immediately revoke session
- [ ] Log suspicious activity

---

# 👤 8. Bind Requests to Session

- [ ] Extract `session_id` from cookie
- [ ] Fetch session from DB
- [ ] Validate:
  - [ ] session exists
  - [ ] session is active
  - [ ] session.user_id == token.sub

---

# 🚪 9. Logout & Session Revocation

- [ x ] Logout current session → `is_active=False`
- [ ] Logout all sessions endpoint
- [ ] Ensure revoked sessions cannot refresh tokens

---

# ⏱️ 10. Token Lifetime Hardening

- [ x ] Access token expiry: 5–15 minutes
- [ x ] Refresh token expiry: 1 day
- [ x ] Expire sessions in DB

---

# 🛡️ 11. CSRF Protection (HARDENED)

- [ x ] Generate CSRF token per session
- [ x ] Store CSRF token in session table
- [ x ] Send CSRF token in cookie

- [ x ] Validate:
  - [ x ] Header (`X-CSRF-Token`)
  - [ x ] Matches session.csrf_token

- [ x ] Enforce only for unsafe methods

- [ x ] Set cookie:
  - [ x ] `httponly=False` (required)
  - [ x ] `secure=True`
  - [ x ] `samesite="Strict"`

- [ x ] Rotate CSRF token:
  - [ x ] on login
  - [ x ] on refresh

- [ ] Validate `Origin` / `Referer` header

---

# 🔐 12. MFA Hardening

- [ ] Use `valid_window=1` in TOTP
- [ ] Prevent reuse of TOTP codes
- [ ] Store last used TOTP timestamp
- [ ] Keep recovery codes hashed

- [ ] NEVER expose:
  - [ ] mfa_secret
  - [ ] recovery codes

---

# ❌ 13. Sensitive Data Protection

- [ ] Remove `mfa_secret` from all responses
- [ ] Ensure no secrets are logged
- [ ] Audit serializers (`to_dict_*`)

---

# 🔑 14. Password Security

- [ ] Re-enable password strength validation
- [ ] Enforce strong password policy

---

# 🔍 15. Monitoring & Logging (Keep this asynchronous, so it does not add too much overhead)

- [ ] Log login attempts (success/failure)
- [ ] Log refresh attempts
- [ ] Log token mismatches (possible attacks)
- [ ] Avoid logging sensitive data

---

# 🧪 16. Testing

- [ ] Copy token to another browser → should fail
- [ ] Reuse refresh token → should fail
- [ ] Logout → tokens invalid
- [ ] CSRF attack simulation → blocked
- [ ] MFA validation works correctly

---

# ✅ FINAL SUCCESS CRITERIA

- [ ] Token replay attack is impossible
- [ ] Sessions are fully controllable
- [ ] Refresh tokens are single-use
- [ ] CSRF is session-bound and validated
- [ ] MFA cannot be bypassed
- [ ] System supports full revocation + monitoring

# 🚀 19. Production Readiness

- [ ] Enforce HTTPS everywhere
- [ ] Secure cookies properly configured
- [ ] Environment variables secured
- [ ] Secrets rotated

---

# 🚧 12. Rate Limiting (MULTI-LAYER)

## Before Login

- [ ] Rate limit by IP
- [ ] Rate limit by device_id cookie

## Login Attempts

- [ ] Rate limit by email + IP
- [ ] Add account lockout after failures

## After Login

- [ ] Rate limit by:
  - [ ] session_id (PRIMARY)
  - [ ] user_id
  - [ ] IP (secondary)

---

| Team                   | Members                                             |
| ---------------------- | --------------------------------------------------- |
| IAM                    | Chaitanya C, Manas Kumar Satpathy, Bharat Reddy     |
| TRPM                   | Bhavnasi Ramchandra, C Chetan Kumar, Monesh G       |
| Security Controls      | Suman Adhikary, Kedareeswari Guttala                |
| VAPT                   | Saketh Kapuganti, Perikaruppan S, C G Harshavardhan |
| SOC                    | Amit V Kulkarni                                     |
| Data Privacy           | Judith Jhon                                         |
| IS Assessment Handlers | Saketh Kapuganti, C G Harshavardhan                 |
