# ApeBrain.cloud - Deployment Guide für Hostinger VPS

## 🚀 Production Deployment auf Hostinger

### 1. VPS Setup (Hostinger)

#### 1.1 Server Anforderungen
- **VPS Plan:** Minimum 2GB RAM, 2 CPU Cores
- **OS:** Ubuntu 22.04 LTS
- **Storage:** Mindestens 20GB SSD

#### 1.2 Initiale Server-Konfiguration

```bash
# SSH in Server einloggen
ssh root@your-server-ip

# System updaten
apt update && apt upgrade -y

# Firewall konfigurieren
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable

# Swap Memory erstellen (optional, empfohlen für 2GB RAM)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

### 2. Dependencies installieren

#### 2.1 Node.js & Yarn
```bash
# Node.js 20.x installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Yarn installieren
npm install -g yarn

# Verifizieren
node -v  # Should be v20.x
yarn -v
```

#### 2.2 Python 3.11
```bash
# Python 3.11 installieren
apt install -y python3.11 python3.11-venv python3-pip

# Verifizieren
python3.11 --version
```

#### 2.3 MongoDB
```bash
# MongoDB 7.0 installieren
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# MongoDB starten
systemctl start mongod
systemctl enable mongod

# Verifizieren
systemctl status mongod
```

#### 2.4 Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

#### 2.5 Supervisor
```bash
apt install -y supervisor
systemctl start supervisor
systemctl enable supervisor
```

---

### 3. Application Setup

#### 3.1 User erstellen
```bash
adduser apebrain
usermod -aG sudo apebrain
su - apebrain
```

#### 3.2 Repository clonen
```bash
cd /home/apebrain
git clone https://github.com/YOUR_USERNAME/apebrain.cloud.git
cd apebrain.cloud
```

#### 3.3 Backend Setup
```bash
cd backend

# Virtual Environment erstellen
python3.11 -m venv venv
source venv/bin/activate

# Dependencies installieren
pip install --upgrade pip
pip install -r requirements.txt

# .env File erstellen
cp .env.example .env
nano .env
```

**Backend .env Configuration:**
```env
MONGO_URL=mongodb://localhost:27017/apebrain
GEMINI_API_KEY=your_gemini_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=live
PEXELS_API_KEY=your_pexels_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=apebrain333@gmail.com
SMTP_PASSWORD=xanrclymlublsmvh
NOTIFICATION_EMAIL=apebrain333@gmail.com
EMERGENT_LLM_KEY=your_emergent_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
JWT_SECRET_KEY=change-this-to-secure-random-string-in-production
FRONTEND_URL=https://apebrain.cloud
```

#### 3.4 Frontend Setup
```bash
cd /home/apebrain/apebrain.cloud/frontend

# Dependencies installieren
yarn install

# .env File erstellen
nano .env
```

**Frontend .env Configuration:**
```env
REACT_APP_BACKEND_URL=https://apebrain.cloud
```

**Frontend Build:**
```bash
yarn build
```

---

### 4. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/apebrain
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name apebrain.cloud www.apebrain.cloud;

    # Frontend (React Build)
    location / {
        root /home/apebrain/apebrain.cloud/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logs
    access_log /var/log/nginx/apebrain_access.log;
    error_log /var/log/nginx/apebrain_error.log;
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/apebrain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 5. SSL Certificate (Let's Encrypt)

```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx

# SSL Certificate generieren
sudo certbot --nginx -d apebrain.cloud -d www.apebrain.cloud

# Auto-renewal testen
sudo certbot renew --dry-run
```

---

### 6. Supervisor Configuration

#### 6.1 Backend Process
```bash
sudo nano /etc/supervisor/conf.d/apebrain-backend.conf
```

```ini
[program:apebrain-backend]
directory=/home/apebrain/apebrain.cloud/backend
command=/home/apebrain/apebrain.cloud/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
user=apebrain
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/apebrain-backend.err.log
stdout_logfile=/var/log/supervisor/apebrain-backend.out.log
environment=PATH="/home/apebrain/apebrain.cloud/backend/venv/bin"
```

**Supervisor starten:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start apebrain-backend
sudo supervisorctl status
```

---

### 7. GitHub Auto-Deploy Setup

#### 7.1 SSH Key für GitHub
```bash
ssh-keygen -t ed25519 -C "deploy@apebrain.cloud"
cat ~/.ssh/id_ed25519.pub
# Copy this key and add to GitHub Deploy Keys
```

#### 7.2 Deploy Script erstellen
```bash
nano /home/apebrain/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to project
cd /home/apebrain/apebrain.cloud

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Backend
echo "🔧 Updating Backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Frontend
echo "🎨 Building Frontend..."
cd ../frontend
yarn install
yarn build

# Restart services
echo "🔄 Restarting services..."
sudo supervisorctl restart apebrain-backend

echo "✅ Deployment complete!"
```

**Executable machen:**
```bash
chmod +x /home/apebrain/deploy.sh
```

#### 7.3 GitHub Actions Workflow
Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: apebrain
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            /home/apebrain/deploy.sh
```

**GitHub Secrets hinzufügen:**
- `SERVER_HOST`: Your server IP
- `SSH_PRIVATE_KEY`: Content of ~/.ssh/id_ed25519

---

### 8. MongoDB Backup Setup

```bash
nano /home/apebrain/backup-mongo.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/apebrain/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --db apebrain --out $BACKUP_DIR/backup_$DATE

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

**Cron Job:**
```bash
crontab -e
# Add: 0 2 * * * /home/apebrain/backup-mongo.sh
```

---

### 9. Monitoring & Logs

#### View Logs:
```bash
# Backend logs
sudo tail -f /var/log/supervisor/apebrain-backend.out.log
sudo tail -f /var/log/supervisor/apebrain-backend.err.log

# Nginx logs
sudo tail -f /var/log/nginx/apebrain_access.log
sudo tail -f /var/log/nginx/apebrain_error.log

# MongoDB logs
sudo journalctl -u mongod -f
```

#### Restart Services:
```bash
# Backend
sudo supervisorctl restart apebrain-backend

# Nginx
sudo systemctl restart nginx

# MongoDB
sudo systemctl restart mongod
```

---

### 10. Security Checklist

- ✅ Firewall aktiviert (ufw)
- ✅ SSL Certificate installiert
- ✅ MongoDB nur localhost
- ✅ Sichere JWT_SECRET_KEY
- ✅ SMTP Credentials sicher
- ✅ Google OAuth Credentials sicher
- ✅ Regelmäßige Backups
- ✅ Updates automatisch

---

### 11. Domain Setup (Hostinger)

1. **DNS Records** in Hostinger Panel:
   - A Record: `@` → Server IP
   - A Record: `www` → Server IP

2. **Google OAuth Redirect URIs** aktualisieren:
   - https://apebrain.cloud/auth/google/callback
   - In Google Cloud Console hinzufügen

3. **PayPal Webhooks** aktualisieren:
   - https://apebrain.cloud/api/paypal/webhook

---

### 12. Post-Deployment Tests

```bash
# Health Check
curl https://apebrain.cloud/api/health

# Test Backend
curl https://apebrain.cloud/api/blogs

# Test Frontend
curl https://apebrain.cloud
```

---

## 🎉 Deployment Complete!

Your ApeBrain.cloud application is now live!

**URLs:**
- Frontend: https://apebrain.cloud
- Backend API: https://apebrain.cloud/api
- Admin Panel: https://apebrain.cloud/shroomsadmin

**Automatic Updates:**
Push to GitHub main branch → Auto-deploy via GitHub Actions
