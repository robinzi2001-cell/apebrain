#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 APEBRAIN SERVER SETUP - apebrain.cloud                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Server: 72.61.177.155 (srv1067587.hstgr.cloud)"
echo "Domain: apebrain.cloud"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }

# System Update
print_step "Updating system..."
export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y
print_success "System updated!"

# Node.js 20
print_step "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g yarn pm2
print_success "Node.js $(node -v) installed!"

# Python 3.12
print_step "Installing Python 3.12..."
apt install -y python3 python3-pip python3-venv python3-dev build-essential
print_success "Python $(python3 --version) installed!"

# MongoDB 7.0
print_step "Installing MongoDB 7.0..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update && apt install -y mongodb-org
systemctl start mongod && systemctl enable mongod
print_success "MongoDB installed!"

# Nginx
print_step "Installing Nginx & SSL tools..."
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx && systemctl start nginx
print_success "Nginx installed!"

# Firewall
print_step "Configuring firewall..."
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw allow 8001 && ufw --force enable
print_success "Firewall configured!"

# User
print_step "Creating apebrain user..."
if ! id "apebrain" &>/dev/null; then
    adduser --disabled-password --gecos "" apebrain
    echo "apebrain:ApeBrain2025-SecureBlog@" | chpasswd
    usermod -aG sudo apebrain
    print_success "User created!"
else
    print_success "User already exists!"
fi

# SSH Keys
print_step "Setting up SSH keys..."
sudo -u apebrain bash << 'EOF'
mkdir -p ~/.ssh && chmod 700 ~/.ssh
if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -C "deploy@apebrain.cloud" -f ~/.ssh/id_ed25519 -N ""
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "🔑 GITHUB DEPLOY KEY:"
    cat ~/.ssh/id_ed25519.pub
    echo "════════════════════════════════════════════════════════════"
    echo "Add to: https://github.com/robinzi2001-cell/apebrain/settings/keys"
    echo "✅ Enable 'Allow write access'"
    echo "════════════════════════════════════════════════════════════"
fi
git config --global user.name "ApeBrain Deploy"
git config --global user.email "deploy@apebrain.cloud"
EOF

# Directories
print_step "Creating directories..."
sudo -u apebrain mkdir -p /home/apebrain/{apebrain.cloud,logs,backups}
print_success "Directories created!"

# Backend Service
print_step "Creating backend service..."
cat > /etc/systemd/system/apebrain-backend.service << 'SERVICE'
[Unit]
Description=ApeBrain Backend API
After=network.target mongodb.service

[Service]
Type=simple
User=apebrain
WorkingDirectory=/home/apebrain/apebrain.cloud/backend
Environment="PATH=/home/apebrain/apebrain.cloud/backend/venv/bin"
ExecStart=/home/apebrain/apebrain.cloud/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
print_success "Backend service created!"

# Sudo rights
print_step "Setting sudo rights..."
echo "apebrain ALL=(ALL) NOPASSWD: /bin/systemctl restart apebrain-backend, /bin/systemctl reload nginx" > /etc/sudoers.d/apebrain
chmod 0440 /etc/sudoers.d/apebrain
print_success "Sudo configured!"

# Swap
print_step "Creating swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "/swapfile none swap sw 0 0" >> /etc/fstab
    print_success "Swap created!"
fi

# Fail2Ban
print_step "Installing Fail2Ban..."
apt install -y fail2ban
systemctl enable fail2ban && systemctl start fail2ban
print_success "Fail2Ban installed!"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ SERVER SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Add SSH key to GitHub (shown above)"
echo "2. Clone repo: sudo su - apebrain"
echo "   git clone git@github.com:robinzi2001-cell/apebrain.git apebrain.cloud"
echo "3. Setup .env files"
echo "4. Run: ~/apebrain.cloud/scripts/deploy.sh"
echo ""