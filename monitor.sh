#!/bin/bash
# Monitor ReviewIntels and publish status to GitHub Gist

HEALTH_URL="http://localhost:3000/api/health"
STATUS_URL="http://localhost:3000/api/status"

# Check if server is running
HEALTH=$(curl -s -m 5 $HEALTH_URL)
STATUS=$(curl -s -m 5 $STATUS_URL)

# Create status payload
STATUS_PAYLOAD=$(cat <<EOF
{
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "service": "ReviewIntels",
  "health": $HEALTH,
  "status": $STATUS,
  "local_url": "http://localhost:3000",
  "process": "$(pm2 list --format json 2>/dev/null | grep reviewintels || echo 'unknown')"
}
EOF
)

echo "$STATUS_PAYLOAD"

# If we had a GitHub token, we could publish this to a gist
# For now, just log it
echo "$STATUS_PAYLOAD" >> /tmp/reviewintels_status.log
