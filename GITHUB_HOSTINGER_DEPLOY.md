# 🚀 ApeBrain.cloud - GitHub zu Hostinger Deployment

## Schnell-Anleitung für automatisches Deployment

### 1. GitHub Repository Setup

#### 1.1 Repository erstellen (falls noch nicht vorhanden)
```bash
# Auf deinem lokalen Rechner
cd /path/to/apebrain.cloud
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/apebrain.git
git push -u origin main
```

#### 1.2 Secrets konfigurieren
In deinem GitHub Repository:
- Gehe zu **Settings → Secrets and variables → Actions**
- Klicke **"New repository secret"**
- Füge hinzu:
  - `SERVER_HOST`: Deine Hostinger Server IP (z.B. 123.45.67.89)
  - `SSH_PRIVATE_KEY`: Inhalt von `~/.ssh/id_ed25519` vom Server
  - `SERVER_USER`: `apebrain` (oder dein Server-Username)

---

### 2. Hostinger VPS - Initial Setup

#### 2.1 Schnell-Installation Script
SSH in deinen Hostinger VPS einloggen und ausführen:

```bash
#!/bin/bash
# Save as: setup-server.sh

echo "🚀 ApeBrain.cloud Server Setup"

# System Update
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Install Yarn
sudo npm install -g yarn

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx & Supervisor
sudo apt install -y nginx supervisor

# Firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Server setup complete!"
```

Ausführen:
```bash
chmod +x setup-server.sh
./setup-server.sh
```

#### 2.2 User & App Directory erstellen
```bash
sudo adduser apebrain
sudo usermod -aG sudo apebrain
su - apebrain
mkdir -p ~/apebrain.cloud
```

#### 2.3 SSH Key für GitHub
```bash
ssh-keygen -t ed25519 -C "deploy@apebrain.cloud"
cat ~/.ssh/id_ed25519.pub
```
- Kopiere den Public Key
- Gehe zu GitHub Repo → Settings → Deploy keys
- Füge den Key hinzu (mit Write-Zugriff)

---

### 3. Application Deployment

#### 3.1 Repository clonen
```bash
cd ~/apebrain.cloud
git clone git@github.com:YOUR_USERNAME/apebrain.git .
```

#### 3.2 Environment Variables
```bash
# Backend .env
cd ~/apebrain.cloud/backend
cp .env.example .env
nano .env
```

**Füge deine echten Credentials ein:**
- `GEMINI_API_KEY`
- `PAYPAL_CLIENT_ID` + `SECRET`
- `GOOGLE_CLIENT_ID` + `SECRET`
- `SMTP_PASSWORD`
- `EMERGENT_LLM_KEY`
- `JWT_SECRET_KEY` (generiere einen mit: `openssl rand -hex 32`)
- `FRONTEND_URL=https://apebrain.cloud`

```bash
# Frontend .env
cd ~/apebrain.cloud/frontend
cp .env.example .env
nano .env
```
Setze: `REACT_APP_BACKEND_URL=https://apebrain.cloud`

#### 3.3 Backend Installation
```bash
cd ~/apebrain.cloud/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

#### 3.4 Frontend Build
```bash
cd ~/apebrain.cloud/frontend
yarn install
yarn build
```

---

### 4. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/apebrain
```

```nginx
server {
    listen 80;
    server_name apebrain.cloud www.apebrain.cloud;

    # Frontend
    location / {
        root /home/apebrain/apebrain.cloud/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/apebrain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 5. SSL Certificate

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d apebrain.cloud -d www.apebrain.cloud
```

---

### 6. Supervisor (Backend Process)

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
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start apebrain-backend
```

---

### 7. Auto-Deploy Script

#### 7.1 Deploy Script erstellen
```bash
nano ~/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Deploying ApeBrain.cloud..."

cd ~/apebrain.cloud

# Pull latest code
git fetch origin
git reset --hard origin/main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Frontend
cd ../frontend
yarn install
yarn build

# Restart backend
sudo supervisorctl restart apebrain-backend

echo "✅ Deployment complete!"
```

```bash
chmod +x ~/deploy.sh
```

#### 7.2 Test Deploy
```bash
~/deploy.sh
```

---

### 8. GitHub Actions (Auto-Deploy)

**In deinem GitHub Repository erstellen:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/apebrain.cloud
            git fetch origin
            git reset --hard origin/main
            
            # Backend
            cd backend
            source venv/bin/activate
            pip install -r requirements.txt
            deactivate
            
            # Frontend
            cd ../frontend
            yarn install
            yarn build
            
            # Restart
            sudo supervisorctl restart apebrain-backend
            
            echo "✅ Deployment successful!"
```

**Commit & Push:**
```bash
git add .github/workflows/deploy.yml
git commit -m "Add auto-deploy workflow"
git push
```

---

### 9. Domain Setup (Hostinger DNS)

In Hostinger Control Panel → DNS Zone Editor:

| Type | Name | Value |
|------|------|-------|
| A | @ | Your Server IP |
| A | www | Your Server IP |
| CNAME | www | apebrain.cloud |

**Google OAuth Update:**
- Gehe zu Google Cloud Console
- Füge hinzu:
  - Origin: `https://apebrain.cloud`
  - Redirect: `https://apebrain.cloud/auth/google/callback`

---

### 10. Monitoring & Maintenance

#### Logs anschauen:
```bash
# Backend logs
sudo tail -f /var/log/supervisor/apebrain-backend.out.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

#### Services neustarten:
```bash
# Backend
sudo supervisorctl restart apebrain-backend

# Nginx
sudo systemctl restart nginx

# MongoDB
sudo systemctl restart mongod
```

#### Updates deployen:
```bash
# Automatisch: Einfach zu GitHub pushen
git push origin main

# Manuell:
~/deploy.sh
```

---

## 🎉 Fertig!

**Workflow:**
1. Code lokal ändern
2. `git add .`
3. `git commit -m "Your changes"`
4. `git push`
5. GitHub Actions deployed automatisch zu Hostinger!

**URLs:**
- App: https://apebrain.cloud
- Admin: https://apebrain.cloud/shroomsadmin

**Support:**
- Backend Logs: `/var/log/supervisor/apebrain-backend.err.log`
- MongoDB: `sudo systemctl status mongod`
- Nginx: `sudo nginx -t`
