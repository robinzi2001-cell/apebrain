# 🚀 COMPLETE SERVER SETUP GUIDE - ApeBrain.cloud
## Every Single Step for Hostinger VPS Deployment

---

## ⚠️ BEFORE YOU START

**What you need:**
1. Hostinger VPS (Business or higher)
2. Domain: apebrain.cloud
3. SSH access credentials
4. PayPal Developer account
5. 2-3 hours of time

**Server Requirements:**
- Ubuntu 20.04 or 22.04 (recommended)
- At least 2GB RAM
- 20GB disk space
- Root or sudo access

---

## 📋 PART 1: INITIAL SERVER ACCESS & SETUP

### Step 1.1: Connect to Your VPS

**From Windows (using PuTTY):**
```
1. Download PuTTY from https://www.putty.org/
2. Open PuTTY
3. Enter your VPS IP in "Host Name"
4. Port: 22
5. Click "Open"
6. Login as: root
7. Enter your password
```

**From Mac/Linux (using Terminal):**
```bash
# Open Terminal and run:
ssh root@your-vps-ip-address

# Example:
ssh root@185.123.45.67

# Type 'yes' when asked about fingerprint
# Enter your password when prompted
```

### Step 1.2: First Commands (Security Check)

```bash
# Check if you're root
whoami
# Should output: root

# Check server location and specs
uname -a
free -h  # Check memory
df -h    # Check disk space
```

---

## 📦 PART 2: SYSTEM UPDATE & SECURITY

### Step 2.1: Update Everything

```bash
# Update package list
apt update

# Upgrade all packages (type 'y' when asked)
apt upgrade -y

# This may take 5-10 minutes
# You'll see lots of text scrolling
```

### Step 2.2: Set Timezone

```bash
# Set to your timezone
timedatectl set-timezone Europe/Berlin
# Or: America/New_York, Asia/Tokyo, etc.

# Verify
timedatectl
```

### Step 2.3: Create Swap Space (if RAM < 4GB)

```bash
# Check if swap exists
swapon --show

# If no output, create swap:
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# Verify
free -h
```

---

## 🔧 PART 3: INSTALL ALL DEPENDENCIES

### Step 3.1: Install Python 3.10+

```bash
# Install Python and pip
apt install -y python3 python3-pip python3-venv python3-dev

# Check version (should be 3.10 or higher)
python3 --version

# Install build essentials
apt install -y build-essential libssl-dev libffi-dev
```

### Step 3.2: Install Node.js & Yarn

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Check versions
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher

# Install Yarn globally
npm install -g yarn

# Verify
yarn --version
```

### Step 3.3: Install MongoDB

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
apt update

# Install MongoDB
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod

# Enable MongoDB to start on boot
systemctl enable mongod

# Check status (should say "active (running)")
systemctl status mongod
# Press 'q' to exit

# Verify MongoDB is running
mongosh --eval "db.version()"
```

### Step 3.4: Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start Nginx
systemctl start nginx

# Enable on boot
systemctl enable nginx

# Check status
systemctl status nginx
# Press 'q' to exit

# Test: Open your browser and go to http://your-vps-ip
# You should see "Welcome to nginx!"
```

### Step 3.5: Install Supervisor

```bash
# Install Supervisor (process manager)
apt install -y supervisor

# Start Supervisor
systemctl start supervisor

# Enable on boot
systemctl enable supervisor

# Check status
systemctl status supervisor
```

### Step 3.6: Install Git

```bash
# Install Git
apt install -y git

# Verify
git --version
```

---

## 📁 PART 4: DEPLOY YOUR APPLICATION

### Step 4.1: Create Application Directory

```bash
# Create directory
mkdir -p /var/www/apebrain

# Navigate to it
cd /var/www/apebrain

# Check where you are
pwd
# Should output: /var/www/apebrain
```

### Step 4.2: Upload Your Code

**Option A: Using Git (Recommended)**

```bash
# If you have your code in GitHub/GitLab:
git clone https://github.com/yourusername/apebrain.git .

# The dot (.) at the end means "clone here"
```

**Option B: Using SCP from Your Computer**

```bash
# On YOUR LOCAL COMPUTER (not VPS), open a terminal:

