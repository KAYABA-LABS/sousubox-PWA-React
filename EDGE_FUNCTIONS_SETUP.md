# Supabase Edge Functions Setup

## Functions Overview

### 1. check_approved_email

✅ Already deployed at: `https://hfnarmrjgtlvwlkeddyw.supabase.co/functions/v1/check_approved_email`

### 2. generate-and-send-otp

Uses **Supabase's built-in email service** (no external dependencies like Resend needed)

### 3. verify-otp

Verifies OTP codes and confirms user accounts

## Setup Instructions

### 1. Create OTP Verifications Table

Run this migration in Supabase SQL Editor:

```sql
-- Create otp_verifications table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  code_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_user_id ON public.otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON public.otp_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Only service role can access (edge functions use service role key)
CREATE POLICY "Service role only" ON public.otp_verifications
  FOR ALL
  TO service_role
  USING (true);

COMMENT ON TABLE public.otp_verifications IS 'Stores hashed OTP codes for email/SMS verification';
```

### 2. Configure Supabase Email Settings

1. Go to **Authentication** → **Email Templates**
2. Customize the "Magic Link" template (used by signInWithOtp):

   ```html
   <h2>Your Verification Code</h2>
   <p>Your verification code is: <strong>{{ .Token }}</strong></p>
   <p>This code expires in 10 minutes.</p>
   ```

3. Set **Site URL** in **Authentication** → **URL Configuration**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

### 3. Deploy Edge Functions

```bash
# Navigate to project root
cd /Users/admin/Projects/Work/Fintech/vaulta/vaulta

# Deploy generate-and-send-otp
supabase functions deploy generate-and-send-otp

# Deploy verify-otp (if not already deployed)
supabase functions deploy verify-otp
```

### 4. Set Environment Variables (Optional)

These have sensible defaults but can be customized:

```bash
# Set custom values if needed
supabase secrets set OTP_EXPIRY_MINUTES=10
supabase secrets set OTP_LENGTH=6
supabase secrets set OTP_RATE_LIMIT_WINDOW_SECONDS=60
supabase secrets set OTP_MAX_REQUESTS_PER_WINDOW=3
supabase secrets set OTP_MAX_VERIFY_ATTEMPTS=5
supabase secrets set SITE_URL=https://yourdomain.com
```

## Usage Flow

### Step 1: Check if email is approved and create user

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/check_approved_email`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      email: "test@gmail.com",
      create_user: true,
      password: "secure-password",
      user_metadata: { name: "John Doe" },
    }),
  }
);

const { approved, user } = await response.json();
```

### Step 2: Generate and send OTP

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/generate-and-send-otp`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      user_id: user.id,
      channel: "email",
    }),
  }
);

const { success } = await response.json();
```

### Step 3: Verify OTP

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  },
  body: JSON.stringify({
    user_id: user.id,
    code: "123456",
    channel: "email",
  }),
});

const { success } = await response.json();

// After successful verification, sign in
if (success) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "test@gmail.com",
    password: "secure-password",
  });
}
```

## Benefits of Using Supabase Email

✅ **No external dependencies** - Uses built-in Supabase Auth email service
✅ **No API keys needed** - Supabase handles everything
✅ **Customizable templates** - Edit email templates in dashboard
✅ **Automatic rate limiting** - Built into Supabase Auth
✅ **Better deliverability** - Supabase manages email reputation
✅ **Free tier included** - No extra costs for email sending

## Security Notes

- OTPs are hashed with SHA256 + random salt before storage
- Uses constant-time comparison to prevent timing attacks
- Rate limited: 3 OTP requests per 60 seconds per user
- Max 5 verification attempts per OTP
- 10-minute expiry (configurable)
- Service role access only via RLS policies
