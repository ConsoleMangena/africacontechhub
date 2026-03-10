#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git curl ufw
curl -fsSL https://get.docker.com | sh
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
mkdir -p /opt
cd /opt
if [ ! -d africacontechhub ]; then
  git clone https://github.com/ConsoleMangena/africacontechhub.git
else
  cd africacontechhub && git pull origin main || git pull origin master
fi
