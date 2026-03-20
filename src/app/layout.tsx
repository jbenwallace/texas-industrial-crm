import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'Texas Industrial CRM' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
```

Actually — this will take too long file by file. There are 33 files. Let me give you a completely different deployment method that avoids GitHub entirely.

**Use Railway's direct Git deploy instead:**

1. Open Command Prompt in your `Texas-industrial-crm unzipped` folder
2. Run these commands one at a time:
```
git init
git add .
git commit -m "deploy"
```

3. In Railway, go to your project → your app service → **Settings** → scroll to **Source** → click **Connect Repo** or look for a way to deploy from a local source

Actually the cleanest path: **use Railway CLI to deploy directly from your computer without GitHub at all.**

1. Go to **railway.app/cli** and download the Railway CLI installer for Windows
2. Run the installer
3. Open Command Prompt in your project folder and run:
```
railway login
railway link
railway up
