# ⚡ Lightning Yield - Open Graph Setup

Your lightningyield.com links will now look professional when shared on social media! 🎉

## ✅ What's Already Done

1. **Updated `index.html`** with comprehensive Open Graph meta tags
2. **Created `public/og-preview.svg`** - a professional preview image
3. **Created conversion script** to generate PNG version

## 🖼️ Creating the Preview Image

### Option 1: Automatic Conversion (Recommended)
```bash
# Install Puppeteer for headless Chrome
npm install puppeteer

# Convert SVG to PNG
node convert-og-image.js
```

### Option 2: Manual Browser Screenshot
1. Open `public/og-preview.svg` in your browser
2. Right-click → Inspect
3. Find the `<svg>` element
4. Right-click → Capture node screenshot
5. Save as `og-preview.png` in the `public/` folder

### Option 3: Online Converter
1. Go to [Convertio](https://convertio.co/svg-png/) or similar
2. Upload `public/og-preview.svg`
3. Download as PNG
4. Rename to `og-preview.png` and place in `public/` folder

## 🚀 Deploy to Vercel

1. Commit and push your changes:
```bash
git add .
git commit -m "Add Open Graph meta tags and preview image"
git push
```

2. Vercel will automatically redeploy

## 🧪 Test Your OG Tags

After deployment, test how your links will look:

- **Open Graph Tester**: https://www.opengraph.xyz/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/

Paste in `https://lightningyield.com` to see the preview.

## 🎯 What You'll Get

Instead of boring "Base44 APP", your links will show:

- **Title**: ⚡ Lightning Yield
- **Description**: Model Bitcoin treasuries. Visualize Lightning yield. Track NAV in sats.
- **Image**: Professional lightning bolt branding on Bitcoin orange gradient
- **Brand**: Base44

## 📱 Supported Platforms

- Twitter/X
- Facebook
- LinkedIn
- Discord
- Slack
- WhatsApp
- Telegram
- Snapchat
- And more!

## 🔧 Customization

Want to change the preview? Edit:
- **Text**: Update meta tags in `index.html`
- **Image**: Replace `public/og-preview.png`
- **Colors**: Modify `public/og-preview.svg`

## 🎨 Image Specifications

- **Size**: 1200×630 pixels (Twitter card size)
- **Format**: PNG or JPG
- **Path**: `/public/og-preview.png`
- **URL**: `https://lightningyield.com/og-preview.png`

---

**Pro tip**: The preview image will make your app look like a polished product instead of a test build! 🚀
