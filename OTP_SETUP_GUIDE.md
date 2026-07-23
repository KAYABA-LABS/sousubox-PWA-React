# OTP Setup Guide

## ✅ What's Included

1. **Database Table**: `otp_verifications` - Stores hashed OTP codes
2. **Edge Functions**:
   - `generate-and-send-otp` - Creates and sends 6-digit codes via Supabase email
   - `verify-otp` - Validates codes and confirms user accounts
3. **UI Page**: `/verify-otp` - Beautiful 6-digit OTP input interface

## 🚀 Quick Setup (3 Steps)

### Step 1: Create OTP Table

Run in Supabase SQL Editor:

```bash
db/migrations/otp-verifications-table.sql
```

This creates:

- `otp_verifications` table with RLS
- Indexes for performance
- Cleanup function for expired OTPs

### Step 2: Deploy Edge Functions

```bash
cd /Users/admin/Projects/Work/Fintech/vaulta/vaulta

# Deploy both functions
supabase functions deploy generate-and-send-otp
supabase functions deploy verify-otp
```

### Step 3: Test the Flow

1. **Sign up** with an approved email
2. After account creation, user is redirected to `/verify-otp?email=...&userId=...`
3. Check email for 6-digit code
4. Enter code → automatically verified
5. Redirected to `/signin` after successful verification

## 📧 Email Configuration (Optional)

Customize the OTP email template in Supabase:

1. Go to **Authentication** → **Email Templates**
2. Select "Magic Link" template
3. Add custom HTML:

```html
<h2>Your Vaulta Verification Code</h2>
<p>Welcome! Use this code to verify your email:</p>
<div
  style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;"
>
  {{ .Token }}
</div>
<p>This code expires in 10 minutes.</p>
<p style="color: #666; font-size: 14px;">
  If you didn't request this code, please ignore this email.
</p>
```

## 🔧 Configuration (Optional)

Set custom values via Supabase secrets:

```bash
# OTP settings
supabase secrets set OTP_EXPIRY_MINUTES=10
supabase secrets set OTP_LENGTH=6
supabase secrets set OTP_MAX_VERIFY_ATTEMPTS=5

# Rate limiting
supabase secrets set OTP_RATE_LIMIT_WINDOW_SECONDS=60
supabase secrets set OTP_MAX_REQUESTS_PER_WINDOW=3
```

## 🔐 Security Features

✅ **Hashed storage**: OTPs hashed with SHA256 + random salt
✅ **Rate limiting**: Max 3 OTP requests per 60 seconds
✅ **Attempt limiting**: Max 5 verification attempts per code
✅ **Auto-expiry**: Codes expire after 10 minutes
✅ **Timing-safe comparison**: Prevents timing attacks
✅ **Service role only**: RLS protects OTP table

## 🎨 UI Features

✅ **Auto-focus**: Automatically moves to next digit
✅ **Auto-submit**: Verifies when all 6 digits entered
✅ **Paste support**: Can paste 6-digit codes
✅ **Resend cooldown**: 60-second cooldown between resends
✅ **Error handling**: Clear feedback for invalid codes
✅ **Success animation**: Smooth transition after verification

## 🔄 Integration with Signup

To integrate OTP into your signup flow, update `signup/page.tsx`:

```typescript
// After successful account creation
const { data: otpData } = await supabase.functions.invoke(
  "generate-and-send-otp",
  {
    body: {
      user_id: user.id,
      channel: "email",
    },
  }
);

if (otpData?.success) {
  router.push(
    `/verify-otp?email=${encodeURIComponent(email)}&userId=${user.id}`
  );
}
```

## 📊 Monitoring

Check OTP usage in Supabase:

```sql
-- Active OTPs
SELECT user_id, channel, expires_at, attempts, used
FROM otp_verifications
WHERE expires_at > NOW() AND used = false;

-- OTP success rate
SELECT
  COUNT(*) FILTER (WHERE used = true) as verified,
  COUNT(*) FILTER (WHERE used = false AND expires_at < NOW()) as expired,
  COUNT(*) as total
FROM otp_verifications;
```

## 🧹 Maintenance

Clean up expired OTPs periodically:

```sql
-- Run manually or via cron
SELECT cleanup_expired_otps();
```

Or set up a pg_cron job:

```sql
SELECT cron.schedule(
  'cleanup-expired-otps',
  '0 * * * *', -- Every hour
  $$SELECT cleanup_expired_otps();$$
);
```

## ✨ That's It!

Your OTP system is now fully set up and ready to use! 🎉
