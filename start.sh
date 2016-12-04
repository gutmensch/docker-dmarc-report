#!/bin/sh
# periodically check if daemon is running
# if not:
#   1. kill former tail processes
#   2. start daemon and wait 5 seconds for startup of logging
#   3. tail new logfile
while true; do
  pgrep raumsrvDaemon &>/dev/null || { 
    pkill tail;
    /opt/raumserver/raumsrvDaemon && sleep 5;
    new_log=$(ls -t /opt/raumserver/logs/*.log 2>/dev/null | head -n 1);
    [ -n "${new_log}" ] && tail -f $new_log &
  }
  sleep 5
done
