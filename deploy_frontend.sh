#!/bin/bash

echo "Removing old tar if exists..."
rm -f build.tar.gz

echo "Building React app..."
npm run build

echo "Creating tar archive of build folder..."
tar -czf build.tar.gz build

echo "Uploading build.tar.gz to AWS EC2..."
scp -i ~/Downloads/my-key.pem build.tar.gz ubuntu@51.20.7.149:~/myproject-frontend/

echo "Connecting to AWS EC2 to extract and restart nginx..."
ssh -i ~/Downloads/my-key.pem ubuntu@51.20.7.149 << EOF
  cd ~/myproject-frontend
  echo "Removing old build folder..."
  sudo rm -rf build
  echo "Extracting build.tar.gz..."
  sudo tar -xzf build.tar.gz
  sudo rm build.tar.gz
  echo "Restarting nginx..."
  sudo systemctl restart nginx

EOF

echo "Deployment done!"
