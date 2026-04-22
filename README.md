**Storage — Next.js + Appwrite**

**Overview:**
- Storage is a server-side rendered Next.js application that provides authenticated file storage, sharing and lightweight file management. It uses Appwrite for authentication, database (Documents), and object storage (buckets). The app exposes a clean UI for uploading, sharing, renaming, and managing user files.

**Features:**
- Email + OAuth authentication (Appwrite Account)
- File upload to Appwrite Storage with metadata persisted to Appwrite Databases
- File sharing via email list on the document (`users` array)
- File size tracking and per-user usage summary
- Admin server operations use an Appwrite server key (server-only env var)

**Architecture (high level):**
- Frontend: Next.js (App Router) UI components in `components/` and pages in `app/`.
- Backend: Server actions and API routes call Appwrite Admin SDK via `lib/appwrite/*`.
- Appwrite responsibilities:
	- Auth: Appwrite Accounts and Sessions
	- Storage: file binary storage in a bucket
	- Database: `users` and `files` collections

**Appwrite collections (required schema)**
- `users` collection — expected document attributes:
	- `fullName` (string)
	- `email` (string)
	- `avatar` (string) — URL
	- `accountId` (string) — Appwrite account $id
	- `hasPassword` (boolean, optional)
	- Appwrite meta fields: `$id`, `$createdAt`, `$updatedAt`

- `files` collection — expected document attributes:
	- `type` (string) — `document|image|video|audio|other`
	- `name` (string)
	- `url` (string) — constructed Appwrite storage view URL
	- `extension` (string)
	- `size` (integer) — bytes (must be an integer attribute in collection)
	- `owner` (string) — internal user document `$id`
	- `accountId` (string) — uploader Appwrite account $id
	- `users` (array of strings) — shared user emails
	- `bucketFileId` (string) — Appwrite storage file id
	- Appwrite meta fields: `$id`, `$createdAt`, `$updatedAt`

**Important notes on permissions**
- Appwrite Storage file permissions are independent from your `files` documents. When creating a file, grant read permission to the uploader's Appwrite account id (example permission: `user:ACCOUNT_ID`) or make files public with `role:all` if appropriate.
- Ensure the server creates storage files with correct permissions; otherwise owners will see `No permissions provided for action 'read'`.

**Environment variables** (use `.env.local`, do not commit secrets, DO NOT wrap values in quotes):
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` (e.g. `https://fra.cloud.appwrite.io/v1`)
- `NEXT_PUBLIC_APPWRITE_PROJECT` (Appwrite project id)
- `NEXT_PUBLIC_APPWRITE_DATABASE` (database id)
- `NEXT_PUBLIC_APPWRITE_USERS_COLLECTION` (users collection id)
- `NEXT_PUBLIC_APPWRITE_FILES_COLLECTION` (files collection id)
- `NEXT_PUBLIC_APPWRITE_BUCKET` (storage bucket id)
- `NEXT_APPWRITE_KEY` (server/admin API key — store as server-only secret)

Example local env (no quotes):
```dotenv
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE=your-database-id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION=your-users-collection-id
NEXT_PUBLIC_APPWRITE_FILES_COLLECTION=your-files-collection-id
NEXT_PUBLIC_APPWRITE_BUCKET=your-bucket-id
NEXT_APPWRITE_KEY=your-secret-server-key
```

**Local development**
1. Install deps:
```bash
npm install
```
2. Run dev server:
```bash
npm run dev
```
3. Open http://localhost:3000

**Build & deploy (Vercel)**
- Add the environment variables to Vercel Project → Settings → Environment Variables (set `NEXT_APPWRITE_KEY` as a secret and the `NEXT_PUBLIC_` values for Preview/Production). Do not include surrounding quotes.
- If build-time code reads Appwrite envs during static generation, ensure Vercel env values are set for the correct deployment environment.

**Common troubleshooting**
- "The current user is not authorized to perform the requested action": verify `NEXT_APPWRITE_KEY` is the Admin/API key for the same project; remove surrounding quotes in env files.
- `Invalid document structure: Attribute "size" has invalid type`: ensure `size` is defined as an integer attribute in Appwrite (your code writes numeric bytes).
- `No permissions provided for action 'read'` for storage files: recreate files with `user:ACCOUNT_ID` read permission or set bucket defaults to public if desired.

**Recreating collections / migration**
- If you recreate collections in Appwrite Console, add the attributes listed above and the necessary indexes you use in code (e.g., `email`, `accountId`, `owner`, `users` for `contains` queries).

**Contributing**
- Open issues or PRs for bugs and feature requests. Follow existing code patterns in `lib/actions/` and `components/`.

**License**
- MIT

---

If you want, I can: provide Appwrite Console JSON to import the `users` and `files` collections, or add a migration script to backfill `size` as an integer for existing documents. Tell me which and I'll prepare it next.
