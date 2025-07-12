# HOTMS Setup and Running Guide

This guide will walk you through setting up and running the Hotel Management System (HOTMS) on your local machine or deploying it to production.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** for version control
- A **Supabase** account (free tier is sufficient)

## Initial Setup

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd HOTMS
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including React, Vite, Supabase client, and UI components.

### 3. Supabase Project Setup

1. **Create a Supabase Project:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - Project name: "HOTMS" (or your preferred name)
     - Database password: Choose a strong password (save this!)
     - Region: Select closest to your location
   - Click "Create new project" and wait for setup

2. **Run Database Migrations:**
   - In Supabase Dashboard, go to "SQL Editor"
   - Run each migration file in order:
     ```
     supabase/migrations/0000_initial_schema.sql
     supabase/migrations/0001_rls_policies.sql
     supabase/migrations/0002_security_improvements.sql
     supabase/migrations/0003_single_owner_enforcement.sql
     ```
   - Copy and paste each file's contents and click "Run"

3. **Deploy Edge Functions:**
   - In Supabase Dashboard, go to "Edge Functions"
   - Create a new function named "merge-guests"
   - Copy the contents from `supabase/functions/merge-guests/index.ts`
   - Deploy the function

### 4. Environment Configuration

1. Create a `.env.local` file in the project root:

```bash
touch .env.local
```

2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Where to find these values:**
   - Go to your Supabase project dashboard
   - Click "Settings" → "API"
   - Copy "Project URL" → `VITE_SUPABASE_URL`
   - Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

## Running the Application

### Development Mode

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### First-Time Setup

1. **Create Your Owner Account in Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to "Authentication" → "Users"
   - Click "Add user" → "Create new user"
   - Enter your email and a strong password
   - Click "Create user"
   - **Important:** This is your single owner account for the system

2. **Login to HOTMS:**
   - Navigate to `http://localhost:5173` in your browser
   - You'll see the login page
   - Enter the email and password you just created in Supabase
   - Click "Login"

3. **Complete the Setup Wizard:**
   - After successful login, you'll be automatically redirected to `/setup`
   - **Step 1:** Configure hotel settings
     - Enter your hotel name
     - Select your timezone
   - **Step 2:** Add initial rooms
     - Add at least one room to get started
     - You can add more rooms later
   - After completing setup, you'll be redirected to the dashboard

## Using the Application

### Main Features

1. **Dashboard** - Overview of your hotel operations
2. **Rooms** - Manage your room inventory
3. **Guests** - Track guest information and history
4. **Reservations** - Calendar view and booking management

### Key Workflows

**Creating a Reservation:**
1. Go to Reservations → Calendar
2. Click on a date
3. Select guest and room
4. Set check-in/out dates
5. Save reservation

**Logging Payments:**
1. Click on any reservation
2. Click "Add Payment"
3. Enter payment details
4. Confirm external payment received
5. Reservation status updates automatically

**Merging Duplicate Guests:**
1. Go to Guests page
2. Select two guests to merge
3. Click "Merge Guests"
4. Choose which data to keep
5. Confirm merge

## Production Deployment

### Deploying to Vercel

1. **Connect to GitHub:**
   - Push your code to a GitHub repository
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables:**
   - In Vercel project settings, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Deploy:**
   - Vercel will automatically build and deploy
   - Your app will be available at your Vercel URL

## Maintenance

### Database Backups
- Supabase automatically backs up your database daily
- You can also create manual backups in the Supabase dashboard

### Monitoring
- Check the footer for system status
- Last backup timestamp shows database health
- App version helps track deployments

## Troubleshooting

### Common Issues

**"Cannot connect to Supabase"**
- Check your `.env.local` file has correct values
- Ensure your Supabase project is active
- Verify network connectivity

**"Authentication failed"**
- Ensure you've completed the setup wizard
- Check if your Supabase Auth settings are correct
- Try resetting your password via Supabase dashboard

**"Merge guests not working"**
- Verify the Edge Function is deployed
- Check Edge Function logs in Supabase dashboard
- Ensure you have selected exactly 2 guests

### Owner Account Recovery

If you lose access to your owner account:

1. Go to Supabase Dashboard
2. Navigate to "Authentication" → "Users"
3. Find your user account
4. Click "Send recovery email" or manually update password
5. Use the recovery link to reset your password

## Support

For issues or questions:
1. Check the application logs in browser console
2. Review Supabase logs for backend errors
3. Ensure all migrations ran successfully
4. Verify environment variables are set correctly

Remember: HOTMS is designed for single-owner operation. There's only one user account, and all data is protected by row-level security policies. 