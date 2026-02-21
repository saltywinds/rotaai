# RotaAI — Launch Guide

## What's in this folder

```
rotaai/
├── src/
│   ├── App.jsx       ← The entire app (staff, rota, holiday, history)
│   └── index.js      ← Entry point
├── public/
│   └── index.html    ← HTML shell
├── package.json      ← Dependencies
├── netlify.toml      ← Netlify deployment config
└── README.md         ← This file
```

---

## Step-by-step: Launch in 15 minutes

### Step 1 — Get a free GitHub account
Go to github.com and sign up (free). This is where your app code will live.

### Step 2 — Create a new repository
1. Click the green **New** button on GitHub
2. Name it `rotaai`
3. Set it to **Private**
4. Click **Create repository**

### Step 3 — Upload your files
1. Click **uploading an existing file** on the repo page
2. Drag and drop the entire `rotaai` folder contents
3. Click **Commit changes**

### Step 4 — Deploy to Netlify (free)
1. Go to **netlify.com** and sign up with your GitHub account
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** → select your `rotaai` repo
4. Build settings will auto-detect (the netlify.toml handles this)
5. Click **Deploy site**
6. Wait ~2 minutes — Netlify builds and gives you a live URL like `rotaai-xyz.netlify.app`

### Step 5 — Get your Claude API key
1. Go to **console.anthropic.com**
2. Sign up / log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Add some credit — generating rotas costs roughly £0.01–0.03 each

### Step 6 — Add your API key to the app
1. Open your live app URL
2. Click **⚙ Settings** in the top right
3. Paste your API key
4. Click Save — it's stored in your browser only

### Step 7 — You're live!
Open the app, pick a week, hit **Generate Rota**. Done.

---

## Optional: Custom domain
Instead of `rotaai-xyz.netlify.app` you can use something like `rota.yourcafe.co.uk`:
1. Buy a domain at Namecheap or Cloudflare (~£10/year)
2. In Netlify: Site settings → Domain management → Add custom domain
3. Follow the DNS instructions (takes ~10 minutes to go live)

---

## Keeping data safe
- Staff and holiday data is saved in your browser's localStorage
- It persists across sessions on the same browser/device
- To share access with another manager: they open the same URL and add their own API key
- For multi-device sync in the future, a database upgrade would be needed

---

## Updating the app
If you want to make changes:
1. Edit `src/App.jsx` locally
2. Commit and push to GitHub
3. Netlify auto-rebuilds in ~2 minutes

---

## Costs
- GitHub: Free
- Netlify hosting: Free
- Claude API: Pay as you go (~£0.01–0.03 per rota generated)
- Custom domain: ~£10/year (optional)

**Total: basically free to run.**
