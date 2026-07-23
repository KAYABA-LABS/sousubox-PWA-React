# Email-Based Signup Approval System

## Overview

The signup flow has been updated to use email-based approval instead of name-based approval. Users must have their email pre-approved in the `approved_emails` table before they can create an account.

## Setup Instructions

### 1. Run the Database Migration

Execute the migration file in your Supabase SQL Editor:

```bash
# File: database-migration-approved-emails.sql
```

This will create:

- `approved_emails` table with email whitelist
- Indexes for fast lookups
- RLS policies (users can read, only service role can modify)

### 2. Add Approved Emails

You can add approved emails via the Supabase dashboard or SQL:

```sql
-- Via SQL Editor
INSERT INTO public.approved_emails (email, notes) VALUES
  ('user@example.com', 'Added via admin panel'),
  ('another@example.com', 'Beta tester');
```

Or create an admin interface to manage the approved list.

### 3. How It Works

**Signup Flow:**

1. **Step 1 - Email Validation:**

   - User enters their email
   - System checks if email exists in `approved_emails` table (case-insensitive)
   - If not approved → redirect to `/access-denied` page
   - If already registered → show error message
   - If approved and new → proceed to step 2

2. **Step 2 - Account Creation:**
   - User enters full name, password, and confirms password
   - Account is created in Supabase Auth
   - Profile is created in `profiles` table with email and full name
   - User is logged in and redirected to dashboard

**Access Denied Page:**

- Friendly message explaining invite-only status
- Option to return to sign in or home page
- Located at `/access-denied`

## Database Schema

### `approved_emails` Table

```sql
- id: UUID (primary key)
- email: TEXT (unique, not null)
- created_at: TIMESTAMPTZ
- notes: TEXT (optional)
```

### Key Features

- Case-insensitive email matching using `.ilike()`
- Prevents duplicate signups
- Clean UX with progress indicators
- Graceful rejection for non-approved users

## Files Modified

- `src/app/(auth)/signup/page.tsx` - Updated signup flow (2 steps instead of 3)
- `src/app/(auth)/access-denied/page.tsx` - New access denied page
- `database-migration-approved-emails.sql` - Database migration

## Testing

1. Add your test email to `approved_emails`:

   ```sql
   INSERT INTO approved_emails (email) VALUES ('test@example.com');
   ```

2. Try signing up with an approved email → should proceed to step 2
3. Try signing up with a non-approved email → should redirect to access-denied
4. Try signing up with an already registered email → should show error

## Next Steps

Consider building:

- Admin panel to manage approved emails
- Invitation system (generate invite codes/links)
- Waitlist feature for interested users
- Email notifications when someone is approved
