# 🔒 Security Audit & Fixes Required for Production

## ⚠️ CRITICAL ISSUES

### 1. **Transaction Data Leak - ALL USERS SEE ALL TRANSACTIONS**

**Location:** [src/app/activity/page.tsx](vaulta/vaulta/src/app/activity/page.tsx#L64-L68)

```tsx
// ❌ CRITICAL: Shows ALL transactions from ALL users!
const { data, error: fetchError } = await supabase
  .from("transactions")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(50);
```

**Fix:**

```tsx
// ✅ Filter by user_id
const { data, error: fetchError } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", user.id) // Only user's transactions
  .order("created_at", { ascending: false })
  .limit(50);
```

**Impact:** Any authenticated user can see ALL transactions from ALL users including amounts, merchants, descriptions, and recipient information.

---

### 2. **Missing RLS Policy Check for User-Specific Tables**

**Tables to audit:**

- `transactions` - Must have RLS policy: `user_id = auth.uid()`
- `recipients` - Must have RLS policy: `user_id = auth.uid()`
- `billers` - Must have RLS policy: `user_id = auth.uid()`
- `documents` - Must have RLS policy: `user_id = auth.uid()`
- `account_limits` - Must have RLS policy: `user_id = auth.uid()`
- `security_settings` - Must have RLS policy: `user_id = auth.uid()`

**Verify in Supabase:**

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('transactions', 'recipients', 'billers', 'documents', 'account_limits', 'security_settings');

-- View existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

---

### 3. **Service Role Key Exposure Risk**

**Location:** Environment variables

**Current risk:**

- Service role key bypasses ALL RLS policies
- If leaked, attacker has full database access

**Required:**

- ✅ Never use `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- ✅ Only use in Edge Functions and API routes
- ✅ Rotate immediately if committed to git history

**Check git history:**

```bash
git log -p | grep -i "service_role"
```

---

## 🚨 HIGH PRIORITY ISSUES

### 4. **No Rate Limiting on Signup/Signin**

**Locations:**

- `/signup` page
- `/signin` page
- OTP generation endpoint

**Current risk:** Brute force attacks, OTP spam

**Fix:** Add rate limiting

```sql
-- Already have auth_request_logs table for OTP
-- Add similar for signin attempts

CREATE TABLE IF NOT EXISTS signin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signin_attempts_email_time ON signin_attempts(email, created_at);
CREATE INDEX idx_signin_attempts_ip_time ON signin_attempts(ip_address, created_at);

-- Block after 5 failed attempts in 15 minutes
CREATE OR REPLACE FUNCTION check_signin_rate_limit(
  p_email TEXT,
  p_ip TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INT;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM signin_attempts
  WHERE (email = p_email OR ip_address = p_ip)
    AND success = FALSE
    AND created_at > NOW() - INTERVAL '15 minutes';

  RETURN attempt_count < 5;
END;
$$ LANGUAGE plpgsql;
```

---

### 5. **Email Verification Not Enforced**

**Current state:** Users can access dashboard without verifying email

**Check in Supabase:**

- Go to Authentication → Settings → Email Auth
- Ensure "Confirm email" is enabled
- Verify email templates are configured

**Add middleware check:**

```tsx
// In middleware or protected pages
const {
  data: { user },
} = await supabase.auth.getUser();

if (user && !user.email_confirmed_at) {
  return NextResponse.redirect(new URL("/verify-email", req.url));
}
```

---

### 6. **No Input Sanitization on Transaction Amounts**

**Risk:** Users could manipulate balances with negative numbers or invalid amounts

**Add validation:**

```typescript
// In deposit/withdraw/transfer logic
function validateAmount(
  amount: number,
  accountType: "checking" | "savings"
): boolean {
  if (amount <= 0 || amount > 10000) return false; // Max single transaction
  if (!Number.isFinite(amount)) return false;
  if (Math.round(amount * 100) !== amount * 100) return false; // Max 2 decimals
  return true;
}
```

**Add database constraints:**

```sql
ALTER TABLE transactions
ADD CONSTRAINT check_amount_positive CHECK (amount > 0);

ALTER TABLE transactions
ADD CONSTRAINT check_amount_max CHECK (amount <= 10000);
```

---

## 📋 MEDIUM PRIORITY ISSUES

### 7. **Weak Password Policy**

**Current:** 8 chars, uppercase, lowercase, number

**Recommended for fintech:**

```typescript
// Add in signup validation
const passwordStrength = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  bannedPasswords: ["password123", "vaulta123", "admin123"],
};

// Check against common passwords
const isCommonPassword = bannedPasswords.includes(password.toLowerCase());
```

---

### 8. **No Session Timeout**

**Add inactivity logout:**

```typescript
// In layout or context
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

useEffect(() => {
  let timeout: NodeJS.Timeout;

  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/signin?reason=timeout");
    }, INACTIVITY_TIMEOUT);
  };

  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keypress", resetTimer);

  return () => {
    clearTimeout(timeout);
    window.removeEventListener("mousemove", resetTimer);
    window.removeEventListener("keypress", resetTimer);
  };
}, []);
```

---

### 9. **No Transaction Audit Log**

**Create audit trail:**

```sql
CREATE TABLE transaction_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
  transaction_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transaction_audit_user ON transaction_audit(user_id);
CREATE INDEX idx_transaction_audit_transaction ON transaction_audit(transaction_id);
```

---

### 10. **No Content Security Policy (CSP)**

**Add to next.config.mjs:**

```javascript
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 🔍 LOW PRIORITY (BUT RECOMMENDED)

### 11. **HTTPS Enforcement**

- Ensure Vercel/hosting enforces HTTPS
- Set `Strict-Transport-Security` header

### 12. **Dependency Audit**

```bash
npm audit
pnpm audit
```

### 13. **Environment Variable Validation**

```typescript
// Add in config file
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
});
```

---

## 🎯 IMMEDIATE ACTION ITEMS

1. **TODAY**: Fix transaction data leak in activity page
2. **TODAY**: Verify RLS policies on all tables
3. **TODAY**: Check git history for exposed service role key
4. **THIS WEEK**: Add rate limiting to auth endpoints
5. **THIS WEEK**: Enforce email verification
6. **THIS WEEK**: Add transaction amount validation
7. **NEXT SPRINT**: Implement session timeout
8. **NEXT SPRINT**: Add audit logging
9. **NEXT SPRINT**: Add security headers

---

## 📊 Security Checklist

- [ ] Transaction data filtered by user_id
- [ ] RLS policies verified on all tables
- [ ] Service role key not in git history
- [ ] Rate limiting on signup/signin
- [ ] Email verification enforced
- [ ] Transaction amount validation
- [ ] Weak password policy strengthened
- [ ] Session timeout implemented
- [ ] Transaction audit log created
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Dependencies audited
- [ ] Environment variables validated
