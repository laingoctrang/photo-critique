#!/bin/bash

# Script để refresh tất cả rankings
# Sử dụng: ./scripts/refresh_all_rankings.sh
# Hoặc: bash scripts/refresh_all_rankings.sh

# Cấu hình
API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"
API_ENDPOINT="${API_BASE_URL}/api/rankings/refresh-all"

# Màu sắc cho output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Refreshing All Rankings ===${NC}"
echo "API Endpoint: ${API_ENDPOINT}"
echo ""

# Kiểm tra xem server có đang chạy không
if ! curl -s --head --request GET "${API_BASE_URL}/actuator/health" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to server at ${API_BASE_URL}${NC}"
    echo "Please make sure the server is running."
    exit 1
fi

# Gọi API refresh-all
echo -e "${YELLOW}Calling refresh-all endpoint...${NC}"
RESPONSE=$(curl -s -X POST "${API_ENDPOINT}" \
    -H "Content-Type: application/json" \
    -w "\n%{http_code}")

# Tách response body và status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Kiểm tra kết quả
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Success!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Error: HTTP ${HTTP_CODE}${NC}"
    echo "Response:"
    echo "$BODY"
    exit 1
fi

echo ""
echo -e "${GREEN}=== Refresh completed ===${NC}"





