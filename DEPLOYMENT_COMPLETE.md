# 🎉 ApeBrain Deployment auf apebrain.cloud

## ✅ STATUS: BEREIT ZUM DEPLOYEN!

---

## 📊 Was wurde vorbereitet:

### ✅ GitHub Repository
- **Branch**: mainnew333
- **Deployment-Files**: Alle hinzugefügt
- **GitHub Actions**: Konfiguriert
- **Docker Setup**: Bereit

### ✅ Server (72.61.177.155)
- **OS**: Ubuntu 24.04 LTS (FRISCH)
- **Status**: Running
- **Root Password**: ApeBrain2025-SecureBlog@

### ✅ Domain
- **Domain**: apebrain.cloud
- **Routes konfiguriert**:
  - `/` - Homepage
  - `/shop` - Shop
  - `/shroomsadmin` - Admin Panel
  - `/dashboard` - Dashboard
  - `/api/*` - Backend API

---

## 🚀 DEPLOYMENT STARTEN (3 Schritte):

### Schritt 1: Server Setup

```bash
# Mit Server verbinden
ssh root@72.61.177.155
# Password: ApeBrain2025-SecureBlog@

# Setup-Script ausführen
bash <(curl -s https://raw.githubusercontent.com/robinzi2001-cell/apebrain/mainnew333/scripts/server-setup.sh)
```

**Das Script installiert:**
- Node.js 20, Python 3.12, MongoDB 7.0
- Nginx, SSL Tools, Firewall
- User 'apebrain', SSH Keys
- Backend Service, Swap, Fail2Ban

⏱️ **Dauer**: ~15 Minuten

---

### Schritt 2: GitHub Deploy Key hinzufügen

Am Ende des Setup-Scripts wird ein SSH Key angezeigt.

**Kopiere den Key und:**
1. Gehe zu: https://github.com/robinzi2001-cell/apebrain/settings/keys
2. Klicke "Add deploy key"
3. Title: `Hostinger Production Server`
4. Key: [Paste]
5. ✅ "Allow write access" aktivieren
6. "Add key"

---

### Schritt 3: Repository clonen & deployen

```bash
# Zu apebrain user wechseln
sudo su - apebrain

# Repository clonen
git clone git@github.com:robinzi2001-cell/apebrain.git apebrain.cloud
cd apebrain.cloud

# Environment Variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Backend .env bearbeiten
nano backend/.env
```

**Backend .env ausfüllen:**
```env
MONGO_URL=mongodb://localhost:27017/apebrain
GEMINI_API_KEY=dein_key
PAYPAL_CLIENT_ID=dein_key
PAYPAL_CLIENT_SECRET=dein_key
GOOGLE_CLIENT_ID=dein_key
GOOGLE_CLIENT_SECRET=dein_key
JWT_SECRET_KEY=$(openssl rand -hex 32)
FRONTEND_URL=https://apebrain.cloud
```

**Frontend .env:**
```bash
nano frontend/.env
```

```env
REACT_APP_BACKEND_URL=https://apebrain.cloud
REACT_APP_PAYPAL_CLIENT_ID=dein_key
REACT_APP_GOOGLE_CLIENT_ID=dein_key
```

**Deployment ausführen:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

### Schritt 4: Nginx konfigurieren

```bash
# Zurück zu root
exit

# Nginx Config
cp /home/apebrain/apebrain.cloud/nginx.conf /etc/nginx/sites-available/apebrain
ln -s /etc/nginx/sites-available/apebrain /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test & Restart
nginx -t
systemctl restart nginx

# Backend Service
systemctl enable apebrain-backend
systemctl start apebrain-backend
systemctl status apebrain-backend
```

---

### Schritt 5: DNS & SSL

**DNS konfigurieren** (in deinem DNS Provider):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 72.61.177.155 | 3600 |
| A | www | 72.61.177.155 | 3600 |

**Warte 5-10 Minuten**, dann:

```bash
# DNS prüfen
dig apebrain.cloud +short

# SSL installieren
certbot --nginx -d apebrain.cloud -d www.apebrain.cloud
```

---

### Schritt 6: GitHub Actions einrichten

**GitHub Secrets hinzufügen:**

1. Gehe zu: https://github.com/robinzi2001-cell/apebrain/settings/secrets/actions
2. Klicke "New repository secret"

**Secret 1:**
- Name: `SERVER_HOST`
- Value: `72.61.177.155`

**Secret 2:**
- Name: `SERVER_USER`  
- Value: `apebrain`

**Secret 3:**
- Name: `SSH_PRIVATE_KEY`
- Value: [Private Key vom Server]

**Private Key holen:**
```bash
ssh apebrain@72.61.177.155
cat ~/.ssh/id_ed25519
# Kompletten Output kopieren
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Server Setup ausgeührt
- [ ] SSH Key zu GitHub hinzugefügt
- [ ] Repository geclont
- [ ] Backend .env erstellt
- [ ] Frontend .env erstellt
- [ ] Deployment ausgeführt
- [ ] Nginx konfiguriert
- [ ] Backend Service gestartet
- [ ] DNS konfiguriert
- [ ] SSL installiert
- [ ] GitHub Secrets hinzugefügt
- [ ] Test-Push gemacht

---

## 🎯 Nach Deployment erreichbar:

- 🌐 **Homepage**: https://apebrain.cloud
- 🛒 **Shop**: https://apebrain.cloud/shop
- 🔧 **Admin**: https://apebrain.cloud/shroomsadmin
- 📊 **Dashboard**: https://apebrain.cloud/dashboard
- 🔌 **API**: https://apebrain.cloud/api/health

---

## 🔄 Auto-Deployment

**Ab jetzt:**
```bash
git add .
git commit -m "Update"
git push
```

→ **Automatisches Deployment via GitHub Actions!** 🚀

---

## 🛠️ Wichtige Befehle

```bash
# Services Status
systemctl status apebrain-backend nginx mongod

# Logs
journalctl -u apebrain-backend -f
tail -f /var/log/nginx/apebrain-error.log

# Neustart
sudo systemctl restart apebrain-backend
sudo systemctl reload nginx

# Deployment
./scripts/deploy.sh
```

---

## 🎉 BEREIT ZUM DEPLOYEN!

**Starte jetzt:**
```bash
ssh root@72.61.177.155
```

Password: `ApeBrain2025-SecureBlog@`

**Dann folge den Schritten oben!** 🚀