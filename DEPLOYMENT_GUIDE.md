# Deployment Guide - Fixing CORS Error

## The Problem

You're getting a CORS error because:
- Your frontend is running on `http://localhost:8080`
- It's trying to call a Supabase Edge Function at `https://omxiwmokkiezhaomafqn.supabase.co/functions/v1/search-query`
- The Edge Function needs to be deployed with the updated code

## Solution: Deploy the Edge Function

### Prerequisites

1. Install Supabase CLI:
```bash
# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using npm
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

### Step 1: Link Your Project

```bash
cd c:\Users\jhavi\Downloads\gyan-dhara-main\gyan-dhara-main
supabase link --project-ref omxiwmokkiezhaomafqn
```

### Step 2: Set the Gemini API Key Secret

```bash
supabase secrets set GEMINI_API_KEY=AIzaSyCcJLhphmyywQLnetwn-E_notYhh2XXmJw
```

### Step 3: Deploy the Edge Function

```bash
supabase functions deploy search-query
```

This will deploy your updated Edge Function with:
- ✅ Fixed CORS headers
- ✅ Google GenAI SDK integration
- ✅ Gemini 2.5 Flash model
- ✅ Your API key

### Step 4: Verify Deployment

After deployment, test the function:
```bash
curl -i --location --request POST 'https://omxiwmokkiezhaomafqn.supabase.co/functions/v1/search-query' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"query":"test","language":"en"}'
```

Replace `YOUR_ANON_KEY` with your Supabase anon key from `.env`:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teGl3bW9ra2llemhhb21hZnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNjk3NjcsImV4cCI6MjA3Njg0NTc2N30.aXNeDCVCoAiQXTHRMccWRISVCLDjBiTcW7gnfsc6j6o
```

## Alternative: Run Supabase Locally

If you want to develop locally:

### Step 1: Start Supabase Locally

```bash
supabase start
```

### Step 2: Update Your .env File

Replace the Supabase URL with the local one:
```env
VITE_SUPABASE_URL="http://localhost:54321"
```

### Step 3: Serve the Function Locally

```bash
supabase functions serve search-query --env-file supabase/functions/.env
```

### Step 4: Restart Your Dev Server

```bash
npm run dev
```

## What Was Fixed

1. **CORS Headers** - Added `Access-Control-Allow-Methods: POST, OPTIONS`
2. **OPTIONS Response** - Explicitly set status 200 for preflight requests
3. **Gemini Integration** - Using official Google GenAI SDK
4. **API Key** - Configured in environment variables

## Testing

Once deployed, your search should work without CORS errors. The function will:
1. Accept POST requests from your frontend
2. Handle CORS preflight (OPTIONS) requests properly
3. Call Google Gemini API with your key
4. Return formatted search results

## Troubleshooting

**If you still get CORS errors:**
1. Check that the function is deployed: `supabase functions list`
2. Verify the secret is set: `supabase secrets list`
3. Check function logs: `supabase functions logs search-query`

**If deployment fails:**
1. Make sure you're logged in: `supabase login`
2. Verify project link: `supabase projects list`
3. Check Deno syntax: The function uses Deno runtime, not Node.js
