# 🧠 ApeBrain - AI-Powered Platform

## 🌐 Live Site
**https://apebrain.cloud**

### 🎯 Routes
- **Homepage**: https://apebrain.cloud
- **Shop**: https://apebrain.cloud/shop
- **Admin Panel**: https://apebrain.cloud/shroomsadmin
- **Dashboard**: https://apebrain.cloud/dashboard
- **API**: https://apebrain.cloud/api

---

## 🚀 Tech Stack

### Frontend
- ⚛️ React 19
- 🎨 Tailwind CSS + Radix UI
- 🔐 React Router v7
- 💰 PayPal Integration
- 📝 React Markdown

### Backend
- 🐍 Python FastAPI
- 🗄️ MongoDB (Motor)
- 🤖 Google Gemini AI
- 🔐 Google OAuth + JWT
- 💳 PayPal + Stripe
- 📧 SMTP Email
- ☁️ AWS S3

---

## 📦 Deployment

### Quick Start

```bash
# 1. Setup server
ssh root@72.61.177.155
bash <(curl -s https://raw.githubusercontent.com/robinzi2001-cell/apebrain/mainnew333/scripts/server-setup.sh)

# 2. Clone repository
sudo su - apebrain
git clone git@github.com:robinzi2001-cell/apebrain.git apebrain.cloud
cd apebrain.cloud

# 3. Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your keys

# 4. Deploy
./scripts/deploy.sh
```

### Auto-Deployment

Every push to `mainnew333` automatically deploys via GitHub Actions.

**Required GitHub Secrets:**
- `SERVER_HOST`: 72.61.177.155
- `SERVER_USER`: apebrain
- `SSH_PRIVATE_KEY`: (from server)

---

## 🔧 Development

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

---

## 🌍 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/apebrain
GEMINI_API_KEY=your_key
PAYPAL_CLIENT_ID=your_key
PAYPAL_CLIENT_SECRET=your_key
GOOGLE_CLIENT_ID=your_key
GOOGLE_CLIENT_SECRET=your_key
JWT_SECRET_KEY=your_key
FRONTEND_URL=https://apebrain.cloud
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://apebrain.cloud
REACT_APP_PAYPAL_CLIENT_ID=your_key
REACT_APP_GOOGLE_CLIENT_ID=your_key
```

---

## 📊 Features

- ✅ AI-Powered Content Generation
- ✅ E-Commerce Shop
- ✅ Payment Integration (PayPal + Stripe)
- ✅ User Authentication (Google OAuth)
- ✅ Admin Dashboard
- ✅ Email Notifications
- ✅ File Uploads (AWS S3)
- ✅ Responsive Design
- ✅ SEO Optimized

---

## 🛠️ Useful Commands

```bash
# Services
sudo systemctl status apebrain-backend nginx mongod

# Logs
journalctl -u apebrain-backend -f
tail -f /var/log/nginx/apebrain-error.log

# Deploy
./scripts/deploy.sh

# Restart
sudo systemctl restart apebrain-backend
sudo systemctl reload nginx
```

---

## 📞 Support

- **Server**: 72.61.177.155
- **Domain**: apebrain.cloud
- **GitHub**: https://github.com/robinzi2001-cell/apebrain

---

## 📄 License

Private - All Rights Reserved