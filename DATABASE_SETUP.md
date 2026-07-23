# Vaulta Database Setup & Seeding Guide

## 1. Initial Schema Setup

Run the complete schema file in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Copy and paste the contents of database-schema-complete.sql
# Click "Run" to execute
```

This creates:

- **profiles** - User account data (extends auth.users)
- **transactions** - All financial transactions
- **recipients** - Saved recipients for Send flow
- **billers** - Saved billers for Pay flow
- **documents** - Statements and confirmations
- **account_limits** - Transaction and withdrawal limits
- **security_settings** - 2FA and security preferences
- **approved_names** - Whitelisted names for signup

## 2. Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- Users can only access their own data
- Proper isolation between accounts
- No cross-user data leakage

## 3. Seeding Sample Data

After creating a user account, seed sample data:

```sql
-- Option A: Run seed-sample-data.sql in SQL Editor
-- This will automatically populate data for the first user

-- Option B: For specific user
DO $$
DECLARE
  target_user_id UUID := 'YOUR_USER_ID_HERE';
BEGIN
  -- Copy the INSERT statements from seed-sample-data.sql
  -- Replace demo_user_id with target_user_id
END $$;
```

## 4. Testing Your Setup

After running the schema and seed data:

### Check Tables

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Verify User Data

```sql
-- Get your user ID
SELECT id, email FROM profiles;

-- Check transactions
SELECT COUNT(*), status FROM transactions
WHERE user_id = 'YOUR_USER_ID'
GROUP BY status;

-- Check recipients
SELECT name, email FROM recipients
WHERE user_id = 'YOUR_USER_ID';

-- Check billers
SELECT name, category FROM billers
WHERE user_id = 'YOUR_USER_ID';
```

## 5. Updating Existing Database

If you already have a profiles table, you may need to migrate:

```sql
-- Add new columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS savings_balance DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS routing_number TEXT DEFAULT '021000021';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT false;

-- Generate account numbers for existing users
UPDATE profiles
SET account_number = substring(md5(random()::text) from 1 for 10)
WHERE account_number IS NULL;
```

## 6. Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 7. Route Guards & Middleware

The middleware (`src/middleware.ts`) automatically:

- Protects routes requiring authentication
- Checks minimum balance for locked features
- Redirects unauthenticated users to signin
- Prevents authenticated users from accessing auth pages

Protected routes:

- `/dashboard` - Requires auth
- `/send` - Requires auth + $350 min balance
- `/pay` - Requires auth + $350 min balance
- `/transfer` - Requires auth + $350 min balance
- `/deposit` - Requires auth
- `/manage` - Requires auth + $350 min balance

## 8. Using Route Guards in Components

```tsx
import { RouteGuard } from "@/components/route-guard";

export default function ProtectedPage() {
  return (
    <RouteGuard requireAuth requireMinBalance minBalance={350}>
      {/* Your page content */}
    </RouteGuard>
  );
}
```

## 9. Using Balance Check Hook

```tsx
import { useBalanceCheck } from "@/components/route-guard";

export default function SomePage() {
  const { hasMinBalance, currentBalance, isLoading } = useBalanceCheck(350);

  if (isLoading) return <LoadingSpinner />;

  if (!hasMinBalance) {
    return <InsufficientBalanceMessage balance={currentBalance} />;
  }

  return <YourContent />;
}
```

## 10. Populating Real User Data

When users perform actions, create real records:

### Create Recipient

```typescript
const { data, error } = await supabase.from("recipients").insert({
  user_id: user.id,
  name: "John Doe",
  email: "john@example.com",
  avatar: "JD",
});
```

### Create Transaction

```typescript
const { data, error } = await supabase.from("transactions").insert({
  user_id: user.id,
  transaction_type: "debit",
  category: "send",
  amount: 100.0,
  description: "Sent to John Doe",
  status: "completed",
  from_account: "deposit",
});
```

### Create Biller

```typescript
const { data, error } = await supabase.from("billers").insert({
  user_id: user.id,
  name: "Electric Company",
  account_number: "ACC123",
  category: "Utilities",
});
```

## 11. Querying User Data

### Get User Transactions

```typescript
const { data: transactions } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

### Get Recipients

```typescript
const { data: recipients } = await supabase
  .from("recipients")
  .select("*")
  .eq("user_id", user.id)
  .order("last_transaction_at", { ascending: false, nullsFirst: false });
```

### Get Billers

```typescript
const { data: billers } = await supabase
  .from("billers")
  .select("*")
  .eq("user_id", user.id)
  .order("name");
```

## 12. Troubleshooting

### RLS Errors

If you get "row level security" errors:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Missing Data

If transactions don't appear:

```sql
-- Check if data exists
SELECT COUNT(*) FROM transactions WHERE user_id = 'YOUR_USER_ID';

-- Check RLS policies allow reading
SELECT * FROM transactions WHERE user_id = auth.uid();
```

## 13. Production Considerations

Before going to production:

1. Review and adjust all `DEFAULT` values
2. Set appropriate limit amounts
3. Consider adding indexes for frequently queried fields
4. Set up database backups
5. Configure monitoring and alerts
6. Review RLS policies for security
7. Test all user flows with real data
8. Set up proper error handling
9. Implement transaction rollbacks for failures
10. Add audit logging for sensitive operations
