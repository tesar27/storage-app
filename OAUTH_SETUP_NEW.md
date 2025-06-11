# OAuth Setup Instructions

## Current Implementation Status

✅ **Completed:**
- OAuth buttons added to AuthForm (Google & GitHub)
- Client-side OAuth implementation using Appwrite SDK
- OAuth session synchronization via API route
- Modern UI styling for OAuth buttons
- Uses Appwrite's internal OAuth handling

## How OAuth Works Now

1. **User clicks OAuth button** → `account.createOAuth2Session()` redirects to Google/GitHub
2. **Google/GitHub authenticates** → redirects to Appwrite's callback URL
3. **Appwrite processes authentication** → redirects to your success URL (`/`)
4. **OAuthHandler detects session** → calls `/api/oauth-sync` to sync session with server
5. **Server creates user in database** → sets proper session cookie
6. **User lands on dashboard** → logged in successfully

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Appwrite Console Setup

#### Step 1: Get Appwrite OAuth Redirect URLs
1. Go to your **Appwrite Console → Auth → Settings**
2. Scroll down to **OAuth2 Providers**
3. You'll see the OAuth redirect URLs for your project:
   - Google: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/[YOUR_PROJECT_ID]`
   - GitHub: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/[YOUR_PROJECT_ID]`

#### Step 2: Set up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set **Authorized Redirect URI** to: 
   ```
   https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/[YOUR_PROJECT_ID]
   ```
   (Use the exact URL from your Appwrite Console)
6. Copy the **Client ID** and **Client Secret**

#### Step 3: Configure Google OAuth in Appwrite
1. In **Appwrite Console → Auth → Settings**
2. Click **+ Add Provider** → **Google**
3. Enter:
   - **App ID**: Your Google Client ID
   - **App Secret**: Your Google Client Secret
4. Click **Update**

#### Step 4: Set up GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create new OAuth App
3. Set **Authorization Callback URL** to:
   ```
   https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/[YOUR_PROJECT_ID]
   ```
   (Use the exact URL from your Appwrite Console)
4. Copy the **Client ID** and **Client Secret**

#### Step 5: Configure GitHub OAuth in Appwrite
1. In **Appwrite Console → Auth → Settings**
2. Click **+ Add Provider** → **GitHub**
3. Enter:
   - **App ID**: Your GitHub Client ID
   - **App Secret**: Your GitHub Client Secret
4. Click **Update**

### 3. Testing OAuth Flow

1. Start your development server: `npm run dev`
2. Go to `/sign-in` or `/sign-up`
3. Click "Continue with Google" or "Continue with GitHub"
4. Should redirect to OAuth provider, then back to your dashboard
5. Check browser console for OAuth flow logs

### 4. Troubleshooting

**If you see `redirect_uri_mismatch` error:**
- Make sure you're using the **exact Appwrite redirect URL** from your console
- **Double-check** the project ID in the URL matches your Appwrite project

**If OAuth seems to hang or keeps refreshing:**
- Check browser console for error messages
- Verify OAuth providers are properly configured in Appwrite Console
- Ensure Client ID and Client Secret are correct
- Make sure redirect URLs match exactly

**If you see "OAuth sync failed" error:**
- Check server logs for API route errors
- Verify Appwrite admin client credentials are correct
- Ensure your users collection ID is properly configured

### 5. Implementation Details

**Key Files:**
- `components/AuthForm.tsx` - OAuth buttons and client-side initiation
- `components/OAuthHandler.tsx` - Detects OAuth sessions and syncs with server
- `app/api/oauth-sync/route.ts` - API route that syncs OAuth session with server-side
- `lib/appwrite/client.ts` - Client-side Appwrite configuration

**Key Point:** The OAuth flow is now fully integrated with proper session management and user database creation!
