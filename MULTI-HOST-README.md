# Multi-Host Pickleball App - Updated Structure

## New Features

The app now supports **two separate hosts** (Bill and Sandy) with individual session management:

### Pages Structure

1. **`/` (root)** - Redirects to `/bill`
2. **`/bill`** - Bill's sessions page (for his regulars)
3. **`/sandy`** - Sandy's sessions page (for her regulars)
4. **`/session/[id]`** - Individual session page (for backup invites)

### How It Works

**For Regulars:**
- Bill's regulars visit: `your-app.vercel.app/bill`
- Sandy's regulars visit: `your-app.vercel.app/sandy`
- They see all upcoming sessions for their host
- Can sign up for multiple weeks

**For Backup Players:**
- Hosts can share individual session links like: `your-app.vercel.app/session/123`
- Backup players only see that specific session
- Can sign up if regulars haven't filled all spots

### Database Migration

If you have existing sessions in your database, run this SQL in Supabase SQL Editor:

\`\`\`sql
-- This adds the host column and makes all existing sessions belong to Bill
ALTER TABLE sessions ADD COLUMN host TEXT NOT NULL DEFAULT 'bill';
\`\`\`

See `migration-add-host.sql` for the full migration script.

### Admin Functions

Each host page (`/bill` and `/sandy`) has its own admin panel at the bottom to create sessions for that host.

### Sharing Individual Sessions

To get the link for a specific session to share with backup players:
1. Look at the session ID in your database (Supabase table viewer)
2. Share: `your-app.vercel.app/session/[SESSION_ID]`

Example: If session ID is `42`, share `your-app.vercel.app/session/42`

## Deployment

Same deployment process as before:

\`\`\`bash
git add .
git commit -m "Multi-host structure with Bill and Sandy"
git push
\`\`\`

Vercel will auto-deploy!
