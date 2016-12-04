#!/bin/sh
while true; do
  pgrep raumsrvDaemon || { 
    pkill -f tail;
    /opt/raumserver/raumsrvDaemon;
    tail -f $(ls -t /opt/raumserver/logs/*.log | head -n 1) &
  }
  sleep 5
done