# Navigate to your project folder
cd /path/to/your/apebrain/project

# Upload to VPS (replace IP and path):
scp -r * root@your-vps-ip:/var/www/apebrain/

# This uploads everything
# Type 'yes' if asked
# Enter your VPS password
```

**Option C: Using SFTP (WinSCP for Windows)**

```
1. Download WinSCP from https://winscp.net/
2. Open WinSCP
3. Protocol: SFTP
4. Host: your-vps-ip
5. Port: 22
6. Username: root
7. Password: your-password
8. Click "Login"
9. Drag your project files to /var/www/apebrain/
```

### Step 4.3: Set Permissions

```bash
# Set correct ownership
chown -R www-data:www-data /var/www/apebrain

# Set permissions
chmod -R 755 /var/www/apebrain

# Verify
ls -la /var/www/apebrain
```

---

## 🐍 PART 5: SETUP BACKEND

### Step 5.1: Create Virtual Environment

```bash
# Navigate to backend
cd /var/www/apebrain/backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Your prompt should now show (venv)
```

### Step 5.2: Install Python Dependencies

```bash
# With venv activated:
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# This will install:
# - fastapi
# - uvicorn
# - motor (MongoDB driver)
# - python-dotenv
# - pydantic
# - emergentintegrations
# - paypalrestsdk
# - and more...

# This may take 2-5 minutes
```

### Step 5.3: Configure .env File

```bash
# Create/edit .env file
nano .env
```

**Paste this content (replace values with yours):**

```env
# MongoDB Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="apebrain_blog"

# CORS (for development, use specific domain in production)
CORS_ORIGINS="*"

# AI API Keys
GEMINI_API_KEY="AIzaSyBTiERhWmrXx-UKdkOWOV7msA6XB9DYnww"
EMERGENT_LLM_KEY="sk-emergent-130C20f3fB753C8F9D"

# Admin Credentials (CHANGE THESE!)
ADMIN_USERNAME="your-secure-username"
ADMIN_PASSWORD="your-secure-password-min-8-chars"

# Frontend URL
FRONTEND_URL="https://apebrain.cloud"

# PayPal Configuration
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
```

**To save in nano:**
```
1. Press Ctrl + X
2. Press Y (yes to save)
3. Press Enter (confirm filename)
```

### Step 5.4: Test Backend

```bash
# Still in /var/www/apebrain/backend with venv activated

# Test if server starts
uvicorn server:app --host 0.0.0.0 --port 8001

# You should see:
# INFO:     Started server process
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8001

# Press Ctrl + C to stop

# If you see errors, check:
# 1. All packages installed? pip install -r requirements.txt
# 2. .env file exists? ls -la
# 3. MongoDB running? systemctl status mongod
```

### Step 5.5: Deactivate venv

```bash
# Deactivate virtual environment
deactivate

# Your prompt should return to normal
```

---

## ⚛️ PART 6: SETUP FRONTEND

### Step 6.1: Install Dependencies

```bash
# Navigate to frontend
cd /var/www/apebrain/frontend

# Install packages with Yarn
yarn install

# This will take 5-10 minutes
# You'll see lots of packages being downloaded
```

### Step 6.2: Configure Frontend .env

```bash
# Create .env file
nano .env
```

**Paste this:**

```env
# Backend API URL (your domain)
REACT_APP_BACKEND_URL=https://apebrain.cloud

# PayPal Client ID (same as backend)
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id

# Other settings
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

**Save:** Ctrl + X → Y → Enter

### Step 6.3: Build Frontend

```bash
# Build production version
yarn build

# This creates /var/www/apebrain/frontend/build folder
# Takes 2-5 minutes

# Verify build exists
ls -la build/
# You should see: index.html, static/, etc.
```

---

## 🌐 PART 7: CONFIGURE NGINX

### Step 7.1: Remove Default Config

```bash
# Remove default nginx site
rm /etc/nginx/sites-enabled/default
```

### Step 7.2: Create ApeBrain Config

```bash
# Create new config file
nano /etc/nginx/sites-available/apebrain
```

**Paste this EXACT configuration:**

