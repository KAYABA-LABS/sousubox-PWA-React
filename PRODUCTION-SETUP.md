# Production Setup Checklist

## Email Confirmation (REQUIRED for Production)

### Current Status: DISABLED (for testing)

For production deployment, you MUST enable email confirmation in Supabase.

### Steps to Enable Email Confirmation for Production:

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Toggle **"Confirm email"** to **ON**
3. Configure Email Templates:

   - Go to **Authentication** → **Email Templates**
   - Customize the "Confirm signup" email template
   - Update the confirmation link to: `{{ .SiteURL }}/auth/confirm?token={{ .TokenHash }}&type=signup`

4. **Update Site URL**:

   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to your production domain (e.g., `https://vaulta.app`)
   - Add production domain to **Redirect URLs**

5. **Email Provider Setup** (Choose one):

   - **Option A**: Use Supabase's built-in email (limited, may go to spam)
   - **Option B**: Configure custom SMTP (recommended):
     - Go to **Project Settings** → **Auth** → **SMTP Settings**
     - Add your SMTP provider (SendGrid, Postmark, AWS SES, etc.)

6. **Test the Flow**:
   - Sign up with a real email
   - Check inbox for confirmation email
   - Click confirmation link
   - Should redirect to dashboard after confirmation

### Security Benefits:

- Prevents fake signups
- Verifies user owns the email address
- Reduces spam accounts
- Better user data quality

### Code is Already Ready:

The signup flow in `src/app/(auth)/signup/page.tsx` automatically detects if email confirmation is enabled:

- If enabled → redirects to `/verify` page for OTP entry
- If disabled → redirects to `/dashboard` directly

No code changes needed when you enable it!

---

## Other Production Requirements:

### 1. Run All Database Migrations

- [x] `db/migrations/000-disable-trigger-temporarily.sql`
- [ ] `db/migrations/database-migration-profiles-email.sql`
- [ ] `db/migrations/database-migration-approved-emails.sql`

### 2. Environment Variables

- Set production Supabase URL and keys
- Update `NEXT_PUBLIC_SITE_URL`

### 3. Security

- [ ] Enable RLS on all tables (done in migrations)
- [ ] Review all RLS policies
- [ ] Enable rate limiting on Auth endpoints
- [ ] Set up CAPTCHA for signup (optional)

### 4. Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging
- [ ] Set up uptime monitoring

### 5. Email Management

- [ ] Set up approved_emails admin panel
- [ ] Create process for adding approved emails
- [ ] Set up email notifications for new signups
