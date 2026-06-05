#!/usr/bin/env bash

# Configuration
SSH_HOST="fantastic4-vps"
FALLBACK_HOST="root@194.182.87.6"
PORT="600"
REMOTE_DIR="/var/www/tapfast.tail8c034f.ts.net"

echo "============================================="
echo "          Bunq PWA VPS Deployer              "
echo "============================================="

# Check connection to primary SSH Host
echo "Connecting to $SSH_HOST..."
ssh -q -o ConnectTimeout=3 "$SSH_HOST" "exit"
if [ $? -eq 0 ]; then
  TARGET_HOST="$SSH_HOST"
  SSH_CMD="ssh"
  RSYNC_CMD="rsync -avz --delete"
  echo "✓ Successfully connected using SSH host '$SSH_HOST'."
else
  echo "⚠ Could not resolve '$SSH_HOST'. Trying fallback connection to $FALLBACK_HOST on port $PORT..."
  ssh -q -p "$PORT" -o ConnectTimeout=3 "$FALLBACK_HOST" "exit"
  if [ $? -eq 0 ]; then
    TARGET_HOST="$FALLBACK_HOST"
    SSH_CMD="ssh -p $PORT"
    RSYNC_CMD="rsync -avz --delete -e 'ssh -p $PORT'"
    echo "✓ Successfully connected to $FALLBACK_HOST on port $PORT."
  else
    echo "❌ ERROR: Could not connect to either '$SSH_HOST' or '$FALLBACK_HOST' on port $PORT."
    echo "Please verify that:"
    echo "  1. Your VPS is online and accessible."
    echo "  2. Your SSH private key is loaded in your SSH agent (run: ssh-add)."
    echo "  3. The port $PORT is correct."
    exit 1
  fi
fi

# 1. Build the app locally
echo ""
echo "Step 1: Building production Next.js PWA locally..."
rm -rf .next
npx next build --webpack
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Local production build failed. Fix errors before deploying."
  exit 1
fi
echo "✓ Local build completed successfully."

# 2. Prepare directory on remote VPS
echo ""
echo "Step 2: Preparing remote directory '$REMOTE_DIR' on VPS..."
$SSH_CMD "$TARGET_HOST" "mkdir -p $REMOTE_DIR"
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Failed to create remote directory on VPS."
  exit 1
fi

# 3. Sync files to the VPS
echo ""
echo "Step 3: Transferring project files to VPS..."
$RSYNC_CMD \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next/cache' \
  --exclude 'inspect.js' \
  ./ "$TARGET_HOST:$REMOTE_DIR/"
if [ $? -ne 0 ]; then
  echo "❌ ERROR: File synchronization failed."
  exit 1
fi
echo "✓ Files transferred successfully."

# 4. Install production dependencies and start/restart app on VPS
echo ""
echo "Step 4: Installing production packages and starting application..."
$SSH_CMD "$TARGET_HOST" "cd $REMOTE_DIR && npm install --production && (pm2 restart tapfast || pm2 start npm --name 'tapfast' -- run start)"
if [ $? -ne 0 ]; then
  echo "⚠ WARNING: Application start command failed on VPS. PM2 might not be installed."
  echo "To run it manually, SSH into your VPS and run:"
  echo "  cd $REMOTE_DIR && npm install && npm run start"
else
  echo "✓ Application successfully started/restarted under PM2."
fi

echo ""
echo "============================================="
echo "✓ Deployment Completed Successfully!        "
echo "  Address: https://bunq.h4ck3d.me"
echo "============================================="
