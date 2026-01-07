#!/bin/bash

# Script để build và push images lên Docker Hub
# Sử dụng: ./build-and-push.sh [tag]
# Nếu không có tag, mặc định dùng "latest"

set -e

# Màu sắc cho output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Registry và tag
REGISTRY="hoangtu0812"
TAG=${1:-latest}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PocketFile - Build & Push Images${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Registry: ${GREEN}${REGISTRY}${NC}"
echo -e "Tag: ${GREEN}${TAG}${NC}"
echo ""

# Kiểm tra đã login Docker Hub chưa
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Chưa đăng nhập Docker Hub. Đang yêu cầu đăng nhập...${NC}"
    docker login
fi

# Build Backend
echo -e "${BLUE}[1/4] Building backend image...${NC}"
docker build -t ${REGISTRY}/pocketfile-backend:${TAG} ./backend
echo -e "${GREEN}✓ Backend built successfully${NC}"

# Build Frontend
echo -e "${BLUE}[2/4] Building frontend image...${NC}"
docker build -t ${REGISTRY}/pocketfile-frontend:${TAG} ./frontend
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Push Backend
echo -e "${BLUE}[3/4] Pushing backend image...${NC}"
docker push ${REGISTRY}/pocketfile-backend:${TAG}
echo -e "${GREEN}✓ Backend pushed successfully${NC}"

# Push Frontend
echo -e "${BLUE}[4/4] Pushing frontend image...${NC}"
docker push ${REGISTRY}/pocketfile-frontend:${TAG}
echo -e "${GREEN}✓ Frontend pushed successfully${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Hoàn thành! Images đã được push lên Docker Hub${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Images:"
echo "  - ${REGISTRY}/pocketfile-backend:${TAG}"
echo "  - ${REGISTRY}/pocketfile-frontend:${TAG}"
echo ""
echo "Để deploy trên Portainer, đảm bảo stack.env có:"
echo "  REGISTRY=${REGISTRY}"
echo "  TAG=${TAG}"

