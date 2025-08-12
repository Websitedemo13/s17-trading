# Deployment Guide

## Admin Login Credentials
- **Email**: quachthanhlong2k3@gmail.com
- **Password**: 13072003

## Vercel Deployment

1. **Connect GitHub Repository**
   - Import your repository to Vercel
   - Select the project root directory

2. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://rhycjfjpehrnlmogrwqq.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeWNqZmpwZWhybmxtb2dyd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTQ4MTcsImV4cCI6MjA3MDE3MDgxN30.QmgHQDDmfUCTOgmKuaCHC76fd6YagrSz_80-3U3tyXg
   ```

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Render Deployment

1. **Connect GitHub Repository**
   - Create a new Web Service in Render
   - Connect your GitHub repository

2. **Build Settings**
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

3. **Environment Variables**
   Add the same environment variables as Vercel above.

## Database Setup (Already Configured)

The Supabase database is already set up with:
- All required tables (profiles, teams, chat_messages, etc.)
- Admin user configuration
- Row Level Security policies
- Real-time subscriptions

## Features Available

- **Admin Dashboard**: Full admin panel with user management
- **Trading Dashboard**: Crypto portfolio tracking
- **Team Chat**: Real-time team collaboration
- **Blog System**: Content management
- **User Profiles**: Complete user management

## Troubleshooting

### Admin Login Issues
If admin login fails:
1. Check that the correct credentials are used
2. Clear browser cache and localStorage
3. The admin account bypasses Supabase auth and uses local authentication

### Database Connection Issues
If you see database errors:
1. Verify the Supabase URL and key are correct
2. Check that the Supabase project is active
3. Ensure environment variables are properly set

### Build Issues
If build fails:
1. Make sure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npm run build`
3. Verify environment variables are set correctly

## Performance Optimizations

The app includes:
- Code splitting with React Router
- Lazy loading of components
- Optimized Tailwind CSS
- Image optimization
- Responsive design for all devices

## Security Features

- Row Level Security (RLS) on all tables
- Secure admin authentication
- HTTPS enforced
- Environment variable protection