```nginx
server {
    listen 80;
    server_name apebrain.cloud www.apebrain.cloud;

    # Increase timeouts for API
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    # Frontend - React Build
    location / {
        root /var/www/apebrain/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Origin, Content-Type, Accept, Authorization' always;
        
        # Handle OPTIONS
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header Access-Control-Allow-Headers 'Origin, Content-Type, Accept, Authorization' always;
            return 204;
        }
    }

    # Increase max body size for file uploads
    client_max_body_size 20M;
}
```

**Save:** Ctrl + X → Y → Enter

### Step 7.3: Enable Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/apebrain /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

# Should output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# If errors, check your config file again

# Reload nginx
systemctl reload nginx
```

---

## 🔄 PART 8: SETUP SUPERVISOR (Process Manager)

### Step 8.1: Create Backend Service

```bash
# Create supervisor config
nano /etc/supervisor/conf.d/apebrain-backend.conf
```

**Paste this:**

```ini
[program:apebrain-backend]
directory=/var/www/apebrain/backend
command=/var/www/apebrain/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/apebrain-backend.err.log
stdout_logfile=/var/log/apebrain-backend.out.log
environment=PATH="/var/www/apebrain/backend/venv/bin"
```

**Save:** Ctrl + X → Y → Enter

### Step 8.2: Start Backend Service

```bash
# Reload supervisor
supervisorctl reread

# Should output:
# apebrain-backend: available

# Update supervisor
supervisorctl update

# Should output:
# apebrain-backend: added process group

# Check status
supervisorctl status

# Should show:
# apebrain-backend RUNNING pid xxxxx, uptime x:xx:xx

# If it says FATAL or ERROR:
# Check logs:
tail -50 /var/log/apebrain-backend.err.log
```

---

## 🌍 PART 9: DOMAIN CONFIGURATION

### Step 9.1: Configure DNS in Hostinger

```
1. Login to Hostinger
2. Go to: Domains
3. Click on "apebrain.cloud"
4. Click "DNS / Name Servers"
5. Select "Use Hostinger nameservers" (if not already)
6. Add/Edit these DNS records:
```

**DNS Records to Add:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your-vps-ip | 3600 |
| A | www | your-vps-ip | 3600 |

```
7. Click "Add Record" or "Update"
8. Wait 15-30 minutes for DNS propagation
```

### Step 9.2: Verify DNS

```bash
# On your VPS, run:
nslookup apebrain.cloud

# Should show your VPS IP

# Also check:
nslookup www.apebrain.cloud

# If it doesn't work yet, wait longer (up to 2 hours max)
```

---

## 🔒 PART 10: SETUP SSL (HTTPS)

### Step 10.1: Install Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx
```

### Step 10.2: Get SSL Certificate

```bash
# Run Certbot
certbot --nginx -d apebrain.cloud -d www.apebrain.cloud

# You'll be asked:
# 1. Enter your email: your@email.com
# 2. Agree to terms: Y
# 3. Share email with EFF: Y or N (your choice)
# 4. Redirect HTTP to HTTPS: 2 (yes, redirect)

# This process takes 1-2 minutes

# You should see:
# Congratulations! Your certificate has been saved
```

### Step 10.3: Test SSL

```bash
# Visit in browser:
https://apebrain.cloud

# Should show your site with padlock icon
```

### Step 10.4: Setup Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# If successful, renewal is already set up automatically!
# Certificate auto-renews every 90 days
```

---

## 🔐 PART 11: SECURITY HARDENING

### Step 11.1: Setup Firewall

```bash
# Install UFW
apt install -y ufw

# Allow SSH (IMPORTANT! Do this first or you'll lock yourself out)
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Enable firewall
ufw enable

# Type 'y' when asked

# Check status
ufw status

# Should show:
# Status: active
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

### Step 11.2: Secure MongoDB

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "apebrain_admin",
  pwd: "your-super-strong-password-here",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Exit MongoDB
exit

# Edit MongoDB config
nano /etc/mongod.conf
```

**Find and update these lines:**

```yaml
# Find:
#security:

# Change to:
security:
  authorization: enabled
```

**Save:** Ctrl + X → Y → Enter

```bash
# Restart MongoDB
systemctl restart mongod

