#!/bin/bash
cd ~/ReviewIntel
npm start > /tmp/reviewintels.log 2>&1 &
echo $! > /tmp/reviewintels.pid
echo "ReviewIntels started with PID $(cat /tmp/reviewintels.pid)"
echo "Logs: tail -f /tmp/reviewintels.log"
echo "Server: http://localhost:3000"
