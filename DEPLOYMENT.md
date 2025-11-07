# Deployment Guide - Simulation Reality

## 📋 Pre-Deployment Checklist

### 1. **Generate PWA Icons**

The project needs PNG icons for PWA support. Choose one method:

**Option A: Using ImageMagick (Recommended)**
```bash
# Install ImageMagick if not installed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: Download from https://imagemagick.org/

# Generate icons
convert public/icon.svg -resize 192x192 public/pwa-192x192.png
convert public/icon.svg -resize 512x512 public/pwa-512x512.png
convert public/icon.svg -resize 180x180 public/apple-touch-icon.png
convert public/icon.svg -resize 32x32 public/favicon.ico
```

**Option B: Using Sharp (Node.js)**
```bash
npm install -D sharp
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('public/icon.svg');
sharp(svg).resize(192, 192).png().toFile('public/pwa-192x192.png');
sharp(svg).resize(512, 512).png().toFile('public/pwa-512x512.png');
sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png');
"
```

**Option C: Online Tool**
1. Go to https://realfavicongenerator.net/
2. Upload `public/icon.svg`
3. Download generated package
4. Extract to `public/` directory

### 2. **Environment Setup**

Create `.env.production` file:
```env
VITE_APP_NAME=Simulation Reality
VITE_APP_URL=https://your-domain.com
VITE_ANALYTICS_ID=  # Optional: Google Analytics ID
```

### 3. **Test Build Locally**

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:4173` and test:
- ✅ App loads without errors
- ✅ 3D scene renders correctly
- ✅ Audio works (after user interaction)
- ✅ Touch/mouse controls work
- ✅ No console errors
- ✅ Performance is acceptable (check FPS with Ctrl+D)

## 🚀 Deployment Options

### Option 1: Netlify (Recommended)

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Deploy:**
```bash
# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

3. **Configure `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
    [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
    [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 2: Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Configure `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Option 3: GitHub Pages

1. **Install gh-pages:**
```bash
npm install -D gh-pages
```

2. **Add to `package.json`:**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **Update `vite.config.ts`:**
```typescript
export default defineConfig({
  base: '/your-repo-name/',  // Replace with your repo name
  // ... rest of config
});
```

4. **Deploy:**
```bash
npm run deploy
```

### Option 4: Self-Hosted (Nginx)

1. **Build:**
```bash
npm run build
```

2. **Nginx Configuration** (`/etc/nginx/sites-available/simulation-reality`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/simulation-reality;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json
               application/wasm;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Service Worker
    location = /sw.js {
        add_header Cache-Control "no-cache";
        proxy_cache_bypass $http_pragma;
        proxy_cache_revalidate on;
    }
}
```

3. **Deploy files:**
```bash
rsync -avz dist/ user@your-server:/var/www/simulation-reality/
```

## 🔒 Production Optimizations

### Performance

The build automatically includes:
- ✅ Minification (Terser)
- ✅ Code splitting (Three.js separate chunk)
- ✅ Tree shaking
- ✅ GLSL shader compression
- ✅ Asset optimization

### Security Headers (Already configured in examples above)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Analytics (Optional)

Add Google Analytics or similar:

```typescript
// src/main.ts
if (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ID) {
  // Add your analytics code
}
```

## 📊 Monitoring

### Performance Monitoring

Use browser DevTools or integrate real user monitoring:

```typescript
// Example: Track performance
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    Analytics.trackTiming('Performance', 'Page Load', pageLoadTime);
  });
}
```

### Error Tracking

Add error boundary:

```typescript
window.addEventListener('error', (event) => {
  if (import.meta.env.PROD) {
    // Send to error tracking service
    console.error('Global error:', event.error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.PROD) {
    // Send to error tracking service
    console.error('Unhandled promise rejection:', event.reason);
  }
});
```

## 🧪 Post-Deployment Testing

Test checklist after deployment:

1. **Functionality**
   - [ ] WebGL renders correctly
   - [ ] Audio plays after interaction
   - [ ] Controls work (mouse, touch, keyboard)
   - [ ] Choices system works
   - [ ] Glitch effects appear on click/touch
   - [ ] Multiple endings are reachable

2. **Performance**
   - [ ] Initial load < 3 seconds
   - [ ] Maintains 60 FPS on desktop
   - [ ] Maintains 30+ FPS on mobile
   - [ ] No memory leaks (check DevTools)

3. **PWA**
   - [ ] Install prompt appears (mobile/desktop)
   - [ ] Works offline after first load
   - [ ] Icons display correctly
   - [ ] Splash screen shows

4. **Browsers**
   - [ ] Chrome (desktop & mobile)
   - [ ] Firefox
   - [ ] Safari (desktop & mobile)
   - [ ] Edge

5. **Devices**
   - [ ] Desktop (various resolutions)
   - [ ] Tablet
   - [ ] Mobile (various sizes)

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### PWA Not Working

1. Check icons exist in `public/`
2. Verify HTTPS is enabled (required for PWA)
3. Check service worker registration in DevTools

### Performance Issues

1. Open Ctrl+D debug menu
2. Check FPS counter
3. Verify appropriate settings for device (mobile vs desktop)
4. Check browser console for errors

### Audio Not Playing

1. Ensure user interaction before audio starts (browser requirement)
2. Check browser console for autoplay policy errors
3. Verify audio context is initialized

## 📱 Mobile-Specific Notes

- Audio requires user interaction to start (browser policy)
- Performance may vary on older devices
- Touch gestures are optimized but test on real devices
- Consider reducing particle count on low-end devices

## 🔄 Updates & Rollbacks

### Deploying Updates

```bash
# Update version in package.json
npm version patch  # or minor, major

# Build and deploy
npm run build
netlify deploy --prod  # or your deployment method
```

### Rolling Back (Netlify example)

```bash
netlify rollback
```

## 📈 Scaling Considerations

The application is client-side only and requires no backend:
- ✅ Scales infinitely with CDN
- ✅ No server costs
- ✅ No database needed
- ✅ Can handle unlimited concurrent users

## 🎯 Success Metrics

Track these metrics post-deployment:

- **Performance**: Time to interactive < 3s
- **Engagement**: Average session duration
- **Completion**: % of users reaching endings
- **Errors**: Error rate < 0.1%
- **FPS**: Average FPS > 50

---

## 🆘 Support

For issues:
1. Check browser console for errors
2. Verify all files are deployed
3. Test in incognito mode
4. Check network tab for failed requests

**Happy Deploying! 🚀**
