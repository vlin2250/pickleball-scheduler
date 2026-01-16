# Pickleball Weekly Signup App

A modern, real-time pickleball session signup application built with Next.js, React, and Supabase.

## Features

- **Admin Session Management**: Create weekly sessions with customizable dates and spot counts
- **Player Signup**: Simple signup process with first name and last initial
- **Real-time Updates**: Automatic updates when players sign up or remove themselves
- **Spot Tracking**: Visual display of available and filled spots
- **Responsive Design**: Works beautifully on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database with real-time subscriptions)
- **Deployment**: Vercel

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Once your project is created, go to the SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create the necessary tables

### 2. Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

### 3. Local Development

1. Clone this repository:
```bash
git clone <your-repo-url>
cd pickleball-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### 4. Deploy to Vercel

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "New Project" and import your repository

4. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Click "Deploy"

Your app will be live at `your-app-name.vercel.app`!

## Usage

### Admin Functions

1. **Create a Session**: Select a date and number of spots (default is 8), then click "Create Session"
2. **Delete a Session**: Click "Delete Session" button at the bottom of an active session

### Player Functions

1. **Sign Up**: Enter your name in the format "First Name Last Initial" (e.g., "John D.") and click "Sign Up"
2. **Remove Signup**: Click the × button next to your name to remove yourself from the session

## Database Schema

### Sessions Table
- `id`: Primary key
- `date`: Date of the pickleball session
- `total_spots`: Number of available spots
- `created_at`: Timestamp

### Players Table
- `id`: Primary key
- `session_id`: Foreign key to sessions table
- `name`: Player name (First Name Last Initial)
- `created_at`: Timestamp

## Customization

### Change Default Spot Count
Edit line 26 in `app/page.tsx`:
```typescript
const [sessionSpots, setSessionSpots] = useState(8) // Change 8 to your preferred default
```

### Change Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  'court-green': '#00B872',
  'light-bg': '#FFFFFF',
  'card-bg': '#F8F9FA',
  'border-color': '#E1E4E8',
  'accent-orange': '#FF6B35',
  'text-primary': '#1A1F26',
  'text-secondary': '#6B7280',
}
```

## Contributing

Feel free to submit issues and pull requests!

## License

MIT
