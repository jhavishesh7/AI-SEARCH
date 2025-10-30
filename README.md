# NepDex - AI Search Assistant

NepDex is a smart search assistant built for Nepal with multilingual support (English, Hindi, and Nepali).

## Project info

**URL**: https://lovable.dev/projects/f9a89da7-b4f3-4e4b-890d-6f7115a78a8c

## Features

- AI-powered search with Google Gemini
- Multilingual support (English, Hindi, Nepali)
- User authentication with Supabase
- Search history and conversation management
- Real-time web scraping for up-to-date information

## How to run locally

**Prerequisites:**
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase CLI installed - [install guide](https://supabase.com/docs/guides/cli)

**Setup steps:**

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Copy .env file (already configured with Supabase credentials)
# The .env file contains:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - GEMINI_API_KEY

# Step 5: Start the development server
npm run dev

# Step 6: In a separate terminal, start Supabase locally (optional for local development)
supabase start
```

**Important Notes:**
- The GEMINI_API_KEY is already configured in `.env` and `supabase/functions/.env`
- Text generation requires the edge function to be deployed or running locally
- Authentication is fully functional with Supabase

## Edit this code

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f9a89da7-b4f3-4e4b-890d-6f7115a78a8c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f9a89da7-b4f3-4e4b-890d-6f7115a78a8c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