# Update backend .env with auth
nano /var/www/apebrain/backend/.env
```

**Change MONGO_URL to:**

```env
MONGO_URL="mongodb://apebrain_admin:your-super-strong-password-here@localhost:27017/?authSource=admin"
```

**Save and restart backend:**

```bash
supervisorctl restart apebrain-backend
```

### Step 11.3: Change Admin Password

```
1. Visit: https://apebrain.cloud/blogadmin
2. Login with default: admin / apebrain2024
3. Go to Settings
4. Change username and password
5. Save
6. Login again with new credentials
```

---

## 💳 PART 12: SETUP PAYPAL

### Step 12.1: Create PayPal Developer Account

```
1. Go to: https://developer.paypal.com
2. Click "Log In" (or Sign Up if you don't have PayPal)
3. After login, go to Dashboard
4. Click "Apps & Credentials"
```

### Step 12.2: Create App

```
1. Under "REST API apps", click "Create App"
2. App Name: "ApeBrain Shop"
3. App Type: "Merchant"
4. Click "Create App"
```

### Step 12.3: Get Credentials

**For Testing (Sandbox):**

```
1. Click "Sandbox"
2. Copy "Client ID"
3. Click "Show" under "Secret"
4. Copy "Secret"
```

**For Production (Live):**

```
1. Click "Live"
2. Click "Show" next to Client ID
3. Copy "Client ID"
4. Click "Show" next to "Secret"
5. Copy "Secret"
```

### Step 12.4: Add to .env

```bash
# Edit backend .env
nano /var/www/apebrain/backend/.env
```

**Update PayPal settings:**

```env
# For TESTING:
PAYPAL_MODE="sandbox"
PAYPAL_CLIENT_ID="your-sandbox-client-id-here"
PAYPAL_CLIENT_SECRET="your-sandbox-secret-here"

# For PRODUCTION (once ready):
PAYPAL_MODE="live"
PAYPAL_CLIENT_ID="your-live-client-id-here"
PAYPAL_CLIENT_SECRET="your-live-secret-here"
```

**Also update frontend .env:**

```bash
nano /var/www/apebrain/frontend/.env
```

```env
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id-here
```

### Step 12.5: Rebuild & Restart

```bash
# Rebuild frontend
cd /var/www/apebrain/frontend
yarn build

# Restart backend
supervisorctl restart apebrain-backend
```

---

## 🧪 PART 13: TESTING

### Step 13.1: Test Website

```
1. Visit: https://apebrain.cloud
2. Should see landing page with purple mushroom
3. Click "Blog" - should load blog page
4. Click "Shop" - should show products
```

### Step 13.2: Test Shopping Cart

```
1. Go to Shop
2. Click "Add to Cart" on any product
3. Cart should open on right side
4. Change quantity, test remove
5. Click "Proceed to Checkout"
```

### Step 13.3: Test PayPal (Sandbox)

```
1. Enter email in checkout
2. Click "Pay with PayPal"
3. Should redirect to PayPal sandbox
4. Login with sandbox test account:
   Email: sb-buyer@business.example.com
   Password: (get from PayPal Dashboard → Sandbox → Accounts)
5. Complete payment
6. Should redirect back to success page
```

### Step 13.4: Test Admin

```
1. Go to: https://apebrain.cloud/blogadmin
2. Login with your credentials
3. Create a test blog
4. Generate with AI
5. Upload an image
6. Publish
7. Check if it appears on blog page
```

---

## 📊 PART 14: MONITORING & MAINTENANCE

### Step 14.1: Check Logs

```bash
# Backend logs
tail -f /var/log/apebrain-backend.out.log  # Press Ctrl+C to exit
tail -f /var/log/apebrain-backend.err.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Supervisor logs
tail -f /var/log/supervisor/supervisord.log
```

### Step 14.2: Service Management Commands

```bash
# Check all service status
supervisorctl status

# Restart backend
supervisorctl restart apebrain-backend

# Stop backend
supervisorctl stop apebrain-backend

# Start backend
supervisorctl start apebrain-backend

# Restart nginx
systemctl restart nginx

# Restart MongoDB
systemctl restart mongod

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top  # Press 'q' to exit
```

### Step 14.3: Update Application

```bash
# Pull latest code
cd /var/www/apebrain
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
supervisorctl restart apebrain-backend

# Update frontend
cd ../frontend
yarn install
yarn build

# Reload nginx
systemctl reload nginx
```

---

## 🆘 TROUBLESHOOTING

### Issue: Backend won't start

```bash
# Check logs
tail -100 /var/log/apebrain-backend.err.log

# Common fixes:
# 1. Missing packages:
cd /var/www/apebrain/backend
source venv/bin/activate
pip install -r requirements.txt

# 2. MongoDB not running:
systemctl status mongod
systemctl start mongod

# 3. Port already in use:
lsof -i :8001
kill -9 <PID>

# 4. Test manually:
cd /var/www/apebrain/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
# See error messages
```

### Issue: Frontend not loading

```bash
# Check if build exists
ls -la /var/www/apebrain/frontend/build/

# If not, rebuild:
cd /var/www/apebrain/frontend
yarn build

# Check nginx
nginx -t
systemctl status nginx

# View nginx errors
tail -100 /var/log/nginx/error.log
```

### Issue: Domain not resolving

```bash
# Check DNS
nslookup apebrain.cloud

# If no result:
# 1. Wait 30 minutes - 2 hours for DNS propagation
# 2. Check Hostinger DNS settings
# 3. Verify you set A records correctly

# Check if site works with IP:
curl http://your-vps-ip
```

### Issue: PayPal not working

```bash
# Check backend logs
tail -100 /var/log/apebrain-backend.out.log | grep -i paypal

# Verify .env settings:
cat /var/www/apebrain/backend/.env | grep PAYPAL

# Common issues:
# 1. Empty PAYPAL_CLIENT_ID or SECRET
# 2. Wrong mode (sandbox vs live)
# 3. Wrong credentials
# 4. Frontend .env not matching backend
```

### Issue: SSL certificate fails

```bash
# Make sure domain points to your IP
nslookup apebrain.cloud

# Make sure port 80 is open
ufw status | grep 80

# Try again
certbot --nginx -d apebrain.cloud -d www.apebrain.cloud

# If still fails, check nginx config:
nginx -t
```

---

## ✅ FINAL CHECKLIST

- [ ] Server updated: `apt update && apt upgrade -y`
- [ ] Python 3.10+ installed
- [ ] Node.js 18+ & Yarn installed
- [ ] MongoDB installed and running
- [ ] Nginx installed and running
- [ ] Supervisor installed and running
- [ ] Application code uploaded
- [ ] Backend dependencies installed
- [ ] Frontend built
- [ ] .env files configured
- [ ] Nginx config created and enabled
- [ ] Supervisor config created
- [ ] Backend service running
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] MongoDB secured
- [ ] Admin password changed
- [ ] PayPal configured
- [ ] Website tested
- [ ] Shop tested
- [ ] Admin panel tested

---

## 🎉 YOU'RE DONE!

Your website is now live at: https://apebrain.cloud

**What you have:**
- ✅ Full-stack website
- ✅ AI blog generation
- ✅ Shopping cart system
- ✅ PayPal integration
- ✅ Admin panel
- ✅ SSL/HTTPS
- ✅ Secure server
- ✅ Auto-start services
- ✅ Production-ready

**Next steps:**
1. Create some blog posts
2. Add product images (via admin)
3. Test complete purchase flow
4. Switch PayPal to live mode when ready
5. Start marketing!

**Need help?** Check logs first, then troubleshooting section.

---

## 📞 SUPPORT CONTACTS

**Server Issues:**
- Hostinger Support: https://www.hostinger.com/cpanel-login

**PayPal Issues:**
- PayPal Developer Support: https://developer.paypal.com/support/

**MongoDB Issues:**
- MongoDB Documentation: https://docs.mongodb.com/

**Nginx Issues:**
- Nginx Documentation: https://nginx.org/en/docs/

---

**Last Updated:** October 2024
**Tested On:** Ubuntu 22.04 LTS
**Deployment Time:** ~2-3 hours
