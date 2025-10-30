# ApeBrain.cloud - Deployment Guide

## 🚀 Hostinger VPS Deployment Guide

### Prerequisites
- Hostinger VPS account (at least Business plan recommended)
- Domain: apebrain.cloud
- SSH access to your VPS

---

## Step 1: Server Setup (Ubuntu/Debian)

### 1.1 Connect to VPS
```bash
ssh root@your-vps-ip
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Dependencies
```bash
# Install Python 3.10+
apt install python3 python3-pip python3-venv -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install mongodb-org -y
systemctl start mongod
systemctl enable mongod

# Install Nginx
apt install nginx -y

# Install Supervisor
apt install supervisor -y

# Install Yarn
npm install -g yarn
```

---

## Step 2: Deploy Application

### 2.1 Create Application Directory
```bash
mkdir -p /var/www/apebrain
cd /var/www/apebrain
```

### 2.2 Upload Your Code
```bash
# Option A: Git (Recommended)
git clone your-repo-url .

# Option B: SCP from local
# From your local machine:
scp -r /path/to/app root@your-vps-ip:/var/www/apebrain
```

### 2.3 Setup Backend
```bash
cd /var/www/apebrain/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure .env
nano .env
```

**Edit .env file:**
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="apebrain_blog"
CORS_ORIGINS="https://apebrain.cloud"
GEMINI_API_KEY="your-gemini-api-key"
EMERGENT_LLM_KEY="your-emergent-key"
ADMIN_USERNAME="your-secure-username"
ADMIN_PASSWORD="your-secure-password"
```

### 2.4 Setup Frontend
```bash
cd /var/www/apebrain/frontend

# Install dependencies
yarn install

# Create production .env
nano .env
```

**Edit .env file:**
```env
REACT_APP_BACKEND_URL=https://apebrain.cloud
```

**Build frontend:**
```bash
yarn build
```

---

## Step 3: Configure Nginx

### 3.1 Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/apebrain
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name apebrain.cloud www.apebrain.cloud;

    # Frontend (React build)
    location / {
        root /var/www/apebrain/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.2 Enable Site
```bash
ln -s /etc/nginx/sites-available/apebrain /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Step 4: Configure Supervisor (Process Manager)

### 4.1 Create Backend Service
```bash
nano /etc/supervisor/conf.d/apebrain-backend.conf
```

**Paste this:**
```ini
[program:apebrain-backend]
directory=/var/www/apebrain/backend
command=/var/www/apebrain/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/apebrain-backend.err.log
stdout_logfile=/var/log/apebrain-backend.out.log
```

### 4.2 Start Services
```bash
supervisorctl reread
supervisorctl update
supervisorctl start apebrain-backend
supervisorctl status
```

---

## Step 5: Setup SSL (HTTPS)

### 5.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 5.2 Get SSL Certificate
```bash
certbot --nginx -d apebrain.cloud -d www.apebrain.cloud
```

Follow prompts:
- Enter email
- Agree to terms
- Choose: Redirect HTTP to HTTPS (option 2)

**Auto-renewal is set up automatically!**

---

## Step 6: Domain Configuration (Hostinger)

### 6.1 Point Domain to VPS
1. Login to Hostinger
2. Go to: Domains → apebrain.cloud → DNS/Nameservers
3. Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your-vps-ip | 3600 |
| A | www | your-vps-ip | 3600 |

Wait 15-30 minutes for DNS propagation.

---

## Step 7: Security Hardening

### 7.1 Setup Firewall
```bash
# Install UFW
apt install ufw -y

# Allow necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Enable firewall
ufw enable
ufw status
```

### 7.2 Change Admin Credentials
1. Visit: https://apebrain.cloud/blogadmin
2. Login with default: `admin` / `apebrain2024`
3. Go to Settings
4. Change username and password
5. Save

### 7.3 Secure MongoDB (Optional but Recommended)
```bash
mongosh
```

```javascript
use admin
db.createUser({
  user: "apebrain_admin",
  pwd: "your-strong-password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
exit
```

Update MONGO_URL in `/var/www/apebrain/backend/.env`:
```
MONGO_URL="mongodb://apebrain_admin:your-strong-password@localhost:27017"
```

Restart backend:
```bash
supervisorctl restart apebrain-backend
```

---

## Step 8: Maintenance

### View Logs
```bash
# Backend logs
tail -f /var/log/apebrain-backend.out.log
tail -f /var/log/apebrain-backend.err.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart backend
supervisorctl restart apebrain-backend

# Restart nginx
systemctl restart nginx

# Check status
supervisorctl status
```

### Update Application
```bash
cd /var/www/apebrain

# Pull latest code
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
supervisorctl restart apebrain-backend

# Update frontend
cd ../frontend
yarn install
yarn build
```

---

## 🎉 Your Site is Live!

- **Frontend**: https://apebrain.cloud
- **Blog**: https://apebrain.cloud/blog
- **Shop**: https://apebrain.cloud/shop
- **Admin**: https://apebrain.cloud/blogadmin

---

## Troubleshooting

### Backend not starting?
```bash
# Check logs
supervisorctl tail apebrain-backend stderr

# Test manually
cd /var/www/apebrain/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend not loading?
```bash
# Check Nginx
nginx -t
systemctl status nginx

# Rebuild frontend
cd /var/www/apebrain/frontend
yarn build
```

### Domain not resolving?
```bash
# Check DNS
nslookup apebrain.cloud

# Wait 15-30 minutes for DNS propagation
```

---

## Support

For issues:
1. Check logs first
2. Verify all services are running
3. Check firewall rules
4. Verify DNS settings

**Your deployment is complete! 🚀**
