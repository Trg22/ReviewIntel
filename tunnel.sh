#!/bin/bash
# Start localhost.run tunnel (exposes localhost:3000 to internet)
# This requires SSH but needs no authentication

echo "Starting SSH tunnel via localhost.run..."
echo "This will expose http://localhost:3000 to the internet"
echo ""
echo "URL will be something like: https://randomname.loca.lt"
echo ""

ssh -R 80:localhost:3000 localhost.run
